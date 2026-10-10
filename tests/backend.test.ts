import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import sharp from "sharp";
import { Store } from "../src/lib/server/store";
import { schema } from "../src/lib/server/schema";
import { handleRequest, requireSameOrigin } from "../src/lib/server/router";
import { DomainError, businessDay, convertQuantity, isDomainError, lineTotal } from "../src/lib/server/validation";

function fixture() {
  const store = new Store(":memory:");
  const session = store.register({ name: "Test Owner", email: `test-${Math.random()}@example.com`, password: "strong-password-123", businessName: "Test Shop", category: "grocery", language: "en" });
  const user = session.user.id, business = session.businesses[0].id;
  const product = store.createProduct(user, business, { name: "Rice", sku: "RICE", unit: "kg", pricePaise: 19999, costPaise: 12000, quantityMilli: 20000, minStockMilli: 2000 });
  const customer = store.createContact(user, business, "customers", { name: "Customer", phone: "9000000000" });
  const supplier = store.createContact(user, business, "suppliers", { name: "Supplier" });
  return { store, user, business, product, customer, supplier };
}
const invoiceInput = (productId: string, extra: Record<string, unknown> = {}) => ({ idempotencyKey: "bill-1", items: [{ productId, quantityMilli: 1000 }], discountPaise: 0, paidPaise: 19999, paymentMethod: "cash", ...extra });
const throwsCode = (work: () => unknown, code: string) => assert.throws(work, (error: unknown) => error instanceof DomainError && error.code === code);

