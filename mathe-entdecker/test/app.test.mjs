import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../dist/', import.meta.url);
const source = await readFile(new URL('app.js', root), 'utf8');
test('Arithmetic and story exercises have correct results in both difficulty levels', () => {
  const context = vm.createContext({ document: { querySelector: () => ({}), addEventListener() {} }, Intl, Math });
  vm.runInContext(source.split("document.querySelector('#parent').onclick")[0], context);
  for (let topic = 0; topic < 6; topic++) for (let level = 0; level < 2; level++) {
    for (let index = 0; index < 5; index++) for (let repeat = 0; repeat < 10; repeat++) {
      const q = context.makeQuestion(topic, level, index);
      assert.ok(Number.isSafeInteger(q.answer) && q.answer >= 0);
      if (q.choices) assert.ok(q.choices.includes(q.answer));
      if (topic === 3 || topic === 4) {
        const expression = q.prompt.replaceAll('·', '*').replaceAll(':', '/').replaceAll('−', '-');
        assert.match(expression, /^[\d\s()+*/-]+$/);
        assert.equal(vm.runInNewContext(expression), q.answer);
      }
      if (topic === 5) {
        const [a,b,c,d] = [...q.prompt.matchAll(/\d+/g)].map(m => Number(m[0]));
        assert.equal(a*b+c*d, q.answer);
      }
    }
  }
});
test('Manifest and all referenced icons work below a GitHub Pages project path', async () => {
  const manifest = JSON.parse(await readFile(new URL('manifest.webmanifest', root), 'utf8'));
  assert.equal(manifest.name, 'Mathe Entdecker');
  assert.equal(manifest.short_name, 'Mathe Entdecker');
  assert.equal(manifest.display, 'standalone');
  const base = 'https://example.github.io/mathe-entdecker/';
  for (const field of ['id', 'start_url', 'scope']) assert.equal(new URL(manifest[field], base).href, base);
  for (const icon of manifest.icons) {
    assert.ok(new URL(icon.src, base).pathname.startsWith('/mathe-entdecker/'));
    const png = await readFile(new URL(icon.src, root));
    const [width,height] = icon.sizes.split('x').map(Number);
    assert.equal(png.readUInt32BE(16), width);
    assert.equal(png.readUInt32BE(20), height);
  }
  assert.equal((await readFile(new URL('icons/apple-touch-icon.png', root))).readUInt32BE(16),180);
});
test('No external CSS/fonts or analytics; no persistent learning data added', async () => {
  const css = await readFile(new URL('style.css', root), 'utf8');
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.doesNotMatch(css, /@import|https?:\/\//);
  assert.doesNotMatch(html, /(?:src|href)=["']https?:/);
  assert.doesNotMatch(source, /localStorage|indexedDB|sendBeacon/);
});

async function workerHarness({ failure = false } = {}) {
  const events = {};
  const storage = new Map();
  const scope = 'https://example.github.io/mathe-entdecker/';
  const caches = {
    async open(key) {
      if (!storage.has(key)) storage.set(key, new Map());
      const data = storage.get(key);
      return {
        async addAll(requests) {
          if (failure) throw new Error('Missing asset');
          for (const r of requests) data.set(r.url, new Response(r.url));
        },
        async match(url) { return data.get(typeof url === 'string' ? url : url.url)?.clone(); }
      };
    },
    async keys() { return [...storage.keys()]; },
    async delete(key) { return storage.delete(key); }
  };
  let claims = 0, skipped = 0, network = 0;
  const context = vm.createContext({ URL, Request, Response, caches,
    self: { location: { href: scope+'sw.js' }, clients: { claim: async () => claims++ },
      skipWaiting: () => skipped++, addEventListener: (type, fn) => events[type] = fn },
    fetch: async () => { network++; throw new Error('Network is offline'); }
  });
  vm.runInContext(await readFile(new URL('sw.js', root), 'utf8'), context);
  async function lifecycle(name) { let promise; events[name]({ waitUntil(p) { promise = p; } }); await promise; }
  async function fetchAsset(path, method='GET') {
    let response;
    events.fetch({ request: new Request(new URL(path, scope), {method}), respondWith(p) { response=p; } });
    return response;
  }
  return { storage, lifecycle, fetchAsset, events, counters: () => ({claims,skipped,network}) };
}
test('Offline cache covers every public asset and both entry URLs, including query strings', async () => {
  const h = await workerHarness();
  await h.lifecycle('install'); await h.lifecycle('activate');
  for (const path of ['./','index.html','app.js','style.css','pwa.js','manifest.webmanifest',
    'icons/apple-touch-icon.png','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','?installed=1']) {
    const response = await h.fetchAsset(path);
    assert.equal(response.status,200,path);
    assert.ok((await response.text()).includes('/mathe-entdecker/'));
  }
  assert.equal(h.counters().network,0);
  assert.equal(await h.fetchAsset('/other-app/index.html'),undefined);
  assert.equal(await h.fetchAsset('https://external.example/test'),undefined);
  assert.equal(await h.fetchAsset('missing.js'),undefined);
  assert.equal(await h.fetchAsset('index.html','POST'),undefined);
});
test('Worker update cleans only its own cache and requires an explicit activation message', async () => {
  const h = await workerHarness();
  h.storage.set('mathe-entdecker:/mathe-entdecker/:old',new Map());
  h.storage.set('mathe-entdecker:/another-app/:old',new Map());
  h.storage.set('unrelated',new Map());
  await h.lifecycle('install'); assert.equal(h.counters().skipped,0);
  await h.lifecycle('activate');
  assert.equal(h.storage.has('mathe-entdecker:/mathe-entdecker/:old'),false);
  assert.ok(h.storage.has('mathe-entdecker:/another-app/:old'));
  assert.ok(h.storage.has('unrelated'));
  h.events.message({data:{type:'ACTIVATE_UPDATE'}}); assert.equal(h.counters().skipped,1);
});
test('Failed precache rejects installation instead of deleting the working old version', async () => {
  const h = await workerHarness({ failure:true });
  h.storage.set('mathe-entdecker:/mathe-entdecker/:old',new Map());
  await assert.rejects(h.lifecycle('install'), /Missing asset/);
  assert.ok(h.storage.has('mathe-entdecker:/mathe-entdecker/:old'));
  assert.equal(h.counters().claims,0);
});
