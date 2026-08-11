const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-emails.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  // search inbox for zomro
  const q = 'zomro';
  await page.goto('https://mail.google.com/mail/u/0/#search/' + q, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(9000);
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tr[jsaction*="t"]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 130)).slice(0, 8);
  });
  log('ZOMRO_ROWS: ' + JSON.stringify(rows));
  // open the "Insufficient funds" email
  const clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
    for (const r of rows) {
      if (/insufficient/i.test(r.innerText)) { r.click(); return r.innerText.replace(/\s+/g, ' ').slice(0, 120); }
    }
    return null;
  });
  log('CLICKED: ' + clicked);
  await sleep(7000);
  const body = await page.evaluate(() => {
    const msg = document.querySelector('div[role="main"]');
    const t = (msg ? msg.innerText : '').replace(/\s+/g, ' ').slice(0, 2500);
    return t;
  });
  log('ZOMRO_EMAIL: ' + body);
  log('DONE');
})();