test("minor-unit arithmetic rounds half up using integer multiplication", () => {
  assert.equal(lineTotal(19999, 500), 10000);
  assert.equal(lineTotal(101, 1500), 152);
  assert.equal(lineTotal(999999999, 999999), 999998999000);
});
test("a bill atomically records snapshot, payment, inventory movement, audit and discount", () => {
  const f = fixture();
  try {
    const bill = f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { items: [{ productId: f.product.id, quantityMilli: 500 }], discountPaise: 125, paidPaise: 9875 }));
    assert.equal(bill.subtotalPaise, 10000); assert.equal(bill.totalPaise, 9875); assert.equal(bill.balancePaise, 0);
    const state = f.store.state(f.user, f.business);
    assert.equal(state.products[0].quantityMilli, 19500); assert.equal(state.payments[0].amountPaise, 9875); assert.equal(state.movements.find(m => m.referenceId === bill.id)?.quantityMilli, -500);
    assert.equal(state.metrics.salesTodayPaise, 9875); assert.equal(state.metrics.collectedTodayPaise, 9875); assert.ok(state.activity.some(a => a.action === "invoice.created"));
  } finally { f.store.close(); }
});
test("insufficient stock or bad cross-tenant line leaves every ledger unchanged", () => {
  const f = fixture();
  try {
    const before = f.store.state(f.user, f.business);
    throwsCode(() => f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { items: [{ productId: f.product.id, quantityMilli: 1000 }, { productId: f.product.id, quantityMilli: 20000 }] })), "INSUFFICIENT_STOCK");
    const after = f.store.state(f.user, f.business);
    assert.deepEqual(after, before);
    throwsCode(() => f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { items: [{ productId: f.product.id, quantityMilli: 1000 }, { productId: "unknown", quantityMilli: 1000 }] })), "NOT_FOUND");
    assert.deepEqual(f.store.state(f.user, f.business), before);
  } finally { f.store.close(); }
});
test("idempotency retries preserve inventory and payload changes are refused", () => {
  const f = fixture();
  try {
    const input = invoiceInput(f.product.id), first = f.store.createInvoice(f.user, f.business, input), second = f.store.createInvoice(f.user, f.business, input);
    assert.deepEqual(second, first); assert.equal(f.store.state(f.user, f.business).invoices.length, 1); assert.equal(f.store.state(f.user, f.business).products[0].quantityMilli, 19000);
    throwsCode(() => f.store.createInvoice(f.user, f.business, { ...input, discountPaise: 1 }), "IDEMPOTENCY_CONFLICT");
  } finally { f.store.close(); }
});
test("contact retries keep one identity and audit while separate keys allow deliberate duplicates", () => {
  const f = fixture();
  try {
    const input = { name: "New contact", phone: "9000000000", idempotencyKey: "contact-attempt-1" };
    const before = f.store.state(f.user, f.business);
    const first = f.store.createContact(f.user, f.business, "customers", input);
    assert.deepEqual(f.store.createContact(f.user, f.business, "customers", input), first);
    let state = f.store.state(f.user, f.business);
    assert.equal(state.customers.length, before.customers.length + 1);
    assert.equal(state.activity.filter(row => row.action === "customers.created").length, before.activity.filter(row => row.action === "customers.created").length + 1);
    throwsCode(() => f.store.createContact(f.user, f.business, "customers", { ...input, phone: "9000000001" }), "IDEMPOTENCY_CONFLICT");
    assert.deepEqual(f.store.state(f.user, f.business), state);
    const deliberate = f.store.createContact(f.user, f.business, "customers", { ...input, idempotencyKey: "contact-attempt-2" });
    assert.notEqual(deliberate.id, first.id);
    assert.equal(deliberate.phone, first.phone);
    const supplier = f.store.createContact(f.user, f.business, "suppliers", input);
    assert.notEqual(supplier.id, first.id);
    assert.deepEqual(f.store.createContact(f.user, f.business, "suppliers", input), supplier);
    state = f.store.state(f.user, f.business);
    assert.equal(state.customers.length, before.customers.length + 2);
    assert.equal(state.suppliers.length, before.suppliers.length + 1);
    assert.equal(state.activity.filter(row => row.action === "suppliers.created").length, before.activity.filter(row => row.action === "suppliers.created").length + 1);
  } finally { f.store.close(); }
});
test("stock retries record one movement and audit while binding the request payload", () => {
  const f = fixture();
  try {
    const input = { productId: f.product.id, quantityMilli: 2500, reason: "receipt", idempotencyKey: "stock-1" };
    const first = f.store.adjustStock(f.user, f.business, input);
    assert.deepEqual(f.store.adjustStock(f.user, f.business, input), first);
    const state = f.store.state(f.user, f.business);
    assert.equal(state.products[0].quantityMilli, 22500);
    assert.equal(state.movements.filter(m => m.reason === "receipt").length, 1);
    assert.equal(state.activity.filter(a => a.action === "stock.receipt").length, 1);
    throwsCode(() => f.store.adjustStock(f.user, f.business, { ...input, quantityMilli: 3000 }), "IDEMPOTENCY_CONFLICT");
    throwsCode(() => f.store.adjustStock(f.user, f.business, { ...input, idempotencyKey: "waste-1", quantityMilli: 23000, reason: "wastage" }), "INSUFFICIENT_STOCK");
    assert.deepEqual(f.store.state(f.user, f.business), state);
    f.store.adjustStock(f.user, f.business, { ...input, idempotencyKey: "waste-1", quantityMilli: 500, reason: "wastage" });
    assert.equal(f.store.state(f.user, f.business).products[0].quantityMilli, 22000);
  } finally { f.store.close(); }
});
test("expense retries survive closing without double posting cash or audit", () => {
  const f = fixture();
  try {
    const input = { description: "Delivery", amountPaise: 1500, method: "cash", idempotencyKey: "expense-1" };
    const first = f.store.createExpense(f.user, f.business, input);
    assert.deepEqual(f.store.createExpense(f.user, f.business, input), first);
    assert.equal(f.store.state(f.user, f.business).expenses.length, 1);
    assert.equal(f.store.state(f.user, f.business).activity.filter(a => a.action === "expense.created").length, 1);
    const closing = f.store.createClosing(f.user, f.business, { openingCashPaise: 2000, actualCashPaise: 500 });
    assert.equal(closing.expectedCashPaise, 500);
    assert.deepEqual(f.store.createExpense(f.user, f.business, input), first);
    throwsCode(() => f.store.createExpense(f.user, f.business, { ...input, amountPaise: 2000 }), "IDEMPOTENCY_CONFLICT");
    assert.equal(f.store.state(f.user, f.business).expenses.length, 1);
  } finally { f.store.close(); }
});
test("piece stock cannot be sold fractionally, and credit requires a customer", () => {
  const f = fixture();
  try {
    const p = f.store.createProduct(f.user, f.business, { name: "Bottle", unit: "pcs", quantityMilli: 5000, pricePaise: 10000 });
    throwsCode(() => f.store.createInvoice(f.user, f.business, invoiceInput(p.id, { items: [{ productId: p.id, quantityMilli: 500 }], paidPaise: 5000 })), "FRACTIONAL_UNIT");
    throwsCode(() => f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { paidPaise: 0 })), "CUSTOMER_REQUIRED");
    assert.equal(f.store.state(f.user, f.business).invoices.length, 0);
  } finally { f.store.close(); }
});
test("the UI's piece unit rejects fractional opening stock, sales, changes and purchases", () => {
  const f = fixture();
  try {
    throwsCode(() => f.store.createProduct(f.user, f.business, { name: "Half-piece", unit: "piece", quantityMilli: 500, pricePaise: 10000 }), "FRACTIONAL_UNIT");
    const piece = f.store.createProduct(f.user, f.business, { name: "Whole-piece", unit: "piece", quantityMilli: 5000, pricePaise: 10000 });
    const before = f.store.state(f.user, f.business);
    throwsCode(() => f.store.createInvoice(f.user, f.business, invoiceInput(piece.id, { items: [{ productId: piece.id, quantityMilli: 1500 }], paidPaise: 15000 })), "FRACTIONAL_UNIT");
    throwsCode(() => f.store.adjustStock(f.user, f.business, { productId: piece.id, quantityMilli: 500, reason: "receipt" }), "FRACTIONAL_UNIT");
    throwsCode(() => f.store.adjustStock(f.user, f.business, { productId: piece.id, quantityMilli: -500, reason: "correction" }), "FRACTIONAL_UNIT");
    throwsCode(() => f.store.createPurchase(f.user, f.business, { idempotencyKey: "fractional-purchase", supplierId: f.supplier.id, items: [{ productId: piece.id, quantityMilli: 500, costPaise: 7000 }], paidPaise: 0 }), "FRACTIONAL_UNIT");
    assert.deepEqual(f.store.state(f.user, f.business), before);
    const bill = f.store.createInvoice(f.user, f.business, invoiceInput(piece.id, { paidPaise: 10000 }));
    assert.equal(bill.items[0].quantityMilli, 1000); assert.equal(f.store.state(f.user, f.business).products.find(p => p.id === piece.id)?.quantityMilli, 4000);
  } finally { f.store.close(); }
});
test("repayment allocates oldest credit, preserves balances and rejects overpayment", () => {
  const f = fixture();
  try {
    const first = f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { customerId: f.customer.id, paidPaise: 0 }));
    // Make ordering deterministic rather than relying on millisecond clock scheduling.
    f.store.db.prepare("UPDATE invoices SET date=? WHERE id=?").run("2026-01-01T00:00:00Z", first.id);
    const second = f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { idempotencyKey: "bill-2", customerId: f.customer.id, paidPaise: 0 }));
    const paymentInput = { idempotencyKey: "pay-1", customerId: f.customer.id, amountPaise: 25000, method: "upi" };
    const payment = f.store.receivePayment(f.user, f.business, paymentInput);
    assert.equal(payment.payments.length, 2); assert.equal(payment.payments[0].invoiceId, first.id); assert.equal(payment.payments[0].amountPaise, 19999); assert.equal(payment.payments[1].amountPaise, 5001);
    assert.deepEqual(f.store.receivePayment(f.user, f.business, paymentInput), payment);
    const state = f.store.state(f.user, f.business);
    assert.equal(state.customers[0].balancePaise, 14998); assert.equal(state.invoices.find(i => i.id === second.id)?.balancePaise, 14998);
    throwsCode(() => f.store.receivePayment(f.user, f.business, { ...paymentInput, idempotencyKey: "pay-2", amountPaise: 14999 }), "OVERPAYMENT");
    throwsCode(() => f.store.cancelInvoice(f.user, f.business, first.id), "REPAYMENT_EXISTS");
  } finally { f.store.close(); }
});
test("cancellation restores stock and refunds once while preserving history", () => {
  const f = fixture();
  try {
    const bill = f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id));
    const cancelled = f.store.cancelInvoice(f.user, f.business, bill.id);
    assert.equal(cancelled.status, "cancelled"); assert.equal(cancelled.paidPaise, 0); assert.equal(cancelled.balancePaise, 0); assert.equal(cancelled.totalPaise, bill.totalPaise);
    f.store.cancelInvoice(f.user, f.business, bill.id);
    const state = f.store.state(f.user, f.business);
    assert.equal(state.products[0].quantityMilli, 20000); assert.equal(state.payments.filter(p => p.kind === "refund").length, 1); assert.equal(state.metrics.salesTodayPaise, 0); assert.equal(state.metrics.collectedTodayPaise, 0); assert.equal(state.metrics.outstandingPaise, 0);
    assert.equal(state.payments.find(p => p.kind === "refund")?.amountPaise, -19999); assert.equal(state.payments.reduce((sum, p) => sum + p.amountPaise, 0), 0);
    assert.equal(f.store.db.prepare("SELECT original_paid_paise FROM invoices WHERE id=?").get(bill.id)?.original_paid_paise, 19999);
  } finally { f.store.close(); }
});
test("cancelling a partial cash bill removes credit and closing uses the signed net refund", () => {
  const f = fixture();
  try {
    const bill = f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { customerId: f.customer.id, paidPaise: 5000 }));
    assert.equal(f.store.state(f.user, f.business).customers[0].balancePaise, 14999);
    f.store.cancelInvoice(f.user, f.business, bill.id);
    const state = f.store.state(f.user, f.business);
    assert.equal(state.customers[0].balancePaise, 0); assert.equal(state.invoices[0].balancePaise, 0); assert.equal(state.invoices[0].paidPaise, 0);
    assert.equal(state.payments.find(p => p.kind === "refund")?.amountPaise, -5000);
    const closing = f.store.createClosing(f.user, f.business, { openingCashPaise: 12000, actualCashPaise: 12000 });
    assert.equal(closing.expectedCashPaise, 12000); assert.equal(closing.differencePaise, 0);
  } finally { f.store.close(); }
});
test("purchases receive stock and supplier credit atomically, with duplicate protection", () => {
  const f = fixture();
  try {
    const input = { idempotencyKey: "purchase-1", supplierId: f.supplier.id, items: [{ productId: f.product.id, quantityMilli: 2500, costPaise: 10001 }], paidPaise: 10000 };
    const purchase = f.store.createPurchase(f.user, f.business, input);
    assert.equal(purchase.totalPaise, 25003); assert.equal(purchase.balancePaise, 15003); assert.deepEqual(f.store.createPurchase(f.user, f.business, input), purchase);
    const state = f.store.state(f.user, f.business);
    assert.equal(state.products[0].quantityMilli, 22500); assert.equal(state.products[0].costPaise, 10001); assert.equal(state.suppliers[0].balancePaise, 15003);
    throwsCode(() => f.store.createPurchase(f.user, f.business, { ...input, idempotencyKey: "bad", items: [input.items[0], { productId: "missing", quantityMilli: 1000, costPaise: 100 }] }), "NOT_FOUND");
    assert.deepEqual(f.store.state(f.user, f.business), state);
  } finally { f.store.close(); }
});
test("closing reconciles cash sales, refunds, cash expenses and paid purchases", () => {
  const f = fixture();
  try {
    const bill = f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id));
    f.store.createExpense(f.user, f.business, { description: "Delivery", amountPaise: 1000, method: "cash" });
    f.store.createExpense(f.user, f.business, { description: "Phone", amountPaise: 2000, method: "upi" });
    f.store.createPurchase(f.user, f.business, { idempotencyKey: "p", supplierId: f.supplier.id, items: [{ productId: f.product.id, quantityMilli: 1000, costPaise: 10000 }], paidPaise: 5000 });
    const closing = f.store.createClosing(f.user, f.business, { openingCashPaise: 10000, actualCashPaise: 23500 });
    assert.equal(closing.expectedCashPaise, 23999); assert.equal(closing.differencePaise, -499);
    assert.equal(closing.businessDay, businessDay(closing.date));
    assert.equal(f.store.state(f.user, f.business).closings[0].businessDay, businessDay());
    throwsCode(() => f.store.createClosing(f.user, f.business, { openingCashPaise: 0, actualCashPaise: 0 }), "ALREADY_CLOSED");
    assert.equal(f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id)).id, bill.id);
    throwsCode(() => f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { idempotencyKey: "later" })), "DAY_CLOSED");
    throwsCode(() => f.store.createExpense(f.user, f.business, { description: "Late expense", amountPaise: 100, method: "cash" }), "DAY_CLOSED");
    throwsCode(() => f.store.cancelInvoice(f.user, f.business, bill.id), "DAY_CLOSED");
    const before = f.store.state(f.user, f.business);
    throwsCode(() => f.store.receivePayment(f.user, f.business, { customerId: f.customer.id, amountPaise: 100, method: "cash", idempotencyKey: "late-payment" }), "DAY_CLOSED");
    throwsCode(() => f.store.createPurchase(f.user, f.business, { supplierId: f.supplier.id, items: [{ productId: f.product.id, quantityMilli: 1000, costPaise: 10000 }], paidPaise: 10000, idempotencyKey: "late-purchase" }), "DAY_CLOSED");
    assert.deepEqual(f.store.state(f.user, f.business), before);
  } finally { f.store.close(); }
});
test("business-day boundaries follow India midnight rather than UTC midnight", () => {
  assert.equal(businessDay("2026-10-08T18:29:59.999Z"), "2026-10-08");
  assert.equal(businessDay("2026-10-08T18:30:00.000Z"), "2026-10-09");
  assert.equal(businessDay("2026-10-09T00:00:00.000Z"), "2026-10-09");
});
test("membership scope prevents cross-business state, product, customer and exports", () => {
  const f = fixture();
  try {
    const other = f.store.register({ name: "Other", email: "other@example.com", password: "strong-password-456", businessName: "Other shop" });
    const foreign = other.businesses[0].id;
    throwsCode(() => f.store.state(other.user.id, f.business), "NOT_FOUND"); throwsCode(() => f.store.export(other.user.id, f.business), "NOT_FOUND");
    throwsCode(() => f.store.createInvoice(other.user.id, foreign, invoiceInput(f.product.id)), "NOT_FOUND");
    const ownProduct = f.store.createProduct(other.user.id, foreign, { name: "Own", pricePaise: 100, quantityMilli: 1000 });
    throwsCode(() => f.store.createInvoice(other.user.id, foreign, invoiceInput(ownProduct.id, { paidPaise: 0, customerId: f.customer.id })), "NOT_FOUND");
    assert.equal(f.store.state(f.user, f.business).products[0].quantityMilli, 20000);
  } finally { f.store.close(); }
});
test("real cookie authentication, logout and CSRF are enforced by the route", async () => {
  const store = new Store(":memory:");
  try {
    const anonymous = await handleRequest(new Request("http://localhost/api/session"), store); assert.equal(anonymous.status, 401);
    const credentials = { name: "Route User", email: "route@example.com", password: "safe-route-password", businessName: "Route Shop" };
    const bad = await handleRequest(new Request("http://localhost/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://attacker.example" }, body: JSON.stringify(credentials) }), store); assert.equal(bad.status, 403);
    const registered = await handleRequest(new Request("http://localhost/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost" }, body: JSON.stringify(credentials) }), store); assert.equal(registered.status, 201);
    const cookie = registered.headers.get("set-cookie")!; assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Lax/);
    const authCookie = cookie.split(";")[0], session = await handleRequest(new Request("http://localhost/api/session", { headers: { Cookie: authCookie } }), store); assert.equal(session.status, 200);
    const payload = await session.json(); assert.equal(payload.user.email, credentials.email); assert.equal(payload.user.password_hash, undefined);
    const missingOrigin = await handleRequest(new Request("http://localhost/api/account/language", { method: "POST", headers: { Cookie: authCookie, "Content-Type": "application/json" }, body: '{"language":"hi"}' }), store); assert.equal(missingOrigin.status, 403);
    const logout = await handleRequest(new Request("http://localhost/api/auth/logout", { method: "POST", headers: { Cookie: authCookie, Origin: "http://localhost" } }), store); assert.equal(logout.status, 200);
    assert.equal((await handleRequest(new Request("http://localhost/api/session", { headers: { Cookie: authCookie } }), store)).status, 401);
    throwsCode(() => store.login({ email: credentials.email, password: "incorrect-password" }), "INVALID_CREDENTIALS"); assert.equal(store.login(credentials).user.email, credentials.email);
  } finally { store.close(); }
});
test("CSRF binds normalized Next URLs to the actual Host and rejects foreign or spoofed origins", async () => {
  const request = (headers: Record<string, string>) => new Request("http://localhost:3001/api/auth/logout", { method: "POST", headers });
  assert.doesNotThrow(() => requireSameOrigin(request({ Host: "127.0.0.1:3001", Origin: "http://127.0.0.1:3001", "Sec-Fetch-Site": "same-origin" })));
  assert.doesNotThrow(() => requireSameOrigin(request({ Host: "[::1]:3001", Origin: "http://[::1]:3001", "Sec-Fetch-Site": "same-origin" })));
  throwsCode(() => requireSameOrigin(request({ Host: "127.0.0.1:3001", Origin: "http://localhost:3001", "Sec-Fetch-Site": "same-site" })), "CSRF_REJECTED");
  throwsCode(() => requireSameOrigin(request({ Host: "127.0.0.1:3001", Origin: "https://attacker.example", "X-Forwarded-Host": "attacker.example" })), "CSRF_REJECTED");
  throwsCode(() => requireSameOrigin(request({ Host: "127.0.0.1:3001", Origin: "http://127.0.0.1:3001", "Sec-Fetch-Site": "cross-site" })), "CSRF_REJECTED");
  throwsCode(() => requireSameOrigin(request({ Host: "user@127.0.0.1:3001", Origin: "http://127.0.0.1:3001" })), "CSRF_REJECTED");
  throwsCode(() => requireSameOrigin(request({ Host: "127.0.0.1:3001/evil", Origin: "http://127.0.0.1:3001" })), "CSRF_REJECTED");
  throwsCode(() => requireSameOrigin(request({ Host: "127.0.0.1:3001" })), "CSRF_REJECTED");
  const store = new Store(":memory:");
  try { assert.equal((await handleRequest(request({ Host: "127.0.0.1:3001", Origin: "http://127.0.0.1:3001" }), store)).status, 200); }
  finally { store.close(); }
});
test("session cookies are always Secure in production and on HTTPS", async () => {
  const store = new Store(":memory:"), previousMode = process.env.NODE_ENV;
  try {
    Reflect.set(process.env, "NODE_ENV", "production");
    store.register({name:'Secure Owner',email:'secure-cookie@example.com',password:'secure-cookie-password',businessName:'Secure shop'});
    const registered = await handleRequest(new Request("http://localhost/api/auth/login", { method: "POST", headers: { Origin: "http://localhost", "Content-Type": "application/json" }, body: JSON.stringify({email:'secure-cookie@example.com',password:'secure-cookie-password'}) }), store);
    assert.equal(registered.status, 200); assert.match(registered.headers.get("set-cookie")!, /; Secure(?:;|$)/); assert.match(registered.headers.get("set-cookie")!, /HttpOnly/); assert.match(registered.headers.get("set-cookie")!, /SameSite=Lax/);
    Reflect.set(process.env, "NODE_ENV", "development");
    const https = await handleRequest(new Request("https://localhost/api/auth/logout", { method: "POST", headers: { Origin: "https://localhost" } }), store);
    assert.equal(https.status, 200); assert.match(https.headers.get("set-cookie")!, /; Secure(?:;|$)/);
    const http = await handleRequest(new Request("http://localhost/api/auth/logout", { method: "POST", headers: { Origin: "http://localhost" } }), store);
    assert.equal(http.status, 200); assert.doesNotMatch(http.headers.get("set-cookie")!, /; Secure(?:;|$)/);
  } finally {
    if (previousMode === undefined) Reflect.deleteProperty(process.env, "NODE_ENV"); else Reflect.set(process.env, "NODE_ENV", previousMode);
    store.close();
  }
});
test("demo sessions own separate fictional businesses and inventory", () => {
  const store = new Store(":memory:");
  try {
    const first = store.demo(), second = store.demo();
    assert.equal(first.user.demo, true); assert.equal(first.businesses.length, 4); assert.notEqual(first.user.id, second.user.id);
    assert.ok(first.businesses.every(b => !second.businesses.some(x => x.id === b.id)));
    assert.ok(store.state(first.user.id, first.businesses[0].id).invoices.length > 0);
    throwsCode(() => store.state(second.user.id, first.businesses[0].id), "NOT_FOUND");
  } finally { store.close(); }
});
test("demo snapshots reconcile dated stock movements, payments and localized task data", () => {
  const store = new Store(":memory:");
  try {
    const session = store.demo();
    for (const business of session.businesses) {
      const state = store.state(session.user.id, business.id);
      for (const product of state.products) {
        let stock = 0;
        for (const movement of state.movements.filter(m => m.productId === product.id).sort((a, b) => a.date.localeCompare(b.date))) { stock += movement.quantityMilli; assert.ok(stock >= 0, `${product.name} went negative in fixture history`); }
        assert.equal(stock, product.quantityMilli);
      }
      for (const invoice of state.invoices) {
        assert.equal(state.payments.filter(p => p.invoiceId === invoice.id).reduce((sum, p) => sum + p.amountPaise, 0), invoice.paidPaise);
        assert.ok(state.payments.filter(p => p.invoiceId === invoice.id).every(p => p.date === invoice.date));
        assert.ok(state.movements.filter(m => m.referenceId === invoice.id).every(m => m.date === invoice.date));
        assert.ok(state.activity.some(a => a.action === "invoice.created" && a.detail.startsWith(invoice.number) && a.date === invoice.date));
      }
      assert.equal(state.weeklySales.reduce((sum, day) => sum + day.salesPaise, 0), state.invoices.filter(i => state.weeklySales.some(day => day.date === businessDay(i.date))).reduce((sum, i) => sum + i.totalPaise, 0));
      for (const task of state.tasks) {
        assert.ok(task.name);
        if (task.type === "stock") { assert.ok(task.productId); assert.equal(task.quantityMilli, state.products.find(p => p.id === task.productId)?.quantityMilli); assert.ok(task.unit); }
        else if (task.type === "credit") { assert.ok(task.customerId); assert.equal(task.balancePaise, state.customers.find(c => c.id === task.customerId)?.balancePaise); }
        else { assert.ok(task.productId); assert.match(task.expiryDate!, /^\d{4}-\d{2}-\d{2}$/); }
      }
    }
  } finally { store.close(); }
});
test("business records and hashed sessions survive database reopen", () => {
  const directory = mkdtempSync(join(tmpdir(), "dukaanset-db-test-")), path = join(directory, "test.sqlite");
  let store: Store | undefined;
  try {
    store = new Store(path);
    const registered = store.register({ name: "Persistent Owner", email: "persistent@example.com", password: "persistent-password", businessName: "Persistent Shop" }), id = registered.businesses[0].id;
    store.createProduct(registered.user.id, id, { name: "Saved stock", pricePaise: 15000, quantityMilli: 7000 });
    const token = store.issueSession(registered.user.id);
    assert.equal(store.db.prepare("SELECT token_hash FROM sessions").get()?.token_hash === token, false);
    store.close(); store = new Store(path);
    assert.equal(store.authenticate(token), registered.user.id); assert.equal(store.state(registered.user.id, id).products[0].quantityMilli, 7000);
    assert.equal(store.login({ email: "persistent@example.com", password: "persistent-password" }).user.id, registered.user.id);
  } finally { store?.close(); rmSync(directory, { recursive: true, force: true }); }
});

