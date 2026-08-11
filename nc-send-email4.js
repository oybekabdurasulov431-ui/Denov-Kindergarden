const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-send-email4.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TO = 'accountaccess@namecheap.com';
const SUBJECT = 'Account access issue - cannot access account email (username: oybek2011)';
const BODY = `Hello Namecheap Support,

I am unable to access my Namecheap account because I no longer have access to the email address registered to the account. My account username is: oybek2011.

When I log in with my correct password, Namecheap asks for a device verification code that is sent to the registered email address (oybekabdurasulovv@gmail.com), but I cannot access that mailbox anymore.

I can verify my identity with any information you require (Support PIN, billing details, government ID, etc.). Please help me change the account email address to oybekabdurasulov431@gmail.com so I can receive the verification code and regain access to my account.

My contact email for this ticket is: oybekabdurasulov431@gmail.com

Thank you for your help.`;
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  const url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(TO) +
    '&su=' + encodeURIComponent(SUBJECT) + '&body=' + encodeURIComponent(BODY);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(12000);
  const snap = await page.evaluate(() => {
    const to = document.querySelector('input[aria-label="To recipients"], input[aria-label="Кому"], input[role="combobox"]');
    const subj = document.querySelector('input[name="subjectbox"]');
    const body = Array.from(document.querySelectorAll('div[contenteditable="true"]')).map(e => e.innerText).filter(t => t.length > 3)[0] || '';
    return { to: to ? to.value : 'NO', subj: subj ? subj.value : 'NO', bodyHead: body.slice(0, 40) };
  });
  log('SNAP: ' + JSON.stringify(snap));
  // if to not set via url (Gmail sometimes needs time), type it
  if (!snap.to || snap.to.indexOf('@') < 0) {
    const to = await page.$('input[aria-label="To recipients"], input[aria-label="Кому"], input[role="combobox"]');
    if (to) {
      await to.click({ clickCount: 3 });
      await sleep(300);
      await page.keyboard.press('Backspace');
      await sleep(300);
      await page.keyboard.type(TO, { delay: 20 });
      await sleep(1500);
      await page.keyboard.press('Enter');
      await sleep(1500);
    }
  }
  const snap2 = await page.evaluate(() => {
    const to = document.querySelector('input[aria-label="To recipients"], input[aria-label="Кому"], input[role="combobox"]');
    return { to: to ? to.value : 'NO', chip: Array.from(document.querySelectorAll('[role="option"] span, .vR')).map(s => s.innerText).filter(Boolean).slice(0, 5) };
  });
  log('SNAP2: ' + JSON.stringify(snap2));
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
    return { sent: /Message sent|Сообщение отправлено/.test(d), head: d.replace(/\s+/g, ' ').slice(0, 120) };
  });
  log('AFTER: ' + JSON.stringify(after));
  // also check Sent folder
  await page.goto('https://mail.google.com/mail/u/0/#sent', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(8000);
  const sentCheck = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 100));
    return rows.slice(0, 5);
  });
  log('SENT_FOLDER: ' + JSON.stringify(sentCheck));
  log('DONE');
})();
