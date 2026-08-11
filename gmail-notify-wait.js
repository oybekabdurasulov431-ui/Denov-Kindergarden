const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-notify-wait.log';
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
  const clickText = async (txt) => {
    return await page.evaluate((txt) => {
      const btns = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      for (const b of btns) {
        const t = (b.textContent || '').trim();
        if (t.includes(txt)) { b.click(); return t; }
      }
      return null;
    }, txt);
  };
  try {
    await page.goto('https://accounts.google.com/signin/recovery', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    const email = await page.$('input[type="email"], input[name="identifier"], #identifierId');
    if (email) { await email.click(); await email.type('oybekabdurasulovv@gmail.com', { delay: 30 }); await sleep(400); await page.keyboard.press('Enter'); }
    await sleep(6000);
    for (let n = 0; n < 6; n++) {
      const c = await clickText('Другой способ');
      if (!c) break;
      await sleep(5000);
    }
    await dump('device-page');
    const codeMatch = await page.evaluate(() => {
      const t = (document.body ? document.body.innerText : '');
      const m = t.match(/(?:код|кода|code)\s+(\d{2})/i);
      return m ? m[1] : null;
    });
    log('PHONE_NUMBER_TO_TAP: ' + codeMatch);
    const r = await clickText('Отправить ещё раз');
    log('resend clicked: ' + r);
    await sleep(4000);
    await dump('fresh-notify');
    log('NOTIFY_SENT — USER SHOULD TAP YES ON PHONE NOW');
    // keep browser open; poll for page change (user taps)
    for (let i = 0; i < 60; i++) {
      await sleep(10000);
      const url = page.url();
      const t = await page.evaluate(() => (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 300)).catch(() => '');
      log('poll' + i + ' | ' + url + ' | ' + t);
      if (/Новый пароль|новый пароль|Create a password|Создайте пароль|Выберите пароль|New password/i.test(t)) {
        log('PASSWORD_STAGE_REACHED');
        await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-password-stage.png' });
        break;
      }
    }
    log('DONE-WAITING');
  } catch (e) {
    log('ERROR: ' + e.message);
  }
})();
