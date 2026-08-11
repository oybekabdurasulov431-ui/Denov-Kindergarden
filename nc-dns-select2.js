const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-dns9.log';
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
    const clicked = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('a'));
      for (const el of els) {
        const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
        if (/^Add New Record$/.test(t)) { el.click(); return t; }
      }
      return null;
    });
    log('ADD CLICKED: ' + clicked);
    await sleep(4000);
    const info = await page.evaluate(() => {
      const selects = [];
      document.querySelectorAll('select').forEach(s => {
        const r = s.getBoundingClientRect();
        const opts = Array.from(s.options).map(o => o.value + '=' + o.textContent.trim().slice(0, 25));
        const ngm = s.getAttribute('ng-model');
        selects.push({ visible: r.width > 0, id: s.id, name: s.name, ngModel: ngm, val: s.value, opts });
      });
      const containers = [];
      document.querySelectorAll('.select2-container, .select2-choice, .select2-chosen').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0) containers.push(el.tagName + '.' + (el.className||'').toString().split(' ').slice(0,2).join('.') + '|id=' + el.id + '|txt=' + (el.textContent||'').trim().slice(0,30));
      });
      return { selects, containers };
    });
    log('SELECTS: ' + JSON.stringify(info.selects));
    log('CONTAINERS: ' + JSON.stringify(info.containers));
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-select2.png', fullPage: true });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-select2-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
