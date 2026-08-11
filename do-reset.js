const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\edge-profile3';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\do-reset.log';
const GEMAIL = 'oybekabdurasulovv@gmail.com';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.writeFileSync(LOG, 'RESET START\n');
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  try {
    log('Open DO login');
    await page.goto('https://cloud.digitalocean.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);

    // click Forgot Password link
    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('a,button,span,div'));
      const el = all.find(e => (e.textContent || '').trim().toLowerCase().includes('forgot password'));
      if (el) { el.scrollIntoView({ block: 'center' }); el.click(); return true; }
      return false;
    });
    log('Forgot Password clicked: ' + clicked);
    await sleep(6000);
    log('URL: ' + page.url());

    // type email
    const typed = await page.evaluate((em) => {
      const inp = document.querySelector('input[type="email"], input[name="email"], #email');
      if (inp) { inp.focus(); inp.value = ''; return true; }
      return false;
    }, GEMAIL);
    log('email field found: ' + typed);
    if (typed) {
      await page.type('input[type="email"], input[name="email"], #email', GEMAIL, { delay: 40 });
      await sleep(800);
      // click submit button
      const sub = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => /(send|reset|submit|confirm|recover)/i.test(x.textContent || ''));
        if (b) { b.click(); return b.textContent.trim(); }
        return null;
      });
      log('submit clicked: ' + sub);
    }
    await sleep(8000);
    const body = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 800) : '');
    log('PAGE AFTER:\n' + body);
    log('URL after: ' + page.url());
    log('WAIT — check email. Link will arrive at ' + GEMAIL);
    await sleep(120000);
    await browser.close();
  } catch (e) {
    log('FATAL: ' + (e.stack || e.message));
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\shots\\do3-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
