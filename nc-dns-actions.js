const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-dns7.log';
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
      const rows = Array.from(document.querySelectorAll('tr[data-ng-repeat-start]'));
      const out = rows.map((tr, idx) => {
        const txt = tr.innerText.replace(/\s+/g, ' ').slice(0, 90);
        const actionCell = tr.querySelector('.actions, [class*="action"], td:last-child');
        const cellHtml = actionCell ? actionCell.outerHTML.slice(0, 1200) : 'NO ACTION CELL';
        const tds = Array.from(tr.querySelectorAll('td')).map(td => (td.className || '') + '|' + td.innerText.replace(/\s+/g, ' ').slice(0, 60));
        return { idx, txt, tds, cellHtml };
      });
      return out;
    });
    info.forEach(r => {
      log('ROW ' + r.idx + ': ' + r.txt);
      log('  TDS: ' + JSON.stringify(r.tds));
      log('  ACTION CELL: ' + r.cellHtml);
    });
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-actions.png', fullPage: true });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-actions-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
