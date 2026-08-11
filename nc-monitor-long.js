const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-monitor-long.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const seenSubjects = new Set();
async function getBrowser() {
  try { return { browser: await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null }), launched: false }; }
  catch (e) {
    log('browser dead, relaunching...');
    const b = await puppeteer.launch({
      executablePath: CHROME, headless: false, userDataDir: PROFILE,
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1', '--remote-debugging-port=9223']
    });
    return { browser: b, launched: true };
  }
}
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  let { browser } = await getBrowser();
  let pages = await browser.pages();
  let page = pages[pages.length - 1];
  for (let i = 0; i < 240; i++) {  // up to ~8 hours every 2 min
    try {
      const alive = await page.evaluate(() => !!document.body).catch(() => null);
      if (alive === null) { log('page dead, reconnecting'); ({ browser } = await getBrowser()); pages = await browser.pages(); page = pages[pages.length - 1]; }
      await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(e => log('nav err: ' + e.message));
      await sleep(8000);
      const rows = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('tr[jsaction*="t"]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 160)).slice(0, 15);
      });
      const matches = rows.filter(r => /namecheap|accountaccess|zomro|support@zomro|authenticator/i.test(r));
      const interesting = matches.filter(r => !/Thank you for contacting us|automated response/i.test(r));
      log('CHECK ' + i + ' matches=' + JSON.stringify(matches));
      if (interesting.length > 0) {
        const subject = interesting[0].slice(0, 80);
        if (!seenSubjects.has(subject)) {
          seenSubjects.add(subject);
          // open it
          const clicked = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
            for (const r of rows) {
              if (/namecheap|accountaccess|zomro|authenticator/i.test(r.innerText) && !/Thank you for contacting us|automated response/i.test(r.innerText)) { r.click(); return r.innerText.replace(/\s+/g, ' ').slice(0, 150); }
            }
            return null;
          });
          log('OPENED: ' + clicked);
          await sleep(8000);
          const body = await page.evaluate(() => {
            const msg = document.querySelector('div[role="main"]');
            return (msg ? msg.innerText : '').replace(/\s+/g, ' ').slice(0, 4000);
          });
          log('REPLY_BODY: ' + body);
        }
      }
    } catch (e) {
      log('CHECK ' + i + ' ERR ' + e.message);
    }
    await sleep(120000);
  }
  log('DONE');
})();
