const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-login.log';
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
      const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 400) : '');
      log(tag + ' | ' + url + ' | ' + t);
    } catch (e) { log(tag + ' err ' + e.message); }
  };
  try {
    await page.goto('https://accounts.google.com/AccountChooser?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    await dump('signin');
    const email = await page.$('input[type="email"], input[name="identifier"], #identifierId');
    if (email) {
      await email.click();
      await email.type('oybekabdurasulovv@gmail.com', { delay: 30 });
      await sleep(500);
      await page.keyboard.press('Enter');
      log('email entered');
      await sleep(6000);
      await dump('after-email');
      const pass = await page.$('input[type="password"]');
      if (pass) {
        await pass.click();
        await pass.type('Mm977853808m$', { delay: 30 });
        await sleep(400);
        await page.keyboard.press('Enter');
        log('password entered');
        for (let i = 0; i < 24; i++) {
          await sleep(5000);
          const u = page.url();
          const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 300) : '').catch(() => '');
          log('poll ' + i + ' url=' + u + ' | ' + t);
          if (t.includes('verification') || t.includes('phone') || t.includes('confirm') || t.includes('New device')) { log('2FA kerak'); break; }
          if (u.includes('mail.google.com') || t.includes('Inbox')) { log('GMAIL ICHIDA'); break; }
        }
      } else log('password field topilmadi');
    } else log('email field topilmadi');
    await dump('final');
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-login.png' });
    await browser.close();
    log('DONE');
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-login.png' }); } catch (e2) {}
    await browser.close();
  }
})();
