const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-ticket-form.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1', '--remote-debugging-port=9223']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  try {
    await page.goto('https://www.namecheap.com/support/ticket/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(8000);
    log('URL: ' + page.url());
    const r = await page.evaluate(() => {
      const body = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 500);
      const inputs = Array.from(document.querySelectorAll('input, select, textarea, button')).map(e => ({ tag: e.tagName, type: e.type || '', name: e.name || '', id: e.id || '', ph: e.placeholder || '', txt: (e.textContent || '').trim().slice(0, 40) }));
      return { body, inputs };
    });
    log('BODY: ' + r.body);
    log('INPUTS: ' + JSON.stringify(r.inputs.slice(0, 40)));
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-ticket-form.png' });
    log('DONE');
    for (let i = 0; i < 120; i++) await sleep(30000);
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    await browser.close();
  }
})();
