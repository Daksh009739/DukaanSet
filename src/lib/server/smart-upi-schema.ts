export const migrationV11=`
CREATE TABLE merchant_profiles(user_id TEXT PRIMARY KEY REFERENCES users(id),phone TEXT NOT NULL DEFAULT '',avatar BLOB,revision INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL);
CREATE TABLE upi_destinations(id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),upi_id TEXT NOT NULL,payee TEXT NOT NULL,state TEXT NOT NULL DEFAULT 'saved',is_primary INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,UNIQUE(business_id,upi_id));
CREATE UNIQUE INDEX upi_primary ON upi_destinations(business_id) WHERE is_primary=1;
INSERT INTO upi_destinations SELECT lower(hex(randomblob(16))),business_id,json_extract(data_json,'$.upiId'),json_extract(data_json,'$.payee'),'saved',1,strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM invoice_branding WHERE json_valid(data_json) AND length(json_extract(data_json,'$.upiId'))>4 AND length(json_extract(data_json,'$.payee'))>0;
CREATE TABLE upi_authorisations(id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),provider TEXT NOT NULL,provider_account TEXT NOT NULL,mode TEXT NOT NULL,state TEXT NOT NULL,tokens TEXT,expires_at TEXT NOT NULL,last_sync TEXT,actor_id TEXT NOT NULL REFERENCES users(id),config_digest TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,revocation_pending INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,UNIQUE(provider,provider_account,mode));
CREATE UNIQUE INDEX upi_active_business ON upi_authorisations(business_id,provider) WHERE state IN ('active','paused');
CREATE TABLE upi_oauth_states(digest TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),business_id TEXT NOT NULL REFERENCES businesses(id),expires_at TEXT NOT NULL,used_at TEXT);
CREATE TABLE upi_transactions(id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),authorisation_id TEXT REFERENCES upi_authorisations(id),reference TEXT NOT NULL,bank_reference TEXT NOT NULL DEFAULT '',amount_paise INTEGER NOT NULL CHECK(amount_paise>0),refunded_paise INTEGER NOT NULL DEFAULT 0 CHECK(refunded_paise>=0 AND refunded_paise<=amount_paise),status TEXT NOT NULL,verified INTEGER NOT NULL DEFAULT 0,payer_key TEXT,masked_payer TEXT NOT NULL DEFAULT '',customer_id TEXT REFERENCES customers(id),occurred_at TEXT NOT NULL,observed_at TEXT NOT NULL,needs_review INTEGER NOT NULL DEFAULT 0,UNIQUE(authorisation_id,reference));
CREATE UNIQUE INDEX upi_import_reference ON upi_transactions(business_id,reference) WHERE authorisation_id IS NULL;
CREATE INDEX upi_transaction_period ON upi_transactions(business_id,occurred_at);
CREATE TABLE upi_payer_links(business_id TEXT NOT NULL REFERENCES businesses(id),payer_key TEXT NOT NULL,customer_id TEXT NOT NULL REFERENCES customers(id),actor_id TEXT NOT NULL REFERENCES users(id),created_at TEXT NOT NULL,PRIMARY KEY(business_id,payer_key));
CREATE TABLE upi_allocations(id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),transaction_id TEXT NOT NULL REFERENCES upi_transactions(id),category TEXT NOT NULL,amount_paise INTEGER NOT NULL CHECK(amount_paise>0),reversed_paise INTEGER NOT NULL DEFAULT 0,payment_id TEXT UNIQUE REFERENCES payments(id),invoice_id TEXT REFERENCES invoices(id),customer_id TEXT REFERENCES customers(id),actor_id TEXT NOT NULL REFERENCES users(id),created_at TEXT NOT NULL);
CREATE TABLE upi_events(authorisation_id TEXT NOT NULL REFERENCES upi_authorisations(id),event_id TEXT NOT NULL,digest TEXT NOT NULL,received_at TEXT NOT NULL,PRIMARY KEY(authorisation_id,event_id));
CREATE TABLE upi_requests(id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),authorisation_id TEXT NOT NULL REFERENCES upi_authorisations(id),invoice_id TEXT NOT NULL REFERENCES invoices(id),provider_reference TEXT UNIQUE,amount_paise INTEGER NOT NULL,state TEXT NOT NULL,created_at TEXT NOT NULL);
PRAGMA user_version=11;
`;
export const migrationV12=`
CREATE TABLE IF NOT EXISTS upi_test_workspaces(business_id TEXT PRIMARY KEY REFERENCES businesses(id));
ALTER TABLE upi_requests ADD COLUMN image_url TEXT;
PRAGMA user_version=12;
`;
export const migrationV13=`
CREATE TABLE upi_payment_origins(transaction_id TEXT PRIMARY KEY REFERENCES upi_transactions(id),business_id TEXT NOT NULL REFERENCES businesses(id),reference TEXT NOT NULL,bank_reference TEXT NOT NULL,amount_paise INTEGER NOT NULL,status TEXT NOT NULL,occurred_at TEXT NOT NULL,observed_at TEXT NOT NULL);
INSERT INTO upi_payment_origins SELECT id,business_id,reference,bank_reference,amount_paise,status,occurred_at,observed_at FROM upi_transactions;
CREATE TRIGGER upi_origins_no_update BEFORE UPDATE ON upi_payment_origins BEGIN SELECT RAISE(ABORT,'Payment originals are immutable'); END;
CREATE TRIGGER upi_origins_no_delete BEFORE DELETE ON upi_payment_origins BEGIN SELECT RAISE(ABORT,'Payment originals are immutable'); END;
CREATE TRIGGER upi_transaction_original_fields BEFORE UPDATE OF reference,bank_reference,amount_paise,occurred_at ON upi_transactions WHEN NEW.reference!=OLD.reference OR NEW.bank_reference!=OLD.bank_reference OR NEW.amount_paise!=OLD.amount_paise OR NEW.occurred_at!=OLD.occurred_at BEGIN SELECT RAISE(ABORT,'Payment source fields are immutable'); END;
CREATE TABLE upi_payer_hints(transaction_id TEXT PRIMARY KEY REFERENCES upi_transactions(id),provider_name TEXT NOT NULL,observed_at TEXT NOT NULL);
CREATE TABLE upi_customer_link_audit(id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),transaction_id TEXT REFERENCES upi_transactions(id),payer_key TEXT,previous_customer_id TEXT REFERENCES customers(id),customer_id TEXT NOT NULL REFERENCES customers(id),actor_id TEXT NOT NULL REFERENCES users(id),reason TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TRIGGER upi_links_audit_no_update BEFORE UPDATE ON upi_customer_link_audit BEGIN SELECT RAISE(ABORT,'Customer link audit is immutable'); END;
CREATE TRIGGER upi_links_audit_no_delete BEFORE DELETE ON upi_customer_link_audit BEGIN SELECT RAISE(ABORT,'Customer link audit is immutable'); END;
PRAGMA user_version=13;
`;
