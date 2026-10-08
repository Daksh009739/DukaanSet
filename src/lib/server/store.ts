import { DatabaseSync } from "node:sqlite";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Business, BusinessState, Customer, Invoice, InvoiceItem, Payment, Product, Purchase, Session, Supplier, User } from "../contracts";
import { schema } from "./schema";
import { DomainError, assertWholeUnit, businessDay, category, date, email, fingerprint, integer, items, language, lineTotal, method, object, password, string } from "./validation";

type Row = Record<string, string | number | null>;
const stamp = () => new Date().toISOString();
const uid = () => randomUUID();
const status = (paid: number, total: number) => paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid";
function hashPassword(value: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(value, salt, 64).toString("hex")}`;
}
function verifyPassword(value: string, encoded: string): boolean {
  const [salt, hash] = encoded.split(":");
  const actual = scryptSync(value, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
function asUser(row: Row): User { return { id: String(row.id), name: String(row.name), email: String(row.email), language: row.language as User["language"], demo: Boolean(row.demo) }; }
function asBusiness(row: Row): Business { return { id: String(row.id), name: String(row.name), category: row.category as Business["category"] }; }
function asProduct(row: Row): Product { return { id: String(row.id), name: String(row.name), sku: String(row.sku), unit: String(row.unit), pricePaise: Number(row.price_paise), costPaise: Number(row.cost_paise), quantityMilli: Number(row.quantity_milli), minStockMilli: Number(row.min_stock_milli), expiryDate: row.expiry_date as string | null }; }
function asInvoice(row: Row): Invoice { return { id: String(row.id), number: String(row.number), date: String(row.date), customerId: row.customer_id as string | null, customerName: String(row.customer_name), items: JSON.parse(String(row.items_json)), subtotalPaise: Number(row.subtotal_paise), discountPaise: Number(row.discount_paise), totalPaise: Number(row.total_paise), paidPaise: row.status === "cancelled" ? 0 : Number(row.paid_paise), balancePaise: row.status === "cancelled" ? 0 : Number(row.balance_paise), paymentMethod: row.payment_method as Invoice["paymentMethod"], status: row.status as Invoice["status"], dueDate: row.due_date as string | null }; }
function asPayment(row: Row): Payment { return { id: String(row.id), customerId: row.customer_id as string | null, invoiceId: row.invoice_id as string | null, amountPaise: (row.kind === "refund" ? -1 : 1) * Number(row.amount_paise), method: row.method as Payment["method"], date: String(row.date), kind: row.kind as Payment["kind"] }; }

export class Store {
  readonly db: DatabaseSync;
  constructor(path = process.env.DATABASE_PATH || resolve(process.cwd(), ".data", "dukaanset.sqlite")) {
    // Runtime database directories are external mutable data, never bundle assets.
    if (path !== ":memory:") mkdirSync(dirname(resolve(/* turbopackIgnore: true */ path)), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;");
    const version = Number((this.db.prepare("PRAGMA user_version").get() as Row).user_version);
    if (version > 1) throw new Error("Database schema is newer than this application.");
    this.db.exec(schema);
    this.db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(stamp());
  }
  close() { this.db.close(); }
  private row(sql: string, ...args: (string | number | null)[]): Row | undefined { return this.db.prepare(sql).get(...args) as Row | undefined; }
  private rows(sql: string, ...args: (string | number | null)[]): Row[] { return this.db.prepare(sql).all(...args) as Row[]; }
  private run(sql: string, ...args: (string | number | null)[]) { return this.db.prepare(sql).run(...args); }
  private transaction<T>(work: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try { const result = work(); this.db.exec("COMMIT"); return result; } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
  private audit(userId: string, businessId: string, action: string, detail: string, at = stamp()) {
    this.run("INSERT INTO audit VALUES(?,?,?,?,?,?)", uid(), businessId, userId, action, detail, at);
  }
  assertMember(userId: string, businessId: string): Business {
    const row = this.row("SELECT b.* FROM businesses b JOIN memberships m ON m.business_id=b.id WHERE m.user_id=? AND b.id=?", userId, businessId);
    if (!row) throw new DomainError("NOT_FOUND", "Business not found.", 404);
    return asBusiness(row);
  }
  private entity(table: "products" | "customers" | "suppliers" | "invoices", businessId: string, id: string): Row {
    const row = this.row(`SELECT * FROM ${table} WHERE id=? AND business_id=?`, id, businessId);
    if (!row) throw new DomainError("NOT_FOUND", "Record not found in this business.", 404);
    return row;
  }
  private limitEntities(table: "products" | "customers" | "suppliers", businessId: string) {
    if (Number(this.row(`SELECT COUNT(*) AS count FROM ${table} WHERE business_id=?`, businessId)!.count) >= 2000) throw new DomainError("LIMIT_REACHED", "This local workspace supports 2,000 records of each type.", 409);
  }
  private assertDayOpen(businessId: string) {
    if (this.row("SELECT id FROM closings WHERE business_id=? AND business_day=?", businessId, businessDay())) throw new DomainError("DAY_CLOSED", "Today is already closed. New financial entries can be recorded on the next business day.", 409);
  }
  session(userId: string): Session {
    const user = this.row("SELECT * FROM users WHERE id=?", userId);
    if (!user) throw new DomainError("UNAUTHENTICATED", "Please sign in.", 401);
    return { user: asUser(user), businesses: this.rows("SELECT b.* FROM businesses b JOIN memberships m ON m.business_id=b.id WHERE m.user_id=? ORDER BY b.created_at,b.id", userId).map(asBusiness) };
  }
  register(raw: unknown): Session {
    const input = object(raw), name = string(input.name, "Name", 100), address = email(input.email), secret = password(input.password), businessName = string(input.businessName, "Business name", 100), businessCategory = category(input.category), preference = language(input.language);
    if (this.row("SELECT id FROM users WHERE email=?", address)) throw new DomainError("EMAIL_EXISTS", "An account already uses this email address.", 409);
    const userId = uid(), encoded = hashPassword(secret);
    this.transaction(() => {
      this.run("INSERT INTO users VALUES(?,?,?,?,?,?,?)", userId, name, address, encoded, preference, 0, stamp());
      this.createBusinessRows(userId, businessName, businessCategory);
    });
    return this.session(userId);
  }
  login(raw: unknown): Session {
    const input = object(raw), address = email(input.email), secret = password(input.password);
    const user = this.row("SELECT * FROM users WHERE email=? AND demo=0", address);
    // Perform equal-cost password work for unknown addresses.
    const encoded = user ? String(user.password_hash) : `00000000000000000000000000000000:${"0".repeat(128)}`;
    if (!verifyPassword(secret, encoded) || !user) throw new DomainError("INVALID_CREDENTIALS", "Email or password is incorrect.", 401);
    return this.session(String(user.id));
  }
  issueSession(userId: string): string {
    const token = randomBytes(32).toString("base64url");
    this.run("INSERT INTO sessions VALUES(?,?,?)", createHash("sha256").update(token).digest("hex"), userId, new Date(Date.now() + 7 * 86_400_000).toISOString());
    return token;
  }
  authenticate(token: string | null): string {
    if (!token || token.length > 100) throw new DomainError("UNAUTHENTICATED", "Please sign in.", 401);
    const row = this.row("SELECT user_id FROM sessions WHERE token_hash=? AND expires_at>?", createHash("sha256").update(token).digest("hex"), stamp());
    if (!row) throw new DomainError("UNAUTHENTICATED", "Your session has expired. Please sign in.", 401);
    return String(row.user_id);
  }
  logout(token: string | null) { if (token) this.run("DELETE FROM sessions WHERE token_hash=?", createHash("sha256").update(token).digest("hex")); }
  updateLanguage(userId: string, raw: unknown): Session { this.run("UPDATE users SET language=? WHERE id=?", language(object(raw).language), userId); return this.session(userId); }
  private createBusinessRows(userId: string, name: string, kind: Business["category"]): Business {
    const id = uid();
    this.run("INSERT INTO businesses VALUES(?,?,?,?)", id, name, kind, stamp());
    this.run("INSERT INTO memberships VALUES(?,?,?)", userId, id, "owner");
    this.audit(userId, id, "business.created", name);
    return { id, name, category: kind };
  }
  createBusiness(userId: string, raw: unknown): Business {
    const input = object(raw), name = string(input.name ?? input.businessName, "Business name", 100), kind = category(input.category);
    if (this.session(userId).businesses.length >= 20) throw new DomainError("LIMIT_REACHED", "A workspace supports up to 20 businesses.", 409);
    return this.transaction(() => this.createBusinessRows(userId, name, kind));
  }
  createProduct(userId: string, businessId: string, raw: unknown): Product {
    this.assertMember(userId, businessId); this.limitEntities("products", businessId);
    const input = object(raw), id = uid(), name = string(input.name, "Product name", 100), sku = string(input.sku, "SKU", 64, true), unit = string(input.unit ?? "pcs", "Unit", 20).toLowerCase(), price = integer(input.pricePaise, "Selling price"), cost = integer(input.costPaise ?? 0, "Cost price"), quantity = integer(input.quantityMilli ?? 0, "Stock quantity"), minimum = integer(input.minStockMilli ?? 5000, "Minimum stock"), expiry = date(input.expiryDate);
    if (!["pcs", "piece", "pieces", "unit", "pair", "box", "bottle", "packet", "pack", "kg", "g", "litre", "liter", "l", "ml", "meter", "metre", "m"].includes(unit)) throw new DomainError("INVALID_UNIT", "Choose a supported piece, weight, volume, or length unit.");
    assertWholeUnit(unit, quantity);
    lineTotal(cost, quantity);
    if (sku && this.row("SELECT id FROM products WHERE business_id=? AND sku=?", businessId, sku)) throw new DomainError("SKU_EXISTS", "This SKU already exists in this business.", 409);
    this.transaction(() => {
      this.run("INSERT INTO products VALUES(?,?,?,?,?,?,?,?,?,?)", id, businessId, name, sku, unit, price, cost, quantity, minimum, expiry);
      if (quantity) this.run("INSERT INTO movements VALUES(?,?,?,?,?,?,?)", uid(), businessId, id, quantity, "opening", stamp(), null);
      this.audit(userId, businessId, "product.created", name);
    });
    return asProduct(this.entity("products", businessId, id));
  }
  createContact(userId: string, businessId: string, table: "customers" | "suppliers", raw: unknown): Customer | Supplier {
    this.assertMember(userId, businessId); this.limitEntities(table, businessId);
    const input = object(raw), id = uid(), name = string(input.name, "Name", 100), phone = string(input.phone, "Phone", 30, true);
    this.transaction(() => { this.run(`INSERT INTO ${table} VALUES(?,?,?,?)`, id, businessId, name, phone); this.audit(userId, businessId, `${table}.created`, name); });
    return { id, name, phone, balancePaise: 0 };
  }
  adjustStock(userId: string, businessId: string, raw: unknown): Product {
    this.assertMember(userId, businessId);
    const input = object(raw), productId = string(input.productId, "Product ID", 80), reason = string(input.reason, "Reason", 20);
    if (!["receipt", "wastage", "correction"].includes(reason)) throw new DomainError("INVALID_INPUT", "Choose receipt, wastage, or correction.");
    const quantity = integer(input.quantityMilli, "Stock change", reason === "correction" ? -1_000_000_000 : 1);
    if (!quantity) throw new DomainError("INVALID_INPUT", "Stock change cannot be zero.");
    const work = () => {
      const product = asProduct(this.entity("products", businessId, productId)), delta = reason === "wastage" ? -quantity : quantity;
      assertWholeUnit(product.unit, delta);
      const next = product.quantityMilli + delta;
      if (next < 0 || next > 1_000_000_000) throw new DomainError("INSUFFICIENT_STOCK", "Stock change would exceed the allowed stock range.", 409);
      lineTotal(product.costPaise, next);
      this.run("UPDATE products SET quantity_milli=? WHERE id=? AND business_id=?", next, productId, businessId);
      this.run("INSERT INTO movements VALUES(?,?,?,?,?,?,?)", uid(), businessId, productId, delta, reason, stamp(), null);
      this.audit(userId, businessId, `stock.${reason}`, `${product.name}: ${delta / 1000} ${product.unit}`);
      return { ...product, quantityMilli: next };
    };
    return input.idempotencyKey === undefined ? this.transaction(work) : this.once(businessId, "stock", input, work);
  }
  private once<T>(businessId: string, operation: string, input: Record<string, unknown>, work: () => T): T {
    const key = string(input.idempotencyKey, "Idempotency key", 120), hash = fingerprint(input);
    return this.transaction(() => {
      const prior = this.row("SELECT * FROM idempotency WHERE business_id=? AND operation=? AND key=?", businessId, operation, key);
      if (prior) {
        if (prior.fingerprint !== hash) throw new DomainError("IDEMPOTENCY_CONFLICT", "This request key was already used with different details.", 409);
        return JSON.parse(String(prior.result_json)) as T;
      }
      const result = work();
      this.run("INSERT INTO idempotency VALUES(?,?,?,?,?,?)", businessId, operation, key, hash, JSON.stringify(result), stamp());
      return result;
    });
  }
  createInvoice(userId: string, businessId: string, raw: unknown): Invoice {
    this.assertMember(userId, businessId);
    const input = object(raw), requested = items(input.items), discount = integer(input.discountPaise ?? 0, "Discount"), paid = integer(input.paidPaise ?? 0, "Amount paid"), paymentMethod = method(input.paymentMethod), dueDate = date(input.dueDate), customerId = string(input.customerId, "Customer ID", 80, true) || null;
    return this.once(businessId, "invoice", input, () => {
      this.assertDayOpen(businessId);
      const customer = customerId ? this.entity("customers", businessId, customerId) : null;
      const aggregated = new Map<string, number>();
      for (const item of requested) { const id = string(item.productId, "Product ID", 80), qty = integer(item.quantityMilli, "Quantity", 1); aggregated.set(id, (aggregated.get(id) ?? 0) + qty); }
      const lines: InvoiceItem[] = [...aggregated].map(([id, quantity]) => {
        integer(quantity, "Combined quantity", 1);
        const p = asProduct(this.entity("products", businessId, id));
        assertWholeUnit(p.unit, quantity);
        if (p.quantityMilli < quantity) throw new DomainError("INSUFFICIENT_STOCK", `Only ${p.quantityMilli / 1000} ${p.unit} of ${p.name} is available.`, 409);
        return { productId: id, name: p.name, unit: p.unit, quantityMilli: quantity, pricePaise: p.pricePaise, totalPaise: lineTotal(p.pricePaise, quantity) };
      });
      const subtotal = integer(lines.reduce((sum, item) => sum + item.totalPaise, 0), "Invoice subtotal", 0, 1_000_000_000_000);
      if (discount > subtotal) throw new DomainError("INVALID_DISCOUNT", "Discount cannot exceed the subtotal.");
      const total = subtotal - discount;
      if (paid > total) throw new DomainError("OVERPAYMENT", "Payment cannot exceed the bill total.");
      if (paid < total && !customer) throw new DomainError("CUSTOMER_REQUIRED", "Select a customer for a credit bill.");
      const id = uid(), at = stamp(), count = Number(this.row("SELECT COUNT(*) AS count FROM invoices WHERE business_id=?", businessId)!.count), number = `DS-${String(count + 1).padStart(5, "0")}`;
      this.run("INSERT INTO invoices VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", id, businessId, number, at, customerId, customer ? String(customer.name) : "Walk-in customer", JSON.stringify(lines), subtotal, discount, total, paid, paid, total - paid, paymentMethod, status(paid, total), dueDate);
      for (const item of lines) {
        this.run("UPDATE products SET quantity_milli=quantity_milli-? WHERE id=? AND business_id=?", item.quantityMilli, item.productId, businessId);
        this.run("INSERT INTO movements VALUES(?,?,?,?,?,?,?)", uid(), businessId, item.productId, -item.quantityMilli, "sale", at, id);
      }
      if (paid > 0) this.run("INSERT INTO payments VALUES(?,?,?,?,?,?,?,?)", uid(), businessId, customerId, id, paid, paymentMethod, at, "sale");
      this.audit(userId, businessId, "invoice.created", `${number} · ₹${(total / 100).toFixed(2)}`, at);
      return asInvoice(this.entity("invoices", businessId, id));
    });
  }
  receivePayment(userId: string, businessId: string, raw: unknown): { payments: Payment[]; amountPaise: number; customerId: string } {
    this.assertMember(userId, businessId);
    const input = object(raw), customerId = string(input.customerId, "Customer ID", 80), amount = integer(input.amountPaise, "Payment amount", 1), paymentMethod = method(input.method);
    return this.once(businessId, "payment", input, () => {
      this.assertDayOpen(businessId);
      const customer = this.entity("customers", businessId, customerId), invoices = this.rows("SELECT * FROM invoices WHERE business_id=? AND customer_id=? AND balance_paise>0 AND status!='cancelled' ORDER BY date,id", businessId, customerId), outstanding = invoices.reduce((sum, row) => sum + Number(row.balance_paise), 0);
      if (amount > outstanding) throw new DomainError("OVERPAYMENT", "Payment cannot exceed this customer's outstanding balance.", 409);
      let remaining = amount; const at = stamp(), result: Payment[] = [];
      for (const invoice of invoices) {
        if (!remaining) break;
        const allocated = Math.min(remaining, Number(invoice.balance_paise)), id = uid(), paid = Number(invoice.paid_paise) + allocated, total = Number(invoice.total_paise);
        this.run("UPDATE invoices SET paid_paise=?,balance_paise=?,status=? WHERE id=? AND business_id=?", paid, total - paid, status(paid, total), String(invoice.id), businessId);
        this.run("INSERT INTO payments VALUES(?,?,?,?,?,?,?,?)", id, businessId, customerId, String(invoice.id), allocated, paymentMethod, at, "repayment");
        result.push(asPayment(this.row("SELECT * FROM payments WHERE id=?", id)!)); remaining -= allocated;
      }
      this.audit(userId, businessId, "payment.received", `${customer.name}: ₹${(amount / 100).toFixed(2)}`, at);
      return { payments: result, amountPaise: amount, customerId };
    });
  }
  createPurchase(userId: string, businessId: string, raw: unknown): Purchase {
    this.assertMember(userId, businessId);
    const input = object(raw), supplierId = string(input.supplierId, "Supplier ID", 80), requested = items(input.items), paid = integer(input.paidPaise ?? 0, "Amount paid");
    return this.once(businessId, "purchase", input, () => {
      this.assertDayOpen(businessId);
      const supplier = this.entity("suppliers", businessId, supplierId), seen = new Set<string>();
      const lines = requested.map((item) => {
        const productId = string(item.productId, "Product ID", 80), quantity = integer(item.quantityMilli, "Quantity", 1), cost = integer(item.costPaise, "Cost price"), product = asProduct(this.entity("products", businessId, productId));
        if (seen.has(productId)) throw new DomainError("DUPLICATE_ITEM", "Include each product once in a purchase.");
        seen.add(productId); assertWholeUnit(product.unit, quantity);
        if (product.quantityMilli + quantity > 1_000_000_000) throw new DomainError("STOCK_LIMIT", "Stock would exceed the supported limit.", 409);
        lineTotal(cost, product.quantityMilli + quantity);
        return { productId, name: product.name, unit: product.unit, quantityMilli: quantity, costPaise: cost, totalPaise: lineTotal(cost, quantity) };
      });
      const total = integer(lines.reduce((sum, item) => sum + item.totalPaise, 0), "Purchase total", 0, 1_000_000_000_000);
      if (paid > total) throw new DomainError("OVERPAYMENT", "Payment cannot exceed the purchase total.");
      const id = uid(), at = stamp();
      this.run("INSERT INTO purchases VALUES(?,?,?,?,?,?,?,?)", id, businessId, supplierId, at, JSON.stringify(lines), total, paid, total - paid);
      for (const item of lines) {
        this.run("UPDATE products SET quantity_milli=quantity_milli+?,cost_paise=? WHERE id=? AND business_id=?", item.quantityMilli, item.costPaise, item.productId, businessId);
        this.run("INSERT INTO movements VALUES(?,?,?,?,?,?,?)", uid(), businessId, item.productId, item.quantityMilli, "purchase", at, id);
      }
      this.audit(userId, businessId, "purchase.received", `${supplier.name}: ₹${(total / 100).toFixed(2)}`, at);
      return { id, supplierId, supplierName: String(supplier.name), date: at, items: lines, totalPaise: total, paidPaise: paid, balancePaise: total - paid };
    });
  }
  cancelInvoice(userId: string, businessId: string, invoiceId: string): Invoice {
    this.assertMember(userId, businessId);
    return this.transaction(() => {
      const row = this.entity("invoices", businessId, invoiceId), invoice = asInvoice(row);
      if (invoice.status === "cancelled") return invoice;
      this.assertDayOpen(businessId);
      if (this.row("SELECT id FROM payments WHERE business_id=? AND invoice_id=? AND kind='repayment'", businessId, invoiceId)) throw new DomainError("REPAYMENT_EXISTS", "This bill has later credit repayments. Cancellation requires a reviewed adjustment.", 409);
      const at = stamp();
      for (const item of invoice.items) {
        const p = asProduct(this.entity("products", businessId, item.productId));
        if (p.quantityMilli + item.quantityMilli > 1_000_000_000) throw new DomainError("STOCK_LIMIT", "Reversal would exceed the stock limit.", 409);
        lineTotal(p.costPaise, p.quantityMilli + item.quantityMilli);
        this.run("UPDATE products SET quantity_milli=quantity_milli+? WHERE id=? AND business_id=?", item.quantityMilli, item.productId, businessId);
        this.run("INSERT INTO movements VALUES(?,?,?,?,?,?,?)", uid(), businessId, item.productId, item.quantityMilli, "cancellation", at, invoiceId);
      }
      if (Number(row.original_paid_paise) > 0) this.run("INSERT INTO payments VALUES(?,?,?,?,?,?,?,?)", uid(), businessId, invoice.customerId, invoiceId, Number(row.original_paid_paise), invoice.paymentMethod, at, "refund");
      // Historical invoice amounts remain intact; cancelled invoices are excluded from receivables and sales.
      this.run("UPDATE invoices SET status='cancelled' WHERE id=? AND business_id=?", invoiceId, businessId);
      this.audit(userId, businessId, "invoice.cancelled", `${invoice.number}: stock returned; original payment refunded`, at);
      return asInvoice(this.entity("invoices", businessId, invoiceId));
    });
  }
  createExpense(userId: string, businessId: string, raw: unknown) {
    this.assertMember(userId, businessId);
    const input = object(raw), description = string(input.description, "Description", 200), amount = integer(input.amountPaise, "Expense amount", 1), paymentMethod = method(input.method), id = uid(), at = stamp();
    const work = () => {
      this.assertDayOpen(businessId);
      this.run("INSERT INTO expenses VALUES(?,?,?,?,?,?)", id, businessId, description, amount, paymentMethod, at);
      this.audit(userId, businessId, "expense.created", `${description}: ₹${(amount / 100).toFixed(2)}`, at);
      return { id, description, amountPaise: amount, method: paymentMethod, date: at };
    };
    return input.idempotencyKey === undefined ? this.transaction(work) : this.once(businessId, "expense", input, work);
  }
  createClosing(userId: string, businessId: string, raw: unknown) {
    this.assertMember(userId, businessId);
    const input = object(raw), opening = integer(input.openingCashPaise ?? 0, "Opening cash"), actual = integer(input.actualCashPaise, "Actual cash"), id = uid(), at = stamp(), day = businessDay(at);
    return this.transaction(() => {
      if (this.row("SELECT id FROM closings WHERE business_id=? AND business_day=?", businessId, day)) throw new DomainError("ALREADY_CLOSED", "A closing already exists for today.", 409);
      const cash = this.rows("SELECT * FROM payments WHERE business_id=? AND method='cash'", businessId).filter(r => businessDay(String(r.date)) === day).reduce((sum, r) => sum + (r.kind === "refund" ? -1 : 1) * Number(r.amount_paise), 0), expenses = this.rows("SELECT * FROM expenses WHERE business_id=? AND method='cash'", businessId).filter(r => businessDay(String(r.date)) === day).reduce((sum, r) => sum + Number(r.amount_paise), 0), purchases = this.rows("SELECT * FROM purchases WHERE business_id=?", businessId).filter(r => businessDay(String(r.date)) === day).reduce((sum, r) => sum + Number(r.paid_paise), 0), expected = opening + cash - expenses - purchases;
      this.run("INSERT INTO closings VALUES(?,?,?,?,?,?,?,?)", id, businessId, at, day, opening, expected, actual, actual - expected);
      this.audit(userId, businessId, "day.closed", `Cash difference: ₹${((actual - expected) / 100).toFixed(2)}`, at);
      return { id, date: at, businessDay: day, openingCashPaise: opening, expectedCashPaise: expected, actualCashPaise: actual, differencePaise: actual - expected };
    });
  }
  state(userId: string, businessId: string): BusinessState {
    const business = this.assertMember(userId, businessId), products = this.rows("SELECT * FROM products WHERE business_id=? ORDER BY name", businessId).map(asProduct), allInvoices = this.rows("SELECT * FROM invoices WHERE business_id=? ORDER BY date DESC,id DESC", businessId).map(asInvoice), allPayments = this.rows("SELECT * FROM payments WHERE business_id=? ORDER BY date DESC,id DESC", businessId).map(asPayment), today = businessDay();
    const customers = this.rows("SELECT c.*,COALESCE((SELECT SUM(i.balance_paise) FROM invoices i WHERE i.customer_id=c.id AND i.business_id=c.business_id AND i.status!='cancelled'),0) balance_paise FROM customers c WHERE c.business_id=? ORDER BY c.name", businessId).map(r => ({ id: String(r.id), name: String(r.name), phone: String(r.phone), balancePaise: Number(r.balance_paise) }));
    const suppliers = this.rows("SELECT s.*,COALESCE((SELECT SUM(p.balance_paise) FROM purchases p WHERE p.supplier_id=s.id AND p.business_id=s.business_id),0) balance_paise FROM suppliers s WHERE s.business_id=? ORDER BY s.name", businessId).map(r => ({ id: String(r.id), name: String(r.name), phone: String(r.phone), balancePaise: Number(r.balance_paise) }));
    const active = allInvoices.filter(i => i.status !== "cancelled"), todayInvoices = active.filter(i => businessDay(i.date) === today), todayPayments = allPayments.filter(p => businessDay(p.date) === today), low = products.filter(p => p.quantityMilli <= p.minStockMilli);
    const weeklySales = Array.from({ length: 7 }, (_, index) => { const day = new Date(Date.parse(`${today}T12:00:00Z`) - (6 - index) * 86_400_000).toISOString().slice(0, 10); return { date: day, label: new Date(`${day}T12:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" }), salesPaise: active.filter(i => businessDay(i.date) === day).reduce((sum, i) => sum + i.totalPaise, 0) }; });
    const tasks: BusinessState["tasks"] = low.slice(0, 6).map(p => ({ id: `stock-${p.id}`, title: `Restock ${p.name}`, detail: `${p.quantityMilli / 1000} ${p.unit} remaining`, type: "stock", name: p.name, productId: p.id, quantityMilli: p.quantityMilli, unit: p.unit }));
    for (const c of customers.filter(c => c.balancePaise > 0).slice(0, 4)) tasks.push({ id: `credit-${c.id}`, title: `Collect from ${c.name}`, detail: `₹${(c.balancePaise / 100).toFixed(2)} outstanding`, type: "credit", name: c.name, customerId: c.id, balancePaise: c.balancePaise });
    for (const p of products.filter(p => p.expiryDate && p.expiryDate <= new Date(Date.parse(`${today}T00:00:00Z`) + 7 * 86_400_000).toISOString().slice(0, 10)).slice(0, 4)) tasks.push({ id: `expiry-${p.id}`, title: `Check ${p.name} expiry`, detail: `Expiry: ${p.expiryDate}`, type: "expiry", name: p.name, productId: p.id, expiryDate: p.expiryDate! });
    return { business, products, customers, suppliers, invoices: allInvoices.slice(0, 1000), payments: allPayments.slice(0, 1000),
      movements: this.rows("SELECT m.*,p.name product_name FROM movements m JOIN products p ON p.id=m.product_id WHERE m.business_id=? ORDER BY m.date DESC,m.id DESC LIMIT 1000", businessId).map(r => ({ id: String(r.id), productId: String(r.product_id), productName: String(r.product_name), quantityMilli: Number(r.quantity_milli), reason: String(r.reason), date: String(r.date), referenceId: r.reference_id as string | null })),
      purchases: this.rows("SELECT p.*,s.name supplier_name FROM purchases p JOIN suppliers s ON s.id=p.supplier_id WHERE p.business_id=? ORDER BY p.date DESC,p.id DESC LIMIT 1000", businessId).map(r => ({ id: String(r.id), supplierId: String(r.supplier_id), supplierName: String(r.supplier_name), date: String(r.date), items: JSON.parse(String(r.items_json)), totalPaise: Number(r.total_paise), paidPaise: Number(r.paid_paise), balancePaise: Number(r.balance_paise) })),
      expenses: this.rows("SELECT * FROM expenses WHERE business_id=? ORDER BY date DESC,id DESC LIMIT 1000", businessId).map(r => ({ id: String(r.id), description: String(r.description), amountPaise: Number(r.amount_paise), method: r.method as "cash" | "upi", date: String(r.date) })),
      closings: this.rows("SELECT * FROM closings WHERE business_id=? ORDER BY date DESC LIMIT 365", businessId).map(r => ({ id: String(r.id), date: String(r.date), businessDay: String(r.business_day), openingCashPaise: Number(r.opening_cash_paise), expectedCashPaise: Number(r.expected_cash_paise), actualCashPaise: Number(r.actual_cash_paise), differencePaise: Number(r.difference_paise) })),
      metrics: { salesTodayPaise: todayInvoices.reduce((sum, i) => sum + i.totalPaise, 0), collectedTodayPaise: todayPayments.reduce((sum, p) => sum + p.amountPaise, 0), outstandingPaise: active.reduce((sum, i) => sum + i.balancePaise, 0), lowStockCount: low.length, billsToday: todayInvoices.length, stockValuePaise: products.reduce((sum, p) => sum + lineTotal(p.costPaise, p.quantityMilli), 0) }, weeklySales, tasks,
      activity: this.rows("SELECT * FROM audit WHERE business_id=? ORDER BY date DESC,id DESC LIMIT 100", businessId).map(r => ({ id: String(r.id), action: String(r.action), detail: String(r.detail), date: String(r.date) })) };
  }
  export(userId: string, businessId: string) {
    this.assertMember(userId, businessId);
    const data: Record<string, unknown> = { version: 1, exportedAt: stamp(), business: this.assertMember(userId, businessId), currency: "INR", quantityScale: 1000 };
    for (const table of ["products", "customers", "suppliers", "invoices", "payments", "movements", "purchases", "expenses", "closings", "audit"] as const) data[table] = this.rows(`SELECT * FROM ${table} WHERE business_id=?`, businessId);
    return data;
  }
  demo(): Session {
    const userId = uid(), at = stamp(), baseline = new Date(Date.parse(at) - 7 * 86_400_000).toISOString();
    this.run("INSERT INTO users VALUES(?,?,?,?,?,?,?)", userId, "Aarav Sharma", `demo-${userId}@example.invalid`, hashPassword(randomBytes(32).toString("hex")), "hinglish", 1, baseline);
    const definitions: { name: string; category: Business["category"]; products: [string, string, number, number, number][] }[] = [
      { name: "Sharma Kirana", category: "grocery", products: [["Basmati Rice", "kg", 12500, 9800, 82000], ["Aashirvaad Atta", "kg", 5800, 4400, 125000], ["Tata Salt", "pcs", 2800, 2200, 68000], ["Amul Milk", "pcs", 3200, 2800, 8000], ["Toor Dal", "kg", 16500, 13200, 34000], ["Fortune Oil", "pcs", 14500, 12100, 25000], ["Parle-G Biscuits", "pcs", 1000, 750, 43000], ["Sugar", "kg", 4500, 3900, 42000], ["Red Chilli Powder", "kg", 28000, 21000, 18000], ["Brooke Bond Tea", "pcs", 14500, 11800, 12000], ["Maggi Noodles", "pcs", 1400, 1050, 4000], ["Surf Excel", "pcs", 12500, 10300, 22000]] },
      { name: "Sharma Hardware", category: "hardware", products: [["Cement Bag 50kg", "pcs", 38000, 34000, 42000], ["Steel Nails", "kg", 8500, 6200, 28000], ["PVC Pipe 1 inch", "pcs", 18500, 14000, 60000], ["Asian Paints White", "pcs", 285000, 236000, 14000], ["Door Handle", "pcs", 25000, 17000, 38000], ["Screwdriver Set", "pcs", 45000, 33000, 18000], ["Electrical Wire", "meter", 2400, 1600, 350000], ["Wall Putty 20kg", "pcs", 65000, 54000, 20000], ["Brass Tap", "pcs", 35000, 26000, 4000], ["Measuring Tape", "pcs", 18000, 11500, 16000]] },
      { name: "Sharma Fresh Vegetables", category: "vegetables", products: [["Fresh Tomatoes", "kg", 4500, 2900, 48000], ["Potatoes", "kg", 3200, 2200, 92000], ["Red Onions", "kg", 4200, 3000, 75000], ["Green Capsicum", "kg", 6500, 4300, 19000], ["Fresh Spinach", "kg", 3500, 1900, 4500], ["Carrots", "kg", 5500, 3500, 28000], ["Green Peas", "kg", 8500, 5800, 16000], ["Cauliflower", "kg", 4800, 3200, 33000], ["Ginger", "kg", 18000, 13000, 8000], ["Green Chillies", "kg", 8500, 4800, 11000]] },
    ];
    for (const definition of definitions) {
      const business = this.createBusiness(userId, definition), customers = ["Priya Verma", "Ramesh Gupta", "Neha Singh", "Vikram Patel"].map((name, i) => this.createContact(userId, business.id, "customers", { name, phone: `90000000${String(i + 11)}` }) as Customer);
      this.createContact(userId, business.id, "suppliers", { name: definition.category === "vegetables" ? "Azadpur Fresh Supply" : "Metro Wholesale Supply", phone: "9000000091" });
      this.createContact(userId, business.id, "suppliers", { name: "Shree Distribution", phone: "9000000092" });
      const products = definition.products.map(([name, unit, pricePaise, costPaise, quantityMilli], i) => this.createProduct(userId, business.id, { name, unit, pricePaise, costPaise, quantityMilli, sku: `${definition.category.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`, minStockMilli: unit === "pcs" ? 5000 : 6000, expiryDate: definition.category === "vegetables" ? new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10) : null }));
      this.run("UPDATE businesses SET created_at=? WHERE id=?", baseline, business.id);
      this.run("UPDATE movements SET date=? WHERE business_id=? AND reason='opening'", baseline, business.id);
      this.run("UPDATE audit SET date=? WHERE business_id=?", baseline, business.id);
      for (let day = 6; day >= 0; day--) {
        const p = products[day % 3], quantity = p.unit === "pcs" ? 1000 : 2000, total = lineTotal(p.pricePaise, quantity), paid = day % 3 === 0 ? Math.floor(total / 2) : total, customer = customers[day % 4];
        const requestKey = uid(), invoice = this.createInvoice(userId, business.id, { idempotencyKey: requestKey, customerId: customer.id, items: [{ productId: p.id, quantityMilli: quantity }], discountPaise: 0, paidPaise: paid, paymentMethod: day % 2 ? "upi" : "cash", dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10) });
        const historical = new Date(Date.now() - day * 86_400_000).toISOString();
        this.run("UPDATE invoices SET date=? WHERE id=?", historical, invoice.id);
        this.run("UPDATE payments SET date=? WHERE invoice_id=?", historical, invoice.id);
        this.run("UPDATE movements SET date=? WHERE reference_id=?", historical, invoice.id);
        this.run("UPDATE audit SET date=? WHERE business_id=? AND action='invoice.created' AND detail LIKE ?", historical, business.id, `${invoice.number} ·%`);
        this.run("UPDATE idempotency SET result_json=?,created_at=? WHERE business_id=? AND operation='invoice' AND key=?", JSON.stringify({ ...invoice, date: historical }), historical, business.id, requestKey);
      }
    }
    return this.session(userId);
  }
}

declare global { var dukaanStore: Store | undefined; }
export function getStore(): Store { return globalThis.dukaanStore ??= new Store(); }
