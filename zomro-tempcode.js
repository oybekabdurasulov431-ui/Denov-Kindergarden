const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-tempcode.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START2\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://cp.zomro.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => log('nav err: ' + e.message));
  await sleep(8000);
  const inspect = await page.evaluate(() => {
    const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ');
    const els = Array.from(document.querySelectorAll('a, button, input, label'));
    const found = [];
    for (const e of els) {
      const txt = (e.textContent || e.value || e.getAttribute('name') || '').trim();
      if (/temp|temporary|one-time|6-digit|code/i.test(txt) && txt.length < 60) {
        const r = e.getBoundingClientRect();
        found.push({ tag: e.tagName, name: e.getAttribute('name'), text: txt.slice(0, 50), visible: r.width > 0 && r.height > 0 });
      }
    }
    return { t, found: found.slice(0, 20) };
  });
  log('PAGE_TEXT: ' + inspect.t.slice(0, 500));
  log('ELS: ' + JSON.stringify(inspect.found));
  // Click on "TEMPORARY CODE" text/link
  const clicked = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('a, button, div, span, label, b, strong'));
    for (const e of nodes) {
      const t = (e.textContent || '').trim();
      if (/^temporary code$/i.test(t) || /^temporary$/i.test(t)) {
        const r = e.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) { e.click(); return t + ' @' + e.tagName; }
      }
    }
    // try words containing temporary
    for (const e of nodes) {
      const t = (e.textContent || '').trim();
      if (/temporary/i.test(t) && t.length < 30) {
        const r = e.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) { e.click(); return t + ' @' + e.tagName; }
      }
    }
    return null;
  });
  log('CLICKED_TEMP: ' + clicked);
  await sleep(7000);
  const after = await page.evaluate(() => {
    const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 700);
    const url = location.href;
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({ name: i.name, type: i.type, ph: i.placeholder }));
    return { url, t, inputs };
  });
  log('AFTER_URL: ' + after.url);
  log('AFTER_TEXT: ' + after.t);
  log('AFTER_INPUTS: ' + JSON.stringify(after.inputs));
  await page.close().catch(e => {});
  await browser.disconnect();
  process.exit(0);
})();
