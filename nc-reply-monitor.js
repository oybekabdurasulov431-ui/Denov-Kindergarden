const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-reply-monitor.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  let browser;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
      log('connected');
      break;
    } catch (e) {
      log('connect fail attempt ' + attempt + ': ' + e.message);
      await sleep(15000);
    }
  }
  if (!browser) { log('NO_BROWSER'); return; }
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  // loop: every 60s check inbox for new Namecheap mails
  for (let i = 0; i < 90; i++) {
    try {
      await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(e => log('nav err: ' + e.message));
      await sleep(9000);
      const r = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 130));
        return rows.filter(r => /namecheap|support|ticket|reply/i.test(r));
      });
      const all = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('tr[jsaction*="t"]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 110)).slice(0, 12);
      });
      log('CHECK ' + i + ' NC_MATCHES=' + JSON.stringify(r));
      if (r.length > 0) {
        log('REPLY_FOUND: ' + JSON.stringify(r));
        break;
      }
      log('CHECK ' + i + ' latest: ' + JSON.stringify(all.slice(0, 3)));
    } catch (e) {
      log('CHECK ' + i + ' ERR ' + e.message);
      break;
    }
    await sleep(55000);
  }
  log('DONE');
})();
