const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-reply-confirm.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const REPLY = `Hello,

Yes, please temporarily disable the additional verification for my account.

Username: oybek2011
Domain: mexriddin.online

After it is disabled, I will log in immediately and update the account email to oybekabdurasulov431@gmail.com.

Thank you very much.`;
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  let browser;
  try { browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null }); }
  catch (e) {
    log('connect failed, launching new...');
    browser = await puppeteer.launch({
      executablePath: CHROME, headless: false, userDataDir: PROFILE,
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1', '--remote-debugging-port=9223']
    });
  }
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  await page.goto('https://mail.google.com/mail/u/0/#search/account+access', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => log('nav err: ' + e.message));
  await sleep(9000);
  const clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
    for (const r of rows) {
      if (/account access/i.test(r.innerText)) { r.click(); return r.innerText.replace(/\s+/g, ' ').slice(0, 150); }
    }
    return null;
  });
  log('THREAD CLICKED: ' + clicked);
  await sleep(8000);
  const rep = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
    for (const b of btns) {
      const t = (b.getAttribute('aria-label') || b.textContent || '').trim();
      if (/^Reply$/.test(t)) { b.click(); return t; }
    }
    return null;
  });
  log('REPLY CLICKED: ' + rep);
  await sleep(5000);
  const bodyFocused = await page.evaluate(() => {
    const eds = Array.from(document.querySelectorAll('div[contenteditable="true"]'));
    const empty = eds.find(e => e.innerText.trim().length < 3);
    if (empty) { empty.focus(); return 'focused'; }
    return null;
  });
  log('BODY FOCUS: ' + bodyFocused);
  await sleep(800);
  await page.keyboard.type(REPLY, { delay: 3 });
  await sleep(2000);
  await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-reply-confirm-draft.png' });
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
