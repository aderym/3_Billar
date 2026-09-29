import crypto from 'node:crypto';

const OWNER_GROUP = '__owner__';

const id = () => crypto.randomUUID();
const now = () => Date.now();

async function hash(password, salt) {
  return new Promise((resolve, reject) => crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (error, key) => error ? reject(error) : resolve(key.toString('hex'))));
}

function initialState(name) {
  return {
    name,
    game: '8-ball',
    race: 3,
    entry: 0,
    prize: false,
    format: 'single',
    players: [],
    tables: [1, 2, 3, 4].map(n => ({ id: id(), name: `Table ${n}`, angles: [{ id: 'main', name: 'Main view' }] })),
    rounds: [],
    scoring: 'games',
    created: now(),
    demo: false
  };
}

export async function registerPublicVenue(db, input) {
  const groupName = String(input.groupName || '').trim().slice(0, 80);
  const name = String(input.name || '').trim().slice(0, 70);
  const username = String(input.username || '').trim().toLowerCase();
  const email = String(input.email || '').trim().toLowerCase() || null;
  const phone = String(input.phone || '').replace(/\D/g, '') || null;
  const password = String(input.password || '');
  if (!groupName || !name || username === 'osp' || !/^[-._a-z0-9]{3,40}$/.test(username) || email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || phone && phone.length < 10 || password.length < 8 || password.length > 128) {
    throw Object.assign(new Error('Enter a venue name, your name, a valid username, and a password of at least 8 characters.'), { status: 400 });
  }
  const groupId = id(), accountId = id(), created = now(), salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = await hash(password, salt);
  await db.batch([
    db.prepare('INSERT INTO groups (id,name,owner_id,state,revision,created_at) VALUES (?,?,?,?,?,?)').bind(groupId, groupName, OWNER_GROUP, JSON.stringify(initialState(groupName)), 1, created),
    db.prepare('INSERT INTO accounts (id,group_id,role,name,username,email,phone,password_hash,salt,player_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(accountId, groupId, 'admin', name, username, email, phone, passwordHash, salt, null, created),
    db.prepare('INSERT INTO venue_admin_permissions (account_id,group_id,can_manage_admins,created_at) VALUES (?,?,1,?)').bind(accountId, groupId, created),
    db.prepare("INSERT INTO venue_billing (group_id,status,current_period_end,updated_at) VALUES (?,'unpaid',0,?)").bind(groupId, created)
  ]);
  return { groupId, venue: groupName, username };
}
