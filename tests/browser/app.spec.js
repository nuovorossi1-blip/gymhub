import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const main = page => page.locator('main');
const nav = async (page, label) => { await page.locator('.mobile-nav').getByRole('button', { name: label, exact: true }).click(); };
const shot = async (page, name) => { await mkdir('artifacts/screenshots', { recursive: true }); await page.screenshot({ path: `artifacts/screenshots/${name}.png`, fullPage: true }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); };

test('percorso completo: scheda, sostituzione, superset/drop, pausa, riapertura e storico', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/'); await expect(page.locator('#avvio')).toHaveCount(0); await shot(page, '01-home-mobile');
  await nav(page, 'Esercizi'); await main(page).getByRole('button', { name: 'Nuovo esercizio' }).click();
  let d = page.getByRole('dialog'); await d.getByLabel('Nome', { exact: true }).fill('Pullover GymHub'); await d.getByLabel('Gruppo muscolare').selectOption('Schiena'); await d.getByLabel('Attrezzo').selectOption('Manubri'); await d.getByRole('button', { name: 'Salva', exact: true }).click();
  await expect(main(page).getByRole('heading', { name: 'Pullover GymHub', exact: true })).toBeVisible(); await shot(page, '02-library-mobile');
  await nav(page, 'Schede'); await main(page).getByRole('button', { name: 'Nuova scheda' }).click(); d = page.getByRole('dialog');
  await d.getByLabel('Nome della scheda').fill('Superset GymHub');
  for (let i=0;i<2;i++) {
    await d.getByRole('button', { name: 'Aggiungi', exact: true }).click();
    const row=d.locator('.plan-editor-row').nth(i);
    await row.locator('[data-prop="exerciseId"]').selectOption(`ex-${i}`); await row.locator('[data-prop="sets"]').fill('1'); await row.locator('[data-prop="rest"]').fill('90'); await row.locator('[data-prop="group"]').selectOption('A');
    if(i===0) await row.locator('[data-prop="drops"]').fill('1');
  }
  await shot(page, '03-plan-editor-mobile'); await d.getByRole('button', { name: 'Salva', exact: true }).click();
  await main(page).locator('.plan-card').filter({has:page.getByRole('heading',{name:'Superset GymHub',exact:true})}).getByRole('button',{name:'Inizia',exact:true}).click();
  await main(page).getByRole('button',{name:'Sostituisci Panca piana'}).click(); d=page.getByRole('dialog');
  await d.getByLabel('Nuovo esercizio').selectOption({label:'Pullover GymHub · Manubri'}); await d.getByRole('button',{name:'Sostituisci',exact:true}).click();
  const cards=main(page).locator('.runner-card'), a=cards.nth(0), b=cards.nth(1);
  await a.locator('[data-property="kg"]').nth(0).fill('20'); await a.locator('[data-property="reps"]').nth(0).fill('8');
  await a.getByRole('button',{name:'Completa serie 1 Pullover GymHub',exact:true}).click(); await expect(page.locator('#rest-panel')).toBeHidden();
  await a.locator('[data-property="kg"]').nth(1).fill('10'); await a.locator('[data-property="reps"]').nth(1).fill('6');
  await a.getByRole('button',{name:'Completa serie 1 Pullover GymHub drop',exact:true}).click(); await expect(page.locator('#rest-panel')).toBeHidden();
  await b.locator('[data-property="kg"]').fill('30'); await b.getByRole('button',{name:'Completa serie 1 Distensioni inclinate',exact:true}).click(); await expect(page.locator('#rest-panel')).toBeVisible();
  await page.locator('#rest-panel').getByRole('button',{name:'+30 s',exact:true}).click(); await expect(page.locator('#rest-time')).toHaveText(/01:5\d|02:00/);
  await page.locator('#rest-panel').getByRole('button',{name:'Salta',exact:true}).click();
  await main(page).getByRole('button',{name:'Pausa',exact:true}).click(); await page.reload(); await expect(page.locator('#avvio')).toHaveCount(0);
  await main(page).getByRole('button',{name:'Riprendi allenamento',exact:true}).click(); await expect(main(page).getByText('Allenamento in pausa',{exact:true})).toBeVisible();
  await main(page).getByRole('button',{name:'Riprendi',exact:true}).click(); await expect(main(page).locator('.set-check.is-done')).toHaveCount(3); await shot(page,'04-runner-mobile');
  await main(page).getByRole('button',{name:'Concludi allenamento'}).click(); await page.getByRole('dialog').getByRole('button',{name:'Salva allenamento'}).click();
  await expect(main(page).locator('.history-card')).toHaveCount(1); await expect(main(page).locator('.history-card')).toContainText('520'); await shot(page,'05-progress-mobile');
  await page.reload(); await expect(page.locator('#avvio')).toHaveCount(0); await nav(page,'Progressi'); await expect(main(page).locator('.history-card')).toContainText('520');
  await main(page).locator('#history-filter').selectOption({label:'Pullover GymHub · Manubri'}); await expect(main(page).locator('.history-card')).toContainText('20 kg × 8');
  expect(errors).toEqual([]);
});

