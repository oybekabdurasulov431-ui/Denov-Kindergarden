const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-send-draft.log';
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
  const list = await page.evaluate(() => Array.from(document.querySelectorAll('tr[jsaction*="t"]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 120)));
  log('DRAFTS: ' + JSON.stringify(list));
  const opened = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
    for (const r of rows) { if (/namecheap/i.test(r.innerText) && /account/i.test(r.innerText)) { r.click(); return true; } }
    return false;
  });
  log('OPENED_DRAFT: ' + opened);
  await sleep(6000);
  const bodySnap = await page.evaluate(() => {
    const eds = Array.from(document.querySelectorAll('div[contenteditable="true"]'));
    return eds.map(e => e.innerText.slice(0, 60));
  });
  log('EDITOR: ' + JSON.stringify(bodySnap));
  const sent = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
    for (const b of btns) {
      const t = (b.getAttribute('aria-label') || b.textContent || '').trim();
      if (t === 'Send' || /^Send$/.test(t)) { b.click(); return t; }
    }
    return null;
  });
  log('SEND: ' + sent);
  await sleep(8000);
  const after = await page.evaluate(() => (document.body ? document.body.innerText.replace(/\s+/g, ' ') : ''));
  log('AFTER: ' + (/Message sent|Сообщение отправлено/.test(after) ? 'SENT_OK' : after.slice(0, 200)));
  await browser.disconnect();
  process.exit(0);
})();
