const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-dns8.log';
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
    const r0 = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[data-ng-repeat-start]'));
      const remove = rows[0].querySelector('a.remove.tooltip-toggle');
      if (remove) { remove.click(); return 'clicked'; }
      return 'not found';
    });
    log('ROW0 REMOVE CLICKED: ' + r0);
    await sleep(3000);
    const dump = await page.evaluate(() => {
      const btns = [];
      document.querySelectorAll('button, a, [role="button"], div, span').forEach(el => {
        const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (t && t.length < 50 && /delete|remove|yes|confirm|cancel|ok|are you sure|удалить/i.test(t)) btns.push(el.tagName + '|' + (el.className||'').toString().slice(0, 70) + '|' + t);
      });
      const bodyTxt = document.body.innerText.replace(/\s+/g, ' ').slice(0, 700);
      return { btns: [...new Set(btns.map(JSON.stringify))].slice(0, 20).map(JSON.parse), bodyTxt };
    });
    log('CONFIRM BTNS: ' + JSON.stringify(dump.btns));
    log('BODY: ' + dump.bodyTxt);
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-remove-confirm.png', fullPage: true });
    log('DONE (no confirm pressed)');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-remove-test-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