test("V1 file migration preserves merchant ledgers, sessions and product stock across reopen", () => {
  const directory = mkdtempSync(join(tmpdir(), "dukaanset-v1-migration-")), path = join(directory, "v1.sqlite"), f = fixture();
  let upgraded: Store | undefined;
  try {
    const invoice = f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { paidPaise: 5000, customerId: f.customer.id }));
    const token = f.store.issueSession(f.user), old = new DatabaseSync(path);
    old.exec(schema);
    for (const table of ["users", "businesses", "memberships", "sessions", "products", "customers", "suppliers", "invoices", "payments", "movements", "audit", "idempotency"]) {
      for (const row of f.store.db.prepare(`SELECT * FROM ${table}`).all()) {
        const columns=old.prepare(`PRAGMA table_info(${table})`).all().map(column=>String(column.name));
        const values = columns.map(column=>row[column]);
        old.prepare(`INSERT INTO ${table} VALUES(${values.map(() => "?").join(",")})`).run(...values);
      }
    }
    old.close();
    upgraded = new Store(path);
    assert.equal(upgraded.db.prepare("PRAGMA user_version").get()?.user_version, 7);
    assert.equal(upgraded.authenticate(token), f.user);
    const state = upgraded.state(f.user, f.business);
    assert.equal(state.products[0].quantityMilli, 19000); assert.deepEqual(state.products[0].aliases, []);
    assert.equal(state.products[0].packSize, null); assert.equal(state.invoices[0].id, invoice.id);
    assert.equal(state.invoices[0].paidPaise, 5000); assert.equal(state.customers[0].balancePaise, 14999);
    assert.equal(state.invoices[0].payments[0].amountPaise, 5000); assert.deepEqual(state.inventoryEntries, []);
    upgraded.close(); upgraded = new Store(path);
    assert.equal(upgraded.state(f.user, f.business).invoices[0].id, invoice.id);
  } finally { upgraded?.close(); f.store.close(); rmSync(directory, { recursive: true, force: true }); }
});

