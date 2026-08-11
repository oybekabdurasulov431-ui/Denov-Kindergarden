const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-send-email.log';
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
  await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(10000);
  log('URL: ' + page.url());
  // click Compose
  const comp = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
    for (const b of btns) {
      const t = (b.getAttribute('aria-label') || b.textContent || '').trim();
      if (/Написать|Compose/i.test(t)) { b.click(); return t; }
    }
    return null;
  });
  log('compose: ' + comp);
  await sleep(5000);
  // fill To
  const toFilled = await page.evaluate((to) => {
    const inps = Array.from(document.querySelectorAll('input, textarea, div[contenteditable="true"]'));
    for (const i of inps) {
      const ar = (i.getAttribute('aria-label') || '').toLowerCase();
      if (ar.includes('кому') || ar.includes('to ') || ar.includes('recipient')) { i.focus(); return 'to-target-' + ar; }
    }
    return null;
  }, TO);
  log('to-field: ' + toFilled);
  await sleep(1000);
  await page.keyboard.type(TO, { delay: 20 });
  await sleep(2000);
  await page.keyboard.press('Enter');
  await sleep(2000);
  // subject
  const subjFilled = await page.evaluate(() => {
    const inps = Array.from(document.querySelectorAll('input'));
    for (const i of inps) {
      const ar = (i.getAttribute('aria-label') || i.getAttribute('name') || '').toLowerCase();
      if (ar.includes('тема') || ar.includes('subject')) { i.focus(); return 'subj-target'; }
    }
    return null;
  });
  log('subject-field: ' + subjFilled);
  await page.keyboard.type(SUBJECT, { delay: 15 });
  await sleep(1000);
  // body
  const bodyFilled = await page.evaluate(() => {
    const eds = Array.from(document.querySelectorAll('div[contenteditable="true"]'));
    for (const e of eds) {
      if (e.innerText.length < 5) { e.focus(); return 'body-target'; }
    }
    return null;
  });
  log('body-field: ' + bodyFilled);
  await page.keyboard.type(BODY, { delay: 3 });
  await sleep(2000);
  await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-email-draft.png' });
  // send
  const sent = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
    for (const b of btns) {
      const t = (b.getAttribute('aria-label') || b.textContent || '').trim();
      if (/Отправить|Send/i.test(t)) { b.click(); return t; }
    }
    return null;
  });
  log('send-click: ' + sent);
  await sleep(6000);
  log('URL after send: ' + page.url());
  const check = await page.evaluate(() => (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 200));
  log('AFTER: ' + check);
  log('DONE');
})();
