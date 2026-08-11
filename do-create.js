const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\edge-profile';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\do-create.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: false,
    userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  const isLoggedIn = async () => {
    try {
      const url = page.url();
      if (!url.includes('digitalocean')) return false;
      const hasNav = await page.evaluate(() => {
        const t = document.body ? document.body.innerText : '';
        return t.includes('Create') && (t.includes('Droplets') || t.includes('Projects'));
      });
      return hasNav;
    } catch (e) { return false; }
  };

  try {
    log('Open DO login page');
    await page.goto('https://cloud.digitalocean.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    log('WAIT_FOR_USER_LOGIN — user should log in with Google in the open window');

    let loggedIn = false;
    for (let i = 0; i < 180; i++) {
      await sleep(5000);
      if (await isLoggedIn()) { loggedIn = true; log('LOGIN OK after ' + (i + 1) * 5 + 's url=' + page.url()); break; }
      if (i % 6 === 0) log('poll ' + i + ' url=' + page.url());
    }
    if (!loggedIn) { log('TIMEOUT waiting for login'); await browser.close(); process.exit(2); }

    log('Navigate to droplet creation');
    await page.goto('https://cloud.digitalocean.com/droplets/new', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(8000);

    const txt = async () => page.evaluate(() => document.body.innerText.slice(0, 3000));
    const clickByText = async (needle, opts = {}) => {
      const clicked = await page.evaluate((n, exact) => {
        const all = Array.from(document.querySelectorAll('div,button,label,span,a,li,section'));
        const el = all.find(e => {
          const t = (e.textContent || '').trim();
          if (!t) return false;
          return exact ? t === n : (t.includes(n) && t.length < n.length + 80 && !e.querySelector('*') || (t === n));
        });
        if (el) { el.scrollIntoView({ block: 'center' }); el.click(); return true; }
        return false;
      }, needle, !!opts.exact);
      if (!clicked) log('  !! clickByText NOT FOUND: ' + needle);
      else log('  clicked: ' + needle);
      await sleep(2500);
      return clicked;
    };

    log('--- IMAGE ---');
    await clickByText('Ubuntu 24.04 (LTS)');

    log('--- REGION ---');
    await clickByText('Frankfurt');

    log('--- PLAN: Regular ---');
    await clickByText('Regular');
    await clickByText('$6/mo');

    log('--- AUTH: One-time password ---');
    await clickByText('One-time password');

    log('--- CREATE ---');
    const created = await clickByText('Create Droplet', { exact: true });

    log('WAIT for droplet creation...');
    await sleep(30000);

    log('Check status');
    await page.goto('https://cloud.digitalocean.com/droplets', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(10000);
    const body = await txt();
    log('DROPLETS PAGE TEXT:\n' + body.slice(0, 1500));

    const ip = await page.evaluate(() => {
      const t = document.body.innerText;
      const m = t.match(/(?:IPv4|IP Address)\s*[:|\n]?\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      return m ? m[1] : null;
    });
    log('FOUND IP: ' + ip);
    if (ip) require('fs').appendFileSync('C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\droplet-ip.txt', ip + '\n');
    log('DONE');
    await browser.close();
  } catch (e) {
    log('ERROR: ' + e.message);
    try { await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\shots\\do-error.png' }); } catch (e2) {}
    await browser.close();
  }
})();
