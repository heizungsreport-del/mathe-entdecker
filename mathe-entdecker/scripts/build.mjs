import { readdir, readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'dist');
const output = path.join(root, 'build');
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const list = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink()) throw new Error('Symlinks are not allowed in public assets');
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) list.push(...await files(file));
    else if (entry.name !== '.DS_Store') list.push(file);
  }
  return list.sort();
}
const entries = await files(source);
const hash = createHash('sha256');
for (const entry of entries) { hash.update(path.relative(source, entry)); hash.update(await readFile(entry)); }
const version = hash.digest('hex').slice(0, 16);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of entries) {
  const dest = path.join(output, path.relative(source, entry));
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(entry, dest);
}
const worker = await readFile(path.join(output, 'sw.js'), 'utf8');
await writeFile(path.join(output, 'sw.js'), worker.replace('__BUILD_VERSION__', version));
await writeFile(path.join(output, '.nojekyll'), '');
console.log(`Production build: ${entries.length} files, version ${version}, output build/`);
