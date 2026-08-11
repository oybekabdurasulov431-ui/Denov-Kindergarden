const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-check.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://cp.zomro.com/login', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(9000);
  const snap = await page.evaluate(() => {
    const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 1200);
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({ name: i.name, type: i.type, ph: i.placeholder }));
    const hasLogout = /logout|chiqish|exit/i.test(document.body ? document.body.innerText : '');
    return { url: location.href, t, inputs, hasLogout };
  });
  log('URL: ' + snap.url);
  log('HAS_LOGOUT: ' + snap.hasLogout);
  log('TEXT: ' + snap.t);
  log('INPUTS: ' + JSON.stringify(snap.inputs));
  await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-check.png' });
  await page.close().catch(e => {});
  await browser.disconnect();
  process.exit(0);
})();
