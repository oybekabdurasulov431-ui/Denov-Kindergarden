const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  const dump = async (tag) => {
    try {
      const url = page.url();
      const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 500) : '');
      log(tag + ' | ' + url + ' | ' + t);
    } catch (e) { log(tag + ' err ' + e.message); }
  };
  const loggedIn = async () => {
    try {
      const url = page.url();
      return url.includes('ap.www.namecheap.com') || url.includes('DomainList') || url.includes('/Domains/');
    } catch (e) { return false; }
  };

  try {
    await page.goto('https://www.namecheap.com/myaccount/login/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    const user = await page.$('input.nc_username');
    if (user) {
      await user.click();
      await user.type('oybek2011', { delay: 40 });
      const pass = await page.$('input.nc_password');
      if (pass) await pass.type('LUxcnu-QiP9v#B3', { delay: 40 });
      await sleep(300);
      await page.evaluate(() => {
        const b = document.querySelector('.nc_login_submit');
        if (b) b.click();
      });
      log('submitted');
    } else log('no user field');

    log("WAIT_FOR_USER — agar twofa/captcha bo'lsa yeching. 5 daqiqa kutiladi...");
    let ok = false;
    for (let i = 0; i < 60; i++) {
      await sleep(5000);
      if (await loggedIn()) { ok = true; log('LOGGED IN url=' + page.url()); break; }
      const cur = page.url();
      if (cur.includes('twofa') || cur.includes('device')) {
        log("DEVICE VERIFICATION sahifasi — Gmail'da kelgan kodni Chrome oynasiga kiriting va Submit bosing");
        break;
      }
      if (i % 6 === 0) await dump('poll ' + i);
    }
    if (!ok) {
      log('waiting after twofa detection for completion...');
      for (let i = 0; i < 40; i++) {
        await sleep(5000);
        if (await loggedIn()) { ok = true; log('LOGGED IN url=' + page.url()); break; }
      }
    }
    if (!ok) { log('login timeout'); await browser.close(); process.exit(2); }

    await page.goto('https://ap.www.namecheap.com/Domains/DomainList', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(8000);
    await dump('domainlist');
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap.png' }); } catch (e2) {}
    await browser.close();
  }
})();
