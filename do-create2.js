const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\edge-profile2';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\do-create2.log';
const GEMAIL = 'oybekabdurasulovv@gmail.com';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.writeFileSync(LOG, 'START2\n');
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  page.on('pageerror', e => log('PAGEERR: ' + e.message));

  const isConsole = async () => {
    try {
      const url = page.url();
      if (!url.includes('digitalocean')) return false;
      const t = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 2000) : '');
      return t.includes('Create') && (t.includes('Droplets') || t.includes('Projects') || t.includes('Get started'));
    } catch (e) { return false; }
  };

  const clickByText = async (needle) => {
    try {
      const ok = await page.evaluate((n) => {
        const all = Array.from(document.querySelectorAll('button,a,div,span,li'));
        const el = all.find(e => { const t = (e.textContent || '').trim(); return t === n; });
        if (el) { el.scrollIntoView({ block: 'center' }); el.click(); return true; }
        const el2 = all.find(e => { const t = (e.textContent || '').trim(); return t.includes(n) && t.length < n.length + 40; });
        if (el2) { el2.scrollIntoView({ block: 'center' }); el2.click(); return true; }
        return false;
      }, needle);
      log('clickByText ' + needle + ' => ' + ok);
      await sleep(2500);
      return ok;
    } catch (e) { log('click ERR ' + needle + ': ' + e.message); return false; }
  };

  try {
    log('1) Open DO login');
    await page.goto('https://cloud.digitalocean.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    try { await clickByText('AGREE & PROCEED'); } catch (e) {}

    log('2) Click Sign in with Google');
    await clickByText('Sign in with Google');

    await sleep(6000);
    log('3) URL now: ' + page.url());

    const typed = await page.evaluate((em) => {
      const inp = document.querySelector('#identifierId') || document.querySelector('input[type="email"]');
      if (inp) { inp.focus(); inp.value = ''; }
      return !!inp;
    }, GEMAIL);
    if (typed) {
      await page.type('#identifierId', GEMAIL, { delay: 40 });
      await sleep(800);
      await clickByText('Next');
      log('4) Google email typed + Next clicked');
    } else {
      log('4) No email field found — user must type it');
    }

    log('WAIT_FOR_USER: type your Google PASSWORD in the open window and any code if asked');
    let ok = false;
    for (let i = 0; i < 180; i++) {
      await sleep(5000);
      if (await isConsole()) { ok = true; log('LOGIN OK after ' + ((i + 1) * 5) + 's url=' + page.url()); break; }
      if (i % 12 === 0) log('poll ' + i + ' url=' + page.url());
    }
    if (!ok) { log('TIMEOUT — login not done'); await browser.close(); process.exit(2); }

    log('5) Creating droplet...');
    await page.goto('https://cloud.digitalocean.com/droplets/new', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(9000);

    await clickByText('Ubuntu 24.04 (LTS)');
    await clickByText('Frankfurt');
    await clickByText('Regular');
    await sleep(1500);
    await clickByText('$6/mo');
    await clickByText('One-time password');
    await sleep(1500);
    const created = await clickByText('Create Droplet');

    log('6) Waiting 40s for droplet creation...');
    await sleep(40000);

    await page.goto('https://cloud.digitalocean.com/droplets', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(12000);
    const body = await page.evaluate(() => document.body.innerText.slice(0, 2000));
    log('DROPLETS TEXT:\n' + body);
    const ip = await page.evaluate(() => {
      const t = document.body.innerText;
      const m = t.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      return m ? m[1] : null;
    });
    log('IP: ' + ip);
    if (ip) fs.writeFileSync('C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\droplet-ip.txt', ip + '\n');
    log('DONE');
    await sleep(5000);
    await browser.close();
  } catch (e) {
    log('FATAL: ' + e.stack || e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\shots\\do2-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
