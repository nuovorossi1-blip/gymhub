import { test,expect } from '@playwright/test';

test('scheda video: dati8-12, rest-pause1/2, ripresa e storico senza numeri inventati',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('#avvio')).toHaveCount(0);
  await page.locator('.mobile-nav').getByRole('button',{name:'Schede',exact:true}).click();
  await page.getByRole('button',{name:'Scopri la sessione'}).click();let d=page.getByRole('dialog');
  await expect(d).toContainText('3 × 8–12');await expect(d.locator('a').nth(1)).toHaveAttribute('href',/ZQPVYJc1cpM&t=136s$/);
  await page.screenshot({path:'artifacts/screenshots/16-cbum-reference.png',fullPage:true});
  await d.getByRole('button',{name:'Aggiungi scheda'}).click();
  const card=page.locator('.plan-card').filter({has:page.getByRole('heading',{name:'Schiena · Chris Bumstead',exact:true})});
  await expect(card).toContainText('3 × 8–12');await card.getByRole('button',{name:'Inizia',exact:true}).click();
  const rows=page.locator('.runner-card'),lat=rows.first();
  await expect(lat.locator('[data-property="reps"]')).toHaveCount(5);await expect(lat.locator('[data-property="reps"]').nth(1)).toHaveValue('');
  const reps=[8,3,8,3,2];
  for(let i=0;i<5;i++){
    await lat.locator('[data-property="kg"]').nth(i).fill('50');
    await lat.locator('[data-property="reps"]').nth(i).fill(String(reps[i]));
    await lat.locator('.set-check').nth(i).click();
    if([0,2,3].includes(i))await expect(page.locator('#rest-panel')).toContainText('REST-PAUSE');
    else await expect(page.locator('#rest-panel')).toBeHidden();
    if(i===0){await page.reload();await expect(page.locator('#avvio')).toHaveCount(0);await page.getByRole('button',{name:'Riprendi allenamento',exact:true}).click();await expect(lat.locator('.set-check.is-done')).toHaveCount(1);await page.getByRole('button',{name:'Riprendi',exact:true}).click();}
  }
  await expect(rows.nth(1)).toContainText('TRI-SET A');await expect(rows.nth(1).locator('[data-property="reps"]').first()).toHaveAttribute('placeholder','8–12');
  await rows.nth(1).locator('[data-property="kg"]').first().fill('20');await rows.nth(1).locator('.set-check').first().click();await expect(page.locator('#toast')).toContainText('Ripetizioni');
  await rows.nth(1).locator('[data-property="reps"]').first().fill('10');await rows.nth(1).locator('.set-check').first().click();await expect(page.locator('#rest-panel')).toBeHidden();
  await lat.getByRole('button',{name:'Avvia un recupero'}).click();d=page.getByRole('dialog');await d.getByLabel('Durata in secondi').fill('60');await d.getByRole('button',{name:'Avvia timer'}).click();await expect(page.locator('#rest-panel')).toContainText('RECUPERO');
  await page.locator('#rest-panel').getByRole('button',{name:'Salta',exact:true}).click();await page.screenshot({path:'artifacts/screenshots/17-cbum-runner.png',fullPage:true});
  await page.getByRole('button',{name:'Concludi allenamento'}).click();await page.getByRole('dialog').getByRole('button',{name:'Salva allenamento'}).click();await expect(page.locator('.history-card')).toContainText(/1\.?400/);
  await page.locator('.history-card').click();await expect(page.getByRole('dialog')).toContainText('rest-pause');expect(errors).toEqual([]);
});
