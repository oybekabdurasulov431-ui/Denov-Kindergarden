const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\duck-reg.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://www.duckdns.org', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(8000);
  const snap = await page.evaluate(() => {
    const forms = Array.from(document.querySelectorAll('form')).map(f => ({ id: f.id, action: f.action, fields: Array.from(f.querySelectorAll('input, button, textarea')).map(i => ({ name: i.name, id: i.id, type: i.type, ph: i.placeholder })) }));
    const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 500);
    return { forms, t };
  });
  log('FORMS: ' + JSON.stringify(snap.forms));
  log('TEXT: ' + snap.t);
  await page.close().catch(e => {});
  await browser.disconnect();
  process.exit(0);
})();
