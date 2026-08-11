const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-dns6.log';
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
        const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (/^Add New Record$/.test(t)) { el.click(); return t; }
      }
      return null;
    });
    log('ADD CLICKED: ' + clicked);
    await sleep(4000);
    const dump = await page.evaluate(() => {
      const addForm = document.querySelector('[data-ng-show="addRecord.show"]');
      const sel = (addForm || document).querySelectorAll('select, input');
      const fields = [];
      sel.forEach(i => {
        const r = i.getBoundingClientRect();
        if (r.width > 0) fields.push((i.tagName) + '|' + (i.getAttribute('name') || i.getAttribute('id') || i.getAttribute('ng-model') || '?') + '|type=' + i.type + '|val=' + (i.value || '').slice(0, 50));
      });
      const opts = [];
      document.querySelectorAll('select option').forEach(o => { if (o.offsetParent !== null) opts.push(o.value + ':' + o.textContent.trim().slice(0, 30)); });
      const txt = (addForm ? addForm.innerText : document.body.innerText).replace(/\s+/g, ' ').slice(0, 800);
      return { fields, opts: opts.slice(0, 30), txt };
    });
    log('FIELDS: ' + JSON.stringify(dump.fields));
    log('OPTS: ' + JSON.stringify(dump.opts));
    log('TEXT: ' + dump.txt);
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-addform.png', fullPage: true });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-addform-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
