const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-livechat.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--remote-debugging-port=9222']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  try {
    await page.goto('https://www.namecheap.com/support/live-chat/', { waitUntil: 'networkidle2', timeout: 90000 });
    await sleep(8000);
    const info = await page.evaluate(() => {
      const t = document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 500) : '';
      const iframes = Array.from(document.querySelectorAll('iframe')).map(f => f.src);
      return { t, iframes };
    });
    log('PAGE: ' + info.t);
    log('IFRAMES: ' + JSON.stringify(info.iframes));
    log('CHAT_OPEN — Live Chat ochiq. User endi yozishi mumkin.');
    for (let i = 0; i < 180; i++) {
      await sleep(30000);
      try {
        const u = page.url();
        const alive = await page.evaluate(() => !!document.body);
        log('HEARTBEAT ' + i + ' alive=' + alive + ' url=' + u);
      } catch (e) { log('HEARTBEAT ' + i + ' BROWSER_DIED: ' + e.message); break; }
    }
  } catch (e) {
    log('ERROR: ' + e.message);
  }
  log('DONE');
  await browser.close();
})();
