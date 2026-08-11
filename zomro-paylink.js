const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-paylink.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://mail.google.com/mail/u/0/#search/zomro+invoice', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(9000);
  const clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
    for (const r of rows) {
      if (/invoice/i.test(r.innerText)) { r.click(); return r.innerText.replace(/\s+/g, ' ').slice(0, 130); }
    }
    return null;
  });
  log('OPENED: ' + clicked);
  await sleep(8000);
  const links = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a[href]').forEach(a => {
      const h = a.href;
      const t = (a.textContent || '').trim();
      if (h && !h.startsWith('javascript') && /pay|invoice|zomro|link|billing|stripe|payment/i.test(h + ' ' + t)) {
        out.push({ t: t.slice(0, 60), h: h.slice(0, 160) });
      }
    });
    return out;
  });
  log('PAY_LINKS: ' + JSON.stringify(links, null, 1));
  log('DONE');
})();
