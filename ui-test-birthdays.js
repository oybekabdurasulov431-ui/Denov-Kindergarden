const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOG = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\ui-test-birthdays.log';
const fs = require('fs');
const log = m => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.writeFileSync(LOG, 'START\n');
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, userDataDir: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\ui-test-profile', args: ['--no-sandbox', '--window-size=1366,900'] });
  log('launched');
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 200)); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + String(e.message).slice(0, 200)));

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 45000 });
  await page.type('#loginUser', 'mexriddin');
  await page.type('#loginPass', 'mexriddin123');
  await page.click('#loginBtn');
  await sleep(5000);

  log('URL after login: ' + page.url().slice(0, 80));
  const dashHasBirthday = await page.evaluate(() => !!document.querySelector('.birthday-list, .birthday-item'));
  log('Dashboard birthday widget present: ' + dashHasBirthday);

  await page.evaluate(() => window.go('birthdays'));
  await sleep(4000);
  const pageTitle = await page.evaluate(() => document.querySelector('#pageTitle')?.textContent || '');
  const bdCount = await page.evaluate(() => document.querySelectorAll('.birthday-item').length);
  const hasToday = await page.evaluate(() => !!document.querySelector('.birthday-item .badge.green'));
  log('Page title: ' + pageTitle);
  log('birthday-item count: ' + bdCount);
  log('has "Bugun" badge: ' + hasToday);
  const bodyHead = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 250));
  log('BODY: ' + bodyHead);
  log('ERRORS: ' + JSON.stringify(errors));
  log('DONE');
  await browser.close();
})();
