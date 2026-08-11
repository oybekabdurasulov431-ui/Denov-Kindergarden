const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-dns2.log';
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
    await page.goto('https://ap.www.namecheap.com/domains/domaincontrolpanel/mexriddin.online/advanced', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(10000);
    const url = page.url();
    log('URL: ' + url);
    const dump = await page.evaluate(() => {
      const t = document.body.innerText.replace(/\s+/g, ' ').slice(0, 1200);
      return t;
    });
    log('TEXT: ' + dump);
    const records = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('input').forEach(i => {
        const r = i.getBoundingClientRect();
        if (r.width > 0) out.push(i.getAttribute('name') + '|' + i.type + '|val=' + (i.value || '').slice(0, 60));
      });
      return out.slice(0, 40);
    });
    log('INPUTS: ' + JSON.stringify(records));
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-advanced.png', fullPage: true });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-advanced-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
