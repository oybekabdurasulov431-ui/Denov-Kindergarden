const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\duck-login.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START5\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://www.duckdns.org/login?generateRequest=google', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(10000);
  // consent or account chooser
  let url = await page.evaluate(() => location.href);
  log('URL1: ' + url.slice(0, 80));
  if (/accountchooser/.test(url)) {
    await page.evaluate(() => { const h = document.querySelector('[data-identifier]'); if (h) h.click(); }).catch(e => {});
    await sleep(9000);
    url = await page.evaluate(() => location.href);
    log('URL2: ' + url.slice(0, 80));
  }
  // click "Davom etish" / "Continue" on consent
  for (let i = 0; i < 5; i++) {
    const done = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, span[role="button"], div[role="button"], input[type="submit"]'));
      let best = null;
      for (const e of all) {
        const t = (e.textContent || e.value || '').replace(/\s+/g, ' ').trim();
        const r = e.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (/^Davom etish$/i.test(t) || /^Continue$/i.test(t) || /^Allow$/i.test(t)) { best = e; break; }
        if (/Davom etish/i.test(t) && !best) best = e;
      }
      if (best) { best.click(); return best.textContent.trim(); }
      return null;
    });
    if (done) { log('CONSENT_CLICKED: ' + done); break; }
    await sleep(2500);
  }
  await sleep(9000);
  const final = await page.evaluate(() => ({ url: location.href, t: (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 500) }));
  log('URL_FINAL: ' + final.url.slice(0, 100));
  log('TEXT_FINAL: ' + final.t);
  await browser.disconnect();
  process.exit(0);
})();
