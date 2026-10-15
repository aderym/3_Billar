import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const files = {};
const textExtensions = new Set(['.html', '.js', '.css', '.txt']);

function add(directory, prefix = '') {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.join(prefix, entry.name).split(path.sep).join('/');
    if (entry.isDirectory()) add(absolute, relative);
    else {
      const extension = path.extname(entry.name).toLowerCase();
      const body = fs.readFileSync(absolute);
      files[`/${relative}`] = textExtensions.has(extension)
        ? { type: extension === '.html' ? 'text/html; charset=utf-8' : extension === '.css' ? 'text/css; charset=utf-8' : extension === '.js' ? 'text/javascript; charset=utf-8' : 'text/plain; charset=utf-8', binary: false, body: body.toString('utf8') }
        : { type: extension === '.png' ? 'image/png' : 'application/octet-stream', binary: true, body: body.toString('base64') };
    }
  }
}

add(publicDir);
const source = fs.readFileSync(path.join(root, 'worker', 'worker-source.js'), 'utf8').replace(/^import \{ files \} from '\.\/static-files\.js';\n/, '');
fs.writeFileSync(path.join(root, 'worker', 'index.js'), `const files=${JSON.stringify(files)};\n${source}`);
