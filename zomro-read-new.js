const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-read-new.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  let page = pages.find(p => /mail\.google/.test(p.url()));
  if (!page) { page = await browser.newPage(); }
  await page.bringToFront();
  await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(9000);
  const clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
    for (const r of rows) { if (/1612897|Authenticator/i.test(r.innerText) && /ticket/i.test(r.innerText)) { r.click(); return r.innerText.replace(/\s+/g, ' ').slice(0, 120); } }
    return null;
  });
  log('OPENED: ' + clicked);
  await sleep(8000);
  const body = await page.evaluate(() => {
    const msg = document.querySelector('.nH.if, div[role="main"]');
    return (msg ? msg.innerText : document.body.innerText).replace(/\s+/g, ' ');
  });
  log('THREAD: ' + body.slice(0, 4000));
  await browser.disconnect();
  process.exit(0);
})();
