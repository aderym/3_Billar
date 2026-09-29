import crypto from 'node:crypto';

const OWNER_GROUP = '__owner__';
const id = () => crypto.randomUUID();
const now = () => Date.now();

async function hash(password, salt) {
  return new Promise((resolve, reject) => crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (error, key) => error ? reject(error) : resolve(key.toString('hex'))));
}

export async function registerPublicPlayer(db, input) {
  const groupId = String(input.groupId || '').trim();
  const name = String(input.name || '').trim().slice(0, 70);
  const username = String(input.username || '').trim().toLowerCase();
  const email = String(input.email || '').trim().toLowerCase() || null;
  const phone = String(input.phone || '').replace(/\D/g, '') || null;
  const password = String(input.password || '');
  const passwordConfirmation = String(input.passwordConfirmation || '');

  if (!groupId || groupId === OWNER_GROUP || !name || username === 'osp' || !/^[-._a-z0-9]{3,40}$/.test(username) || email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || phone && phone.length < 10 || password.length < 8 || password.length > 128 || password !== passwordConfirmation) {
    throw Object.assign(new Error('Completa los datos y usa una contraseña válida de al menos 8 caracteres. Las contraseñas deben coincidir.'), { status: 400 });
  }

  const group = await db.prepare('SELECT id,name,state FROM groups WHERE id=? AND id<>?').bind(groupId, OWNER_GROUP).first();
  if (!group) throw Object.assign(new Error('Selecciona un local válido.'), { status: 404 });

  const duplicate = await db.prepare('SELECT id FROM accounts WHERE username=? OR (email IS NOT NULL AND email=?) OR (phone IS NOT NULL AND phone=?) LIMIT 1').bind(username, email || '', phone || '').first();
  if (duplicate) throw Object.assign(new Error('El usuario, correo o teléfono ya está registrado.'), { status: 409 });

  const playerId = id();
  const accountId = id();
  const created = now();
  const salt = crypto.randomBytes(16).toString('hex');
  const state = JSON.parse(group.state || '{}');
  state.players = Array.isArray(state.players) ? state.players : [];
  state.players.push({ id: playerId, name, seed: state.players.length + 1 });

  await db.batch([
    db.prepare('INSERT INTO accounts (id,group_id,role,name,username,email,phone,password_hash,salt,player_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(accountId, groupId, 'player', name, username, email, phone, await hash(password, salt), salt, playerId, created),
    db.prepare('UPDATE groups SET state=?,revision=revision+1 WHERE id=?').bind(JSON.stringify(state), groupId)
  ]);

  return { accountId, playerId, username, venue: group.name };
}
