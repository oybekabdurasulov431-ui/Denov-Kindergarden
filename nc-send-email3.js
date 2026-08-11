const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-send-email3.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TO = 'accountaccess@namecheap.com';
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  // locate To field
  const toInfo = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('input[aria-label*="To"], input[aria-label*="Кому"], input[role="combobox"]'));
    return els.map(e => ({ ar: e.getAttribute('aria-label'), val: e.value }));
  });
  log('TO_CANDIDATES: ' + JSON.stringify(toInfo));
  // clear and set To
  const done = await page.evaluate((to) => {
    const el = document.querySelector('input[aria-label="To recipients"], input[aria-label="Кому"], input[role="combobox"]');
    if (!el) return 'not-found';
    el.focus();
    // select all text
    el.select ? el.select() : null;
    return 'focused-val=' + el.value;
  }, TO);
  log('CLEAR_STEP: ' + done);
  await sleep(500);
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await sleep(300);
  await page.keyboard.press('Backspace');
  await sleep(500);
  await page.keyboard.type(TO, { delay: 20 });
  await sleep(2000);
  await page.keyboard.press('Enter');
  await sleep(2500);
  const check = await page.evaluate(() => {
    const el = document.querySelector('input[aria-label="To recipients"], input[aria-label="Кому"], input[role="combobox"]');
    return { val: el ? el.value : 'NO', chips: Array.from(document.querySelectorAll('[role="option"] span, .vR')).map(s => s.innerText).filter(Boolean).slice(0, 5) };
  });
  log('TO_CHECK: ' + JSON.stringify(check));
  await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-email-draft3.png' });
  // send
  const sent = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
    for (const b of btns) {
      const t = (b.getAttribute('aria-label') || b.textContent || '').trim();
      if (/^Send/.test(t)) { b.click(); return t; }
    }
    return null;
  });
  log('SEND: ' + sent);
  await sleep(8000);
  const after = await page.evaluate(() => {
    const d = document.body ? document.body.innerText : '';
    return { sent: /Message sent|Сообщение отправлено|Отправлено/.test(d), head: d.replace(/\s+/g, ' ').slice(0, 150) };
  });
  log('AFTER: ' + JSON.stringify(after));
  log('DONE');
})();
