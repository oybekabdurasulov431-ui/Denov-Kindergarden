const puppeteer = require('puppeteer-core');
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-ticket-article.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  const r = await page.evaluate(() => {
    const article = document.querySelector('.article-content, #bodySection, article, .kb-article, [class*="article"]');
    const t = (article ? article.innerText : document.body.innerText).replace(/\s+/g, ' ');
    const links = Array.from(document.querySelectorAll('a[href*="mailto:"], a')).map(a => ({ t: (a.textContent||'').trim().slice(0,60), h: a.href })).filter(x => /mailto|ticket|support/i.test(x.h));
    return { t: t.slice(0, 1500), links: links.slice(0, 15) };
  });
  log('ARTICLE: ' + r.t);
  log('LINKS: ' + JSON.stringify(r.links));
  log('DONE');
})();
