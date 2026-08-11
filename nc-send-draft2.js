const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-send-draft2.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  await page.goto('https://mail.google.com/mail/u/0/#drafts', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(8000);
  const opened = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
    for (const r of rows) { if (/namecheap/i.test(r.innerText) && /response/i.test(r.innerText)) { r.click(); return r.innerText.replace(/\s+/g,' ').slice(0,80); } }
    return null;
  });
  log('OPENED: ' + opened);
  await sleep(6000);
  // click send via multiple selector strategies
  const snap = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"], button, [role="link"]'));
    const found = [];
    for (const b of btns) {
      const t = (b.getAttribute('aria-label') || b.textContent || '').trim();
      if (/send/i.test(t)) found.push(t.slice(0, 30));
    }
    return found.slice(0, 10);
  });
  log('SEND_BUTTONS: ' + JSON.stringify(snap));
  // try focusing compose and pressing Ctrl+Enter
  const pressed = await page.evaluate(() => {
    const eds = Array.from(document.querySelectorAll('div[contenteditable="true"]'));
    if (!eds.length) return 'NO_EDITOR';
    const el = eds[eds.length - 1];
    el.focus();
    el.click();
    return 'FOCUSED';
  });
  log('PRESS: ' + pressed);
  await sleep(1500);
  await page.keyboard.press('Control+Enter');
  await sleep(9000);
  const after = await page.evaluate(() => (document.body ? document.body.innerText.replace(/\s+/g, ' ') : ''));
  log('AFTER: ' + (/Message sent|Сообщение отправлено/.test(after) ? 'SENT_OK' : after.slice(0, 250)));
  const still = await page.evaluate(() => Array.from(document.querySelectorAll('tr[jsaction*="t"]')).some(tr => /namecheap/i.test(tr.innerText) && /response/i.test(tr.innerText)));
  log('DRAFT_STILL_THERE: ' + still);
  await browser.disconnect();
  process.exit(0);
})();
