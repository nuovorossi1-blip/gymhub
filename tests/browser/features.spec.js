import {test,expect} from '@playwright/test';
test('GymHub: consultazione, timer 80s, serie preparatorie e scelta in Oggi', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('#avvio')).toHaveCount(0);
  await page.locator('.mobile-nav').getByRole('button',{name:'Schede',exact:true}).click();
  await page.locator('.plan-card').first().getByRole('button',{name:'Leggi scheda'}).click();
  await expect(page.getByRole('dialog')).toContainText('LEGGI LE TECNICHE');
  await expect(page.locator('#session-time')).toHaveCount(0);
  await page.getByRole('dialog').getByRole('button',{name:'Chiudi'}).click();
  await page.locator('.mobile-nav').getByRole('button',{name:'Oggi',exact:true}).click();
  await page.getByRole('button',{name:'Scegli la seduta di oggi'}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Avvia allenamento'}).click();
  const row=page.locator('.runner-card').first();
  await row.getByRole('button',{name:'+ Serie di avvicinamento'}).click();
  await row.getByRole('button',{name:'+ Serie di avvicinamento'}).click();
  await expect(row.locator('.set-number').filter({hasText:'RISC.'})).toHaveCount(2);
  for(const [i,kg] of [70,80].entries()){
    await row.locator('[data-property="kg"]').nth(i).fill(String(kg));
    await row.locator('[data-property="reps"]').nth(i).fill('5');
    await row.locator('.set-check').nth(i).click();
  }
  await expect(page.locator('.session-dashboard')).toContainText('0');
  await row.getByRole('button',{name:'Timer personalizzato'}).click();
  await expect(page.getByRole('dialog').getByLabel('Durata in secondi')).toHaveValue('80');
  await page.getByRole('dialog').getByRole('button',{name:'Avvia timer'}).click();
  await expect(page.locator('#rest-panel')).toContainText('RECUPERO');
  await page.locator('#rest-panel').getByRole('button',{name:'Salta'}).click();
});
