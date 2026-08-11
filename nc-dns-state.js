const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-state.log';
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
    const dump = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[data-ng-repeat-start]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 100));
      const sa = Array.from(document.querySelectorAll('a,button')).map(el => ({ t: (el.textContent||'').trim().replace(/\s+/g,' '), c: el.className, vis: el.getBoundingClientRect().width>0 })).filter(x => /Save All Changes/i.test(x.t));
      const alerts = Array.from(document.querySelectorAll('.alert, [class*="message"], [class*="notif"]')).map(el => el.innerText.replace(/\s+/g,' ').slice(0,120)).slice(0,5);
      return { rows, saveAll: sa, alerts };
    });
    log('ROWS: ' + JSON.stringify(dump.rows));
    log('SAVEALL: ' + JSON.stringify(dump.saveAll));
    log('ALERTS: ' + JSON.stringify(dump.alerts));
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-state.png', fullPage: true });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    await browser.close();
  }
})();
