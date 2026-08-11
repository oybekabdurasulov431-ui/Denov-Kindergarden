const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-code-session.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--remote-debugging-port=9222']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
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
      await page.evaluate(() => { const b = document.querySelector('.nc_login_submit'); if (b) b.click(); });
      log('submitted');
    }
    for (let i = 0; i < 15; i++) {
      await sleep(4000);
      if (page.url().includes('twofa') || page.url().includes('device')) { log('TWOFA PAGE url=' + page.url()); break; }
    }
    await sleep(2000);
    const info = await page.evaluate(() => {
      const t = document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 400) : '';
      const inp = !!document.querySelector('#codeInput');
      return { t, codeInput: inp };
    });
    log('PAGE: ' + info.t);
    log('codeInput present: ' + info.codeInput);
    log('SESSION_READY — browser ochiq. CDP port 9222.');
    log("CODE_SENT — Gmail'da Namecheap verification kodini topib, menga yozing.");
    // keep alive 15 minutes
    for (let i = 0; i < 180; i++) await sleep(5000);
  } catch (e) {
    log('ERROR: ' + e.message);
  }
  log('DONE');
  await browser.close();
})();
