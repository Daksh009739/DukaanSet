-- Additive V1 → V2 migration. Apply once within BEGIN IMMEDIATE / COMMIT.
ALTER TABLE products ADD COLUMN aliases_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN barcode TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN variation TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN pack_size INTEGER CHECK(pack_size IS NULL OR (pack_size>0 AND pack_size<=100000));
CREATE TABLE inventory_entries (id TEXT PRIMARY KEY, business_id TEXT NOT NULL REFERENCES businesses(id), actor_id TEXT NOT NULL REFERENCES users(id), date TEXT NOT NULL, source TEXT NOT NULL CHECK(source IN ('voice','manual','mixed')), items_json TEXT NOT NULL);
CREATE INDEX inventory_entries_business_date ON inventory_entries(business_id,date);
CREATE TABLE attachments (id TEXT PRIMARY KEY, business_id TEXT NOT NULL REFERENCES businesses(id), product_id TEXT NOT NULL REFERENCES products(id), invoice_id TEXT REFERENCES invoices(id), mime TEXT NOT NULL CHECK(mime IN ('image/jpeg','image/png','image/webp')), size INTEGER NOT NULL CHECK(size>0 AND size<=2097152), bytes BLOB NOT NULL, sha256 TEXT NOT NULL, date TEXT NOT NULL);
CREATE INDEX attachments_business ON attachments(business_id);
CREATE INDEX payments_invoice ON payments(business_id,invoice_id);
PRAGMA user_version = 2;
