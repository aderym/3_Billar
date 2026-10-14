import http from 'node:http';
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import fs from 'node:fs';
import path from 'node:path';
import { db, bucket, billingEncryptionKey } from './database.mjs';
import { registerPublicVenue } from './public-venue-registration.mjs';
import { registerPublicPlayer } from './public-player-registration.mjs';
import site from '../worker/index.js';

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const maxBody = 2200000;
const publicDir = path.resolve(import.meta.dirname, '..', 'public');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };
const ownerSession = req => /(?:^|;\s*)osp_owner_session=([^;]+)/.exec(req.headers.cookie || '')?.[1] || /(?:^|;\s*)osp_session=([^;]+)/.exec(req.headers.cookie || '')?.[1] || '';
const isOwnerRequest = async req => { const token = ownerSession(req); if (!token) return false; const tokenHash = createHash('sha256').update(token).digest('hex'); const account = await db.prepare('SELECT a.group_id,a.role FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires_at>? AND a.active=1').bind(tokenHash, Date.now()).first(); return account?.group_id === '__owner__' && account.role === 'admin'; };

http.createServer(async (incoming, outgoing) => {
  try {
    const forwarded = String(incoming.headers['x-forwarded-proto'] || '').split(',')[0];
    const protocol = forwarded === 'https' ? 'https' : forwarded === 'http' ? 'http' : incoming.socket.encrypted ? 'https' : 'http';
    const hostname = incoming.headers.host || `localhost:${port}`;
    const url = new URL(incoming.url || '/', `${protocol}://${hostname}`);
    if (url.pathname === '/health') { outgoing.writeHead(200, { 'content-type': 'text/plain' }); outgoing.end('OK'); return; }
    if ((incoming.method === 'GET' || incoming.method === 'HEAD') && !url.pathname.startsWith('/api/')) {
      let filename;
      try { filename = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname); }
      catch { outgoing.writeHead(400); outgoing.end(); return; }
      const file = path.resolve(publicDir, `.${filename}`);
      if (!file.startsWith(publicDir + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { outgoing.writeHead(404); outgoing.end('Not found'); return; }
      outgoing.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream', 'cache-control': /\.(html|js|css)$/.test(file) ? 'no-store' : 'public, max-age=3600' });
      if (incoming.method === 'HEAD') outgoing.end(); else fs.createReadStream(file).pipe(outgoing);
      return;
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of incoming) {
      size += chunk.length;
      if (size > maxBody) { outgoing.writeHead(413); outgoing.end('Request too large'); return; }
      chunks.push(chunk);
    }
    if (url.pathname === '/api/register-venue' && incoming.method === 'POST') {
      try {
        const origin = incoming.headers.origin;
        if (origin && origin !== url.origin) { outgoing.writeHead(403, { 'content-type': 'application/json' }); outgoing.end(JSON.stringify({ error: 'Invalid request origin' })); return; }
        const result = await registerPublicVenue(db, JSON.parse(Buffer.concat(chunks).toString('utf8')));
        outgoing.writeHead(201, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        outgoing.end(JSON.stringify({ ok: true, ...result }));
      } catch (error) {
        const status = Number(error.status) || (error.code === 'ER_DUP_ENTRY' ? 409 : 400);
        outgoing.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        outgoing.end(JSON.stringify({ error: error.code === 'ER_DUP_ENTRY' ? 'Username, email, or phone is already in use.' : error.message || 'Could not create the venue.' }));
      }
      return;
    }
    if (url.pathname === '/api/register-player' && incoming.method === 'POST') {
      try {
        const origin = incoming.headers.origin;
        if (origin && origin !== url.origin) { outgoing.writeHead(403, { 'content-type': 'application/json' }); outgoing.end(JSON.stringify({ error: 'Invalid request origin' })); return; }
        const result = await registerPublicPlayer(db, JSON.parse(Buffer.concat(chunks).toString('utf8')));
        outgoing.writeHead(201, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        outgoing.end(JSON.stringify({ ok: true, ...result }));
      } catch (error) {
        const status = Number(error.status) || (error.code === 'ER_DUP_ENTRY' ? 409 : 400);
        outgoing.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        outgoing.end(JSON.stringify({ error: error.code === 'ER_DUP_ENTRY' ? 'El usuario, correo o teléfono ya está registrado.' : error.message || 'No se pudo crear la cuenta.' }));
      }
      return;
    }
    if (url.pathname === '/api/owner/venue-requests' && incoming.method === 'GET') {
      if (!await isOwnerRequest(incoming)) { outgoing.writeHead(403, { 'content-type': 'application/json' }); outgoing.end(JSON.stringify({ error: 'Owner access required.' })); return; }
      const rows = (await db.prepare("SELECT id,name,username,email,phone,message,created_at FROM access_requests WHERE group_id='__owner__' AND kind='venue_signup' AND status='pending' ORDER BY created_at DESC LIMIT 100").all()).results;
      const requests = rows.map(row => { let details = {}; try { details = JSON.parse(row.message || '{}'); } catch {} return { ...row, groupId: details.groupId || '', venue: details.venue || '' }; });
      outgoing.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); outgoing.end(JSON.stringify({ requests })); return;
    }
    if (/^\/api\/owner\/venue-requests\/[^/]+$/.test(url.pathname) && incoming.method === 'PATCH') {
      if (!await isOwnerRequest(incoming)) { outgoing.writeHead(403, { 'content-type': 'application/json' }); outgoing.end(JSON.stringify({ error: 'Owner access required.' })); return; }
      let payload = {}; try { payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { payload = {}; }
      const status = String(payload.status || '');
      if (!['resolved', 'dismissed'].includes(status)) { outgoing.writeHead(400, { 'content-type': 'application/json' }); outgoing.end(JSON.stringify({ error: 'Invalid request status.' })); return; }
      const requestId = decodeURIComponent(url.pathname.split('/').pop());
      const result = await db.prepare("UPDATE access_requests SET status=?,updated_at=? WHERE id=? AND group_id='__owner__' AND kind='venue_signup' AND status='pending'").bind(status, Date.now(), requestId).run();
      if (!result.meta.changes) { outgoing.writeHead(404, { 'content-type': 'application/json' }); outgoing.end(JSON.stringify({ error: 'Request no longer pending.' })); return; }
      outgoing.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); outgoing.end(JSON.stringify({ ok: true })); return;
    }
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      if (name !== 'oai-authenticated-user-email' && value != null) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    }
    // Sites' owner identity is platform specific. This server uses the local setup command.
    const init = { method: incoming.method, headers };
    if (incoming.method !== 'GET' && incoming.method !== 'HEAD') init.body = Buffer.concat(chunks);
    const response = await site.fetch(new Request(url, init), {
      DB: db,
      BUCKET: bucket,
      BILLING_ENCRYPTION_KEY: billingEncryptionKey,
      OWNER_BOOTSTRAP_PASSWORD: process.env.OWNER_BOOTSTRAP_PASSWORD,
      URL_USERS_SYNC: process.env.URL_USERS_SYNC
    });
    const responseHeaders = Object.fromEntries(response.headers);
    const cookies = response.headers.getSetCookie?.();
    if (cookies?.length) responseHeaders['set-cookie'] = cookies;
    outgoing.writeHead(response.status, responseHeaders);
    if (incoming.method === 'HEAD' || !response.body) { outgoing.end(); return; }
    Readable.fromWeb(response.body).pipe(outgoing);
  } catch (error) {
    console.error(error);
    if (!outgoing.headersSent) outgoing.writeHead(500, { 'content-type': 'application/json' });
    outgoing.end(JSON.stringify({ error: 'Server error.' }));
  }
}).listen(port, host, () => console.log(`OSP Billiards Play listening on ${host}:${port}`));
