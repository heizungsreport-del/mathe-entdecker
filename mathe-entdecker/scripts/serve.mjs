import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../build/', import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.webmanifest':'application/manifest+json' };
const port = Number(process.env.PORT || 8766);
http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const prefix = '/mathe-entdecker/';
  if (!pathname.startsWith(prefix)) { res.writeHead(404); res.end('Not found'); return; }
  const file = path.resolve(root, pathname.slice(prefix.length) || 'index.html');
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}/mathe-entdecker/`));
