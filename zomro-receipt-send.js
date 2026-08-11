const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-receipt-send.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TO = 'support@zomro.com';
const SUBJECT = '[Ticket: 1612897] Lost access to Google Authenticator - request to disable 2FA (account: oybekabdurasulov431@gmail.com)';
const BODY = `Dear ZOMRO Support (Jason S.),

Thank you for your reply. Here is the proof of payment you requested to verify that I am the account owner.

My account login: oybekabdurasulov431@gmail.com
Account holder: Oybek Abdurasulov

Recent payment details (I received the official "Payment credited" email from ZOMRO):
- Payment amount: 2.83 EUR
- Invoice number: pfx/2942223
- Date: 05 Aug 2026
- Service: VPS Platinum Intel | NL-3 v.2 #6917489
- Current account balance after payment: 2.83 EUR

The payment was made from my bank card to ZOMRO. My IP address and the email address on the account confirm my identity.

Please disable or reset the two-factor authentication on my account so I can log in, add funds and pay the remaining invoice. I need access urgently to avoid further downtime.

Thank you.
Best regards,
Oybek Abdurasulov
oybekabdurasulov431@gmail.com`;
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  log('connected');
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  const url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(TO) +
    '&su=' + encodeURIComponent(SUBJECT) + '&body=' + encodeURIComponent(BODY);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('goto err: ' + e.message));
  await sleep(15000);
  const snap = await page.evaluate(() => {
    const to = document.querySelector('input[aria-label="To recipients"], input[aria-label="Кому"]');
    const subj = document.querySelector('input[name="subjectbox"]');
    const body = Array.from(document.querySelectorAll('div[contenteditable="true"]')).map(e => e.innerText).filter(t => t.length > 3)[0] || '';
    return { to: to ? to.value : 'NO', subj: subj ? subj.value : 'NO', bodyLen: body.length };
  }).catch(e => ({ err: e.message }));
  log('SNAP1: ' + JSON.stringify(snap));
  const sent = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
    for (const b of btns) {
      const t = (b.getAttribute('aria-label') || b.textContent || '').trim();
      if (/^Send/.test(t)) { b.click(); return t; }
    }
    return null;
  });
  log('SEND: ' + sent);
  await sleep(9000);
  const after = await page.evaluate(() => {
    const d = document.body ? document.body.innerText : '';
    return { sent: /Message sent|Сообщение отправлено/.test(d) };
  }).catch(e => ({ err: e.message }));
  log('AFTER: ' + JSON.stringify(after));
  log('RECEIPT_SENT');
})();
