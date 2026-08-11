const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  const check = (name, cond) => console.log((cond ? 'PASS ' : 'FAIL ') + name);

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.type('#loginUser', 'mexriddin');
  await page.type('#loginPass', '000000');
  await page.click('#loginBtn');
  await page.waitForFunction(() => state && state.user && state.user.role === 'admin', { timeout: 8000 });
  await page.waitForSelector('.stat-card', { visible: true, timeout: 8000 });
  check('dashboard on mobile', await page.$('.stat-card') !== null);

  const statsCols = await page.evaluate(() => {
    const card = document.querySelector('.stat-card');
    return getComputedStyle(card.parentElement).gridTemplateColumns.split(' ').length;
  });
  check('stats 2 cols on mobile', statsCols === 2);

  const sidebarPos = await page.evaluate(() => getComputedStyle(document.querySelector('#sidebar')).transform);
  check('sidebar hidden on mobile', sidebarPos !== 'none');

  await page.click('#sidebarToggle');
  await new Promise(r => setTimeout(r, 400));
  check('sidebar opens', await page.evaluate(() => document.querySelector('#sidebar').classList.contains('open')));

  // nav to a page and back
  await page.evaluate(() => go('payments'));
  await new Promise(r => setTimeout(r, 900));
  check('payments on mobile', await page.evaluate(() => document.querySelector('#content').innerText.includes('Status')));

  await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\shots\\mobile.png' });

  // tablet
  await page.setViewport({ width: 820, height: 1180, isMobile: false, hasTouch: true });
  await page.evaluate(() => go('dashboard'));
  await new Promise(r => setTimeout(r, 900));
  check('dashboard on tablet', await page.$('.kpi-banner') !== null);
  await page.screenshot({ path: 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\shots\\tablet.png' });

  console.log('=== Mobile errors: ' + errors.length + ' ===');
  errors.slice(0, 10).forEach(e => console.log('  ' + e));
  await browser.close();
})();
