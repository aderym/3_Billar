import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { db, randomUUID } from './database.mjs';

const rl = createInterface({ input: stdin, output: stdout });
const ask = async (label, fallback = '') => (await rl.question(`${label}${fallback ? ` [${fallback}]` : ''}: `)).trim() || fallback;
try {
  const groupName = await ask('Venue name', 'El Dorado');
  const name = await ask('Administrator name');
  const username = (await ask('Administrator username')).toLowerCase();
  const email = (await ask('Email (optional)')).toLowerCase() || null;
  const phone = (await ask('Phone (optional)')).replace(/\D/g, '') || null;
  const password = await ask('Password (8 or more characters; terminal input is visible)');
  if (!name || !/^[-._a-z0-9]{3,40}$/.test(username) || password.length < 8 || password.length > 128 || (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) || (phone && phone.length < 10)) throw new Error('Invalid account details.');
  const group = randomUUID(), account = randomUUID(), salt = randomBytes(16).toString('hex');
  const passwordHash = pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  const now = Date.now();
  const initial = { name: groupName, game: '8-ball', race: 3, entry: 0, prize: false, format: 'single', players: [], tables: [1, 2, 3, 4].map(n => ({ id: randomUUID(), name: `Table ${n}`, angles: [{ id: 'main', name: 'Main view' }] })), rounds: [], scoring: 'games', created: now, demo: false };
  await db.batch([
    db.prepare('INSERT INTO groups (id,name,owner_id,state,revision,created_at) VALUES (?,?,?,?,?,?)').bind(group, groupName, 'hostinger-local', JSON.stringify(initial), 1, now),
    db.prepare('INSERT INTO accounts (id,group_id,role,name,username,email,phone,password_hash,salt,player_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(account, group, 'admin', name, username, email, phone, passwordHash, salt, null, now)
  ]);
  console.log(`Administrator created for ${groupName}. Sign in using ${username}.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally { rl.close(); }
