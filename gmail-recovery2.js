const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\nc-real-copy';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-recovery2.log';
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
      const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').slice(0, 400) : '');
      log(tag + ' | ' + url + ' | ' + t);
    } catch (e) { log(tag + ' err ' + e.message); }
  };
  const clickByText = async (labels) => {
    return await page.evaluate((labels) => {
      const btns = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="button"]'));
      for (const b of btns) {
        const t = (b.textContent || b.value || '').trim();
        if (labels.some(l => t.includes(l))) { b.click(); return t; }
      }
      return null;
    }, labels);
  };
  try {
    await page.goto('https://accounts.google.com/signin/recovery', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    const email = await page.$('input[type="email"], input[name="identifier"], #identifierId');
    if (email) {
      await email.click();
      await email.type('oybekabdurasulovv@gmail.com', { delay: 30 });
      await sleep(400);
      await page.keyboard.press('Enter');
      log('email entered');
      await sleep(6000);
    }
    await dump('step1');
    // click "Try another way" repeatedly
    for (let n = 0; n < 6; n++) {
      const clicked = await clickByText(['Другой способ', 'Try another way', 'Another way', 'Use another option']);
      log('click ' + n + ': ' + (clicked || 'none'));
      if (!clicked) break;
      await sleep(5000);
    }
    await dump('after-another');
    await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-recovery2.png' });
    log('WAIT_FOR_USER — telefon orqali kodni kiritish uchun (Chrome oynasida) yoki menga SMS kodni yozing. 8 daqiqa kutiladi...');
    for (let i = 0; i < 96; i++) {
      await sleep(5000);
      const url = page.url();
      const t = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ') : '').catch(() => '');
      if (url.includes('mail.google.com') || /Inbox|password\s*changed|success/i.test(t)) {
        log('RECOVERY COMPLETE url=' + url);
        break;
      }
      if (i % 24 === 23) await dump('periodic ' + i);
    }
    await dump('final');
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\gmail-recovery2.png' }); } catch (e2) {}
    await browser.close();
  }
})();
