const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\duck-add.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://www.duckdns.org/captcha', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(8000);
  const fill = await page.evaluate(() => {
    const inp = document.querySelector('input[name="addDomain"]');
    if (!inp) return 'NO_INPUT';
    inp.focus();
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(inp, 'oybek-kindergarten');
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    return 'FILLED';
  });
  log('FILL: ' + fill);
  await sleep(1500);
  const clicked = await page.evaluate(() => {
    const btn = document.querySelector('input[name="Add Domain"], button[name="Add Domain"], input[value="Add Domain"]');
    if (btn) { btn.click(); return btn.name || btn.value; }
    // fallback: any button with text Add Domain
    const b2 = Array.from(document.querySelectorAll('button, input')).find(x => (x.value || x.textContent || '').trim().toLowerCase() === 'add domain');
    if (b2) { b2.click(); return b2.value || 'fallback'; }
    return 'NO_BTN';
  });
  log('ADD_CLICKED: ' + clicked);
  await sleep(12000);
  const snap = await page.evaluate(() => {
    const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 800);
    return { url: location.href, t };
  });
  log('URL: ' + snap.url);
  log('TEXT: ' + snap.t);
  await browser.disconnect();
  process.exit(0);
})();
