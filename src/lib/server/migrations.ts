/** Forward-only additive migration. V1 records, sessions and financial ledgers survive. */
export const migrationV2 = `
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
`;
export const migrationV3 = `ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0 CHECK(email_verified IN (0,1));
ALTER TABLE users ADD COLUMN verification_required INTEGER NOT NULL DEFAULT 0 CHECK(verification_required IN (0,1));
ALTER TABLE memberships ADD COLUMN permissions_json TEXT;
CREATE TABLE auth_tokens (token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),kind TEXT NOT NULL CHECK(kind IN ('verification','reset','invite')),business_id TEXT REFERENCES businesses(id),payload_json TEXT NOT NULL DEFAULT '{}',expires_at TEXT NOT NULL,used_at TEXT);
CREATE INDEX auth_tokens_user ON auth_tokens(user_id,kind);
CREATE TABLE business_settings (business_id TEXT PRIMARY KEY REFERENCES businesses(id),features_json TEXT NOT NULL,notifications_json TEXT NOT NULL,location TEXT NOT NULL DEFAULT '',contact TEXT NOT NULL DEFAULT '',revision INTEGER NOT NULL DEFAULT 1);
CREATE TABLE demand_requests (id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),product_id TEXT REFERENCES products(id),product_name TEXT NOT NULL,variant TEXT NOT NULL,quantity_milli INTEGER NOT NULL CHECK(quantity_milli>0),unit TEXT NOT NULL,customer_id TEXT REFERENCES customers(id),contact_permission INTEGER NOT NULL CHECK(contact_permission IN (0,1)),observed_people INTEGER CHECK(observed_people IS NULL OR observed_people>0),status TEXT NOT NULL CHECK(status IN ('open','ordered','available','contacted','converted','closed','cancelled')),notes TEXT NOT NULL,date TEXT NOT NULL,actor_id TEXT NOT NULL REFERENCES users(id));
CREATE INDEX demand_business_date ON demand_requests(business_id,date);
CREATE INDEX demand_product ON demand_requests(business_id,product_id);
CREATE INDEX demand_customer ON demand_requests(business_id,customer_id);
CREATE TABLE demand_followups (id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),demand_id TEXT NOT NULL REFERENCES demand_requests(id),channel TEXT NOT NULL,permission_snapshot INTEGER NOT NULL CHECK(permission_snapshot=1),date TEXT NOT NULL,actor_id TEXT NOT NULL REFERENCES users(id));
CREATE TABLE demand_conversions (id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),demand_id TEXT NOT NULL REFERENCES demand_requests(id),invoice_id TEXT NOT NULL REFERENCES invoices(id),product_id TEXT NOT NULL REFERENCES products(id),quantity_milli INTEGER NOT NULL CHECK(quantity_milli>0),amount_paise INTEGER NOT NULL CHECK(amount_paise>=0),date TEXT NOT NULL,actor_id TEXT NOT NULL REFERENCES users(id));
CREATE INDEX demand_conversion_invoice ON demand_conversions(business_id,invoice_id,product_id);
CREATE TABLE reorder_drafts (id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),product_id TEXT NOT NULL REFERENCES products(id),supplier_id TEXT REFERENCES suppliers(id),quantity_milli INTEGER NOT NULL CHECK(quantity_milli>0),cost_paise INTEGER NOT NULL CHECK(cost_paise>=0),request_ids_json TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('draft','received','cancelled')),date TEXT NOT NULL,purchase_id TEXT REFERENCES purchases(id),actor_id TEXT NOT NULL REFERENCES users(id));
CREATE INDEX reorder_business ON reorder_drafts(business_id,status);
CREATE TABLE demand_dismissals (business_id TEXT NOT NULL REFERENCES businesses(id),group_key TEXT NOT NULL,date TEXT NOT NULL,PRIMARY KEY(business_id,group_key));
PRAGMA user_version=3;
`;

export const migrationV4 = `
ALTER TABLE products ADD COLUMN display_names_json TEXT NOT NULL DEFAULT '{}';
PRAGMA user_version=4;
`;

export const migrationV5 = `
CREATE TABLE invoice_branding (business_id TEXT PRIMARY KEY REFERENCES businesses(id),data_json TEXT NOT NULL,revision INTEGER NOT NULL);
ALTER TABLE invoices ADD COLUMN issued_json TEXT;
ALTER TABLE payments ADD COLUMN receipt_id TEXT;
UPDATE payments SET receipt_id=id;
CREATE INDEX payments_receipt ON payments(business_id,receipt_id);
CREATE TABLE documents (id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),customer_id TEXT REFERENCES customers(id),kind TEXT NOT NULL,source_id TEXT NOT NULL,model_json TEXT NOT NULL,pdf BLOB,filename TEXT NOT NULL,pages INTEGER NOT NULL,hash TEXT NOT NULL,created_at TEXT NOT NULL,expires_at TEXT NOT NULL,actor_id TEXT NOT NULL REFERENCES users(id));
CREATE INDEX documents_customer ON documents(business_id,customer_id,created_at);
CREATE TABLE communication_preferences (business_id TEXT NOT NULL REFERENCES businesses(id),customer_id TEXT NOT NULL REFERENCES customers(id),data_json TEXT NOT NULL,PRIMARY KEY(business_id,customer_id));
CREATE TABLE whatsapp_connections (business_id TEXT PRIMARY KEY REFERENCES businesses(id),enabled INTEGER NOT NULL DEFAULT 0,verified_at TEXT,templates_json TEXT NOT NULL DEFAULT '{}');
CREATE TABLE deliveries (id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),document_id TEXT NOT NULL REFERENCES documents(id),customer_id TEXT NOT NULL REFERENCES customers(id),destination TEXT NOT NULL,language TEXT NOT NULL,mode TEXT NOT NULL,status TEXT NOT NULL,error_code TEXT NOT NULL DEFAULT '',provider_id TEXT,request_key TEXT NOT NULL,fingerprint TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,actor_id TEXT NOT NULL REFERENCES users(id),UNIQUE(business_id,request_key));
CREATE UNIQUE INDEX deliveries_provider ON deliveries(provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX deliveries_customer ON deliveries(business_id,customer_id,created_at);
CREATE UNIQUE INDEX deliveries_pending ON deliveries(business_id,document_id,destination) WHERE status IN ('preparing','submitting');
CREATE TABLE whatsapp_inbound (business_id TEXT NOT NULL REFERENCES businesses(id),number TEXT NOT NULL,received_at TEXT NOT NULL,PRIMARY KEY(business_id,number));
CREATE TABLE delivery_events (id TEXT PRIMARY KEY,delivery_id TEXT NOT NULL REFERENCES deliveries(id),status TEXT NOT NULL,provider_at TEXT NOT NULL,received_at TEXT NOT NULL);
PRAGMA user_version=5;
`;

export const migrationV6 = `
ALTER TABLE documents ADD COLUMN cache_key TEXT NOT NULL DEFAULT '';
CREATE INDEX documents_cache ON documents(business_id,cache_key);
ALTER TABLE deliveries ADD COLUMN document_key TEXT NOT NULL DEFAULT '';
UPDATE deliveries SET document_key=(SELECT kind||':'||source_id FROM documents WHERE documents.id=deliveries.document_id);
CREATE UNIQUE INDEX deliveries_source_pending ON deliveries(business_id,document_key,destination) WHERE status IN ('preparing','submitting','unknown');
PRAGMA user_version=6;
`;
