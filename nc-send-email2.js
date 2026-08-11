const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-send-email2.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TO = 'accountaccess@namecheap.com';
const SUBJECT = 'Account access issue - cannot access account email (username: oybek2011)';
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  // inspect compose fields first
  const fields = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('input, textarea, div[contenteditable="true"]'));
    return all.map(e => ({
      tag: e.tagName, name: e.name || '', ar: (e.getAttribute('aria-label') || '').slice(0, 30), ph: e.placeholder || '', val: (e.value || '').slice(0, 20), text: (e.innerText || '').slice(0, 20)
    })).filter(f => f.name || f.ar || f.ph || f.text);
  });
  log('FIELDS: ' + JSON.stringify(fields, null, 1));
  // fill To using input[name=to]
  const toDone = await page.evaluate((to) => {
    const el = document.querySelector('input[name="to"]');
    if (el) {
      el.focus();
      el.value = '';
      return 'found-to';
    }
    return 'no-to-input';
  }, TO);
  log('TO: ' + toDone);
  await sleep(500);
  await page.keyboard.type(TO, { delay: 20 });
  await sleep(2000);
  await page.keyboard.press('Enter');
  await sleep(2000);
  // subject
  const subjDone = await page.evaluate((s) => {
    const el = document.querySelector('input[name="subjectbox"]');
    if (el) {
      el.focus();
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, s);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return 'subject-set';
    }
    return 'no-subjectbox';
  }, SUBJECT);
  log('SUBJ: ' + subjDone);
  await sleep(1500);
  const snapshot = await page.evaluate(() => {
    const to = document.querySelector('input[name="to"]') ? document.querySelector('input[name="to"]').value : 'NO';
    const subj = document.querySelector('input[name="subjectbox"]') ? document.querySelector('input[name="subjectbox"]').value : 'NO';
    const body = Array.from(document.querySelectorAll('div[contenteditable="true"]')).map(e => e.innerText).filter(t => t.length > 3)[0] || '';
    return { to, subj, bodyLen: body.length, bodyHead: body.slice(0, 60) };
  });
  log('SNAPSHOT: ' + JSON.stringify(snapshot));
  await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-email-draft2.png' });
  // send
  const sent = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
    for (const b of btns) {
      const t = (b.getAttribute('aria-label') || b.textContent || '').trim();
      if (/^Send|^Отправить/.test(t)) { b.click(); return t; }
    }
    return null;
  });
  log('SEND: ' + sent);
  await sleep(8000);
  const after = await page.evaluate(() => {
    const d = document.body ? document.body.innerText : '';
    const sentFlash = /Сообщение отправлено|Message sent|Отправлено/.test(d);
    return { sentFlash, head: d.replace(/\s+/g, ' ').slice(0, 120) };
  });
  log('AFTER: ' + JSON.stringify(after));
  log('DONE');
})();
