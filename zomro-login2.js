const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-login2.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://cp.zomro.com/login', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(9000);
  const email = await page.$('input[name="email"]');
  const pass = await page.$('input[name="password"]');
  if (email && pass) {
    await email.click();
    await email.type('oybekabdurasulov431@gmail.com', { delay: 15 });
    await pass.click();
    await pass.type('Mm977853808m$', { delay: 15 });
    await sleep(500);
    // click LOG IN button
    const sub = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      for (const b of btns) { const t = (b.textContent || b.value || '').trim(); if (/^LOG IN$/i.test(t) || /log in/i.test(t)) { b.click(); return t; } }
      return null;
    });
    log('LOGIN_CLICKED: ' + sub);
    await sleep(12000);
    const snap = await page.evaluate(() => {
      const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 1200);
      return { url: location.href, t };
    });
    log('URL_AFTER: ' + snap.url);
    log('TEXT_AFTER: ' + snap.t);
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-login2.png' });
  } else {
    log('NO LOGIN FIELDS');
  }
  await page.close().catch(e => {});
  await browser.disconnect();
  process.exit(0);
})();
