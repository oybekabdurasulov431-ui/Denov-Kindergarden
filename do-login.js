const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SHOTS = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\shots\\do-';
const EMAIL = 'oybekabdurasulovv@gmail.com';
const PASS = '977853808m$';

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: false,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  const dump = async (tag) => {
    const url = page.url();
    const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 400).replace(/\n+/g, ' | ') : '(no body)');
    console.log('### ' + tag + ' | ' + url + ' | ' + text);
  };

  try {
    await page.goto('https://cloud.digitalocean.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(5000);

    try {
      const btn = await page.$('button:has-text("AGREE")');
      if (btn) { await btn.click(); await sleep(1500); }
    } catch (e) {}

    await page.waitForSelector('#email', { timeout: 30000 });
    await page.type('#email', EMAIL, { delay: 60 });
    await page.type('#password', PASS, { delay: 60 });
    await sleep(500);
    await page.keyboard.press('Enter');
    await sleep(10000);
    await dump('after-submit');

    // wait a bit more for possible cloudflare/turnstile
    for (let i = 0; i < 6; i++) {
      await sleep(5000);
      const url = page.url();
      const hasLogin = await page.evaluate(() => document.body.innerText.includes('Log in to your account'));
      console.log('poll ' + i + ' url=' + url + ' stillOnLogin=' + hasLogin);
      if (!url.includes('login') && !hasLogin) break;
    }
    await dump('final');
    await browser.close();
  } catch (e) {
    console.log('ERROR:', e.message);
    try { await dump('error'); } catch (e2) {}
    await browser.close();
  }
})();
