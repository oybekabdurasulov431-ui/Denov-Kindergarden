const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\direct-check2.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1', '--remote-debugging-port=9223']
  });
  log('launched');
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'load', timeout: 60000 }).catch(e => log('nav err: ' + e.message));
  await sleep(12000);
  log('URL: ' + page.url());
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tr[jsaction*="t"]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 170)).slice(0, 18);
  });
  log('INBOX: ' + JSON.stringify(rows, null, 1));
  log('DONE');
  // keep alive
  for (let i = 0; i < 120; i++) await sleep(30000);
  await browser.close();
})();
