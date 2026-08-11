const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-support-email.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TO = 'support@zomro.com';
const SUBJECT = 'Lost access to Google Authenticator - request to disable 2FA (account: oybekabdurasulov431@gmail.com)';
const BODY = `Hello Zomro Support,

I am unable to log in to my Zomro client area because I have lost access to the Google Authenticator app on my device and cannot provide the 6-digit TOTP code.

My account email/login is: oybekabdurasulov431@gmail.com

I need to access my account urgently to pay my invoice (VPS Platinum Intel | NL-3 v.2 #6917489) and add funds to avoid service suspension.

Please disable or reset the two-factor authentication for my account, or let me know how I can verify my identity and regain access.

Thank you for your help.`;
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  let browser;
  try { browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null }); log('connected'); }
  catch (e) {
    log('launching new browser');
    browser = await puppeteer.launch({
      executablePath: CHROME, headless: false, userDataDir: PROFILE,
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1', '--remote-debugging-port=9223']
    });
  }
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
    return { to: to ? to.value : 'NO', subj: subj ? subj.value : 'NO', bodyLen: body.length };
  }).catch(e => ({ err: e.message }));
  log('SNAP: ' + JSON.stringify(snap));
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
    return { sent: /Message sent|Сообщение отправлено/.test(d), head: d.replace(/\s+/g, ' ').slice(0, 130) };
  });
  log('AFTER: ' + JSON.stringify(after));
  log('DONE');
})();
