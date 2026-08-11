const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-addinsp.log';
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
    await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('a'));
      for (const el of els) {
        const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
        if (/^Add New Record$/.test(t)) { el.click(); return; }
      }
    });
    await sleep(4000);
    const info = await page.evaluate(() => {
      const inputs = [];
      document.querySelectorAll('input').forEach(i => {
        const r = i.getBoundingClientRect();
        if (r.width > 0) inputs.push('id=' + (i.id||'') + ' name=' + (i.name||'') + ' ngm=' + (i.getAttribute('ng-model')||'') + ' val=' + (i.value||''));
      });
      const btns = [];
      document.querySelectorAll('a, button, input[type="submit"], div, span').forEach(el => {
        const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && t && t.length < 30 && /add|save|ok|create|cancel/i.test(t)) btns.push(el.tagName + '|' + (el.className||'').toString().slice(0,50) + '|' + t);
      });
      const t2 = document.body.innerText.replace(/\s+/g, ' ').slice(0, 600);
      return { inputs, btns: [...new Set(btns.map(JSON.stringify))].slice(0, 15).map(JSON.parse), t2 };
    });
    log('INPUTS: ' + JSON.stringify(info.inputs));
    log('BTNS: ' + JSON.stringify(info.btns));
    log('TEXT: ' + info.t2);
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-addinspect.png', fullPage: true });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    await browser.close();
  }
})();
