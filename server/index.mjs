import http from 'node:http';
import { Readable } from 'node:stream';
import fs from 'node:fs';
import path from 'node:path';
import { db, bucket, billingEncryptionKey } from './database.mjs';
import site from '../worker/index.js';

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const maxBody = 2200000;
const publicDir = path.resolve(import.meta.dirname, '..', 'public');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };

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
      OWNER_BOOTSTRAP_PASSWORD: process.env.OWNER_BOOTSTRAP_PASSWORD
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
