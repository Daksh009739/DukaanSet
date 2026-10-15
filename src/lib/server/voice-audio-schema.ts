export const migrationV9=`
CREATE TABLE user_voice_preferences(user_id TEXT PRIMARY KEY REFERENCES users(id),voice_id TEXT NOT NULL,cloud_audio_consent INTEGER NOT NULL DEFAULT 0 CHECK(cloud_audio_consent IN (0,1)),audible INTEGER NOT NULL DEFAULT 1 CHECK(audible IN (0,1)),revision INTEGER NOT NULL DEFAULT 1,updated_at TEXT NOT NULL);
CREATE TABLE voice_audio_usage(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),business_id TEXT NOT NULL REFERENCES businesses(id),kind TEXT NOT NULL CHECK(kind IN ('stt','tts')),provider TEXT NOT NULL,characters INTEGER NOT NULL DEFAULT 0,audio_seconds REAL NOT NULL DEFAULT 0,latency_ms INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL);
CREATE INDEX voice_usage_user_date ON voice_audio_usage(user_id,created_at);
PRAGMA user_version=9;
`;
