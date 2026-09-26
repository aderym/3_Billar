import mysql from 'mysql2/promise';
import { randomUUID, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const root = path.resolve(import.meta.dirname, '..');
export const dataDir = path.resolve(process.env.OSP_DATA_DIR || path.join(root, 'storage'));
fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
const billingKeyPath = path.join(dataDir, 'billing.key');
if (!fs.existsSync(billingKeyPath)) fs.writeFileSync(billingKeyPath, randomBytes(32).toString('hex'), { mode: 0o600, flag: 'wx' });
export const billingEncryptionKey = fs.readFileSync(billingKeyPath, 'utf8').trim();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db', port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'symfony', password: process.env.DB_PASSWORD || 'symfony',
  database: process.env.DB_NAME || 'billar', waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10), multipleStatements: true, charset: 'utf8mb4'
});
const normalize = value => value === undefined ? null : typeof value === 'boolean' ? Number(value) : value;
const sqlForMaria = sql => {
  let converted = sql.replace(/INSERT OR IGNORE/gi, 'INSERT IGNORE');
  const match = converted.match(/\s+ON CONFLICT\([^)]*\)\s+DO UPDATE SET\s+([\s\S]*)$/i);
  if (match) {
    let updates = match[1].replace(/\s+WHERE\s+[\s\S]*$/i, '').replace(/excluded\.([a-z_][a-z0-9_]*)/gi, 'VALUES($1)');
    converted = converted.slice(0, match.index) + ' ON DUPLICATE KEY UPDATE ' + updates;
  }
  return converted;
};
const schema = fs.readFileSync(path.join(root, 'schema', 'mariadb.sql'), 'utf8');
let ready;
async function initialize() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt++) {
    try { await pool.query(schema); return; }
    catch (error) { lastError = error; await new Promise(resolve => setTimeout(resolve, Math.min(attempt * 1000, 5000))); }
  }
  throw lastError;
}
ready = initialize();
function statement(sql, values = []) {
  return {
    sql: sqlForMaria(sql), values: values.map(normalize),
    bind(...next) { this.values = next.map(normalize); return this; },
    async first() { await ready; const [rows] = await pool.execute(this.sql, this.values); return rows[0] || null; },
    async all() { await ready; const [rows] = await pool.execute(this.sql, this.values); return { results: rows }; },
    async run() { await ready; const [result] = await pool.execute(this.sql, this.values); return { meta: { changes: Number(result.affectedRows || 0), last_row_id: Number(result.insertId || 0) } }; }
  };
}
export const db = {
  prepare(sql) { return statement(sql); },
  async batch(statements) {
    await ready; const connection = await pool.getConnection();
    try {
      await connection.beginTransaction(); const results = [];
      for (const item of statements) { const [result] = await connection.execute(sqlForMaria(item.sql), item.values); results.push({ meta: { changes: Number(result.affectedRows || 0), last_row_id: Number(result.insertId || 0) } }); }
      await connection.commit(); return results;
    } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
  }
};

const photoDir = path.join(dataDir, 'photos'), tvImageDir = path.join(dataDir, 'tv-images'), venueLogoDir = path.join(dataDir, 'venue-logos'), proofDir = path.join(dataDir, 'payment-proofs');
for (const dir of [photoDir, tvImageDir, venueLogoDir, proofDir]) fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
const photoPath = key => {
  if (/^venues\/[a-f0-9-]{36}\/logo$/.test(key)) return path.join(venueLogoDir, key.slice(7, -5));
  if (/^proofs\/[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(key)) return path.join(proofDir, key.slice(7).replace('/', '-'));
  if (/^tv\/[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(key)) return path.join(tvImageDir, key.slice(3).replace('/', '-'));
  if (!/^profiles\/[\w-]{1,100}$/.test(key)) throw new Error('Invalid image path');
  return path.join(photoDir, key.slice(9));
};
export const bucket = {
  async get(key) { const file = photoPath(key); if (!fs.existsSync(file)) return null; const body = fs.readFileSync(file); const type = body[0] === 137 ? 'image/png' : body[0] === 255 ? 'image/jpeg' : body[0] === 37 ? 'application/pdf' : 'image/webp'; return { body, httpMetadata: { contentType: type } }; },
  async put(key, bytes) { fs.writeFileSync(photoPath(key), bytes, { mode: 0o600 }); },
  async delete(key) { try { fs.unlinkSync(photoPath(key)); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
};
export { randomUUID };
