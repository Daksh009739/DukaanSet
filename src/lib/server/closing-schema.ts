export const migrationV7 = `
CREATE TABLE closing_settings (
 business_id TEXT PRIMARY KEY REFERENCES businesses(id), data_json TEXT NOT NULL, revision INTEGER NOT NULL
);
CREATE TABLE business_sessions (
 id TEXT PRIMARY KEY, business_id TEXT NOT NULL REFERENCES businesses(id), business_date TEXT NOT NULL,
 opened_at TEXT NOT NULL, timezone TEXT NOT NULL, cutoff TEXT NOT NULL, opening_cash_paise INTEGER NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('open','closed')), closed_at TEXT,
 UNIQUE(business_id,id)
);
CREATE UNIQUE INDEX one_open_business_session ON business_sessions(business_id) WHERE status='open';
CREATE TABLE closing_versions (
 id TEXT PRIMARY KEY, business_id TEXT NOT NULL REFERENCES businesses(id), session_id TEXT NOT NULL,
 version INTEGER NOT NULL, data_json TEXT NOT NULL, created_at TEXT NOT NULL,
 FOREIGN KEY(business_id,session_id) REFERENCES business_sessions(business_id,id), UNIQUE(session_id,version)
);
CREATE TRIGGER closing_snapshot_immutable BEFORE UPDATE ON closing_versions BEGIN SELECT RAISE(ABORT,'Closing snapshots are immutable'); END;
CREATE TABLE cash_movements (
 id TEXT PRIMARY KEY, business_id TEXT NOT NULL REFERENCES businesses(id), session_id TEXT NOT NULL,
 amount_paise INTEGER NOT NULL CHECK(amount_paise>0), kind TEXT NOT NULL CHECK(kind IN ('deposit','withdrawal')),
 reason TEXT NOT NULL, actor_id TEXT NOT NULL REFERENCES users(id), date TEXT NOT NULL,
 FOREIGN KEY(business_id,session_id) REFERENCES business_sessions(business_id,id)
);
CREATE TABLE supplier_payments (
 id TEXT PRIMARY KEY, business_id TEXT NOT NULL REFERENCES businesses(id), purchase_id TEXT NOT NULL REFERENCES purchases(id),
 supplier_id TEXT NOT NULL REFERENCES suppliers(id), amount_paise INTEGER NOT NULL CHECK(amount_paise>0),
 method TEXT NOT NULL CHECK(method IN ('cash','upi')), actor_id TEXT NOT NULL REFERENCES users(id), date TEXT NOT NULL
);
CREATE TABLE closing_jobs (
 id TEXT PRIMARY KEY, business_id TEXT NOT NULL REFERENCES businesses(id), session_id TEXT NOT NULL,
 scheduled_at TEXT NOT NULL, next_attempt TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('queued','failed','done')),
 attempts INTEGER NOT NULL DEFAULT 0, error_code TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL,
 FOREIGN KEY(business_id,session_id) REFERENCES business_sessions(business_id,id), UNIQUE(session_id)
);
CREATE TABLE closing_notices (
 id TEXT PRIMARY KEY, business_id TEXT NOT NULL REFERENCES businesses(id), session_id TEXT NOT NULL,
 kind TEXT NOT NULL, date TEXT NOT NULL, UNIQUE(session_id,kind)
);
PRAGMA user_version = 7;
`;
