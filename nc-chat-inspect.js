const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-chat-inspect.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null });
  const pages = await browser.pages();
  log('pages: ' + pages.length);
  const page = pages[pages.length - 1];
  log('url=' + page.url());
  const frames = page.frames();
  log('frames: ' + frames.length);
  for (const f of frames) {
    try {
      const t = await f.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 300) : '');
      log('FRAME url=' + f.url() + ' | ' + t);
    } catch (e) { log('FRAME err url=' + f.url() + ' ' + e.message); }
  }
  const els = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a, button, div').forEach(el => {
      const t = (el.textContent || '').trim();
      if (/Chat|Live|Leave a message|Chat with|Start chat/i.test(t) && t.length < 80) out.push(t);
    });
    return out.slice(0, 20);
  });
  log('CHAT_ELEMENTS: ' + JSON.stringify(els));
  log('DONE');
})();
