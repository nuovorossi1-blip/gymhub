import {test,expect} from '@playwright/test';
test('mobile senza tagli orizzontali: Oggi, Schede, Split, Progressi, Esercizi, Allenamento',async({page})=>{
 for(const width of [320,360,375,390,412,430]){
  await page.setViewportSize({width,height:850});
  for(const screen of ['home','plans','progress','library','ppl']){
   await page.goto('/?screen='+screen);
   await expect(page.locator('#avvio')).toHaveCount(0);
   const actual=await page.evaluate(()=>document.documentElement.scrollWidth);
   expect(actual,screen+' @'+width).toBeLessThanOrEqual(width);
  }
  await page.goto('/?screen=plans');
  await expect(page.locator('#avvio')).toHaveCount(0);
  await page.locator('.library-program').last().getByRole('button',{name:'Esplora'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth),'dialog @'+width).toBeLessThanOrEqual(width);
 }
});