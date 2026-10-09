import { DatabaseSync } from "node:sqlite";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Business, BusinessState, Customer, CustomerStatement, InventoryEntry, Invoice, InvoiceItem, Payment, Product, Purchase, SaleAttachment, Session, Supplier, User } from "../contracts";
import { schema } from "./schema";
import { migrationV2, migrationV3 } from "./migrations";
import { access, authorize } from './access';
import type { ModuleKey, Permission } from '../v3-contracts';
import { DomainError, aliases, assertWholeUnit, businessDay, category, convertQuantity, date, email, fingerprint, integer, items, keys, language, lineTotal, method, object, oneOf, password, string, unit as validateUnit } from "./validation";

type Row = Record<string, string | number | null>;
const stamp = () => new Date().toISOString();
const uid = () => randomUUID();
const status = (paid: number, total: number) => paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid";
export function hashPassword(value: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(value, salt, 64).toString("hex")}`;
}
export function verifyPassword(value: string, encoded: string): boolean {
  const [salt, hash] = encoded.split(":");
  const actual = scryptSync(value, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
function asUser(row: Row): User { return { id: String(row.id), name: String(row.name), email: String(row.email), language: row.language as User["language"], demo: Boolean(row.demo), emailVerified: Boolean(row.email_verified), verificationRequired: Boolean(row.verification_required) }; }
function asBusiness(row: Row): Business { return { id: String(row.id), name: String(row.name), category: row.category as Business["category"] }; }
function asProduct(row: Row): Product { return { id: String(row.id), name: String(row.name), sku: String(row.sku), unit: String(row.unit), pricePaise: Number(row.price_paise), costPaise: Number(row.cost_paise), quantityMilli: Number(row.quantity_milli), minStockMilli: Number(row.min_stock_milli), expiryDate: row.expiry_date as string | null, aliases: JSON.parse(String(row.aliases_json)), barcode: String(row.barcode), variation: String(row.variation), packSize: row.pack_size === null ? null : Number(row.pack_size) }; }
function asInvoice(row: Row, payments: Payment[] = []): Invoice { return { id: String(row.id), number: String(row.number), date: String(row.date), customerId: row.customer_id as string | null, customerName: String(row.customer_name), items: JSON.parse(String(row.items_json)), subtotalPaise: Number(row.subtotal_paise), discountPaise: Number(row.discount_paise), totalPaise: Number(row.total_paise), paidPaise: row.status === "cancelled" ? 0 : Number(row.paid_paise), balancePaise: row.status === "cancelled" ? 0 : Number(row.balance_paise), paymentMethod: row.payment_method as Invoice["paymentMethod"], payments, status: row.status as Invoice["status"], dueDate: row.due_date as string | null }; }
function asPayment(row: Row): Payment { return { id: String(row.id), customerId: row.customer_id as string | null, invoiceId: row.invoice_id as string | null, amountPaise: (row.kind === "refund" ? -1 : 1) * Number(row.amount_paise), method: row.method as Payment["method"], date: String(row.date), kind: row.kind as Payment["kind"] }; }
function asAttachment(row: Row): SaleAttachment { return { id: String(row.id), url: `/api/businesses/${row.business_id}/attachments/${row.id}`, productId: String(row.product_id), mime: row.mime as SaleAttachment["mime"], size: Number(row.size), date: String(row.date) }; }

export class Store {
  readonly db: DatabaseSync;
  readonly schemaVersion = 3;
  readonly runtimeRevision = "v3.1";
  private transactionDepth = 0;
  constructor(path = process.env.DATABASE_PATH || resolve(process.cwd(), ".data", "dukaanset.sqlite")) {
    // Runtime database directories are external mutable data, never bundle assets.
    if (path !== ":memory:") mkdirSync(dirname(resolve(/* turbopackIgnore: true */ path)), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;");
    const version = Number((this.db.prepare("PRAGMA user_version").get() as Row).user_version);
    if (version > 3) { this.db.close(); throw new Error("Database schema is newer than this application."); }
    this.transaction(() => {
      if (version === 0) this.db.exec(schema);
      if (version < 2) this.db.exec(migrationV2);
      if (version < 3) this.db.exec(migrationV3);
    });
    this.db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(stamp());
    this.db.prepare("DELETE FROM attachments WHERE invoice_id IS NULL AND date < ?").run(new Date(Date.now() - 86_400_000).toISOString());
  }
  close() { this.db.close(); }
  private row(sql: string, ...args: (string | number | null)[]): Row | undefined { return this.db.prepare(sql).get(...args) as Row | undefined; }
  private rows(sql: string, ...args: (string | number | null)[]): Row[] { return this.db.prepare(sql).all(...args) as Row[]; }
  private run(sql: string, ...args: (string | number | null)[]) { return this.db.prepare(sql).run(...args); }
  transaction<T>(work: () => T): T {
    const level = this.transactionDepth, savepoint = `work_${level}`;
    this.db.exec(level ? `SAVEPOINT ${savepoint}` : "BEGIN IMMEDIATE");
    this.transactionDepth++;
    try { const result = work(); this.db.exec(level ? `RELEASE ${savepoint}` : "COMMIT"); return result; }
    catch (error) { this.db.exec(level ? `ROLLBACK TO ${savepoint}; RELEASE ${savepoint}` : "ROLLBACK"); throw error; }
    finally { this.transactionDepth--; }
  }
  private invoice(businessId: string, invoiceId: string): Invoice { return asInvoice(this.entity("invoices", businessId, invoiceId), this.rows("SELECT * FROM payments WHERE business_id=? AND invoice_id=? ORDER BY date,id", businessId, invoiceId).map(asPayment)); }
  audit(userId: string, businessId: string, action: string, detail: string, at = stamp()) {
    this.run("INSERT INTO audit VALUES(?,?,?,?,?,?)", uid(), businessId, userId, action, detail, at);
  }
  assertMember(userId: string, businessId: string): Business {
    access(this.db,userId,businessId);
    const row = this.row("SELECT b.* FROM businesses b JOIN memberships m ON m.business_id=b.id WHERE m.user_id=? AND b.id=?", userId, businessId);
    if (!row) throw new DomainError("NOT_FOUND", "Business not found.", 404);
    return asBusiness(row);
  }
  assertPermission(userId:string,businessId:string,permission:Permission,feature?:ModuleKey){return authorize(this.db,userId,businessId,permission,feature);}
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
    const input = object(raw), name = string(input.name, "Name", 100), address = email(input.email), secret = password(input.password), businessName = string(input.businessName, "Business name", 100,true), businessCategory = category(input.category), preference = language(input.language);
    if (this.row("SELECT id FROM users WHERE email=?", address)) throw new DomainError("EMAIL_EXISTS", "An account already uses this email address.", 409);
    const userId = uid(), encoded = hashPassword(secret);
    this.transaction(() => {
      this.run("INSERT INTO users(id,name,email,password_hash,language,demo,created_at) VALUES(?,?,?,?,?,?,?)", userId, name, address, encoded, preference, 0, stamp());
      if(businessName)this.createBusinessRows(userId, businessName, businessCategory);
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
    this.run("INSERT INTO memberships(user_id,business_id,role) VALUES(?,?,?)", userId, id, "owner");
    this.audit(userId, id, "business.created", name);
    return { id, name, category: kind };
  }
  createBusiness(userId: string, raw: unknown): Business {
    const account=this.session(userId).user;if(account.verificationRequired&&!account.emailVerified)throw new DomainError('EMAIL_UNVERIFIED','Verify your email before creating a shop.',403);
    const input = object(raw), name = string(input.name ?? input.businessName, "Business name", 100), kind = category(input.category);
    if (this.session(userId).businesses.length >= 20) throw new DomainError("LIMIT_REACHED", "A workspace supports up to 20 businesses.", 409);
    return this.transaction(() => this.createBusinessRows(userId, name, kind));
  }
  createProduct(userId: string, businessId: string, raw: unknown): Product {
    this.assertPermission(userId,businessId,"inventory");
    this.assertMember(userId, businessId); this.limitEntities("products", businessId);
    const input = object(raw), id = uid(), name = string(input.name, "Product name", 100), sku = string(input.sku, "SKU", 64, true), unit = validateUnit(input.unit), price = integer(input.pricePaise, "Selling price"), cost = integer(input.costPaise ?? 0, "Cost price"), quantity = integer(input.quantityMilli ?? 0, "Stock quantity"), minimum = integer(input.minStockMilli ?? 5000, "Minimum stock"), expiry = date(input.expiryDate), names = aliases(input.aliases), barcode = string(input.barcode, "Barcode", 80, true), variation = string(input.variation, "Variation", 100, true), packSize = input.packSize === undefined || input.packSize === null ? null : integer(input.packSize, "Pack size", 1, 100000);
    keys(input, ["name", "sku", "unit", "pricePaise", "costPaise", "quantityMilli", "minStockMilli", "expiryDate", "aliases", "barcode", "variation", "packSize"]);
    if(variation)this.assertPermission(userId,businessId,'inventory','variants');
    if(expiry)this.assertPermission(userId,businessId,'inventory','expiryTracking');
    if(packSize)this.assertPermission(userId,businessId,'inventory','unitConversion');
    assertWholeUnit(unit, quantity);
    lineTotal(cost, quantity);
    if (sku && this.row("SELECT id FROM products WHERE business_id=? AND sku=?", businessId, sku)) throw new DomainError("SKU_EXISTS", "This SKU already exists in this business.", 409);
    this.transaction(() => {
      this.run("INSERT INTO products VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", id, businessId, name, sku, unit, price, cost, quantity, minimum, expiry, JSON.stringify(names), barcode, variation, packSize);
      if (quantity) this.run("INSERT INTO movements VALUES(?,?,?,?,?,?,?)", uid(), businessId, id, quantity, "opening", stamp(), null);
      this.audit(userId, businessId, "product.created", name);
    });
    return asProduct(this.entity("products", businessId, id));
  }
  editProduct(userId: string, businessId: string, productId: string, raw: unknown): Product {
    this.assertPermission(userId,businessId,"inventory");
    this.assertMember(userId, businessId);
    const input = object(raw);
    keys(input, ["name", "sku", "unit", "pricePaise", "costPaise", "minStockMilli", "expiryDate", "aliases", "barcode", "variation", "packSize"]);
    return this.transaction(() => {
      const prior = asProduct(this.entity("products", businessId, productId));
      const next = { ...prior, name: input.name === undefined ? prior.name : string(input.name, "Product name", 100), sku: input.sku === undefined ? prior.sku : string(input.sku, "SKU", 64, true), unit: input.unit === undefined ? prior.unit : validateUnit(input.unit), pricePaise: input.pricePaise === undefined ? prior.pricePaise : integer(input.pricePaise, "Selling price"), costPaise: input.costPaise === undefined ? prior.costPaise : integer(input.costPaise, "Cost price"), minStockMilli: input.minStockMilli === undefined ? prior.minStockMilli : integer(input.minStockMilli, "Minimum stock"), expiryDate: input.expiryDate === undefined ? prior.expiryDate : date(input.expiryDate), aliases: input.aliases === undefined ? prior.aliases : aliases(input.aliases), barcode: input.barcode === undefined ? prior.barcode : string(input.barcode, "Barcode", 80, true), variation: input.variation === undefined ? prior.variation : string(input.variation, "Variation", 100, true), packSize: input.packSize === undefined ? prior.packSize : input.packSize === null ? null : integer(input.packSize, "Pack size", 1, 100000) };
      if(next.variation&&next.variation!==prior.variation)this.assertPermission(userId,businessId,'inventory','variants');
      if(next.expiryDate&&next.expiryDate!==prior.expiryDate)this.assertPermission(userId,businessId,'inventory','expiryTracking');
      if(next.packSize&&next.packSize!==prior.packSize)this.assertPermission(userId,businessId,'inventory','unitConversion');
      if (next.unit !== prior.unit && this.row("SELECT id FROM movements WHERE business_id=? AND product_id=? LIMIT 1", businessId, productId)) throw new DomainError("UNIT_LOCKED", "A product's unit cannot change after stock movements. Create a separate product with the new unit.", 409);
      if (next.sku && this.row("SELECT id FROM products WHERE business_id=? AND sku=? AND id!=?", businessId, next.sku, productId)) throw new DomainError("SKU_EXISTS", "This SKU already exists in this business.", 409);
      lineTotal(next.costPaise, next.quantityMilli);
      this.run("UPDATE products SET name=?,sku=?,unit=?,price_paise=?,cost_paise=?,min_stock_milli=?,expiry_date=?,aliases_json=?,barcode=?,variation=?,pack_size=? WHERE id=? AND business_id=?", next.name, next.sku, next.unit, next.pricePaise, next.costPaise, next.minStockMilli, next.expiryDate, JSON.stringify(next.aliases), next.barcode, next.variation, next.packSize, productId, businessId);
      this.audit(userId, businessId, "product.updated", next.name);
      return next;
    });
  }
  createContact(userId: string, businessId: string, table: "customers" | "suppliers", raw: unknown): Customer | Supplier {
    this.assertPermission(userId,businessId,table==='suppliers'?'purchases':'customers');
    this.assertMember(userId, businessId);
    const input = object(raw), name = string(input.name, "Name", 100), phone = string(input.phone, "Phone", 30, true);
    keys(input, ["name", "phone", "idempotencyKey"]);
    const work = (): Customer | Supplier => {
      this.limitEntities(table, businessId);
      const id = uid();
      this.run(`INSERT INTO ${table} VALUES(?,?,?,?)`, id, businessId, name, phone);
      this.audit(userId, businessId, `${table}.created`, name);
      return table === "customers" ? { id, name, phone, balancePaise: 0, totalSalesPaise: 0, netReceivedPaise: 0 } : { id, name, phone, balancePaise: 0 };
    };
    return input.idempotencyKey === undefined ? this.transaction(work) : this.once(businessId, `contact.${table}`, input, work);
  }
  private customers(businessId: string, customerId?: string): Customer[] {
    return this.rows(`SELECT c.*,COALESCE((SELECT SUM(i.balance_paise) FROM invoices i WHERE i.customer_id=c.id AND i.business_id=c.business_id AND i.status!='cancelled'),0) balance_paise, COALESCE((SELECT SUM(i.total_paise) FROM invoices i WHERE i.customer_id=c.id AND i.business_id=c.business_id AND i.status!='cancelled'),0) total_sales_paise, COALESCE((SELECT SUM(CASE WHEN p.kind='refund' THEN -p.amount_paise ELSE p.amount_paise END) FROM payments p WHERE p.customer_id=c.id AND p.business_id=c.business_id),0) net_received_paise FROM customers c WHERE c.business_id=?${customerId ? " AND c.id=?" : ""} ORDER BY c.name`, businessId, ...(customerId ? [customerId] : [])).map(row => ({ id: String(row.id), name: String(row.name), phone: String(row.phone), balancePaise: Number(row.balance_paise), totalSalesPaise: Number(row.total_sales_paise), netReceivedPaise: Number(row.net_received_paise) }));
  }
  customerStatement(userId: string, businessId: string, customerId: string): CustomerStatement {
    this.assertPermission(userId,businessId,"customers");
    this.assertMember(userId, businessId); this.entity("customers", businessId, customerId);
    return this.transaction(() => {
      const invoiceUsage = this.row("SELECT COUNT(*) count,COALESCE(SUM(length(items_json)),0) size FROM invoices WHERE business_id=? AND customer_id=?", businessId, customerId)!;
      const paymentUsage = this.row("SELECT COUNT(*) count FROM payments WHERE business_id=? AND customer_id=?", businessId, customerId)!;
      if (Number(invoiceUsage.count) > 5000 || Number(paymentUsage.count) > 10000 || Number(invoiceUsage.size) > 8388608) throw new DomainError("STATEMENT_LIMIT", "The full statement exceeds the supported local download limit. Export the business ledger instead.", 409);
      const payments = this.rows("SELECT * FROM payments WHERE business_id=? AND customer_id=? ORDER BY date DESC,id DESC", businessId, customerId).map(asPayment);
      const grouped = new Map<string, Payment[]>();
      for (const payment of payments) if (payment.invoiceId) grouped.set(payment.invoiceId, [...(grouped.get(payment.invoiceId) ?? []), payment]);
      const invoices = this.rows("SELECT * FROM invoices WHERE business_id=? AND customer_id=? ORDER BY date DESC,id DESC", businessId, customerId).map(row => asInvoice(row, grouped.get(String(row.id)) ?? []));
      return { customer: this.customers(businessId, customerId)[0], invoices, payments };
    });
  }
  adjustStock(userId: string, businessId: string, raw: unknown): Product {
    this.assertPermission(userId,businessId,"inventory");
    this.assertMember(userId, businessId);
    const input = object(raw), productId = string(input.productId, "Product ID", 80), reason = string(input.reason, "Reason", 20);
    if(reason==='wastage')this.assertPermission(userId,businessId,'inventory','wastageTracking');
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
  receiveStockBatch(userId: string, businessId: string, raw: unknown): InventoryEntry {
    this.assertPermission(userId,businessId,"inventory");
    this.assertMember(userId, businessId);
    const input = object(raw), requested = items(input.items), source = oneOf(input.source, "Entry source", ["voice", "manual", "mixed"]);
    if(source!=='manual')this.assertPermission(userId,businessId,'inventory','voiceStock');
    keys(input, ["idempotencyKey", "source", "items"]);
    return this.once(businessId, "stockbatch", input, () => {
      const aggregate = new Map<string, { product: Product; quantity: number }>();
      const created = new Map<string, { product: Product; fingerprint: string }>();
      for (const item of requested) {
        keys(item, ["productId", "newProduct", "quantityMilli", "unit"]);
        if ((item.productId !== undefined) === (item.newProduct !== undefined)) throw new DomainError('INVALID_INPUT','Choose an existing product or supply reviewed new-product details.');
        let product: Product;
        if (item.newProduct !== undefined) {
          const details=object(item.newProduct);
          keys(details,['name','unit','pricePaise','costPaise','sku','variation']);
          const name=string(details.name,'Product name',100), variation=string(details.variation,'Variation',100,true), unit=validateUnit(details.unit);
          const label=(value:string)=>value.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
          const unitAliases:Record<string,string>={pcs:'piece',pieces:'piece',unit:'piece',kilogram:'kg',gram:'g',grams:'g',liter:'litre',l:'litre',meter:'metre',m:'metre'};
          const canonical=(value:string)=>unitAliases[value]||value;
          const identity=JSON.stringify([label(name),label(variation),canonical(unit)]), digest=fingerprint(details), prior=created.get(identity);
          if(prior){if(prior.fingerprint!==digest)throw new DomainError('INVALID_INPUT','Repeated new-product rows must have the same product details.');product=prior.product;}
          else {
            if(this.rows('SELECT name,variation,unit FROM products WHERE business_id=?',businessId).some(row=>label(String(row.name))===label(name)&&label(String(row.variation))===label(variation)&&canonical(String(row.unit))===canonical(unit)))throw new DomainError('PRODUCT_EXISTS','This product already exists. Choose it from the catalogue.',409);
            product=this.createProduct(userId,businessId,{...details,name,variation,unit,quantityMilli:0});
            created.set(identity,{product,fingerprint:digest});
          }
        } else product=asProduct(this.entity('products',businessId,string(item.productId,'Product ID',80)));
        const productId=product.id, quantity = integer(item.quantityMilli, "Quantity", 1), from = item.unit === undefined ? product.unit : validateUnit(item.unit);
        assertWholeUnit(from, quantity);
        if(from!==product.unit)this.assertPermission(userId,businessId,'inventory','unitConversion');
        const converted = convertQuantity(quantity, from, product.unit, product.packSize);
        assertWholeUnit(product.unit, converted);
        aggregate.set(productId, { product, quantity: (aggregate.get(productId)?.quantity ?? 0) + converted });
      }
      const id = uid(), at = stamp();
      const lines = [...aggregate].map(([productId, { product, quantity }]) => {
        integer(quantity, "Combined stock receipt", 1);
        if (product.quantityMilli + quantity > 1_000_000_000) throw new DomainError("STOCK_LIMIT", "Stock would exceed the supported limit.", 409);
        lineTotal(product.costPaise, product.quantityMilli + quantity);
        return { productId, name: product.name, unit: product.unit, quantityMilli: quantity, movementId: uid() };
      });
      for (const item of lines) {
        this.run("UPDATE products SET quantity_milli=quantity_milli+? WHERE id=? AND business_id=?", item.quantityMilli, item.productId, businessId);
        this.run("INSERT INTO movements VALUES(?,?,?,?,?,?,?)", item.movementId, businessId, item.productId, item.quantityMilli, "receipt", at, id);
      }
      this.run("INSERT INTO inventory_entries VALUES(?,?,?,?,?,?)", id, businessId, userId, at, source, JSON.stringify(lines));
      this.audit(userId, businessId, "stockbatch.received", `${source}: ${lines.length} products received`, at);
      return { id, date: at, source, items: lines };
    });
  }
  /** Only decoded, normalized images from the router enter this private blob table. */
  createAttachment(userId: string, businessId: string, productId: string, mime: SaleAttachment["mime"], bytes: Buffer, requestKey: string, originalHash: string): SaleAttachment {
    this.assertPermission(userId,businessId,"sales");
    this.assertPermission(userId,businessId,'sales','photoSales');
    this.assertMember(userId, businessId);
    const input = { idempotencyKey: string(requestKey, "Idempotency key", 120), productId: string(productId, "Product ID", 80), mime, originalHash };
    if (bytes.length < 1 || bytes.length > 2097152) throw new DomainError("BODY_TOO_LARGE", "Photos must be at most 2 MB.", 413);
    return this.once(businessId, "attachment", input, () => {
      this.entity("products", businessId, productId);
      this.run("DELETE FROM attachments WHERE business_id=? AND invoice_id IS NULL AND date<?", businessId, new Date(Date.now() - 86_400_000).toISOString());
      const usage = this.row("SELECT COUNT(*) count,COALESCE(SUM(size),0) size FROM attachments WHERE business_id=?", businessId)!;
      const pending = this.row("SELECT COUNT(*) count FROM attachments WHERE business_id=? AND invoice_id IS NULL", businessId)!;
      if (Number(usage.size) + bytes.length > 104857600 || Number(usage.count) >= 1000 || Number(pending.count) >= 20) throw new DomainError("ATTACHMENT_LIMIT", "Photo storage limit reached. Remove unused photos before uploading.", 409);
      const id = uid(), at = stamp();
      this.db.prepare("INSERT INTO attachments VALUES(?,?,?,?,?,?,?,?,?)").run(id, businessId, productId, null, mime, bytes.length, bytes, createHash("sha256").update(bytes).digest("hex"), at);
      return asAttachment(this.row("SELECT id,business_id,product_id,mime,size,date FROM attachments WHERE id=?", id)!);
    });
  }
  readAttachment(userId: string, businessId: string, attachmentId: string): { metadata: SaleAttachment; bytes: Uint8Array } {
    const photoAccess=access(this.db,userId,businessId);if(!photoAccess.permissions.sales&&!photoAccess.permissions.customers)throw new DomainError('FORBIDDEN','Your role cannot view invoice photos.',403);
    this.assertMember(userId, businessId);
    const result = this.db.prepare("SELECT * FROM attachments WHERE id=? AND business_id=?").get(attachmentId, businessId) as (Row & { bytes: Uint8Array }) | undefined;
    if (!result || (!result.invoice_id && String(result.date) < new Date(Date.now() - 86_400_000).toISOString())) throw new DomainError("NOT_FOUND", "Photo not found in this business.", 404);
    return { metadata: asAttachment(result), bytes: result.bytes };
  }
  deleteAttachment(userId: string, businessId: string, attachmentId: string): { ok: true } {
    this.assertPermission(userId,businessId,"sales");
    this.assertMember(userId, businessId);
    return this.transaction(() => {
      const row = this.row("SELECT invoice_id FROM attachments WHERE id=? AND business_id=?", attachmentId, businessId);
      if (!row) return { ok: true };
      if (row.invoice_id) throw new DomainError("ATTACHMENT_LOCKED", "Saved invoice photos remain with the historical invoice.", 409);
      this.run("DELETE FROM attachments WHERE id=? AND business_id=?", attachmentId, businessId);
      return { ok: true };
    });
  }
  createInvoice(userId: string, businessId: string, raw: unknown): Invoice {
    this.assertPermission(userId,businessId,"sales");
    this.assertMember(userId, businessId);
    const input = object(raw), requested = items(input.items), discount = integer(input.discountPaise ?? 0, "Discount"), dueDate = date(input.dueDate), customerId = string(input.customerId, "Customer ID", 80, true) || null;
    keys(input, ["idempotencyKey", "items", "discountPaise", "paidPaise", "paymentMethod", "payments", "customerId", "dueDate"]);
    const receipts: { method: Payment["method"]; amountPaise: number }[] = [];
    if (input.payments !== undefined) {
      if (!Array.isArray(input.payments) || input.payments.length > 2) throw new DomainError("INVALID_INPUT", "Use at most one cash and one UPI receipt.");
      const seen = new Set<string>();
      for (const rawReceipt of input.payments) {
        const receipt = object(rawReceipt); keys(receipt, ["method", "amountPaise"]);
        const paymentMethod = method(receipt.method), amountPaise = integer(receipt.amountPaise, "Receipt amount", 1);
        if (seen.has(paymentMethod)) throw new DomainError("DUPLICATE_PAYMENT", "Include each payment method once.");
        seen.add(paymentMethod); receipts.push({ method: paymentMethod, amountPaise });
      }
    } else {
      const amountPaise = integer(input.paidPaise ?? 0, "Amount paid"), paymentMethod = method(input.paymentMethod);
      if (amountPaise) receipts.push({ method: paymentMethod, amountPaise });
    }
    const paid = integer(receipts.reduce((sum, receipt) => sum + receipt.amountPaise, 0), "Amount paid", 0, 1_000_000_000);
    if (input.payments !== undefined && input.paidPaise !== undefined && integer(input.paidPaise, "Amount paid") !== paid) throw new DomainError("PAYMENT_MISMATCH", "Received amount must match the cash and UPI receipts.");
    const paymentMethod = receipts.length > 1 ? "split" : receipts[0]?.method ?? method(input.paymentMethod);
    return this.once(businessId, "invoice", input, () => {
      this.assertDayOpen(businessId);
      const customer = customerId ? this.entity("customers", businessId, customerId) : null;
      const aggregated = new Map<string, { quantity: number; attachmentIds: string[] }>(), seenPhotos = new Set<string>();
      for (const item of requested) {
        keys(item, ["productId", "quantityMilli", "attachmentIds"]);
        const id = string(item.productId, "Product ID", 80), qty = integer(item.quantityMilli, "Quantity", 1);
        if (item.attachmentIds !== undefined && (!Array.isArray(item.attachmentIds) || item.attachmentIds.length > 3)) throw new DomainError("INVALID_INPUT", "Use at most three photos per item.");
        const photos = ((item.attachmentIds ?? []) as unknown[]).map(value => string(value, "Photo ID", 80));
        if(photos.length)this.assertPermission(userId,businessId,'sales','photoSales');
        for (const photo of photos) { if (seenPhotos.has(photo)) throw new DomainError("DUPLICATE_ATTACHMENT", "Each photo can be attached once."); seenPhotos.add(photo); }
        const prior = aggregated.get(id);
        aggregated.set(id, { quantity: (prior?.quantity ?? 0) + qty, attachmentIds: [...(prior?.attachmentIds ?? []), ...photos] });
      }
      const lines: InvoiceItem[] = [...aggregated].map(([id, { quantity, attachmentIds }]) => {
        integer(quantity, "Combined quantity", 1);
        const p = asProduct(this.entity("products", businessId, id));
        assertWholeUnit(p.unit, quantity);
        if (p.quantityMilli < quantity) throw new DomainError("INSUFFICIENT_STOCK", `Only ${p.quantityMilli / 1000} ${p.unit} of ${p.name} is available.`, 409);
        if (attachmentIds.length > 3) throw new DomainError("INVALID_INPUT", "Use at most three photos per item.");
        const attachments = attachmentIds.map(photoId => {
          const photo = this.row("SELECT id,business_id,product_id,invoice_id,mime,size,date FROM attachments WHERE id=? AND business_id=? AND product_id=?", photoId, businessId, id);
          if (!photo) throw new DomainError("NOT_FOUND", "Photo not found for this product and business.", 404);
          if (!photo.invoice_id && String(photo.date) < new Date(Date.now() - 86_400_000).toISOString()) throw new DomainError("NOT_FOUND", "This pending photo expired. Upload it again before saving.", 404);
          if (photo.invoice_id) throw new DomainError("ATTACHMENT_LOCKED", "This photo is already saved with an invoice.", 409);
          return asAttachment(photo);
        });
        return { productId: id, name: p.name, unit: p.unit, quantityMilli: quantity, pricePaise: p.pricePaise, totalPaise: lineTotal(p.pricePaise, quantity), ...(p.variation ? { variation: p.variation } : {}), ...(attachments.length ? { attachmentIds, attachments } : {}) };
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
        for (const photoId of item.attachmentIds ?? []) this.run("UPDATE attachments SET invoice_id=? WHERE id=? AND business_id=?", id, photoId, businessId);
      }
      for (const receipt of receipts) this.run("INSERT INTO payments VALUES(?,?,?,?,?,?,?,?)", uid(), businessId, customerId, id, receipt.amountPaise, receipt.method, at, "sale");
      this.audit(userId, businessId, "invoice.created", `${number} · ₹${(total / 100).toFixed(2)}`, at);
      return this.invoice(businessId, id);
    });
  }
  receivePayment(userId: string, businessId: string, raw: unknown): { payments: Payment[]; amountPaise: number; customerId: string } {
    this.assertPermission(userId,businessId,"payments");
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
    this.assertPermission(userId,businessId,"purchases");
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
    this.assertPermission(userId,businessId,"sales");
    this.assertMember(userId, businessId);
    return this.transaction(() => {
      const row = this.entity("invoices", businessId, invoiceId), invoice = this.invoice(businessId, invoiceId);
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
      for (const receipt of invoice.payments.filter(payment => payment.kind === "sale")) this.run("INSERT INTO payments VALUES(?,?,?,?,?,?,?,?)", uid(), businessId, invoice.customerId, invoiceId, receipt.amountPaise, receipt.method, at, "refund");
      // Historical invoice amounts remain intact; cancelled invoices are excluded from receivables and sales.
      this.run("UPDATE invoices SET status='cancelled' WHERE id=? AND business_id=?", invoiceId, businessId);
      this.audit(userId, businessId, "invoice.cancelled", `${invoice.number}: stock returned; original payment refunded`, at);
      return this.invoice(businessId, invoiceId);
    });
  }
  createExpense(userId: string, businessId: string, raw: unknown) {
    this.assertPermission(userId,businessId,"reports");
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
    this.assertPermission(userId,businessId,"reports");
    this.assertPermission(userId,businessId,'reports','dailyClosing');
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
    const business = this.assertMember(userId, businessId), products = this.rows("SELECT * FROM products WHERE business_id=? ORDER BY name", businessId).map(asProduct), allPayments = this.rows("SELECT * FROM payments WHERE business_id=? ORDER BY date DESC,id DESC", businessId).map(asPayment), today = businessDay();
    const receipts = new Map<string, Payment[]>();
    for (const payment of allPayments) if (payment.invoiceId) receipts.set(payment.invoiceId, [...(receipts.get(payment.invoiceId) ?? []), payment]);
    const allInvoices = this.rows("SELECT * FROM invoices WHERE business_id=? ORDER BY date DESC,id DESC", businessId).map(row => asInvoice(row, receipts.get(String(row.id)) ?? []));
    const customers = this.customers(businessId);
    const suppliers = this.rows("SELECT s.*,COALESCE((SELECT SUM(p.balance_paise) FROM purchases p WHERE p.supplier_id=s.id AND p.business_id=s.business_id),0) balance_paise FROM suppliers s WHERE s.business_id=? ORDER BY s.name", businessId).map(r => ({ id: String(r.id), name: String(r.name), phone: String(r.phone), balancePaise: Number(r.balance_paise) }));
    const active = allInvoices.filter(i => i.status !== "cancelled"), todayInvoices = active.filter(i => businessDay(i.date) === today), todayPayments = allPayments.filter(p => businessDay(p.date) === today), low = products.filter(p => p.quantityMilli <= p.minStockMilli);
    const todayStart = new Date(`${today}T00:00:00+05:30`).toISOString(), tomorrowStart = new Date(Date.parse(todayStart) + 86_400_000).toISOString();
    const expenses = this.row("SELECT COALESCE(SUM(amount_paise),0) total,COALESCE(SUM(CASE WHEN method='cash' AND date>=? AND date<? THEN amount_paise ELSE 0 END),0) today_cash,COALESCE(SUM(CASE WHEN date>=? AND date<? THEN amount_paise ELSE 0 END),0) today_total FROM expenses WHERE business_id=?", todayStart, tomorrowStart, todayStart, tomorrowStart, businessId)!;
    const purchases = this.row("SELECT COUNT(*) count,COALESCE(SUM(paid_paise),0) cash FROM purchases WHERE business_id=? AND date>=? AND date<?", businessId, todayStart, tomorrowStart)!;
    const invoiceDays = new Map(allInvoices.map(invoice => [invoice.id, businessDay(invoice.date)]));
    const weeklySales = Array.from({ length: 7 }, (_, index) => { const day = new Date(Date.parse(`${today}T12:00:00Z`) - (6 - index) * 86_400_000).toISOString().slice(0, 10); return { date: day, label: new Date(`${day}T12:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" }), salesPaise: active.filter(i => businessDay(i.date) === day).reduce((sum, i) => sum + i.totalPaise, 0) }; });
    const tasks: BusinessState["tasks"] = low.slice(0, 6).map(p => ({ id: `stock-${p.id}`, title: `Restock ${p.name}`, detail: `${p.quantityMilli / 1000} ${p.unit} remaining`, type: "stock", name: p.name, productId: p.id, quantityMilli: p.quantityMilli, unit: p.unit }));
    for (const c of customers.filter(c => c.balancePaise > 0).slice(0, 4)) tasks.push({ id: `credit-${c.id}`, title: `Collect from ${c.name}`, detail: `₹${(c.balancePaise / 100).toFixed(2)} outstanding`, type: "credit", name: c.name, customerId: c.id, balancePaise: c.balancePaise });
    for (const p of products.filter(p => p.expiryDate && p.expiryDate <= new Date(Date.parse(`${today}T00:00:00Z`) + 7 * 86_400_000).toISOString().slice(0, 10)).slice(0, 4)) tasks.push({ id: `expiry-${p.id}`, title: `Check ${p.name} expiry`, detail: `Expiry: ${p.expiryDate}`, type: "expiry", name: p.name, productId: p.id, expiryDate: p.expiryDate! });
    return { business, products, customers, suppliers, invoices: allInvoices.slice(0, 1000), payments: allPayments.slice(0, 1000),
      totals: { salesPaise: active.reduce((sum, invoice) => sum + invoice.totalPaise, 0), receivedPaise: allPayments.reduce((sum, payment) => sum + payment.amountPaise, 0), expensesPaise: Number(expenses.total) },
      daily: { cashPaise: todayPayments.filter(payment => payment.method === "cash").reduce((sum, payment) => sum + payment.amountPaise, 0), upiPaise: todayPayments.filter(payment => payment.method === "upi").reduce((sum, payment) => sum + payment.amountPaise, 0), purchaseCount: Number(purchases.count), expensesPaise: Number(expenses.today_total), cashExpensesPaise: Number(expenses.today_cash), cashPurchasePaymentsPaise: Number(purchases.cash), creditSalesPaise: todayInvoices.reduce((sum, invoice) => sum + invoice.balancePaise, 0), olderDuesReceivedPaise: todayPayments.filter(payment => payment.kind === "repayment" && payment.invoiceId && (invoiceDays.get(payment.invoiceId) ?? today) < today).reduce((sum, payment) => sum + payment.amountPaise, 0) },
      inventoryEntries: this.rows("SELECT * FROM inventory_entries WHERE business_id=? ORDER BY date DESC,id DESC LIMIT 1000", businessId).map(row => ({ id: String(row.id), date: String(row.date), source: row.source as InventoryEntry["source"], items: JSON.parse(String(row.items_json)) })),
      movements: this.rows("SELECT m.*,p.name product_name FROM movements m JOIN products p ON p.id=m.product_id WHERE m.business_id=? ORDER BY m.date DESC,m.id DESC LIMIT 1000", businessId).map(r => ({ id: String(r.id), productId: String(r.product_id), productName: String(r.product_name), quantityMilli: Number(r.quantity_milli), reason: String(r.reason), date: String(r.date), referenceId: r.reference_id as string | null })),
      purchases: this.rows("SELECT p.*,s.name supplier_name FROM purchases p JOIN suppliers s ON s.id=p.supplier_id WHERE p.business_id=? ORDER BY p.date DESC,p.id DESC LIMIT 1000", businessId).map(r => ({ id: String(r.id), supplierId: String(r.supplier_id), supplierName: String(r.supplier_name), date: String(r.date), items: JSON.parse(String(r.items_json)), totalPaise: Number(r.total_paise), paidPaise: Number(r.paid_paise), balancePaise: Number(r.balance_paise) })),
      expenses: this.rows("SELECT * FROM expenses WHERE business_id=? ORDER BY date DESC,id DESC LIMIT 1000", businessId).map(r => ({ id: String(r.id), description: String(r.description), amountPaise: Number(r.amount_paise), method: r.method as "cash" | "upi", date: String(r.date) })),
      closings: this.rows("SELECT * FROM closings WHERE business_id=? ORDER BY date DESC LIMIT 365", businessId).map(r => ({ id: String(r.id), date: String(r.date), businessDay: String(r.business_day), openingCashPaise: Number(r.opening_cash_paise), expectedCashPaise: Number(r.expected_cash_paise), actualCashPaise: Number(r.actual_cash_paise), differencePaise: Number(r.difference_paise) })),
      metrics: { salesTodayPaise: todayInvoices.reduce((sum, i) => sum + i.totalPaise, 0), collectedTodayPaise: todayPayments.reduce((sum, p) => sum + p.amountPaise, 0), outstandingPaise: active.reduce((sum, i) => sum + i.balancePaise, 0), lowStockCount: low.length, billsToday: todayInvoices.length, stockValuePaise: products.reduce((sum, p) => sum + lineTotal(p.costPaise, p.quantityMilli), 0) }, weeklySales, tasks,
      activity: this.rows("SELECT * FROM audit WHERE business_id=? ORDER BY date DESC,id DESC LIMIT 100", businessId).map(r => ({ id: String(r.id), action: String(r.action), detail: String(r.detail), date: String(r.date) })) };
  }
  export(userId: string, businessId: string) {
    this.assertPermission(userId,businessId,"settings");
    this.assertMember(userId, businessId);
    const data: Record<string, unknown> = { version: 3, exportedAt: stamp(), business: this.assertMember(userId, businessId), currency: "INR", quantityScale: 1000 };
    for (const table of ["products", "customers", "suppliers", "invoices", "payments", "movements", "inventory_entries", "purchases", "expenses", "closings", "audit", "business_settings", "demand_requests", "demand_followups", "demand_conversions", "reorder_drafts", "demand_dismissals"] as const) data[table] = this.rows(`SELECT * FROM ${table} WHERE business_id=?`, businessId);
    data.attachments = this.rows("SELECT id,business_id,product_id,invoice_id,mime,size,sha256,date FROM attachments WHERE business_id=?", businessId);
    return data;
  }
  demo(): Session {
    return this.transaction(() => {
    const userId = uid(), at = stamp(), baseline = new Date(Date.parse(at) - 7 * 86_400_000).toISOString();
    this.run("INSERT INTO users(id,name,email,password_hash,language,demo,created_at) VALUES(?,?,?,?,?,?,?)", userId, "Aarav Sharma", `demo-${userId}@example.invalid`, hashPassword(randomBytes(32).toString("hex")), "hinglish", 1, baseline);
    return this.seedDemo(userId);
    });
  }
  resetDemo(userId: string): Session {
    return this.transaction(() => {
      const session = this.session(userId);
      if (!session.user.demo) throw new DomainError("DEMO_ONLY", "Only an isolated demo workspace can be reset.", 403);
      for (const business of session.businesses) {
        if (this.row("SELECT user_id FROM memberships WHERE business_id=? AND user_id!=? LIMIT 1", business.id, userId)) throw new DomainError("DEMO_ONLY", "A shared business cannot be reset as demo data.", 403);
        for (const table of ["demand_followups", "demand_conversions", "reorder_drafts", "demand_dismissals", "demand_requests", "attachments", "idempotency", "payments", "movements", "inventory_entries", "purchases", "invoices", "expenses", "closings", "audit", "products", "customers", "suppliers"]) this.run(`DELETE FROM ${table} WHERE business_id=?`, business.id);
        this.run('DELETE FROM business_settings WHERE business_id=?',business.id);
      }
      const result = this.seedDemo(userId, session.businesses);
      for (const business of result.businesses) this.audit(userId, business.id, "demo.reset", "Fictional demo workspace reset");
      return result;
    });
  }
  private seedDemo(userId: string, retained: Business[] = []): Session {
    const at = stamp(), baseline = new Date(Date.parse(at) - 7 * 86_400_000).toISOString();
    const definitions: { name: string; category: Business["category"]; products: [string, string, number, number, number][] }[] = [
      { name: "Sharma Kirana Store", category: "grocery", products: [["Basmati Rice", "kg", 12500, 9800, 82000], ["Aashirvaad Atta", "kg", 5800, 4400, 125000], ["Tata Salt", "pcs", 2800, 2200, 68000], ["Milk", "packet", 3200, 2800, 8000], ["Dal", "kg", 16500, 13200, 34000], ["Fortune Oil", "pcs", 14500, 12100, 25000], ["Biscuit", "packet", 1000, 750, 43000], ["Sugar", "kg", 4500, 3900, 42000], ["Red Chilli Powder", "kg", 28000, 21000, 18000], ["Brooke Bond Tea", "pcs", 14500, 11800, 12000], ["Maggi Noodles", "pcs", 1400, 1050, 4000], ["Surf Excel", "pcs", 12500, 10300, 22000], ["Onion", "kg", 4200, 3000, 75000], ["Potato", "kg", 3200, 2200, 92000]] },
      { name: "Sharma Hardware", category: "hardware", products: [["Cement Bag 50kg", "pcs", 38000, 34000, 42000], ["Steel Nails", "kg", 8500, 6200, 28000], ["PVC Pipe 1 inch", "pcs", 18500, 14000, 60000], ["Asian Paints White", "pcs", 285000, 236000, 14000], ["Door Handle", "pcs", 25000, 17000, 38000], ["Screwdriver Set", "pcs", 45000, 33000, 18000], ["Electrical Wire", "meter", 2400, 1600, 350000], ["Wall Putty 20kg", "pcs", 65000, 54000, 20000], ["Brass Tap", "pcs", 35000, 26000, 4000], ["Measuring Tape", "pcs", 18000, 11500, 16000]] },
      { name: "Sharma Fresh Vegetables", category: "vegetables", products: [["Fresh Tomatoes", "kg", 4500, 2900, 48000], ["Potatoes", "kg", 3200, 2200, 92000], ["Red Onions", "kg", 4200, 3000, 75000], ["Green Capsicum", "kg", 6500, 4300, 19000], ["Fresh Spinach", "kg", 3500, 1900, 4500], ["Carrots", "kg", 5500, 3500, 28000], ["Green Peas", "kg", 8500, 5800, 16000], ["Cauliflower", "kg", 4800, 3200, 33000], ["Ginger", "kg", 18000, 13000, 8000], ["Green Chillies", "kg", 8500, 4800, 11000]] },
      { name: "Sharma Fashion Store", category: "clothing", products: [["Blue Casual Shirt", "piece", 89900, 55000, 4000], ["Black T-Shirt", "piece", 49900, 29000, 8000], ["Denim Jeans", "piece", 129900, 85000, 6000]] },
    ];
    const aliasMap: Record<string, string[]> = { Milk: ["doodh", "दूध", "Amul Milk"], Dal: ["daal", "दाल", "Toor Dal"], Onion: ["pyaaz", "pyaz", "प्याज", "onions"], Potato: ["aloo", "आलू", "potatoes"], Biscuit: ["biscuits", "बिस्कुट", "Parle-G Biscuits"] };
    for (const [index, definition] of definitions.entries()) {
      const business = retained.find(b => b.category === definition.category) ?? this.createBusiness(userId, definition);
      if (retained.some(b => b.id === business.id)) this.run("UPDATE businesses SET name=? WHERE id=?", definition.name, business.id);
      const customers = (definition.category === "clothing" ? ["Rahul Sharma"] : ["Priya Verma", "Ramesh Gupta", "Neha Singh", "Vikram Patel"]).map((name, i) => this.createContact(userId, business.id, "customers", { name, phone: `90000000${String(i + 11)}` }) as Customer);
      this.createContact(userId, business.id, "suppliers", { name: definition.category === "vegetables" ? "Azadpur Fresh Supply" : "Metro Wholesale Supply", phone: "9000000091" });
      this.createContact(userId, business.id, "suppliers", { name: "Shree Distribution", phone: "9000000092" });
      const products = definition.products.map(([name, unit, pricePaise, costPaise, quantityMilli], i) => this.createProduct(userId, business.id, { name, unit, pricePaise, costPaise, quantityMilli, sku: `${definition.category.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`, aliases: aliasMap[name] ?? [], variation: definition.category === "clothing" ? i === 0 ? "Blue · M" : i === 1 ? "Black · M" : "Blue · 32" : "", minStockMilli: definition.category === "clothing" ? 2000 : unit === "pcs" ? 5000 : 6000, expiryDate: definition.category === "vegetables" ? new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10) : null }));
      this.run("UPDATE businesses SET created_at=? WHERE id=?", new Date(Date.parse(baseline) + index).toISOString(), business.id);
      this.run("UPDATE movements SET date=? WHERE business_id=? AND reason='opening'", baseline, business.id);
      this.run("UPDATE audit SET date=? WHERE business_id=?", baseline, business.id);
      const demandProduct=definition.category==='clothing'?this.createProduct(userId,business.id,{name:'Blue Shirt',sku:'CLO-XL',unit:'piece',pricePaise:99900,costPaise:60000,quantityMilli:0,variation:'XL',minStockMilli:2000}):definition.category==='hardware'?this.createProduct(userId,business.id,{name:'PVC Pipe',sku:'HAR-2IN',unit:'pcs',pricePaise:24000,costPaise:17500,quantityMilli:0,variation:'2-inch',minStockMilli:5000}):null;
      if(definition.category==='clothing')this.createProduct(userId,business.id,{name:'White Shirt',sku:'CLO-WM',unit:'piece',pricePaise:89900,costPaise:55000,quantityMilli:3000,variation:'M',minStockMilli:2000});
      if(demandProduct){for(let n=0;n<2;n++)this.run('INSERT INTO demand_requests VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',uid(),business.id,demandProduct.id,demandProduct.name,demandProduct.variation,(n+1)*1000,demandProduct.unit,n===0?customers[0].id:null,n===0?1:0,null,'open','Fictional demo request',at,userId);}
      if(definition.category==='grocery')this.run('INSERT INTO demand_requests VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',uid(),business.id,null,'Specific Brand Tea','500g',1000,'packet',null,0,null,'open','Fictional uncatalogued demo request',at,userId);
      if (definition.category === "clothing") continue;
      for (let day = 6; day >= 0; day--) {
        const p = products[day % 3], quantity = p.unit === "pcs" ? 1000 : 2000, total = lineTotal(p.pricePaise, quantity), paid = day % 3 === 0 ? Math.floor(total / 2) : total, customer = customers[day % 4];
        const requestKey = uid(), invoice = this.createInvoice(userId, business.id, { idempotencyKey: requestKey, customerId: customer.id, items: [{ productId: p.id, quantityMilli: quantity }], discountPaise: 0, paidPaise: paid, paymentMethod: day % 2 ? "upi" : "cash", dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10) });
        const historical = new Date(Date.now() - day * 86_400_000).toISOString();
        this.run("UPDATE invoices SET date=? WHERE id=?", historical, invoice.id);
        this.run("UPDATE payments SET date=? WHERE invoice_id=?", historical, invoice.id);
        this.run("UPDATE movements SET date=? WHERE reference_id=?", historical, invoice.id);
        this.run("UPDATE audit SET date=? WHERE business_id=? AND action='invoice.created' AND detail LIKE ?", historical, business.id, `${invoice.number} ·%`);
        this.run("UPDATE idempotency SET result_json=?,created_at=? WHERE business_id=? AND operation='invoice' AND key=?", JSON.stringify(this.invoice(business.id, invoice.id)), historical, business.id, requestKey);
      }
    }
    return this.session(userId);
  }
}

declare global { var dukaanStore: Store | undefined; }
export function getStore(): Store {
  if (globalThis.dukaanStore && globalThis.dukaanStore.runtimeRevision !== "v3.1") { globalThis.dukaanStore.close(); globalThis.dukaanStore = undefined; }
  return globalThis.dukaanStore ??= new Store();
}
