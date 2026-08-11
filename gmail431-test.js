const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail431-test.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TEST_EMAIL = 'oybekabdurasulov431@gmail.com';
const TEST_PASS = 'Mm977853808m$';
(async () => {
  fs.writeFileSync(LOG, 'START test ' + TEST_EMAIL + '\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  const dump = async (tag) => {
    try {
      const t = await page.evaluate(() => (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 300));
      log(tag + ' | ' + page.url().slice(0, 120) + ' | ' + t);
    } catch (e) { log(tag + ' err ' + e.message); }
  };
  try {
    await page.goto('https://accounts.google.com/signin', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    const email = await page.$('input[type="email"], input[name="identifier"], #identifierId');
    if (email) { await email.click(); await email.type(TEST_EMAIL, { delay: 30 }); await sleep(400); await page.keyboard.press('Enter'); }
    await sleep(6000);
    await dump('after-email');
    const pw = await page.$('input[type="password"], input[name="Passwd"]');
    if (pw) {
      await pw.click();
      await pw.type(TEST_PASS, { delay: 25 });
      await sleep(300);
      await page.keyboard.press('Enter');
      await sleep(8000);
      const result = await page.evaluate(() => (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 400));
      log('FINAL: ' + result);
      await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail431.png' });
      const isInbox = await page.evaluate(() => !!(document.querySelector('a[href*="mail.google.com/mail/"]') && document.body.innerText.match(/Входящие|Inbox|Compose|Написать/)));
      log('INBOX_REACHED: ' + isInbox);
    } else {
      log('no password field');
      await dump('pw-missing');
    }
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    await browser.close();
  }
})();
