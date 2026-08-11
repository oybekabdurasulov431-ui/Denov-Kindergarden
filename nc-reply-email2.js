const puppeteer = require('puppeteer-core');
const fs = require('fs');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-reply-email2.log';
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BODY = `Hello,

Thank you for your response. The email address currently associated with my Namecheap account is:

oybekabdurasulovv@gmail.com

I no longer have access to this mailbox, which is why I cannot receive the Trusted Device Verification code when logging in. Please disable the additional verification for my account (username: oybek2011) for 24 hours so I can log in and update the account email address.

My contact email for this ticket is: oybekabdurasulov431@gmail.com

Thank you for your help.`;
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(8000);
  const clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
    for (const r of rows) { const t = r.innerText; if (/namecheap/i.test(t) && /account access/i.test(t)) { r.click(); return t.replace(/\s+/g, ' ').slice(0, 100); } }
    return null;
  });
  log('OPENED: ' + clicked);
  await sleep(7000);
  // click Reply button
  const rep = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"], span[role="button"], button'));
    for (const b of btns) {
      const t = (b.getAttribute('aria-label') || b.textContent || '').trim();
      if (t === 'Reply' || /^Reply$/.test(t)) { b.click(); return t; }
    }
    return null;
  });
  log('REPLY_BTN: ' + rep);
  await sleep(4000);
  // type into reply compose box
  const typed = await page.evaluate((txt) => {
    const editors = Array.from(document.querySelectorAll('div[contenteditable="true"]'));
    const el = editors[editors.length - 1];
    if (!el) return 'NO_EDITOR';
    el.focus();
    document.execCommand('insertText', false, txt);
    return 'TYPED ' + el.innerText.length;
  }, BODY);
  log('TYPED: ' + typed);
  await sleep(2000);
  const snap = await page.evaluate(() => {
    const eds = Array.from(document.querySelectorAll('div[contenteditable="true"]'));
    return eds.map(e => e.innerText.slice(0, 40));
  });
  log('SNAP: ' + JSON.stringify(snap));
  const sent = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
    for (const b of btns) {
      const t = (b.getAttribute('aria-label') || b.textContent || '').trim();
      if (t === 'Send') { b.click(); return t; }
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
