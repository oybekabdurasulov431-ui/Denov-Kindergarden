const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-login3.log';
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
    await email.click(); await email.type('oybekabdurasulov431@gmail.com', { delay: 15 });
    await pass.click(); await pass.type('Mm977853808m$', { delay: 15 });
    log('FILLED');
  }
  // click recaptcha checkbox inside anchor frame
  let cbClicked = false;
  for (const f of page.frames()) {
    if (/recaptcha\/enterprise\/anchor/.test(f.url())) {
      try {
        await f.waitForSelector('.recaptcha-checkbox-border, [role="checkbox"]', { timeout: 10000 });
        const h = await f.$('.recaptcha-checkbox-border, [role="checkbox"]');
        const box = await h.boundingBox();
        log('CB_BOX: ' + JSON.stringify(box));
        if (box) { await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); cbClicked = true; log('CB_CLICKED'); }
      } catch (e) { log('cb err: ' + e.message); }
    }
  }
  if (!cbClicked) log('CB_NOT_CLICKED');
  await sleep(5000);
  // check if recaptcha solved
  const solved = await page.evaluate(() => {
    const ta = document.querySelector('#g-recaptcha-response');
    return ta ? ta.value.length : 0;
  });
  log('RECAPTCHA_TOKEN_LEN: ' + solved);
  // click LOG IN
  const sub = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
    for (const b of btns) { const t = (b.textContent || b.value || '').trim(); if (/log in/i.test(t)) { b.click(); return t; } }
    return null;
  });
  log('LOGIN_CLICKED: ' + sub);
  await sleep(12000);
  const snap = await page.evaluate(() => {
    const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 1500);
    return { url: location.href, t };
  });
  log('URL_AFTER: ' + snap.url);
  log('TEXT_AFTER: ' + snap.t);
  await browser.disconnect();
  process.exit(0);
})();
