const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-chat-click.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  // click the "Contact us" dropdown toggle then "Live Chat"
  const clicked = await page.evaluate(() => {
    const toggles = Array.from(document.querySelectorAll('.gb-dropdown__toggle, button, a'));
    let res = [];
    for (const t of toggles) {
      const tx = (t.textContent || '').trim();
      if (tx === 'Contact us') { t.click(); res.push('opened dropdown'); break; }
    }
    return res;
  });
  log('step1: ' + JSON.stringify(clicked));
  await sleep(2000);
  const clicked2 = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('a, button'));
    for (const i of items) {
      const tx = (i.textContent || '').trim();
      if (tx === 'Live Chat') { i.click(); return 'clicked Live Chat -> ' + i.href; }
    }
    return null;
  });
  log('step2: ' + clicked2);
  await sleep(8000);
  log('url now: ' + page.url());
  const r = await page.evaluate(() => {
    const zsiq = document.querySelectorAll('[id*="zsiq"], [class*="zsiq"], [class*="salesIQ"], [class*="SalesIQ"]').length;
    const ifr = Array.from(document.querySelectorAll('iframe')).map(f => ({ src: f.src, id: f.id }));
    const scripts = Array.from(document.scripts).map(s => s.src).filter(s => /zoho|zsiq|sales/i.test(s));
    return { zsiq, ifr, scripts };
  });
  log('WIDGET: ' + JSON.stringify(r, null, 1));
  log('DONE');
})();
