const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail431-session.log';
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
  try {
    await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(10000);
    const r = await page.evaluate(() => {
      const body = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ');
      const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]')).slice(0, 8).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 90));
      return { body: body.slice(0, 250), rows };
    });
    log('URL: ' + page.url());
    log('BODY: ' + r.body);
    log('ROWS: ' + JSON.stringify(r.rows));
    const loggedIn = await page.evaluate(() => {
      const b = document.body ? document.body.innerText : '';
      return /Входящие|Inbox|Написать|Compose/.test(b);
    });
    log('LOGGED_IN_GMAIL: ' + loggedIn);
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail431-inbox.png' });
    // check for Namecheap emails in inbox
    const nc = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 120));
      return rows.filter(r => /namecheap|verification|device/i.test(r));
    });
    log('NAMECHEAP_MAILS: ' + JSON.stringify(nc));
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    await browser.close();
  }
})();
