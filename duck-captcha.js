const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\duck-captcha.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START2\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://www.duckdns.org', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(8000);
  const clicked = await page.evaluate(() => {
    const f = document.querySelector('form#captcha-form, form[action*="captcha"]');
    if (!f) return 'NO_FORM';
    const btn = f.querySelector('input[type="submit"], button');
    if (!btn) return 'NO_BTN';
    btn.click();
    return 'CLICKED';
  });
  log('CAPTCHA_SUBMIT: ' + clicked);
  await sleep(12000);
  const snap = await page.evaluate(() => {
    const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 700);
    const forms = Array.from(document.querySelectorAll('form')).map(f => ({ id: f.id, action: f.action, fields: Array.from(f.querySelectorAll('input, button, select, textarea')).map(i => ({ name: i.name, type: i.type, ph: i.placeholder })) }));
    return { url: location.href, t, forms };
  });
  log('URL: ' + snap.url);
  log('TEXT: ' + snap.t);
  log('FORMS: ' + JSON.stringify(snap.forms));
  await browser.disconnect();
  process.exit(0);
})();
