const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\monitor-v3.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let browser = null;
let page = null;
async function launch() {
  try { if (browser) { try { await browser.close(); } catch (e) {} } } catch (e) {}
  browser = null; page = null;
  log('LAUNCH');
  browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1', '--remote-debugging-port=9223']
  });
  const pages = await browser.pages();
  page = pages[0];
  await page.setViewport({ width: 1366, height: 900 });
  log('LAUNCHED');
  return true;
}
async function safeNav(url) {
  try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 }); return true; }
  catch (e) { log('nav err: ' + e.message); return false; }
}
async function check() {
  try {
    if (!browser) await launch();
    const ok = await safeNav('https://mail.google.com/mail/u/0/#inbox');
    if (!ok) { throw new Error('nav failed'); }
    await sleep(9000);
    const rows = await page.evaluate(() => Array.from(document.querySelectorAll('tr[jsaction*="t"]')).map(tr => tr.innerText.replace(/\s+/g, ' ')).slice(0, 12));
    if (!rows.length) { log('CHECK EMPTY'); return; }
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (/ticket|2FA|Authenticator|verification|verif|suspension|additional|disable/i.test(r)) {
        log('CANDIDATE[' + i + ']: ' + r.slice(0, 220));
        if (/ticket|2FA|Authenticator|suspension/i.test(r) && i < 4) {
          try {
            await page.evaluate((idx) => { document.querySelectorAll('tr[jsaction*="t"]')[idx].click(); }, i);
            await sleep(8000);
            const body = await page.evaluate(() => {
              const msg = document.querySelector('div[role="main"]');
              return (msg ? msg.innerText : '').replace(/\s+/g, ' ').slice(0, 2600);
            });
            log('REPLY_BODY: ' + body);
            await safeNav('https://mail.google.com/mail/u/0/#inbox');
            await sleep(5000);
          } catch (e2) { log('open err: ' + e2.message); }
        }
      }
    }
    log('CHECK OK ' + rows.length);
  } catch (e) {
    log('check err: ' + e.message);
    try { await launch(); } catch (e2) { log('relaunch err: ' + e2.message); }
  }
}
(async () => {
  fs.writeFileSync(LOG, 'MONITOR V3 START\n');
  while (true) {
    await check();
    await sleep(120000);
  }
})();
