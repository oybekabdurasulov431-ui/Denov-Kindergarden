const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-read-reply.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(9000);
  // click the thread containing Namecheap
  const clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
    for (const r of rows) {
      const t = r.innerText;
      if (/namecheap/i.test(t) && /account access/i.test(t)) { r.click(); return t.replace(/\s+/g, ' ').slice(0, 120); }
    }
    return null;
  });
  log('CLICKED: ' + clicked);
  await sleep(7000);
  const body = await page.evaluate(() => {
    const msg = document.querySelector('.nH.if, div[role="main"]');
    const t = (msg ? msg.innerText : document.body.innerText).replace(/\s+/g, ' ').slice(0, 3500);
    return t;
  });
  log('EMAIL_BODY: ' + body);
  await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-reply-body.png' });
  log('DONE');
})();