test("fashion split sale records two receipts, exact credit and stock once", () => {
  const store = new Store(":memory:");
  try {
    const session = store.demo(), business = session.businesses.find(b => b.category === "clothing")!, before = store.state(session.user.id, business.id);
    const shirt = before.products.find(p => p.name === "Blue Casual Shirt")!, rahul = before.customers.find(c => c.name === "Rahul Sharma")!;
    assert.equal(shirt.quantityMilli, 4000); assert.equal(shirt.pricePaise, 89900); assert.equal(rahul.balancePaise, 129900); assert.equal(before.invoices.length, 1);
    const input = { idempotencyKey: "shirt-split", customerId: rahul.id, items: [{ productId: shirt.id, quantityMilli: 2000 }], payments: [{ method: "cash", amountPaise: 100000 }, { method: "upi", amountPaise: 50000 }] };
    const bill = store.createInvoice(session.user.id, business.id, input);
    assert.equal(bill.totalPaise, 179800); assert.equal(bill.paidPaise, 150000); assert.equal(bill.balancePaise, 29800); assert.equal(bill.paymentMethod, "split"); assert.equal(bill.status, "partial");
    assert.equal(bill.items[0].variation, "Blue · M"); assert.equal(bill.payments.length, 2);
    assert.deepEqual(bill.payments.map(p => [p.method, p.amountPaise]).sort(), [["cash", 100000], ["upi", 50000]]);
    assert.deepEqual(store.createInvoice(session.user.id, business.id, input), bill);
    const after = store.state(session.user.id, business.id);
    assert.equal(after.products.find(p => p.id === shirt.id)!.quantityMilli, 2000); assert.equal(after.customers.find(c => c.id === rahul.id)!.balancePaise, rahul.balancePaise + 29800);
    assert.equal(after.metrics.salesTodayPaise, 179800); assert.equal(after.metrics.collectedTodayPaise, 150000);
    store.receivePayment(session.user.id, business.id, { idempotencyKey: "shirt-due", customerId: rahul.id, amountPaise: rahul.balancePaise + 29800, method: "upi" });
    const repaid = store.state(session.user.id, business.id);
    assert.equal(repaid.metrics.salesTodayPaise, 179800); assert.equal(repaid.customers[0].balancePaise, 0); assert.equal(repaid.invoices[0].payments.length, 3);
    throwsCode(() => store.cancelInvoice(session.user.id, business.id, bill.id), "REPAYMENT_EXISTS");
  } finally { store.close(); }
});

