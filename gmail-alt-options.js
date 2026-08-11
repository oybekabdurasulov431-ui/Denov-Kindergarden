const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-alt-options.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized', '--no-first-run', '--profile-directory=Profile 1']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  const dump = async (tag) => {
    try {
      const url = page.url();
      const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 600) : '');
      log(tag + ' | ' + url + ' | ' + t);
    } catch (e) { log(tag + ' err ' + e.message); }
  };
  const clickText = async (txt) => {
    return await page.evaluate((txt) => {
      const btns = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      for (const b of btns) {
        const t = (b.textContent || '').trim();
        if (t.includes(txt)) { b.click(); return t; }
      }
      return null;
    }, txt);
  };
  try {
    await page.goto('https://accounts.google.com/signin/recovery', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    const email = await page.$('input[type="email"], input[name="identifier"], #identifierId');
    if (email) { await email.click(); await email.type('oybekabdurasulovv@gmail.com', { delay: 30 }); await sleep(400); await page.keyboard.press('Enter'); }
    await sleep(6000);
    for (let n = 0; n < 6; n++) {
      const c = await clickText('Другой способ');
      if (!c) break;
      await sleep(5000);
    }
    await dump('device-page');
    const c2 = await clickText('У меня нет доступа к телефону');
    log('clicked no-access: ' + c2);
    await sleep(6000);
    await dump('after-no-access');
    const links = await page.evaluate(() => Array.from(document.querySelectorAll('a, button, [role="button"]')).map(a => (a.textContent || '').trim()).filter(Boolean));
    log('ALL: ' + JSON.stringify(links.slice(0, 30)));
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-alt.png' });
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-alt.png' }); } catch (e2) {}
    await browser.close();
  }
})();
