import { chromium, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
const adb = join(process.env.ANDROID_HOME, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
const serial = process.argv[2] || 'emulator-5580';
const call = (...args) => execFileSync(adb, ['-s', serial, ...args], { encoding: 'utf8' }).trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
async function connect() {
  for (let i = 0; i < 40; i++) {
    const pid = call('shell', 'pidof', 'dev.aios.gymhub');
    if (pid) {
      call('forward', 'tcp:9227', `localabstract:webview_devtools_remote_${pid}`);
      try { const browser = await chromium.connectOverCDP('http://127.0.0.1:9227', { timeout: 1500 }); const page = browser.contexts()[0].pages()[0]; if (page) return { browser, page }; await browser.close(); } catch { /* WebView is still starting. */ }
    }
    await wait(250);
  }
  throw new Error('WebView GymHub non raggiungibile.');
}
async function screenshot(name) {
  await mkdir('artifacts/screenshots', { recursive: true });
  await writeFile(`artifacts/screenshots/${name}.png`, execFileSync(adb, ['-s', serial, 'exec-out', 'screencap', '-p'], { maxBuffer: 10 * 1024 * 1024 }));
}
// Let the native bridge initialize before attaching a debugger to the WebView.
await wait(3500);
let { browser, page } = await connect();
const errors = []; page.on('pageerror', e => errors.push(e.message));
await expect(page.locator('#avvio')).toHaveCount(0, { timeout: 15000 });
await expect(page.getByRole('heading', { name: 'CIAO, ATLETA.' })).toBeVisible();
console.log('Android: home pronta, viewport', await page.evaluate(() => innerWidth));
await screenshot('11-native-home');
await page.locator('main').getByRole('button', { name: 'Inizia ad allenarti' }).click({ force: true });
const card = page.locator('main .runner-card').first();
await card.locator('[data-property="kg"]').first().fill('40');
await card.locator('[data-property="reps"]').first().fill('8');
await card.locator('.set-check').first().click({ force: true });
await expect(page.locator('#rest-panel')).toBeVisible();
await screenshot('12-native-runner');
await page.locator('main').getByRole('button', { name: 'Pausa', exact: true }).click({ force: true });
await expect(page.locator('main').getByText('Allenamento in pausa', { exact: true })).toBeVisible();
call('shell', 'am', 'force-stop', 'dev.aios.gymhub');
await browser.close().catch(() => {});
call('shell', 'am', 'start', '-n', 'dev.aios.gymhub/.MainActivity');
call('shell', 'input', 'keyevent', 'KEYCODE_WAKEUP');
call('shell', 'wm', 'dismiss-keyguard');
await wait(3500);
({ browser, page } = await connect());
await expect(page.locator('#avvio')).toHaveCount(0, { timeout: 15000 });
await page.locator('main').getByRole('button', { name: 'Riprendi allenamento' }).click({ force: true });
await expect(page.locator('main .set-check.is-done')).toHaveCount(1);
await expect(page.locator('main [data-property="kg"]').first()).toHaveValue('40');
await expect(page.locator('main [data-property="reps"]').first()).toHaveValue('8');
await expect(page.locator('main').getByText('Allenamento in pausa', { exact: true })).toBeVisible();
await page.locator('main').getByRole('button', { name: 'Riprendi', exact: true }).click({ force: true });
await page.locator('main').getByRole('button', { name: 'Concludi allenamento' }).click({ force: true });
await page.getByRole('dialog').getByRole('button', { name: 'Salva allenamento' }).click({ force: true });
await expect(page.locator('main .history-card')).toContainText('320');
console.log('Android: serie 40 kg x 8, pausa, force-stop, ripresa e storico 320 kg verificati.');
await page.locator('.mobile-nav').getByRole('button', { name: 'Altro', exact: true }).click({ force: true });
await page.locator('main').getByRole('button', { name: /Impostazioni e backup/ }).click({ force: true });
await page.locator('main').getByRole('button', { name: 'Esporta backup' }).click({ force: true });
await wait(500);
const cached = call('shell', 'run-as', 'dev.aios.gymhub', 'ls', 'cache');
if (!/gymhub-\d{4}-\d{2}-\d{2}\.json/.test(cached)) throw new Error('Backup Android non generato.');
console.log('Android: file backup generato tramite Filesystem, condivisione invocata.');
call('shell', 'input', 'keyevent', '4');
await screenshot('13-native-settings');
expect(errors).toEqual([]);
await browser.close(); call('forward', '--remove', 'tcp:9227');
console.log('NATIVE SMOKE PASS');