test("split cancellation refunds each original method once and closing counts cash only", () => {
  const f = fixture();
  try {
    const input = invoiceInput(f.product.id, { paidPaise: 15000, customerId: f.customer.id, payments: [{ method: "cash", amountPaise: 10000 }, { method: "upi", amountPaise: 5000 }] });
    const bill = f.store.createInvoice(f.user, f.business, input), cancelled = f.store.cancelInvoice(f.user, f.business, bill.id);
    assert.equal(cancelled.paidPaise, 0); assert.equal(cancelled.balancePaise, 0);
    assert.deepEqual(cancelled.payments.filter(p => p.kind === "refund").map(p => [p.method, p.amountPaise]).sort(), [["cash", -10000], ["upi", -5000]]);
    assert.deepEqual(f.store.cancelInvoice(f.user, f.business, bill.id), cancelled);
    const state = f.store.state(f.user, f.business);
    assert.equal(state.customers[0].balancePaise, 0); assert.equal(state.daily.cashPaise, 0); assert.equal(state.daily.upiPaise, 0); assert.equal(state.totals.receivedPaise, 0);
    const closing = f.store.createClosing(f.user, f.business, { openingCashPaise: 4000, actualCashPaise: 4000 });
    assert.equal(closing.expectedCashPaise, 4000); assert.equal(closing.differencePaise, 0);
  } finally { f.store.close(); }
});

test("invalid split receipts fail before any sale or stock mutation", () => {
  const f = fixture();
  try {
    const before = f.store.state(f.user, f.business);
    throwsCode(() => f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { payments: [{ method: "cash", amountPaise: 1 }] })), "PAYMENT_MISMATCH");
    throwsCode(() => f.store.createInvoice(f.user, f.business, { idempotencyKey: "bad-duplicate-payment", items: [{ productId: f.product.id, quantityMilli: 1000 }], payments: [{ method: "cash", amountPaise: 10000 }, { method: "cash", amountPaise: 9999 }] }), "DUPLICATE_PAYMENT");
    throwsCode(() => f.store.createInvoice(f.user, f.business, { idempotencyKey: "zero-receipt", items: [{ productId: f.product.id, quantityMilli: 1000 }], payments: [{ method: "upi", amountPaise: 0 }] }), "INVALID_INPUT");
    throwsCode(() => f.store.createInvoice(f.user, f.business, { idempotencyKey: "overpay-split", items: [{ productId: f.product.id, quantityMilli: 1000 }], payments: [{ method: "cash", amountPaise: 20000 }] }), "OVERPAYMENT");
    assert.deepEqual(f.store.state(f.user, f.business), before);
  } finally { f.store.close(); }
});

