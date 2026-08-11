const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-recovery3.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  const dump = async (tag) => {
    try {
      const url = page.url();
      const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 500) : '');
      log(tag + ' | ' + url + ' | ' + t);
    } catch (e) { log(tag + ' err ' + e.message); }
  };
  const clickSubmit = async () => {
    return await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'));
      const visible = btns.filter(b => { const s = getComputedStyle(b); return s.display !== 'none' && s.visibility !== 'hidden' && b.offsetParent !== null; });
      for (const b of visible) {
        const t = (b.textContent || b.value || '').trim();
        if (/Получить код|Get code|Отправить|Send|Continue|Далее|Next|Продолжить|Verify|Подтвердить/i.test(t)) { b.click(); return t; }
      }
      if (visible.length) { const b = visible[visible.length - 1]; b.click(); return 'LAST:' + (b.textContent || b.value || '').trim(); }
      return null;
    });
  };
  try {
    await page.goto('https://accounts.google.com/signin/recovery', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    const email = await page.$('input[type="email"], input[name="identifier"], #identifierId');
    if (email) { await email.click(); await email.type('oybekabdurasulovv@gmail.com', { delay: 30 }); await sleep(400); await page.keyboard.press('Enter'); }
    await sleep(6000);
    for (let n = 0; n < 6; n++) {
      const clicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        for (const b of btns) {
          const t = (b.textContent || '').trim();
          if (t.includes('Другой способ') || t.includes('Try another way')) { b.click(); return t; }
        }
        return null;
      });
      if (!clicked) break;
      log('clicked another-way: ' + clicked);
      await sleep(5000);
    }
    await dump('before-send');
    const sent = await clickSubmit();
    log('sent button: ' + sent);
    await sleep(5000);
    await dump('after-send');
    log('CODE_INPUT_WAIT — SMS kod telefoningizga keldi. Kodni menga yozing. 6 daqiqa kutiladi...');
    for (let i = 0; i < 72; i++) { await sleep(5000); if (i % 24 === 23) await dump('periodic ' + i); }
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-recovery3.png' }); } catch (e2) {}
    await browser.close();
  }
})();
