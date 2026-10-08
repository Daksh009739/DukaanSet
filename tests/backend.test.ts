import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "../src/lib/server/store";
import { handleRequest, requireSameOrigin } from "../src/lib/server/router";
import { DomainError, businessDay, lineTotal } from "../src/lib/server/validation";

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
    const registered = await handleRequest(new Request("http://localhost/api/auth/register", { method: "POST", headers: { Origin: "http://localhost", "Content-Type": "application/json" }, body: JSON.stringify({ name: "Secure Owner", email: "secure-cookie@example.com", password: "secure-cookie-password", businessName: "Secure shop" }) }), store);
    assert.equal(registered.status, 201); assert.match(registered.headers.get("set-cookie")!, /; Secure(?:;|$)/); assert.match(registered.headers.get("set-cookie")!, /HttpOnly/); assert.match(registered.headers.get("set-cookie")!, /SameSite=Lax/);
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
    assert.equal(first.user.demo, true); assert.equal(first.businesses.length, 3); assert.notEqual(first.user.id, second.user.id);
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
      assert.equal(state.weeklySales.reduce((sum, day) => sum + day.salesPaise, 0), state.invoices.reduce((sum, i) => sum + i.totalPaise, 0));
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
