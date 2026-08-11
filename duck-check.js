const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\duck-check.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START3\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://www.duckdns.org/index.jsp', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(6000);
  const snap = await page.evaluate(() => {
    const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 600);
    const btns = Array.from(document.querySelectorAll('a, button, input[type="submit"], img')).map(b => {
      const txt = (b.textContent || b.alt || b.value || b.getAttribute('href') || '').trim();
      const r = b.getBoundingClientRect();
      return txt.slice(0, 40) + (r.width > 0 ? '' : '(hidden)');
    }).filter(x => /sign|log|login|register|google|github|reddit|twitter/i.test(x)).slice(0, 15);
    return { t, btns };
  });
  log('TEXT: ' + snap.t);
  log('BTNS: ' + JSON.stringify(snap.btns));
  await page.close().catch(e => {});
  await browser.disconnect();
  process.exit(0);
})();
