import { test,expect } from '@playwright/test';

async function controlled(page){await page.evaluate(()=>navigator.serviceWorker.ready);await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);}

test('HTML vecchio in cache: riapertura online aggiorna la shell, dati e accesso offline conservati',async({page,context})=>{
  await page.goto('/?screen=settings');await expect(page.locator('#avvio')).toHaveCount(0);await controlled(page);
  await page.getByLabel('Come ti chiami?').fill('Cache verificata');await page.getByRole('button',{name:'Salva nome'}).click();
  await page.evaluate(async()=>{const keys=await caches.keys(),cache=await caches.open(keys.filter(k=>k.startsWith('gymhub-')).at(-1));const stale=new Response('<h1>VERSIONE VECCHIA</h1>',{headers:{'content-type':'text/html'}});await cache.put(new URL('./',location.href),stale.clone());await cache.put(new URL('./index.html',location.href),stale.clone());});
  await page.goto('/');await expect(page.locator('#avvio')).toHaveCount(0);await expect(page.getByRole('heading',{name:'CIAO, CACHE VERIFICATA.'})).toBeVisible();await expect(page.getByText('VERSIONE VECCHIA')).toHaveCount(0);
  await page.locator('.mobile-nav').getByRole('button',{name:'Schede',exact:true}).click();await expect(page.locator('[data-action="library-ppl"]')).toBeVisible();
  await context.setOffline(true);await page.goto('/?screen=ppl');await expect(page.locator('#avvio')).toHaveCount(0);await expect(page.locator('.program-session')).toHaveCount(6);await context.setOffline(false);
});

test('avviso aggiornamento: nessun reload automatico, aggiorna conserva allenamento e vista',async({page})=>{
  await page.goto('/');await expect(page.locator('#avvio')).toHaveCount(0);await controlled(page);
  await page.getByRole('button',{name:'Inizia ad allenarti',exact:true}).click();await page.locator('[data-property="kg"]').first().fill('35');await page.locator('[data-property="reps"]').first().fill('9');
  await page.evaluate(()=>navigator.serviceWorker.controller.postMessage({type:'CHECK_CLIENT',asset:new URL('./assets/vecchia-versione.js',location.href).href}));
  await expect(page.locator('#web-update')).toBeVisible();await expect(page.locator('[data-property="kg"]').first()).toHaveValue('35');await page.screenshot({path:'artifacts/screenshots/31-web-update.png'});
  await page.locator('#web-update').getByRole('button',{name:'Aggiorna',exact:true}).click();await expect(page).toHaveURL(/screen=runner/);await expect(page.locator('#avvio')).toHaveCount(0);await expect(page.locator('[data-property="kg"]').first()).toHaveValue('35');await expect(page.locator('[data-property="reps"]').first()).toHaveValue('9');await expect(page.locator('#web-update')).toHaveCount(0);
});
