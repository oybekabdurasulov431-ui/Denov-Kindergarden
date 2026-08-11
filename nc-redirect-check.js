const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-redirect.log';
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
    await page.goto('https://ap.www.namecheap.com/domains/domaincontrolpanel/mexriddin.online/domain', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(12000);
    const txt = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 2000));
    log('DETAILS TEXT: ' + txt);
    const redirectBtns = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('a, button, [role="button"], div'));
      return els.map(el => ({ t: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60), vis: el.getBoundingClientRect().width > 0 }))
        .filter(x => x.t && x.t.length < 60 && (/redirect/i.test(x.t) || /^Remove$/i.test(x.t)))
        .slice(0, 20);
    });
    log('REDIRECT ELEMS: ' + JSON.stringify(redirectBtns));
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-details.png', fullPage: true });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    await browser.close();
  }
})();
