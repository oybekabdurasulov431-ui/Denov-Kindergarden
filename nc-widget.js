const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-widget.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null });
  const pages = await browser.pages();
  for (let i = 0; i < pages.length; i++) log('page' + i + ' url=' + pages[i].url());
  const page = pages[pages.length - 1];
  const frames = page.frames();
  log('frames: ' + frames.length);
  for (const f of frames) {
    try {
      const info = await f.evaluate(() => {
        const b = document.body;
        const t = b ? b.innerText.replace(/\s+/g, ' ').slice(0, 200) : '';
        const els = Array.from(document.querySelectorAll('a,button,[role="button"],[class*="zsiq"],[class*="chat"]')).map(e => (e.textContent||'').trim() + '::' + e.className).filter(s=>s).slice(0,15);
        return { t, els };
      });
      log('FRAME url=' + f.url().slice(0,120));
      log('  text=' + info.t);
      log('  els=' + JSON.stringify(info.els));
    } catch (e) { log('FRAME err ' + e.message); }
  }
  log('DONE');
})();
