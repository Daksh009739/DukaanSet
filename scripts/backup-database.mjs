import { DatabaseSync, backup } from 'node:sqlite';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
const source = path.resolve(process.argv[2] || process.env.DATABASE_PATH || '.data/dukaanset.sqlite');
if (!existsSync(source)) throw new Error('Database does not exist; no backup was created.');
const directory = path.resolve('.data/backups'); mkdirSync(directory, { recursive: true });
const target = path.join(directory, `dukaanset-${new Date().toISOString().replaceAll(':', '-')}-${randomUUID().slice(0, 8)}.sqlite`);
const database = new DatabaseSync(source, { readOnly: true });
try { await backup(database, target); } finally { database.close(); }
const verification = new DatabaseSync(target, { readOnly: true });
try {
  if (verification.prepare('PRAGMA quick_check').get().quick_check !== 'ok') throw new Error('Backup failed SQLite integrity verification.');
  if (verification.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Backup failed foreign-key verification.');
  console.log(`Verified private SQLite backup: ${target} (${statSync(target).size} bytes)`);
} finally { verification.close(); }
