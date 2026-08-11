const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-widget2.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  const r = await page.evaluate(() => {
    const zsiq = document.querySelectorAll('[id*="zsiq"], [class*="zsiq"], [class*="salesIQ"], [class*="SalesIQ"]').length;
    const scripts = Array.from(document.scripts).map(s => s.src).filter(s => /zoho|zsiq|sales/i.test(s));
    const anyIframe = Array.from(document.querySelectorAll('iframe')).map(f => ({ src: f.src, id: f.id, cls: f.className }));
    return { zsiq, scripts, anyIframe };
  });
  log(JSON.stringify(r, null, 1));
  log('DONE');
})();
