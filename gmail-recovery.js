const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-recovery.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  const dump = async (tag) => {
    try {
      const url = page.url();
      const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 350) : '');
      log(tag + ' | ' + url + ' | ' + t);
    } catch (e) { log(tag + ' err ' + e.message); }
  };
  try {
    await page.goto('https://accounts.google.com/signin/recovery', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    const email = await page.$('input[type="email"], input[name="identifier"], #identifierId');
    if (email) {
      await email.click();
      await email.type('oybekabdurasulovv@gmail.com', { delay: 30 });
      await sleep(400);
      await page.keyboard.press('Enter');
      log('email entered — RECOVERY davom eting (Chrome oynasida)');
    } else {
      log('email field topilmadi, url=' + page.url());
    }
    await dump('recovery-start');
    log("WAIT_FOR_USER — Google recovery'ni o'zingiz tugating. 10 daqiqa kutiladi...");
    for (let i = 0; i < 120; i++) {
      await sleep(5000);
      const url = page.url();
      const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ') : '').catch(() => '');
      if (/success|verified|password|Inbox|mail\.google\.com/.test(t + ' ' + url) && (i % 4 === 0)) {
        await dump('progress ' + i);
      }
      if (i % 24 === 23) await dump('periodic ' + i);
    }
    await dump('final');
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-recovery.png' }); } catch (e2) {}
    await browser.close();
  }
})();
