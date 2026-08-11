const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-dns.log';
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
      const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 700) : '');
      log(tag + ' | ' + url + ' | ' + t);
    } catch (e) { log(tag + ' err ' + e.message); }
  };

  try {
    await page.goto('https://www.namecheap.com/myaccount/login/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    const user = await page.$('input.nc_username');
    if (user) {
      await user.click();
      await user.type('oybek2011', { delay: 30 });
      const pass = await page.$('input.nc_password');
      if (pass) await pass.type('LUxcnu-QiP9v#B3', { delay: 30 });
      await sleep(300);
      await page.evaluate(() => { const b = document.querySelector('.nc_login_submit'); if (b) b.click(); });
      log('submitted');
    } else { log('no user field — may already be logged in'); }

    let ok = false;
    for (let i = 0; i < 60; i++) {
      await sleep(5000);
      const url = page.url();
      if (url.includes('ap.www.namecheap.com') || url.includes('DomainList')) { ok = true; log('LOGGED IN url=' + url); break; }
      if (url.includes('twofa') || url.includes('device') || url.includes('verif')) {
        log('POSSIBLE VERIFICATION PAGE url=' + url);
        await dump('verif');
        break;
      }
    }
    if (!ok) {
      log('login not confirmed within 5min; dumping current state');
      await dump('final');
      await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-login-state.png' });
      await browser.close();
      process.exit(3);
    }

    await page.goto('https://ap.www.namecheap.com/Domains/DomainList', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(9000);
    await dump('domainlist');

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('mexriddin')).slice(0, 10);
    });
    log('MEXRIDDIN LINKS: ' + JSON.stringify(links));

    if (links.length) {
      await page.goto(links[0], { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(9000);
      await dump('dns-page');
      await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-dns-page.png', fullPage: true });
    }
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-dns-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
