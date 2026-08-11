const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-dns5.log';
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
    const info = await page.evaluate(() => {
      const cb = document.querySelector('#chbHostRecord_0');
      let row = null;
      if (cb) {
        row = cb.closest('tr');
        if (!row) row = cb.closest('div');
      }
      const rowInfo = row ? row.outerHTML.slice(0, 1800) : 'NO ROW';
      const btns = [];
      document.querySelectorAll('button, a, [role="button"], span, div').forEach(el => {
        const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (/^Remove$|^Edit$|^Delete$|Add New Record|^Save/.test(t) && t.length < 40) btns.push(el.tagName + '|' + (el.getAttribute('href')||'') + '|' + t + '|' + (el.className||'').toString().slice(0,60));
      });
      return { rowInfo, btns: [...new Set(btns.map(b => b))].slice(0, 25) };
    });
    log('ROW HTML: ' + info.rowInfo);
    log('BTNS: ' + JSON.stringify(info.btns));
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-rows.png', fullPage: true });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-rows-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
