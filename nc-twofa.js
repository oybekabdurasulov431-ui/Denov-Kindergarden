const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-twofa.log';
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
    for (let i = 0; i < 12; i++) {
      await sleep(4000);
      if (page.url().includes('twofa') || page.url().includes('device')) break;
    }
    log('url=' + page.url());
    await sleep(3000);
    const info = await page.evaluate(() => {
      const txt = document.body ? document.body.innerText.replace(/\s+/g, ' ') : '';
      const links = Array.from(document.querySelectorAll('a')).map(a => ({ t: (a.textContent||'').trim().slice(0,60), href: a.href })).filter(x => x.t);
      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({ id: i.id, name: i.name, type: i.type, ph: i.placeholder }));
      const radios = Array.from(document.querySelectorAll('input[type="radio"], input[type="checkbox"]')).map(r => ({ id: r.id, name: r.name, val: r.value }));
      return { txt: txt.slice(0, 900), links: links.slice(0, 25), inputs, radios };
    });
    log('TXT: ' + info.txt);
    log('LINKS: ' + JSON.stringify(info.links));
    log('INPUTS: ' + JSON.stringify(info.inputs));
    log('RADIOS: ' + JSON.stringify(info.radios));
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-twofa.png' });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-twofa.png' }); } catch (e2) {}
    await browser.close();
  }
})();
