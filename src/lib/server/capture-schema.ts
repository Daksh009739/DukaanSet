export const migrationV17=`
CREATE TABLE document_captures(id TEXT PRIMARY KEY,business_id TEXT NOT NULL REFERENCES businesses(id),scope TEXT NOT NULL CHECK(scope IN ('inventory','sales','purchases')),original_sha256 TEXT NOT NULL,pixel_sha256 TEXT NOT NULL,filename TEXT NOT NULL,mime TEXT NOT NULL,original_bytes BLOB NOT NULL,preview_bytes BLOB NOT NULL,status TEXT NOT NULL,extraction_json TEXT,lease TEXT,lease_until TEXT,result_json TEXT,review_json TEXT,review_hash TEXT,created_at TEXT NOT NULL,actor_id TEXT NOT NULL REFERENCES users(id),committed_at TEXT,UNIQUE(business_id,original_sha256),UNIQUE(business_id,pixel_sha256));
CREATE INDEX capture_scope ON document_captures(business_id,created_at);
CREATE TABLE document_import_claims(business_id TEXT NOT NULL REFERENCES businesses(id),claim TEXT NOT NULL,capture_id TEXT NOT NULL REFERENCES document_captures(id),PRIMARY KEY(business_id,claim));
PRAGMA user_version=17;
`;
