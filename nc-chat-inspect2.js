const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-chat-inspect2.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null });
  const pages = await browser.pages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    log('page' + i + ' url=' + p.url());
  }
  const page = pages[0];
  await page.bringToFront();
  const frames = page.frames();
  log('frames: ' + frames.length);
  for (const f of frames) {
    try {
      const t = await f.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 200) : '');
      log('FRAME url=' + f.url().slice(0, 100) + ' | ' + t);
    } catch (e) { log('FRAME err ' + e.message); }
  }
  const els = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a, button, [role="button"], [class*="chat"], [class*="zsiq"]').forEach(el => {
      const t = (el.textContent || '').trim();
      if (t && t.length < 60 && /chat|live|message|start|leave/i.test(t + ' ' + el.className)) out.push(t + ' :: ' + el.className);
    });
    return out.slice(0, 25);
  });
  log('CHAT_ELEMENTS: ' + JSON.stringify(els));
  log('DONE');
})();
