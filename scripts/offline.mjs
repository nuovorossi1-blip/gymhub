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
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>{const old=keys.filter(k=>k.startsWith('gymhub-')&&k!==CACHE);return Promise.all(old.slice(0,-1).map(k=>caches.delete(k)));}).then(()=>self.clients.claim()));});
const INDEX=new URL('./index.html',self.location.href).href;
self.addEventListener('message',e=>{if(e.data?.type==='CHECK_CLIENT'&&!ASSETS.some(a=>new URL(a,self.location.href).href===e.data.asset))e.source?.postMessage({type:'GYMHUB_UPDATE_AVAILABLE'});});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 if(e.request.mode==='navigate'){
  e.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(new Request(e.request,{cache:'no-cache'}));if(response.ok)await cache.put(INDEX,response.clone());return response;}catch{return await cache.match(INDEX,{ignoreVary:true})||await caches.match(INDEX,{ignoreVary:true})||Response.error();}})());return;
 }
 e.respondWith(caches.open(CACHE).then(async c=>await c.match(e.request,{ignoreVary:true})||await caches.match(e.request,{ignoreVary:true})||fetch(e.request)));
});
`);
console.log(`Offline shell: ${assets.length} file, cache ${version}`);
