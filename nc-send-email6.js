const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-send-email6.log';
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
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1', '--remote-debugging-port=9223']
  });
  log('browser launched');
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  const url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(TO) +
    '&su=' + encodeURIComponent(SUBJECT) + '&body=' + encodeURIComponent(BODY);
  log('goto compose');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('goto err: ' + e.message));
  await sleep(15000);
  const snap = await page.evaluate(() => {
    const to = document.querySelector('input[aria-label="To recipients"], input[aria-label="Кому"]');
    const subj = document.querySelector('input[name="subjectbox"]');
    const body = Array.from(document.querySelectorAll('div[contenteditable="true"]')).map(e => e.innerText).filter(t => t.length > 3)[0] || '';
    return { to: to ? to.value : 'NO', subj: subj ? subj.value : 'NO', bodyLen: body.length, bodyHead: body.slice(0, 30) };
  }).catch(e => ({ err: e.message }));
  log('SNAP1: ' + JSON.stringify(snap));
  if (snap && !snap.err && (!snap.to || snap.to.indexOf('@') < 0)) {
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
  }).catch(e => ({ err: e.message }));
  log('SNAP2: ' + JSON.stringify(snap2));
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
  log('EMAIL_SEND_ATTEMPT_DONE');
  for (let i = 0; i < 120; i++) {
    await sleep(30000);
    try {
      const alive = await page.evaluate(() => !!document.body);
      log('HB ' + i + ' alive=' + alive + ' url=' + page.url().slice(0, 80));
    } catch (e) { log('HB ' + i + ' DIED ' + e.message); break; }
  }
  await browser.close();
})();
