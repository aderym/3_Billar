import mysql from 'mysql2/promise';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export const root = path.resolve(import.meta.dirname, '..');
export const dataDir = path.resolve(process.env.OSP_DATA_DIR || path.join(root, 'storage'));
fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'symfony',
  password: process.env.DB_PASSWORD || 'symfony',
  database: process.env.DB_NAME || 'billar',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  multipleStatements: true,
  charset: 'utf8mb4'
});

const schema = fs.readFileSync(path.join(root, 'schema/mariadb.sql'), 'utf8');
let ready;
async function initialize() {
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      await pool.query(schema);
      await migrateLegacySqlite();
      return;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, Math.min(attempt * 1000, 5000)));
    }
  }
  throw lastError;
}
ready = initialize();

const normalize = value => value === undefined ? null : typeof value === 'boolean' ? Number(value) : value;
const sqlForMaria = sql => sql
  .replace(/INSERT OR IGNORE/gi, 'INSERT IGNORE')
  .replace(/ON CONFLICT\(group_id,event_key,player_id\) DO UPDATE SET status=excluded\.status,reason=excluded\.reason,updated_at=excluded\.updated_at/gi, 'ON DUPLICATE KEY UPDATE status=VALUES(status),reason=VALUES(reason),updated_at=VALUES(updated_at)');

function statement(sql, values = []) {
  return {
    sql: sqlForMaria(sql),
    values: values.map(normalize),
    bind(...next) { this.values = next.map(normalize); return this; },
    async first() {
      await ready;
      const [rows] = await pool.execute(this.sql, this.values);
      return rows[0] || null;
    },
    async all() {
      await ready;
      const [rows] = await pool.execute(this.sql, this.values);
      return { results: rows };
    },
    async run() {
      await ready;
      const [result] = await pool.execute(this.sql, this.values);
      return { meta: { changes: Number(result.affectedRows || 0), last_row_id: Number(result.insertId || 0) } };
    }
  };
}

export const db = {
  prepare(sql) { return statement(sqlForMaria(sql)); },
  async batch(statements) {
    await ready;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const results = [];
      for (const item of statements) {
        const [result] = await connection.execute(item.sql, item.values);
        results.push({ meta: { changes: Number(result.affectedRows || 0), last_row_id: Number(result.insertId || 0) } });
      }
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

async function migrateLegacySqlite() {
  const legacyPath = path.join(dataDir, 'osp.sqlite');
  if (!fs.existsSync(legacyPath)) return;

  const sqlite = new DatabaseSync(legacyPath, { readOnly: true });
  const tables = [
    ['groups', ['id', 'name', 'owner_id', 'state', 'revision', 'created_at']],
    ['accounts', ['id', 'group_id', 'role', 'name', 'username', 'email', 'phone', 'password_hash', 'salt', 'player_id', 'active', 'created_at', 'avatar_updated_at']],
    ['sessions', ['token_hash', 'account_id', 'expires_at']],
    ['messages', ['id', 'group_id', 'account_id', 'kind', 'body', 'match_id', 'created_at']],
    ['signals', ['id', 'group_id', 'room', 'role', 'client', 'type', 'data', 'created_at']],
    ['tournament_history', ['group_id', 'event_key', 'name', 'state', 'ended_at']],
    ['event_responses', ['group_id', 'event_key', 'player_id', 'status', 'reason', 'updated_at']],
    ['practice_rooms', ['id', 'group_id', 'creator_account_id', 'opponent_account_id', 'status', 'state', 'turn_account_id', 'created_at', 'updated_at']],
    ['access_requests', ['id', 'group_id', 'kind', 'name', 'username', 'email', 'phone', 'message', 'status', 'created_at', 'updated_at']]
  ];
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const [table, columns] of tables) {
      const rows = sqlite.prepare(`SELECT ${columns.map(column => `"${column}"`).join(',')} FROM "${table}"`).all();
      if (!rows.length) continue;
      const placeholders = columns.map(() => '?').join(',');
      const sql = `INSERT IGNORE INTO \`${table}\` (${columns.map(column => `\`${column}\``).join(',')}) VALUES (${placeholders})`;
      for (const row of rows) await connection.execute(sql, columns.map(column => normalize(row[column])));
    }
    await connection.commit();
    sqlite.close();
    fs.renameSync(legacyPath, `${legacyPath}.migrated`);
    for (const suffix of ['-wal', '-shm']) {
      const file = `${legacyPath}${suffix}`;
      if (fs.existsSync(file)) fs.renameSync(file, `${file}.migrated`);
    }
    console.log('Legacy SQLite data migrated to MariaDB.');
  } catch (error) {
    await connection.rollback();
    sqlite.close();
    throw error;
  } finally {
    connection.release();
  }
}

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
