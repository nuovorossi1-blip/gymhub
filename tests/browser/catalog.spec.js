import {test,expect} from '@playwright/test';
test('split Chris 2024: biblioteca in sola lettura, calendario scelto in Oggi, riposi e conflitti',async({page})=>{
 await page.clock.install({time:new Date('2027-02-01T12:00:00+01:00')});
 await page.goto('/?screen=plans');await expect(page.locator('#avvio')).toHaveCount(0);
 const library=page.locator('[data-action="library-program"][data-id="cbum-offseason-2024"]');
 await library.click();let d=page.getByRole('dialog');
 await expect(d).toContainText('Justin King');
 await expect(d.locator('.library-session-tile')).toHaveCount(9);
 await expect(d).not.toContainText('Avvia allenamento');
 await d.getByRole('button',{name:'Chiudi'}).click();
 await page.locator('.mobile-nav').getByRole('button',{name:'Oggi',exact:true}).click();
 await page.getByRole('button',{name:'Scegli split e ciclo'}).click();
 await page.getByRole('dialog').locator('[data-action="activate-catalog"][data-id="cbum-offseason-2024"]').click();
 d=page.getByRole('dialog');
 await expect(d.locator('select[name^="day-"]')).toHaveCount(7);
 await d.getByLabel('Data di partenza').fill('2027-02-01');
 await d.getByRole('button',{name:'Aggiungi il ciclo'}).click();
 await expect(page.locator('.weekly-agenda')).toContainText('Riposo');
 await page.getByRole('button',{name:'Scegli split e ciclo'}).click();
 await page.getByRole('dialog').locator('[data-action="activate-catalog"][data-id="cbum-offseason-2024"]').click();
 d=page.getByRole('dialog');
 await d.getByLabel('Data di partenza').fill('2027-02-01');
 await d.getByRole('button',{name:'Aggiungi il ciclo'}).click();
 await expect(d.locator('.form-error')).toContainText('occupata');
});
test('mobile 320 e 390: biblioteca dei periodi e scelta del ciclo in Oggi senza debordare',async({page})=>{
 for(const width of [320,390]){
  await page.setViewportSize({width,height:850});await page.goto('/?screen=plans');
  await expect(page.locator('#avvio')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  await page.locator('[data-action="library-program"][data-id="cbum-olympia-2023"]').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  await page.getByRole('dialog').getByRole('button',{name:'Chiudi'}).click();
  await page.locator('.mobile-nav').getByRole('button',{name:'Oggi',exact:true}).click();
  await page.getByRole('button',{name:'Scegli split e ciclo'}).click();
  await page.getByRole('dialog').locator('[data-action="activate-catalog"][data-id="cbum-olympia-2023"]').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 }
});
