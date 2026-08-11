const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-dns3.log';
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
    await sleep(9000);
    const tabs = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('a, button, [role="tab"], li').forEach(el => {
        const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (/advanced|dns/i.test(t) && t.length < 60) out.push(el.tagName + '|' + (el.getAttribute('href') || '') + '|' + t);
      });
      return out.slice(0, 20);
    });
    log('TABS: ' + JSON.stringify(tabs));

    const clicked = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('a, button, [role="tab"], li, div'));
      for (const el of els) {
        const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (/^Advanced DNS$/i.test(t) || /Advanced DNS/i.test(t) && t.length < 40) { el.click(); return t; }
      }
      return null;
    });
    log('CLICKED: ' + clicked);
    await sleep(9000);
    const url = page.url();
    const dump = await page.evaluate(() => {
      const t = document.body.innerText.replace(/\s+/g, ' ').slice(0, 1500);
      return t;
    });
    log('URL: ' + url);
    log('TEXT: ' + dump);
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-advanced2.png', fullPage: true });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-advanced2-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
