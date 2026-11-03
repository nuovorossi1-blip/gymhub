import { test,expect } from '@playwright/test';

test('split completa: sei schede, calendario riposi, editor40s, timer e ripresa',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('#avvio')).toHaveCount(0);
  await page.locator('.mobile-nav').getByRole('button',{name:'Schede',exact:true}).click();
  await page.getByRole('button',{name:'Apri la split completa'}).click();
  await expect(page.locator('.program-session')).toHaveCount(6);
  await expect(page.locator('.program-intro')).toContainText('2019');
  await expect(page.locator('.program-session').nth(4)).toContainText('2 × 20');
  await page.screenshot({path:'artifacts/screenshots/25-ppl-program.png'});
  await page.getByRole('button',{name:'Pianifica il ciclo',exact:true}).click();let d=page.getByRole('dialog');
  await d.getByLabel('Data di partenza').fill('2027-01-04');await d.getByLabel('Quanti cicli').selectOption('1');
  await expect(d.locator('.cycle-day')).toHaveCount(8);await expect(d.locator('.rest-day')).toHaveCount(2);
  await page.screenshot({path:'artifacts/screenshots/26-ppl-calendar.png'});
  await d.getByRole('button',{name:'Aggiungi schede e calendario'}).click();await expect(page.locator('.plan-card')).toHaveCount(7);
  const pull=page.locator('.plan-card').filter({has:page.getByRole('heading',{name:'Pull A · Chris 2019',exact:true})});
  await pull.getByRole('button',{name:'Modifica Pull A · Chris 2019'}).click();d=page.getByRole('dialog');
  await expect(d.getByLabel('Tipo di serie esercizio 8')).toHaveValue('time');await d.getByRole('button',{name:'Salva',exact:true}).click();
  await pull.getByRole('button',{name:'Inizia',exact:true}).click();let timed=page.locator('.runner-card').filter({has:page.getByRole('button',{name:'Avvia serie 40s'})});
  await expect(timed.locator('[data-property="reps"]').first()).toHaveValue('');
  await timed.getByRole('button',{name:'Avvia serie 40s'}).click();await expect(page.locator('#effort-panel')).toContainText('SERIE IN CORSO');
  await timed.locator('[data-property="kg"]').first().fill('10');await timed.locator('[data-property="reps"]').first().fill('15');
  await page.reload();await expect(page.locator('#avvio')).toHaveCount(0);await page.getByRole('button',{name:'Riprendi allenamento',exact:true}).click();
  await expect(page.locator('#effort-panel')).toBeVisible();await expect(timed.locator('[data-property="reps"]').first()).toHaveValue('15');
  await timed.locator('.set-check').first().click();await expect(page.locator('#effort-panel')).toHaveCount(0);
  await page.screenshot({path:'artifacts/screenshots/27-ppl-runner.png'});
  await page.getByRole('button',{name:'Concludi allenamento'}).click();await page.getByRole('dialog').getByRole('button',{name:'Salva allenamento'}).click();await expect(page.locator('.history-card')).toContainText('150');
  await page.locator('.mobile-nav').getByRole('button',{name:'Schede',exact:true}).click();await page.getByRole('button',{name:'Apri la split completa'}).click();await page.getByRole('button',{name:'Pianifica il ciclo',exact:true}).click();d=page.getByRole('dialog');await d.getByLabel('Data di partenza').fill('2027-01-04');await d.getByRole('button',{name:'Aggiungi schede e calendario'}).click();await expect(d.locator('.form-error')).toContainText('già pianificato');
  expect(errors).toEqual([]);
});

test('giornata riposo: home mostra il riposo e nomi delle sedute, senza avvio automatico',async({page})=>{
  await page.clock.install({time:new Date('2027-01-07T12:00:00+01:00')});await page.goto('/');await page.clock.runFor(1300);
  await page.locator('.mobile-nav').getByRole('button',{name:'Schede',exact:true}).click();await page.getByRole('button',{name:'Apri la split completa'}).click();await page.getByRole('button',{name:'Pianifica il ciclo',exact:true}).click();const d=page.getByRole('dialog');await d.getByLabel('Data di partenza').fill('2027-01-04');await d.getByLabel('Quanti cicli').selectOption('1');await d.getByRole('button',{name:'Aggiungi schede e calendario'}).click();
  await page.locator('.mobile-nav').getByRole('button',{name:'Oggi',exact:true}).click();await expect(page.locator('.hero')).toContainText('RIPOSO PIANIFICATO');await expect(page.locator('.hero').getByRole('button',{name:'Inizia ad allenarti'})).toHaveCount(0);await expect(page.locator('.weekly-agenda')).toContainText('Push B');await expect(page.locator('.weekly-agenda')).toContainText('Riposo');
  await page.screenshot({path:'artifacts/screenshots/28-ppl-rest-day.png'});
});
