const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-recovery4.log';
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
      log('clicked: ' + clicked);
      await sleep(5000);
    }
    await dump('phone-challenge');
    log("TELEFONGA QARANG — Google bildirishnomasi keldi: 'Да'/Ha ni bosing, so'ng telefonda ko'rsatilgan raqamni tanlang. 8 daqiqa kutiladi...");
    let done = false;
    for (let i = 0; i < 96; i++) {
      await sleep(5000);
      const url = page.url();
      const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ') : '').catch(() => '');
      if (url.includes('signin/recovery') === false && (t.includes('Новый пароль') || t.includes('new password') || t.includes('Create a password') || t.includes('Создайте пароль') || t.includes('choose a password'))) {
        log("PASSWORD STEP — telefon tasdiqlandi! Yangi parol o'rnatish sahifasida.");
        done = true; break;
      }
      if (i % 12 === 11) await dump('periodic ' + i);
    }
    if (!done) await dump('final-not-done');
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-recovery4.png' }); } catch (e2) {}
    await browser.close();
  }
})();
