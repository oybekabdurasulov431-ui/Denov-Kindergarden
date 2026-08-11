const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-urgent-send.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TO = 'support@zomro.com';
const SUBJECT = '[Ticket: 1612897] Lost access to Google Authenticator - request to disable 2FA (account: oybekabdurasulov431@gmail.com)';
const BODY = `Dear ZOMRO Support,

This is an URGENT follow-up to my ticket [1612897].

My VPS service "Platinum Intel | NL-3 v.2 #6917489" has now been SUSPENDED due to non-payment (I received the "Service suspension" notification). I want to add funds and activate the service immediately, but I cannot log in to my Client area because I lost access to the Google Authenticator app and cannot provide the 6-digit TOTP code.

Because the service is now suspended and a 100% per-day penalty is being applied, this is extremely time-sensitive. Please help me as soon as possible:

1. Disable or reset the two-factor authentication on my account (login: oybekabdurasulov431@gmail.com), OR
2. Tell me how I can verify my identity and regain access, OR
3. If possible, provide a direct payment link so I can add funds and activate the suspended service without logging in.

My VPS ID is #6917489 and I am ready to pay the renewal (2.77 EUR) plus any penalty immediately.

Thank you for your urgent assistance.
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
    return { to: to ? to.value : 'NO', subj: subj ? subj.value : 'NO', bodyLen: body.length, bodyHead: body.slice(0, 30) };
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
    return { sent: /Message sent|Сообщение отправлено/.test(d), head: d.replace(/\s+/g, ' ').slice(0, 150) };
  }).catch(e => ({ err: e.message }));
  log('AFTER: ' + JSON.stringify(after));
  log('URGENT_FOLLOWUP_SENT');
})();
