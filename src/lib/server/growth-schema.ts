export const migrationV15=`
ALTER TABLE products ADD COLUMN stock_tracked INTEGER NOT NULL DEFAULT 1 CHECK(stock_tracked IN (0,1));
CREATE TABLE business_growth_settings(business_id TEXT PRIMARY KEY REFERENCES businesses(id),orders_enabled INTEGER NOT NULL,appointments_enabled INTEGER NOT NULL,revision INTEGER NOT NULL);
CREATE TABLE business_activities(id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),kind TEXT NOT NULL CHECK(kind IN ('order','appointment')),label TEXT NOT NULL,customer_id TEXT REFERENCES customers(id),scheduled_at TEXT NOT NULL,ends_at TEXT,table_label TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('scheduled','in_progress','completed','cancelled')),revision INTEGER NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,actor_id TEXT NOT NULL REFERENCES users(id));
CREATE INDEX activities_scope ON business_activities(business_id,kind,scheduled_at);
CREATE TABLE business_referrals(business_id TEXT PRIMARY KEY REFERENCES businesses(id),code TEXT NOT NULL UNIQUE,actor_id TEXT NOT NULL REFERENCES users(id),created_at TEXT NOT NULL);
CREATE TABLE referral_attributions(user_id TEXT PRIMARY KEY REFERENCES users(id),business_id TEXT NOT NULL REFERENCES businesses(id),created_at TEXT NOT NULL);
CREATE TABLE business_feedback(id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),user_id TEXT NOT NULL REFERENCES users(id),body TEXT NOT NULL,publication_permission INTEGER NOT NULL CHECK(publication_permission IN (0,1)),created_at TEXT NOT NULL);
PRAGMA user_version=15;
`;

/** Cancellation metadata reuses the reviewed invoice operation; it is not a payment or stock movement. */
export const migrationV16=`
CREATE TABLE invoice_cancellations(invoice_id TEXT PRIMARY KEY REFERENCES invoices(id),business_id TEXT NOT NULL REFERENCES businesses(id),occurred_at TEXT NOT NULL,actor_id TEXT NOT NULL REFERENCES users(id));
CREATE INDEX cancellation_scope ON invoice_cancellations(business_id,occurred_at);
INSERT INTO invoice_cancellations SELECT i.id,i.business_id,a.date,a.actor_id FROM invoices i JOIN audit a ON a.business_id=i.business_id AND a.action='invoice.cancelled' AND substr(a.detail,1,length(i.number)+2)=i.number||': ' WHERE i.status='cancelled' AND a.id=(SELECT a2.id FROM audit a2 WHERE a2.business_id=i.business_id AND a2.action='invoice.cancelled' AND substr(a2.detail,1,length(i.number)+2)=i.number||': ' ORDER BY a2.date,a2.id LIMIT 1);
PRAGMA user_version=16;
`;
