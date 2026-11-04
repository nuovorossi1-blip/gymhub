import {test,expect} from '@playwright/test';
const cases=[
 ['Squat','squat','mesopiede'],
 ['Curl bilanciere EZ','curl','Gomiti vicino ai fianchi'],
 ['Shoulder press manubri','press','Manubri all’altezza'],
 ['Rematore bilanciere busto flesso','row','Anche indietro'],
 ['Lat machine presa larga','lat','petto alto'],
 ['Leg extension','legextension','Asse del ginocchio']
];
for(const [query,kind,cue] of cases){
 test('Esercizi → '+query+' mostra modello 3D reale e guida accanto',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/?screen=library');await expect(page.locator('#avvio')).toHaveCount(0);
  await page.getByRole('searchbox',{name:'Cerca esercizio'}).fill(query);
  const card=page.locator('.exercise-card').filter({has:page.getByRole('heading',{name:query,exact:true})}).first();
  await expect(card).toBeVisible();await card.click();
  const d=page.getByRole('dialog'),p=d.locator('.motion-workspace');
  await expect(p).toHaveAttribute('data-motion',kind);
  await expect(p.locator('canvas')).toBeVisible();
  await expect(p.locator('canvas')).toHaveAttribute('data-renderer-ready','true');
  await expect(p).toContainText(cue);
  await expect(p).toContainText('Cosa fare');
  await expect(p).toContainText('Cosa evitare');
  await p.locator('[data-motion-control="play"]').click();
  await expect(p.locator('[data-motion-control="play"]')).toContainText('Avvia');
  await p.locator('[data-motion-speed]').selectOption('0.25');
  await p.locator('[data-motion-control="side"]').click();
  await expect(p.locator('.motion-view-name')).toHaveText('Vista laterale');
  await d.getByRole('button',{name:'Chiudi'}).click();
  expect(errors).toEqual([]);
 });
}
test('La libreria su mobile 320px mostra subito il modello 3D e la spiegazione sotto',async({page})=>{
 await page.setViewportSize({width:320,height:750});
 await page.goto('/?screen=library');await expect(page.locator('#avvio')).toHaveCount(0);
 await page.getByRole('searchbox',{name:'Cerca esercizio'}).fill('Leg extension');
 await page.locator('.exercise-card').first().click();
 const d=page.getByRole('dialog');
 await expect(d.locator('.motion-workspace canvas')).toBeVisible();
 await expect(d.locator('.motion-guidance')).toContainText('Cosa evitare');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
