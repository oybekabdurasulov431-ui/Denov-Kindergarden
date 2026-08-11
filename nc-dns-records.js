const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-dns4.log';
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
    await page.goto('https://ap.www.namecheap.com/Domains/DomainControlPanel/mexriddin.online/advancedns', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(12000);
    const url = page.url();
    const dump = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 1500));
    log('URL: ' + url);
    log('TEXT: ' + dump);
    const inputs = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('input, select').forEach(i => {
        const r = i.getBoundingClientRect();
        if (r.width > 0) out.push((i.tagName) + '#' + (i.getAttribute('name') || i.getAttribute('id') || '?') + '|type=' + i.type + '|val=' + (i.value || '').slice(0, 70));
      });
      return out.slice(0, 60);
    });
    log('INPUTS: ' + JSON.stringify(inputs));
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-records.png', fullPage: true });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-records-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
