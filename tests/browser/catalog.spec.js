import {test,expect} from '@playwright/test';
test('catalogo Chris: tutte le split, calendario 9 giorni e conflitti senza perdita',async({page})=>{
 await page.clock.install({time:new Date('2027-02-01T12:00:00+01:00')});
 await page.goto('/?screen=cbum');await expect(page.locator('#avvio')).toHaveCount(0);
 await expect(page.locator('.program-session')).toHaveCount(4);
 await expect(page.locator('.program-session').nth(3).locator('li')).toHaveCount(9);
 await page.locator('.program-session').nth(3).getByRole('button',{name:'Pianifica il ciclo'}).click();
 let d=page.getByRole('dialog');
 await expect(d.locator('select[name^="day-"]')).toHaveCount(7);
 await d.getByLabel('Data di partenza').fill('2027-02-01');
 await d.getByRole('button',{name:'Aggiungi il ciclo'}).click();
 await expect(page.locator('.weekly-agenda')).toContainText('Riposo');
 await page.locator('.mobile-nav').getByRole('button',{name:'Schede',exact:true}).click();
 await page.getByRole('button',{name:'Apri il catalogo split'}).click();
 await page.locator('.program-session').nth(3).getByRole('button',{name:'Pianifica il ciclo'}).click();
 d=page.getByRole('dialog');
 await d.getByLabel('Data di partenza').fill('2027-02-01');
 await d.getByRole('button',{name:'Aggiungi il ciclo'}).click();
 await expect(d.locator('.form-error')).toContainText('occupata');
});
test('catalogo e pianificazione entro lo schermo a 320 e 390 px',async({page})=>{
 for(const width of [320,390]){
  await page.setViewportSize({width,height:850});await page.goto('/?screen=cbum');
  await expect(page.locator('#avvio')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  await page.locator('.program-session').last().getByRole('button',{name:'Pianifica il ciclo'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 }
});
