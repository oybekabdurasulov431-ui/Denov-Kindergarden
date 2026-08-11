const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\edge-profile4';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\do-captcha.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.writeFileSync(LOG, 'CAPTCHA START\n');
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: false, userDataDir: PROFILE,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  try {
    await page.goto('https://cloud.digitalocean.com/security/registrations', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(10000);
    log('url: ' + page.url());

    const frames = page.frames();
    log('frames: ' + frames.map(f => f.url()).join(' || '));

    const cfFrame = frames.find(f => f.url().includes('challenges.cloudflare.com') || f.url().includes('cf-chl') || f.url().includes('turnstile'));
    log('cfFrame: ' + (cfFrame ? cfFrame.url() : 'none'));

    if (cfFrame) {
      const dump = await cfFrame.evaluate(() => {
        const html = document.body ? document.body.innerHTML.slice(0, 3000) : 'no body';
        const inputs = Array.from(document.querySelectorAll('input,button,div[role],a')).map(e => ({
          tag: e.tagName, role: e.getAttribute('role'), cls: e.className,
          aria: e.getAttribute('aria-checked'), t: (e.textContent || '').trim().slice(0, 40)
        })).slice(0, 40);
        return { html, inputs };
      });
      log('CF HTML: ' + dump.html.replace(/</g, '\n<').slice(0, 2000));
      log('CF inputs: ' + JSON.stringify(dump.inputs));
    } else {
      log('no cf frame found — dumping page html');
      const html = await page.evaluate(() => document.body.innerHTML.slice(0, 2000));
      log(html.replace(/</g, '\n<').slice(0, 2000));
    }
    await browser.close();
  } catch (e) {
    log('FATAL: ' + (e.stack || e.message));
    await browser.close();
  }
})();
