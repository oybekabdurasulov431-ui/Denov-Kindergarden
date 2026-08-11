const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\edge-profile4';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\do-security2.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.writeFileSync(LOG, 'SECURITY2 START\n');
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  try {
    await page.goto('https://cloud.digitalocean.com/security/registrations', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(8000);
    log('url: ' + page.url());
    let resolved = false;
    for (let i = 0; i < 120; i++) {
      await sleep(5000);
      const url = page.url();
      const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 300).replace(/\n+/g, ' | ') : '');
      if (i % 3 === 0) log('poll ' + i + ' url=' + url + ' | ' + text);
      if (!url.includes('/security/')) { resolved = true; log('RESOLVED url=' + url + ' | ' + text); break; }
    }
    const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 800).replace(/\n+/g, ' | ') : '');
    log('FINAL url=' + page.url() + ' | ' + text);
    await sleep(5000);
    await browser.close();
  } catch (e) {
    log('FATAL: ' + (e.stack || e.message));
    await browser.close();
  }
})();
