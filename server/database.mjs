import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const root = path.resolve(import.meta.dirname, '..');
export const dataDir = path.resolve(process.env.OSP_DATA_DIR || path.join(root, 'storage'));
fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
const sqlite = new DatabaseSync(path.join(dataDir, 'osp.sqlite'));
sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;');
sqlite.exec(fs.readFileSync(path.join(root, 'schema', 'sqlite.sql'), 'utf8'));

const convert = value => value === undefined ? null : typeof value === 'boolean' ? Number(value) : value;
const adapt = row => row ? Object.fromEntries(Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? Number(value) : value])) : null;
export const db = {
  prepare(sql) {
    const statement = sqlite.prepare(sql);
    let parameters = [];
    return {
      bind(...values) { parameters = values.map(convert); return this; },
      first() { return adapt(statement.get(...parameters)); },
      all() { return { results: statement.all(...parameters).map(adapt) }; },
      run() { const result = statement.run(...parameters); return { meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } }; }
    };
  },
  async batch(statements) {
    sqlite.exec('BEGIN IMMEDIATE');
    try {
      const results = statements.map(statement => statement.run());
      sqlite.exec('COMMIT');
      return results;
    } catch (error) {
      sqlite.exec('ROLLBACK');
      throw error;
    }
  }
};

const photoDir = path.join(dataDir, 'photos');
const tvImageDir = path.join(dataDir, 'tv-images');
fs.mkdirSync(photoDir, { recursive: true, mode: 0o700 });
fs.mkdirSync(tvImageDir, { recursive: true, mode: 0o700 });
const photoPath = key => {
  if (/^tv\/[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(key)) return path.join(tvImageDir, key.slice(3).replace('/', '-'));
  if (!/^profiles\/[\w-]{1,100}$/.test(key)) throw new Error('Invalid image path');
  return path.join(photoDir, key.slice(9));
};
export const bucket = {
  async get(key) {
    const file = photoPath(key);
    if (!fs.existsSync(file)) return null;
    const body = fs.readFileSync(file);
    const type = body[0] === 137 ? 'image/png' : body[0] === 255 ? 'image/jpeg' : 'image/webp';
    return { body, httpMetadata: { contentType: type } };
  },
  async put(key, bytes) { fs.writeFileSync(photoPath(key), bytes, { mode: 0o600 }); },
  async delete(key) { try { fs.unlinkSync(photoPath(key)); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
};
export { randomUUID };
