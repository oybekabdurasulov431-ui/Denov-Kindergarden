const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-addfunds.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  await page.goto('https://mail.google.com/mail/u/0/#search/service+suspension', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(8000);
  const clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
    for (const r of rows) {
      if (/suspension/i.test(r.innerText)) { r.click(); return 'ok'; }
    }
    return null;
  });
  await sleep(7000);
  const links = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a[href]').forEach(a => {
      const h = a.href; const t = (a.textContent || '').trim();
      if (h && !h.startsWith('javascript')) {
        out.push({ t: t.slice(0, 40), h: h.slice(0, 180) });
      }
    });
    return out;
  });
  log('ALL_LINKS: ' + JSON.stringify(links, null, 1));
  log('DONE');
})();
