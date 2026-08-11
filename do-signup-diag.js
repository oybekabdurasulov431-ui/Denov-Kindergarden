const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\edge-profile4';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\do-signup-diag.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.writeFileSync(LOG, 'DIAG START\n');
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  const dump = async (tag) => {
    log('--- ' + tag + ' ---');
    log('pages: ' + (await browser.pages()).length);
    log('url: ' + page.url());
    const body = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 1000) : '');
    log('text: ' + body.replace(/\n+/g, ' | '));
    const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button,a')).map(b => (b.textContent || '').trim()).filter(Boolean).slice(0, 30));
    log('buttons: ' + JSON.stringify(btns));
  };

  try {
    await page.goto('https://cloud.digitalocean.com/registrations/new', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    await dump('initial');

    // click sign up with email by finding exact button
    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button,a,span,div'));
      const el = all.find(e => { const t = (e.textContent || '').trim(); return t === 'Sign Up with Email'; });
      if (el) { el.scrollIntoView({ block: 'center' }); el.click(); return el.tagName + '.' + el.className; }
      return null;
    });
    log('clicked elem: ' + clicked);
    await sleep(8000);
    await dump('after click');
    log('pages now: ' + (await browser.pages()).map(p => p.url()).join(' ; '));

    await browser.close();
  } catch (e) {
    log('FATAL: ' + (e.stack || e.message));
    await browser.close();
  }
})();
