const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-dns-apply.log';
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

  const clickVisible = (selText) => page.evaluate((txt) => {
    const els = Array.from(document.querySelectorAll('a, button'));
    for (const el of els) {
      const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && new RegExp('^' + txt + '$').test(t)) { el.click(); return t; }
    }
    return null;
  }, selText);

  const clickVisibleYes = () => page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a.yes, button.yes, a[class*="yes"]'));
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) { el.click(); return el.textContent.trim().slice(0, 40); }
    }
    return null;
  });

  const recordRows = () => page.evaluate(() => Array.from(document.querySelectorAll('tr[data-ng-repeat-start]')).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 80)));

  const removeFirst = async (label) => {
    const toggled = await page.evaluate(() => {
      const rows = document.querySelectorAll('tr[data-ng-repeat-start]');
      for (const tr of rows) {
        const a = tr.querySelector('a.remove.tooltip-toggle');
        if (a) { a.click(); return tr.innerText.replace(/\s+/g, ' ').slice(0, 60); }
      }
      return null;
    });
    log('REMOVE TOGGLE [' + label + ']: ' + toggled);
    await sleep(2500);
    let yes = await clickVisibleYes();
    log('  confirm yes1: ' + yes);
    if (!yes) {
      const tooltipRem = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('a, button'));
        for (const el of els) {
          const t = (el.textContent || '').trim();
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && /^Remove$/.test(t) && el.className && /remove/.test(el.className)) { el.click(); return t; }
        }
        return null;
      });
      log('  tooltip remove: ' + tooltipRem);
      await sleep(2000);
      yes = await clickVisibleYes();
      log('  confirm yes2: ' + yes);
    }
    await sleep(3000);
  };

  const addRecord = async (host, value) => {
    const addClicked = await clickVisible('Add New Record');
    log('ADD CLICKED: ' + addClicked);
    await sleep(3000);
    const filled = await page.evaluate((h, v) => {
      const hostEl = document.querySelector('input[name="host"]') || document.querySelector('input[ng-model$="host"]') || document.querySelector('input[data-ng-model$="host"]');
      const valEl = document.querySelector('input[idAddress]') || document.querySelector('input[ng-model*="ddress"]') || document.querySelector('input[data-ng-model*="ddress"]');
      if (hostEl) { hostEl.focus(); hostEl.value = h; hostEl.dispatchEvent(new Event('input', { bubbles: true })); hostEl.dispatchEvent(new Event('change', { bubbles: true })); }
      if (valEl) { valEl.focus(); valEl.value = v; valEl.dispatchEvent(new Event('input', { bubbles: true })); valEl.dispatchEvent(new Event('change', { bubbles: true })); }
      return { host: !!hostEl, val: !!valEl };
    }, host, value);
    log('  filled host=' + filled.host + ' value=' + filled.val + ' for ' + host + ' -> ' + value);
    await sleep(1200);
    const addBtn = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('a, button, input[type="submit"]'));
      for (const el of els) {
        const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && /^Add$/i.test(t)) { el.click(); return t; }
      }
      for (const el of els) {
        const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && /Add Record/i.test(t) && !/Add New Record/i.test(t)) { el.click(); return t; }
      }
      return null;
    });
    log('  FORM ADD BTN: ' + addBtn);
    await sleep(2500);
  };

  try {
    await page.goto('https://ap.www.namecheap.com/Domains/DomainControlPanel/mexriddin.online/advancedns', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(12000);
    log('INITIAL ROWS: ' + JSON.stringify(await recordRows()));

    await removeFirst('CNAME/www');
    log('AFTER REMOVE1: ' + JSON.stringify(await recordRows()));
    await removeFirst('URLREDIRECT/@');
    log('AFTER REMOVE2: ' + JSON.stringify(await recordRows()));

    await addRecord('@', '80.89.238.78');
    log('AFTER ADD @: ' + JSON.stringify(await recordRows()));
    await addRecord('www', '80.89.238.78');
    log('AFTER ADD www: ' + JSON.stringify(await recordRows()));

    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-before-save.png', fullPage: true });
    log('BEFORE SAVE — reviewing. NOT SAVING in this run.');
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-apply-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
