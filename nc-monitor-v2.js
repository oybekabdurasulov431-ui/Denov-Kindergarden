const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\monitor-v2.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let browser = null;
let page = null;
async function ensureBrowser() {
  if (browser && browser.isConnected()) { try { await browser.version(); return true; } catch (e) {} }
  log('LAUNCH');
  browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1', '--remote-debugging-port=9223']
  });
  const pages = await browser.pages();
  page = pages[0];
  await page.setViewport({ width: 1366, height: 900 });
  return true;
}
async function nav(url) {
  try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); return true; }
  catch (e) { log('nav err: ' + e.message); return false; }
}
async function check() {
  try {
    if (!(await ensureBrowser())) return;
    await nav('https://mail.google.com/mail/u/0/#inbox');
    await sleep(9000);
    const rows = await page.evaluate(() => Array.from(document.querySelectorAll('tr[jsaction*="t"]')).map(tr => tr.innerText.replace(/\s+/g, ' ')).slice(0, 12));
    if (!rows.length) { log('CHECK EMPTY'); return; }
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (/ticket|2FA|Authenticator|verification|verif|suspension|additional/i.test(r)) {
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
            await nav('https://mail.google.com/mail/u/0/#inbox');
            await sleep(5000);
          } catch (e2) { log('open err: ' + e2.message); }
        }
      }
    }
    log('CHECK OK ' + rows.length);
  } catch (e) { log('check err: ' + e.message); }
}
(async () => {
  fs.writeFileSync(LOG, 'MONITOR V2 START\n');
  await check();
  setInterval(check, 120000);
})();