test("product edit preserves invoice snapshots, permits ambiguous aliases and locks historical units", () => {
  const f = fixture();
  try {
    const bill = f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id));
    const edited = f.store.editProduct(f.user, f.business, f.product.id, { name: "Premium Rice", pricePaise: 25000, aliases: ["chawal", "चावल", "CHAWAL"], barcode: "890000000001", variation: "Basmati", packSize: 5 });
    assert.deepEqual(edited.aliases, ["CHAWAL", "चावल"]); assert.equal(edited.barcode, "890000000001"); assert.equal(edited.packSize, 5);
    const historical = f.store.state(f.user, f.business).invoices.find(i => i.id === bill.id)!;
    assert.equal(historical.items[0].name, "Rice"); assert.equal(historical.items[0].pricePaise, 19999);
    f.store.createProduct(f.user, f.business, { name: "Other rice", pricePaise: 20000, aliases: ["chawal"] });
    throwsCode(() => f.store.editProduct(f.user, f.business, f.product.id, { unit: "g" }), "UNIT_LOCKED");
    throwsCode(() => f.store.editProduct(f.user, f.business, f.product.id, { quantityMilli: 999999 }), "INVALID_INPUT");
    assert.equal(f.store.state(f.user, f.business).products.find(p => p.id === f.product.id)!.quantityMilli, 19000);
  } finally { f.store.close(); }
});

test("stock batch commits all rows, exact compatible conversions and history once", () => {
  const f = fixture();
  try {
    const milk = f.store.createProduct(f.user, f.business, { name: "Milk", unit: "litre", pricePaise: 6400, quantityMilli: 2000 });
    const biscuit = f.store.createProduct(f.user, f.business, { name: "Biscuit", unit: "packet", pricePaise: 1000, quantityMilli: 1000, packSize: 12 });
    const input = { idempotencyKey: "voice-entry-1", source: "mixed", items: [{ productId: f.product.id, quantityMilli: 500000, unit: "g" }, { productId: f.product.id, quantityMilli: 1500 }, { productId: milk.id, quantityMilli: 250000, unit: "ml" }, { productId: biscuit.id, quantityMilli: 2000, unit: "box" }] };
    const entry = f.store.receiveStockBatch(f.user, f.business, input);
    assert.equal(entry.items.length, 3); assert.equal(entry.items.find(item => item.productId === f.product.id)!.quantityMilli, 2000);
    assert.deepEqual(f.store.receiveStockBatch(f.user, f.business, input), entry);
    const state = f.store.state(f.user, f.business);
    assert.equal(state.inventoryEntries.length, 1); assert.deepEqual(state.inventoryEntries[0], entry);
    assert.equal(state.products.find(p => p.id === f.product.id)!.quantityMilli, 22000);
    assert.equal(state.products.find(p => p.id === milk.id)!.quantityMilli, 2250);
    assert.equal(state.products.find(p => p.id === biscuit.id)!.quantityMilli, 25000);
    assert.equal(state.movements.filter(m => m.referenceId === entry.id).length, 3);
    assert.ok(entry.items.every(item => state.movements.some(m => m.id === item.movementId && m.quantityMilli === item.quantityMilli)));
    throwsCode(() => f.store.receiveStockBatch(f.user, f.business, { ...input, source: "voice" }), "IDEMPOTENCY_CONFLICT");
    const repeated = f.store.receiveStockBatch(f.user, f.business, { ...input, idempotencyKey: "voice-repeat-new-draft" });
    assert.notEqual(repeated.id, entry.id); assert.equal(f.store.state(f.user, f.business).inventoryEntries.length, 2);
  } finally { f.store.close(); }
});

test("batch failures roll back all rows and reject incompatible or imprecise quantities", () => {
  const f = fixture();
  try {
    const piece = f.store.createProduct(f.user, f.business, { name: "Shirt", unit: "piece", pricePaise: 89900 });
    const before = f.store.state(f.user, f.business), request = { idempotencyKey: "rollback-voice", source: "voice", items: [{ productId: f.product.id, quantityMilli: 1000 }, { productId: piece.id, quantityMilli: 1500 }] };
    throwsCode(() => f.store.receiveStockBatch(f.user, f.business, request), "FRACTIONAL_UNIT");
    assert.deepEqual(f.store.state(f.user, f.business), before);
    throwsCode(() => f.store.receiveStockBatch(f.user, f.business, { ...request, items: [{ productId: f.product.id, quantityMilli: 1000, unit: "litre" }] }), "INVALID_UNIT");
    throwsCode(() => f.store.receiveStockBatch(f.user, f.business, { ...request, items: [{ productId: f.product.id, quantityMilli: 1, unit: "g" }] }), "QUANTITY_PRECISION");
    throwsCode(() => f.store.receiveStockBatch(f.user, f.business, { ...request, items: [{ productId: piece.id, quantityMilli: 1000, unit: "box" }] }), "INVALID_UNIT");
    throwsCode(() => f.store.receiveStockBatch(f.user, f.business, { ...request, transcript: "do not retain audio" }), "INVALID_INPUT");
    f.store.receiveStockBatch(f.user, f.business, { ...request, items: [{ productId: piece.id, quantityMilli: 2000 }] });
    assert.equal(f.store.state(f.user, f.business).products.find(p => p.id === piece.id)!.quantityMilli, 2000);
    assert.equal(convertQuantity(2000, "metre", "meter"), 2000);
    assert.equal(convertQuantity(1500, "kg", "g"), 1500000);
    const outsider = f.store.register({ name: "Other", email: "voice-other@example.com", password: "voice-other-password", businessName: "Other" });
    throwsCode(() => f.store.receiveStockBatch(outsider.user.id, f.business, request), "NOT_FOUND");
  } finally { f.store.close(); }
});

