const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-cp.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  let browser;
  try { browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null }); }
  catch (e) {
    browser = await puppeteer.launch({
      executablePath: CHROME, headless: false, userDataDir: PROFILE,
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1', '--remote-debugging-port=9223']
    });
  }
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  try {
    log('goto zomro cp');
    await page.goto('https://cp.zomro.com', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => log('goto err: ' + e.message));
    await sleep(8000);
    log('URL: ' + page.url());
    const snap = await page.evaluate(() => {
      const t = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 400);
      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({ name: i.name, type: i.type, ph: i.placeholder }));
      return { t, inputs };
    });
    log('PAGE: ' + snap.t);
    log('INPUTS: ' + JSON.stringify(snap.inputs));
    // login
    const email = await page.$('input[name="login"], input[type="email"], input[name="email"]');
    const pass = await page.$('input[name="password"], input[type="password"]');
    log('emailField: ' + !!email + ' passField: ' + !!pass);
    if (email && pass) {
      await email.click();
      await email.type('oybekabdurasulov431@gmail.com', { delay: 20 });
      await pass.click();
      await pass.type('Mm977853808m$', { delay: 20 });
      await sleep(500);
      // submit
      const sub = await page.evaluate(() => {
        const b = document.querySelector('button[type="submit"], input[type="submit"]');
        if (b) { b.click(); return 'clicked'; }
        return 'no submit';
      });
      log('SUBMIT: ' + sub);
      await sleep(10000);
      log('URL after: ' + page.url());
      const t2 = await page.evaluate(() => (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 500));
      log('AFTER_LOGIN: ' + t2);
      await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\zomro-cp.png' });
    } else {
      log('no login fields found');
    }
    log('DONE');
  } catch (e) {
    log('ERROR: ' + e.message);
  }
})();