test('nutrizione, ricette, abitudini, backup e funzionamento offline',async({page,context})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('#avvio')).toHaveCount(0);await nav(page,'Altro');
  await main(page).getByRole('button',{name:'Nutrizione Diario, alimenti e macronutrienti'}).click();
  await main(page).getByRole('button',{name:/I tuoi alimenti/}).click();await page.getByRole('dialog').getByRole('button',{name:'Nuovo alimento'}).click();
  let d=page.getByRole('dialog');await d.getByLabel('Nome',{exact:true}).fill('Alimento di prova');
  for(const [name,value]of [['Calorie (kcal)','100'],['Proteine (g)','10'],['Carboidrati (g)','15'],['Grassi (g)','2']])await d.getByLabel(name,{exact:true}).fill(value);
  await d.getByRole('button',{name:'Salva',exact:true}).click();await main(page).getByRole('button',{name:/I tuoi alimenti/}).click();await page.getByRole('dialog').getByRole('button',{name:/Alimento di prova/}).click();
  d=page.getByRole('dialog');await d.getByLabel('Quantità in grammi').fill('150');await d.getByRole('button',{name:'Registra',exact:true}).click();await expect(main(page).locator('.meal-row')).toContainText('150');await shot(page,'06-nutrition-mobile');
  await main(page).getByRole('button',{name:/Le tue ricette/}).click();await main(page).getByRole('button',{name:'Nuova ricetta'}).click();d=page.getByRole('dialog');await d.getByLabel('Nome',{exact:true}).fill('Ricetta prova');await d.getByLabel('Numero di porzioni').fill('2');await d.getByRole('button',{name:'Aggiungi',exact:true}).click();await d.getByRole('button',{name:'Salva',exact:true}).click();await expect(main(page).locator('.recipe-card')).toContainText('50');await shot(page,'07-recipes-mobile');
  await nav(page,'Altro');await main(page).getByRole('button',{name:/Abitudini e traguardi/}).click();await main(page).locator('.habit-toggle').first().click();await expect(main(page).locator('.habit-toggle').first()).toHaveAttribute('aria-pressed','true');await shot(page,'08-habits-mobile');
  await nav(page,'Altro');await main(page).getByRole('button',{name:/Impostazioni e backup/}).click();
  const dl=page.waitForEvent('download');await main(page).getByRole('button',{name:'Esporta backup'}).click();const download=await dl;expect(download.suggestedFilename()).toMatch(/^gymhub-.*\.json$/);
  await page.locator('#import-file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":99}')});await expect(page.locator('#toast')).toContainText('Formato backup non supportato');
  await page.locator('#import-file').setInputFiles(await download.path());await page.getByRole('dialog').getByRole('button',{name:'Conferma',exact:true}).click();await expect(page.locator('#toast')).toContainText('Backup importato');
  await shot(page,'09-settings-mobile');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);await page.reload();await expect(page.locator('#avvio')).toHaveCount(0);await nav(page,'Altro');await main(page).getByRole('button',{name:/Nutrizione/}).click();await expect(main(page).locator('.meal-row')).toHaveCount(1);await context.setOffline(false);
  expect(errors).toEqual([]);
});

test('layout desktop e nessuna dipendenza da servizi remoti',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});const remote=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:3187')&&!r.url().startsWith('data:'))remote.push(r.url());});
  await page.goto('/');await expect(page.locator('#avvio')).toHaveCount(0);await shot(page,'10-home-desktop');
  await expect(page.locator('.sidebar')).toBeVisible();expect(remote).toEqual([]);
});
