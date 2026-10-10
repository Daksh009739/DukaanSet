export const migrationV8 = `
CREATE TABLE media_settings (business_id TEXT PRIMARY KEY REFERENCES businesses(id), enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)));
CREATE TABLE media_assets (id TEXT PRIMARY KEY, business_id TEXT NOT NULL REFERENCES businesses(id), bytes BLOB NOT NULL, sha256 TEXT NOT NULL, mime TEXT NOT NULL, metadata_json TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(business_id,sha256));
CREATE TABLE product_media (product_id TEXT PRIMARY KEY REFERENCES products(id), business_id TEXT NOT NULL REFERENCES businesses(id), selected TEXT NOT NULL DEFAULT 'automatic' CHECK(selected IN ('automatic','merchant','default')), asset_id TEXT REFERENCES media_assets(id), candidates_json TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'queued', attempts INTEGER NOT NULL DEFAULT 0, available_at TEXT NOT NULL, updated_at TEXT NOT NULL, identity TEXT NOT NULL DEFAULT '', lease TEXT);
CREATE INDEX media_jobs ON product_media(status,available_at);
CREATE TABLE media_search_cache (query TEXT PRIMARY KEY, candidates_json TEXT NOT NULL, expires_at TEXT NOT NULL);
INSERT INTO product_media(product_id,business_id,available_at,updated_at) SELECT id,business_id,datetime('now'),datetime('now') FROM products;
PRAGMA user_version=8;
`;
