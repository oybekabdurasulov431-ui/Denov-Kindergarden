const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-chat-session.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--remote-debugging-port=9222', '--no-first-run', '--no-default-browser-check']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  try {
    await page.goto('https://www.namecheap.com/help-center/live-chat/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    log('page loaded: ' + page.url());
    // open Contact us dropdown and click Live Chat
    const r1 = await page.evaluate(() => {
      for (const t of document.querySelectorAll('button, a')) {
        if ((t.textContent || '').trim() === 'Contact us') { t.click(); return 'dropdown opened'; }
      }
      return 'no Contact us';
    });
    log('dropdown: ' + r1);
    await sleep(2500);
    const r2 = await page.evaluate(() => {
      for (const i of document.querySelectorAll('a, button')) {
        if ((i.textContent || '').trim() === 'Live Chat') { i.click(); return 'livechat clicked'; }
      }
      return 'no Live Chat item';
    });
    log('click: ' + r2);
    await sleep(10000);
    log('url2: ' + page.url());
    const w = await page.evaluate(() => {
      const zsiq = document.querySelectorAll('[id*="zsiq"],[class*="zsiq"],[class*="salesIQ"],[class*="SalesIQ"]').length;
      const ifr = Array.from(document.querySelectorAll('iframe')).map(f => ({ src: f.src, id: f.id, cls: f.className }));
      const scripts = Array.from(document.scripts).map(s => s.src).filter(s => /zoho|zsiq|sales/i.test(s));
      return { zsiq, ifr, scripts };
    });
    log('WIDGET: ' + JSON.stringify(w));
    // try clicking the float launcher if present
    const r3 = await page.evaluate(() => {
      const sel = '#zsiq_float, .zsiq_float, [class*="zsiq"] [role="button"], .zsiq_fltcnt, [id*="zsiq_float"]';
      const el = document.querySelector(sel);
      if (el) { el.click(); return 'launcher clicked'; }
      return 'no launcher';
    });
    log('launcher: ' + r3);
    await sleep(6000);
    const frames = page.frames();
    log('frames now: ' + frames.length);
    for (const f of frames) {
      if (f.url() !== 'about:blank') {
        try {
          const t = await f.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 200) : '');
          log('FRAME ' + f.url().slice(0, 100) + ' | ' + t);
        } catch (e) { log('frame err ' + e.message); }
      }
    }
    log('READY_FOR_USER');
    for (let i = 0; i < 120; i++) {
      await sleep(30000);
      try {
        const alive = await page.evaluate(() => !!document.body);
        log('HB ' + i + ' alive=' + alive + ' url=' + page.url());
      } catch (e) { log('HB ' + i + ' DIED ' + e.message); break; }
    }
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-chat-err.png' }); } catch (e2) {}
  }
  log('DONE');
  await browser.close();
})();
