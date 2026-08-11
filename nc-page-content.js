const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-page-content.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  const r = await page.evaluate(() => {
    const body = document.body ? document.body.innerText.replace(/\s+/g, ' ') : '';
    const buttons = Array.from(document.querySelectorAll('button,a')).map(e => (e.textContent||'').trim()).filter(t => t && t.length < 60);
    return { body: body.slice(0, 900), buttons: Array.from(new Set(buttons)).slice(0, 60) };
  });
  log('BODY: ' + r.body);
  log('BUTTONS: ' + JSON.stringify(r.buttons));
  log('DONE');
})();
