export const migrationV10=`
CREATE TABLE my_voice_challenges(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),language TEXT NOT NULL,phrase TEXT NOT NULL,script TEXT NOT NULL,consent_version TEXT NOT NULL,created_at TEXT NOT NULL,expires_at TEXT NOT NULL,used_at TEXT);
CREATE INDEX my_voice_challenge_owner ON my_voice_challenges(user_id,created_at);
CREATE TABLE my_voice_profiles(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),challenge_id TEXT NOT NULL UNIQUE REFERENCES my_voice_challenges(id),provider TEXT NOT NULL,provider_account TEXT NOT NULL,provider_reference TEXT,phase TEXT NOT NULL,locales_json TEXT NOT NULL DEFAULT '[]',approved_languages_json TEXT NOT NULL DEFAULT '[]',consent_version TEXT NOT NULL,verification_reference TEXT NOT NULL,sample_digest TEXT NOT NULL,duration_seconds REAL NOT NULL,error_code TEXT NOT NULL DEFAULT '',operation_until TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,deleted_at TEXT);
CREATE UNIQUE INDEX my_voice_one_profile ON my_voice_profiles(user_id) WHERE phase!='deleted';
CREATE TABLE my_voice_previews(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),profile_id TEXT NOT NULL REFERENCES my_voice_profiles(id),language TEXT NOT NULL,created_at TEXT NOT NULL,expires_at TEXT NOT NULL,used_at TEXT);
CREATE TABLE my_voice_events(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),profile_id TEXT,action TEXT NOT NULL,status TEXT NOT NULL,characters INTEGER NOT NULL DEFAULT 0,latency_ms INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);
CREATE INDEX my_voice_events_usage ON my_voice_events(user_id,created_at);
PRAGMA user_version=10;
`;
