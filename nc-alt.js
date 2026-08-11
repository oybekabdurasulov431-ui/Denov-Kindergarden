const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-alt.log';
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
  const dump = async () => {
    const url = page.url();
    const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 700) : '');
    log('| ' + url + ' | ' + t);
  };
  // click "Didn't get the code?"
  const clicked = await page.evaluate(() => {
    const as = Array.from(document.querySelectorAll('a, button'));
    for (const a of as) {
      const t = (a.textContent || '').trim();
      if (/Didn't get the code|Не получили код|Resend|Отправить ещё раз/i.test(t)) { a.click(); return t; }
    }
    return null;
  });
  log('clicked: ' + clicked);
  await sleep(5000);
  await dump();
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a, button')).map(a => (a.textContent || '').trim()).filter(Boolean).slice(0, 40));
  log('ALL: ' + JSON.stringify(links));
  log('DONE');
})();
