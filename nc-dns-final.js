const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-dns-final.log';
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

  const rows = () => page.evaluate(() => Array.from(document.querySelectorAll('tr[data-ng-repeat-start]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 90)));
  const clickYes = () => page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a.yes, button.yes, a[class*="yes"]'));
    for (const el of els) { const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) { el.click(); return 'yes'; } }
    return null;
  });
  const removeFirst = async (label) => {
    const tg = await page.evaluate(() => {
      const rows = document.querySelectorAll('tr[data-ng-repeat-start]');
      for (const tr of rows) {
        if (!tr.innerText.includes('Locked')) {
          const a = tr.querySelector('a.remove.tooltip-toggle');
          if (a) { a.click(); return tr.innerText.replace(/\s+/g, ' ').slice(0, 60); }
        }
      }
      return null;
    });
    log('REMOVE[' + label + ']: ' + tg);
    if (!tg) { log('  (nothing removable)'); await sleep(2000); return false; }
    await sleep(2500);
    log('  yes=' + (await clickYes()));
    await sleep(3000);
    return true;
  };
  const addRecord = async (host, value) => {
    await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('a'));
      for (const el of els) { const t = (el.textContent || '').trim().replace(/\s+/g, ' '); if (/^Add New Record$/.test(t)) { el.click(); return; } }
    });
    await sleep(3000);
    const filled = await page.evaluate((h, v) => {
      const hostEl = document.querySelector('input[name="host"]');
      const valEl = document.querySelector('input[name="idAddress"]');
      if (hostEl) { hostEl.focus(); hostEl.value = h; hostEl.dispatchEvent(new Event('input', { bubbles: true })); hostEl.dispatchEvent(new Event('change', { bubbles: true })); }
      if (valEl) { valEl.focus(); valEl.value = v; valEl.dispatchEvent(new Event('input', { bubbles: true })); valEl.dispatchEvent(new Event('change', { bubbles: true })); }
      return { host: !!hostEl, val: !!valEl };
    }, host, value);
    log('  fill ' + host + ': host=' + filled.host + ' val=' + filled.val);
    await sleep(1500);
    const saved = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('a, button, input[type="submit"]'));
      for (const el of els) {
        const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && /^Save Changes$/i.test(t)) { el.click(); return t; }
      }
      return null;
    });
    log('  savebtn=' + saved);
    await sleep(3000);
  };

  try {
    await page.goto('https://ap.www.namecheap.com/Domains/DomainControlPanel/mexriddin.online/advancedns', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(12000);
    log('INIT: ' + JSON.stringify(await rows()));

    await removeFirst('old/CNAME');
    await removeFirst('old/REDIRECT');
    log('AFTER REMOVE: ' + JSON.stringify(await rows()));

    await addRecord('@', '80.89.238.78');
    await addRecord('www', '80.89.238.78');
    log('AFTER ADD: ' + JSON.stringify(await rows()));

    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-final-before-save.png', fullPage: true });

    const sa = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('a, button'));
      for (const el of els) {
        const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && /^Save All Changes$/i.test(t)) { el.click(); return t; }
      }
      return null;
    });
    log('SAVE ALL: ' + sa);
    await sleep(10000);
    log('AFTER SAVE: ' + JSON.stringify(await rows()));
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-final-saved.png', fullPage: true });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-final-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
