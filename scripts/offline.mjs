import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function files(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(e => e.isDirectory() ? files(`${dir}/${e.name}`, `${prefix}${e.name}/`) : [`${prefix}${e.name}`]));
  return nested.flat().filter(p => p !== 'sw.js');
}
const assets = await files('dist');
const hash = createHash('sha256');
for (const path of assets.sort()) hash.update(await readFile(`dist/${path}`));
const version = hash.digest('hex').slice(0, 16);
await writeFile('dist/sw.js', `const CACHE='gymhub-${version}';
const ASSETS=${JSON.stringify(['./', ...assets.map(p => `./${p}`)])};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('gymhub-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request,{ignoreVary:true}).then(hit=>hit||fetch(e.request).catch(()=>e.request.mode==='navigate'?caches.match(new URL('./index.html',self.location.href),{ignoreVary:true}):Response.error())));});
`);
console.log(`Offline shell: ${assets.length} file, cache ${version}`);
