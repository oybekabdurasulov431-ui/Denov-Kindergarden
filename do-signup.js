const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\edge-profile4';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\do-signup.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const EMAIL = 'oybekabdurasulovv+do@gmail.com';
const PASS = 'Bogcha2026#Secure';

(async () => {
  fs.writeFileSync(LOG, 'SIGNUP FLOW START\n');
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  const clickText = async (needle) => {
    const ok = await page.evaluate((n) => {
      const all = Array.from(document.querySelectorAll('button,a,span,div'));
      const el = all.find(e => { const t = (e.textContent || '').trim(); return t === n; }) ||
                 all.find(e => { const t = (e.textContent || '').trim(); return t.includes(n) && t.length < n.length + 30; });
      if (el) { el.scrollIntoView({ block: 'center' }); el.click(); return true; }
      return false;
    }, needle);
    log('click [' + needle + '] => ' + ok);
    await sleep(2500);
    return ok;
  };

  try {
    log('1) signup page');
    await page.goto('https://cloud.digitalocean.com/registrations/new', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);

    log('2) check terms checkbox');
    const cb = await page.evaluate(() => {
      const c = document.querySelector('input[type="checkbox"]');
      if (c) { if (!c.checked) c.click(); return c.checked; }
      return null;
    });
    log('checkbox checked: ' + cb);
    await sleep(1500);

    log('3) click Sign Up with Email');
    await clickText('Sign Up with Email');
    await sleep(5000);
    log('URL: ' + page.url());

    const fields = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map(i => ({ id: i.id, name: i.name, type: i.type })));
    log('INPUTS: ' + JSON.stringify(fields));

    const nameSel = 'input#name, input[name="name"]';
    const emailSel = 'input#email, input[type="email"], input[name="email"]';
    const passSel = 'input#password, input[type="password"]';
    await page.waitForSelector(emailSel, { timeout: 15000 });
    const nameVal = await page.evaluate((s) => { const el = document.querySelector(s); return el ? el.value : null; }, nameSel);
    if (!nameVal) { await page.type(nameSel, 'Oybek Abdurasulov', { delay: 30 }); }
    await page.type(emailSel, EMAIL, { delay: 30 });
    await page.type(passSel, PASS, { delay: 30 });
    log('4) filled name+email+password');

    await clickText('Sign Up');
    await sleep(8000);
    const body = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 1200) : '');
    log('5) PAGE AFTER:\n' + body);
    log('URL: ' + page.url());
    log('CHECK_GMAIL: verification email arrives at ' + EMAIL);
    log('PASSWORD_SET: ' + PASS);
    await browser.close();
  } catch (e) {
    log('FATAL: ' + (e.stack || e.message));
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\shots\\signup-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
