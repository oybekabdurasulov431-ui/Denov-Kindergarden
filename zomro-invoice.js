const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-invoice.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://mail.google.com/mail/u/0/#search/zomro', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(9000);
  const clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
    for (const r of rows) {
      if (/invoice/i.test(r.innerText)) { r.click(); return r.innerText.replace(/\s+/g, ' ').slice(0, 140); }
    }
    return null;
  });
  log('OPENED: ' + clicked);
  await sleep(8000);
  const body = await page.evaluate(() => {
    const msg = document.querySelector('div[role="main"]');
    return (msg ? msg.innerText : '').replace(/\s+/g, ' ').slice(0, 3000);
  });
  log('INVOICE_EMAIL: ' + body);
  log('DONE');
})();