test("secure photos validate real bytes, enforce tenant and product scope, and lock after invoice save", async () => {
  const f = fixture();
  try {
    const token = f.store.issueSession(f.user), bytes = await sharp({ create: { width: 2, height: 2, channels: 3, background: "#336699" } }).png().toBuffer();
    const url = `http://localhost/api/businesses/${f.business}/attachments`;
    const upload = (payload = bytes, extra: Record<string, string> = {}) => handleRequest(new Request(url, { method: "POST", headers: { origin: "http://localhost", cookie: `dukaanset_session=${token}`, "content-type": "image/png", "x-product-id": f.product.id, "x-idempotency-key": "photo-1", ...extra }, body: new Uint8Array(payload) }), f.store);
    const response = await upload(); assert.equal(response.status, 201);
    const photo = await response.json(); assert.equal(photo.productId, f.product.id); assert.equal(photo.mime, "image/png"); assert.ok(photo.size > 0);
    const duplicate = await upload(); assert.deepEqual(await duplicate.json(), photo);
    assert.equal(f.store.db.prepare("SELECT COUNT(*) count FROM attachments").get()?.count, 1);
    const image = await handleRequest(new Request(`http://localhost${photo.url}`, { headers: { cookie: `dukaanset_session=${token}` } }), f.store);
    assert.equal(image.status, 200); assert.equal(image.headers.get("cache-control"), "private, no-store"); assert.equal(image.headers.get("content-type"), "image/png");
    assert.equal((await sharp(Buffer.from(await image.arrayBuffer())).metadata()).width, 2);
    assert.equal((await handleRequest(new Request(`http://localhost${photo.url}`), f.store)).status, 401);
    const other = f.store.register({ name: "Other", email: "photos-other@example.com", password: "photos-other-password", businessName: "Other" }), otherToken = f.store.issueSession(other.user.id);
    assert.equal((await handleRequest(new Request(`http://localhost${photo.url}`, { headers: { cookie: `dukaanset_session=${otherToken}` } }), f.store)).status, 404);
    const bad = await upload(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0]), { "x-idempotency-key": "bad-image" }); assert.equal((await bad.json()).error.code, "INVALID_IMAGE");
    assert.equal((await upload(bytes, { "content-type": "image/svg+xml", "x-idempotency-key": "svg" })).status, 415);
    assert.equal((await upload(bytes, { "content-length": "2097153", "x-idempotency-key": "too-large" })).status, 413);
    assert.equal((await upload(bytes, { origin: "https://foreign.example" })).status, 403);
    const unrelated = f.store.createProduct(f.user, f.business, { name: "Other product", pricePaise: 1000, quantityMilli: 1000 });
    throwsCode(() => f.store.createInvoice(f.user, f.business, { idempotencyKey: "wrong-photo-product", items: [{ productId: unrelated.id, quantityMilli: 1000, attachmentIds: [photo.id] }], payments: [{ method: "cash", amountPaise: 1000 }] }), "NOT_FOUND");
    const bill = f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { items: [{ productId: f.product.id, quantityMilli: 1000, attachmentIds: [photo.id] }] }));
    assert.equal(bill.items[0].attachments?.[0].id, photo.id);
    throwsCode(() => f.store.deleteAttachment(f.user, f.business, photo.id), "ATTACHMENT_LOCKED");
    throwsCode(() => f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { idempotencyKey: "reuse-photo", items: [{ productId: f.product.id, quantityMilli: 1000, attachmentIds: [photo.id] }] })), "ATTACHMENT_LOCKED");
    const pendingResponse = await upload(bytes, { "x-idempotency-key": "pending-delete" }), pending = await pendingResponse.json();
    assert.deepEqual(f.store.deleteAttachment(f.user, f.business, pending.id), { ok: true });
    throwsCode(() => f.store.readAttachment(f.user, f.business, pending.id), "NOT_FOUND");
  } finally { f.store.close(); }
});

test("demo reset is transactional, retains session/language/business IDs and never deletes real records", () => {
  const f = fixture();
  try {
    const demo = f.store.demo(), other = f.store.demo(), beforeReal = f.store.state(f.user, f.business), beforeOther = other.businesses.map(b => f.store.state(other.user.id, b.id));
    f.store.updateLanguage(demo.user.id, { language: "hi" });
    const fashion = demo.businesses.find(b => b.category === "clothing")!, state = f.store.state(demo.user.id, fashion.id), shirt = state.products.find(p => p.name === "Blue Casual Shirt")!;
    f.store.createInvoice(demo.user.id, fashion.id, { idempotencyKey: "demo-reset-sale", customerId: state.customers[0].id, items: [{ productId: shirt.id, quantityMilli: 2000 }], payments: [{ method: "cash", amountPaise: 100000 }, { method: "upi", amountPaise: 50000 }] });
    const token = f.store.issueSession(demo.user.id), reset = f.store.resetDemo(demo.user.id);
    assert.equal(reset.user.id, demo.user.id); assert.equal(reset.user.language, "hi"); assert.equal(f.store.authenticate(token), demo.user.id);
    assert.deepEqual(reset.businesses.map(b => b.id), demo.businesses.map(b => b.id));
    const restored = f.store.state(demo.user.id, fashion.id);
    assert.equal(restored.products.find(p => p.name === "Blue Casual Shirt")!.quantityMilli, 4000); assert.equal(restored.customers[0].balancePaise, 129900); assert.equal(restored.invoices.length, 1);
    assert.ok(restored.activity.some(a => a.action === "demo.reset"));
    assert.deepEqual(f.store.state(f.user, f.business), beforeReal); assert.deepEqual(other.businesses.map(b => f.store.state(other.user.id, b.id)), beforeOther);
    throwsCode(() => f.store.resetDemo(f.user), "DEMO_ONLY");
    assert.deepEqual(f.store.state(f.user, f.business), beforeReal);
    f.store.db.prepare("INSERT INTO memberships(user_id,business_id,role) VALUES(?,?,?)").run(f.user, fashion.id, "owner");
    const beforeShared = demo.businesses.map(b => f.store.state(demo.user.id, b.id));
    throwsCode(() => f.store.resetDemo(demo.user.id), "DEMO_ONLY");
    assert.deepEqual(demo.businesses.map(b => f.store.state(demo.user.id, b.id)), beforeShared);
  } finally { f.store.close(); }
});

test("customer aggregates and complete statements remain accurate past the recent 1000-record view", async () => {
  const f = fixture();
  try {
    for (let index = 0; index < 1001; index++) f.store.createInvoice(f.user, f.business, { idempotencyKey: `long-history-${index}`, customerId: f.customer.id, items: [{ productId: f.product.id, quantityMilli: 1 }], payments: [{ method: "cash", amountPaise: 10 }] });
    const state = f.store.state(f.user, f.business), customer = state.customers[0];
    assert.equal(state.invoices.length, 1000); assert.equal(state.payments.length, 1000);
    assert.equal(customer.totalSalesPaise, 20020); assert.equal(customer.netReceivedPaise, 10010); assert.equal(customer.balancePaise, 10010);
    assert.equal(state.totals.salesPaise, 20020); assert.equal(state.totals.receivedPaise, 10010); assert.equal(state.daily.cashPaise, 10010); assert.equal(state.daily.creditSalesPaise, 10010);
    const statement = f.store.customerStatement(f.user, f.business, f.customer.id);
    assert.equal(statement.invoices.length, 1001); assert.equal(statement.payments.length, 1001); assert.deepEqual(statement.customer, customer);
    assert.equal(statement.invoices.reduce((sum, invoice) => sum + invoice.balancePaise, 0), customer.balancePaise);
    assert.equal(statement.payments.reduce((sum, payment) => sum + payment.amountPaise, 0), customer.netReceivedPaise);
    const token = f.store.issueSession(f.user), url = `http://localhost/api/businesses/${f.business}/customers/${f.customer.id}/statement`;
    assert.equal((await handleRequest(new Request(url, { headers: { cookie: `dukaanset_session=${token}` } }), f.store)).status, 200);
    assert.equal((await handleRequest(new Request(url), f.store)).status, 401);
    const other = f.store.register({ name: "Other", email: "statement-other@example.com", password: "statement-other-password", businessName: "Other" }), otherToken = f.store.issueSession(other.user.id);
    assert.equal((await handleRequest(new Request(url, { headers: { cookie: `dukaanset_session=${otherToken}` } }), f.store)).status, 404);
  } finally { f.store.close(); }
});

