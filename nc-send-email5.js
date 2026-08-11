const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-send-email5.log';
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
  log('connecting...');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  log('connected, pages=' + (await browser.pages()).length);
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  log('new tab created');
  const url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(TO) +
    '&su=' + encodeURIComponent(SUBJECT) + '&body=' + encodeURIComponent(BODY);
  log('goto compose url');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('goto err: ' + e.message));
  log('goto done, url=' + page.url());
  await sleep(15000);
  const snap = await page.evaluate(() => {
    const to = document.querySelector('input[aria-label="To recipients"], input[aria-label="Кому"]');
    const subj = document.querySelector('input[name="subjectbox"]');
    const body = Array.from(document.querySelectorAll('div[contenteditable="true"]')).map(e => e.innerText).filter(t => t.length > 3)[0] || '';
    return { to: to ? to.value : 'NO', subj: subj ? subj.value : 'NO', bodyHead: body.slice(0, 30), bodyLen: body.length };
  });
  log('SNAP1: ' + JSON.stringify(snap));
  // fix To if needed using native setter
  if (!snap.to || snap.to.indexOf('@') < 0) {
    log('fixing To...');
    await page.evaluate((to) => {
      const el = document.querySelector('input[aria-label="To recipients"], input[aria-label="Кому"]');
      if (el) {
        el.focus();
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, to);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, TO);
    await sleep(3000);
    await page.keyboard.press('Enter');
    await sleep(2000);
  }
  const snap2 = await page.evaluate(() => {
    const to = document.querySelector('input[aria-label="To recipients"], input[aria-label="Кому"]');
    return { to: to ? to.value : 'NO' };
  });
  log('SNAP2: ' + JSON.stringify(snap2));
  await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-email5.png' });
  // send
  log('clicking Send');
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
  });
  log('AFTER: ' + JSON.stringify(after));
  log('DONE');
})();
