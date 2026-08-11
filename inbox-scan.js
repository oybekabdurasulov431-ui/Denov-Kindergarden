const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\inbox-scan.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'load', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(10000);
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tr[jsaction*="t"]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 150)).slice(0, 10);
  });
  log('INBOX_TOP: ' + JSON.stringify(rows, null, 1));
  log('DONE');
})();
