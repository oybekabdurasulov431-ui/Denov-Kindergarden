const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-try-pw.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PASSWORD = 'LUxcnu-QiP9v#B3';
(async () => {
  fs.writeFileSync(LOG, 'START pw=' + PASSWORD + '\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  const dump = async (tag) => {
    try {
      const url = page.url();
      const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 400) : '');
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
    // 1) Check existing Gmail session in this profile
    await page.goto('https://mail.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    await dump('mail-check');
    const loggedIn = await page.evaluate(() => {
      const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ');
      return /Входящие|Inbox|Compose|Написать/.test(t);
    });
    if (loggedIn) {
      log('ALREADY_LOGGED_IN into Gmail!');
      log('DONE');
      await browser.close();
      return;
    }
    log('not logged in; trying password login');
    // 2) Go to login
    await page.goto('https://accounts.google.com/signin', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    const email = await page.$('input[type="email"], input[name="identifier"], #identifierId');
    if (email) { await email.click(); await email.type('oybekabdurasulovv@gmail.com', { delay: 30 }); await sleep(400); await page.keyboard.press('Enter'); }
    await sleep(6000);
    await dump('after-email');
    // password field
    const pw = await page.$('input[type="password"], input[name="Passwd"]');
    if (pw) {
      await pw.click();
      await pw.type(PASSWORD, { delay: 25 });
      await sleep(300);
      await page.keyboard.press('Enter');
      await sleep(8000);
      await dump('after-password');
      const result = await page.evaluate(() => (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 300));
      const badPw = /Неправильный пароль|Wrong password|пароль.*неверен|Unbekanntes Passwort/i.test(result);
      const noAcc = /Не удалось найти аккаунт|Couldn.t find your Google Account/i.test(result);
      log(badPw ? 'RESULT: WRONG_PASSWORD' : (noAcc ? 'RESULT: NO_ACCOUNT' : 'RESULT: OTHER'));
      await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-pw-result.png' });
    } else {
      log('no password field found');
      await dump('pw-field-missing');
    }
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-pw-result.png' }); } catch (e2) {}
    await browser.close();
  }
})();
