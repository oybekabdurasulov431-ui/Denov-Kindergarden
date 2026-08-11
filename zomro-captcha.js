const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-captcha.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://cp.zomro.com/login', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(9000);
  const frames = page.frames().map(f => f.url()).filter(u => u && !u.startsWith('about:'));
  log('FRAMES: ' + JSON.stringify(frames));
  const snap = await page.evaluate(() => {
    const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 800);
    const els = Array.from(document.querySelectorAll('iframe, input[type="checkbox"], div[role="checkbox"], .recaptcha-checkbox-border, [class*="captcha"], [id*="captcha"], [class*="h-captcha"]')).map(e => ({ tag: e.tagName, id: e.id, cls: (e.className || '').toString().slice(0, 50), src: (e.src || '').slice(0, 60) }));
    return { t, els };
  });
  log('TEXT: ' + snap.t);
  log('CAPTCHA_ELS: ' + JSON.stringify(snap.els));
  await page.close().catch(e => {});
  await browser.disconnect();
  process.exit(0);
})();