test("daily and lifetime expense/purchase aggregates ignore recent-history caps", () => {
  const f = fixture();
  try {
    for (let index = 0; index < 1001; index++) {
      f.store.createExpense(f.user, f.business, { idempotencyKey: `cap-expense-${index}`, description: "Small business expense", amountPaise: 1, method: index % 2 ? "upi" : "cash" });
      f.store.createPurchase(f.user, f.business, { idempotencyKey: `cap-purchase-${index}`, supplierId: f.supplier.id, items: [{ productId: f.product.id, quantityMilli: 1, costPaise: 1000 }], paidPaise: 1 });
    }
    const state = f.store.state(f.user, f.business);
    assert.equal(state.expenses.length, 1000); assert.equal(state.purchases.length, 1000);
    assert.equal(state.totals.expensesPaise, 1001); assert.equal(state.daily.expensesPaise, 1001); assert.equal(state.daily.cashExpensesPaise, 501); assert.equal(state.daily.purchaseCount, 1001); assert.equal(state.daily.cashPurchasePaymentsPaise, 1001);
    const closing = f.store.createClosing(f.user, f.business, { openingCashPaise: 2000, actualCashPaise: 498 });
    assert.equal(closing.expectedCashPaise, 498); assert.equal(closing.differencePaise, 0);
  } finally { f.store.close(); }
});

test("daily old-dues aggregate counts repayments against prior India business days", () => {
  const f = fixture();
  try {
    const bill = f.store.createInvoice(f.user, f.business, invoiceInput(f.product.id, { customerId: f.customer.id, paidPaise: 5000 })), yesterday = new Date(Date.now() - 86_400_000).toISOString();
    f.store.db.prepare("UPDATE invoices SET date=? WHERE id=?").run(yesterday, bill.id);
    f.store.db.prepare("UPDATE payments SET date=? WHERE invoice_id=?").run(yesterday, bill.id);
    f.store.receivePayment(f.user, f.business, { idempotencyKey: "older-dues-repayment", customerId: f.customer.id, amountPaise: 5000, method: "upi" });
    const state = f.store.state(f.user, f.business);
    assert.equal(state.daily.olderDuesReceivedPaise, 5000); assert.equal(state.daily.upiPaise, 5000); assert.equal(state.daily.cashPaise, 0); assert.equal(state.daily.creditSalesPaise, 0);
    assert.equal(state.totals.salesPaise, 19999); assert.equal(state.totals.receivedPaise, 10000); assert.equal(state.metrics.outstandingPaise, 9999);
  } finally { f.store.close(); }
});

test("V2 writes and demo reset require cookie, same origin and correct scope over HTTP", async () => {
  const f = fixture();
  try {
    const token = f.store.issueSession(f.user), base = `http://localhost/api/businesses/${f.business}`, cookie = `dukaanset_session=${token}`;
    const write = (path: string, input: unknown, headers: Record<string, string> = {}) => handleRequest(new Request(`${base}${path}`, { method: "POST", headers: { cookie, origin: "http://localhost", "content-type": "application/json", ...headers }, body: JSON.stringify(input) }), f.store);
    const entry = { idempotencyKey: "http-stockbatch", source: "manual", items: [{ productId: f.product.id, quantityMilli: 500 }] };
    assert.equal((await write("/stockbatch", entry, { origin: "https://foreign.example" })).status, 403);
    assert.equal((await write("/stockbatch", entry, { cookie: "" })).status, 401);
    assert.equal((await write("/stockbatch", entry, { "content-type": "application/json-garbage" })).status, 415);
    assert.equal((await write("/stockbatch", entry)).status, 201);
    assert.equal((await write(`/products/${f.product.id}/edit`, { aliases: ["chawal", "चावल"] })).status, 200);
    const resetUrl = "http://localhost/api/auth/demo/reset", before = f.store.state(f.user, f.business);
    assert.equal((await handleRequest(new Request(resetUrl, { method: "POST", headers: { cookie, origin: "http://localhost" } }), f.store)).status, 403);
    assert.deepEqual(f.store.state(f.user, f.business), before);
    const demo = f.store.demo(), demoToken = f.store.issueSession(demo.user.id), demoCookie = `dukaanset_session=${demoToken}`;
    assert.equal((await handleRequest(new Request(resetUrl, { method: "POST", headers: { cookie: demoCookie, origin: "https://foreign.example" } }), f.store)).status, 403);
    const response = await handleRequest(new Request(resetUrl, { method: "POST", headers: { cookie: demoCookie, origin: "http://localhost" } }), f.store);
    assert.equal(response.status, 200); assert.equal((await response.json()).user.id, demo.user.id); assert.equal(f.store.authenticate(demoToken), demo.user.id);
    assert.deepEqual(f.store.state(f.user, f.business), before);
  } finally { f.store.close(); }
});

test("domain errors survive module identity changes while unbranded errors stay private", async context => {
  const f = fixture(); context.mock.method(console, "error", () => undefined);
  try {
    const token = f.store.issueSession(f.user), stale = Object.create(f.store) as Store, url = `http://localhost/api/businesses/${f.business}/state`;
    const reloadedBrand: unique symbol = Symbol.for("dukaanset.domain-error");
    class ReloadedError extends Error { code = "NOT_FOUND"; status = 404; [reloadedBrand] = true; }
    const reloaded = new ReloadedError("Scoped record unavailable.");
    assert.equal(reloaded instanceof DomainError, false); assert.equal(isDomainError(reloaded), true);
    stale.assertMember = () => { throw reloaded; };
    const response = await handleRequest(new Request(url, { headers: { cookie: `dukaanset_session=${token}` } }), stale);
    assert.equal(response.status, 404); assert.equal((await response.json()).error.code, "NOT_FOUND");
    stale.assertMember = () => { throw Object.assign(new Error("secret raw database detail"), { code: "NOT_FOUND", status: 404 }); };
    const privateFailure = await handleRequest(new Request(url, { headers: { cookie: `dukaanset_session=${token}` } }), stale);
    assert.equal(privateFailure.status, 500); assert.equal((await privateFailure.json()).error.code, "INTERNAL_ERROR");
    assert.equal(isDomainError({ code: "NOT_FOUND", status: 404, message: "untrusted payload" }), false);
  } finally { f.store.close(); }
});
