const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REAL_PROFILE = 'C:\\Users\\user\\AppData\\Local\\Google\\Chrome\\User Data';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-real.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: REAL_PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run']
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

  try {
    await page.goto('https://ap.www.namecheap.com/Domains/DomainList', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(10000);
    await dump('domainlist');
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-real.png' });

    const url = page.url();
    if (url.includes('login')) {
      log('SESSION YOQ — login kerak');
      const user = await page.$('input.nc_username');
      if (user) {
        await user.click();
        await user.type('oybek2011', { delay: 40 });
        const pass = await page.$('input.nc_password');
        if (pass) await pass.type('LUxcnu-QiP9v#B3', { delay: 40 });
        await sleep(300);
        await page.evaluate(() => { const b = document.querySelector('.nc_login_submit'); if (b) b.click(); });
        log('submitted');
        for (let i = 0; i < 36; i++) {
          await sleep(5000);
          if (page.url().includes('ap.www.namecheap.com') || page.url().includes('DomainList')) { log('IN url=' + page.url()); break; }
          if (page.url().includes('twofa') || page.url().includes('device')) { log('DEVICE VERIFICATION — kod kerak'); break; }
          if (i % 6 === 0) await dump('poll ' + i);
        }
      }
    }
    await dump('final');
    await browser.close();
    log('DONE');
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-real.png' }); } catch (e2) {}
    await browser.close();
  }
})();
