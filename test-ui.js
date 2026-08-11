const puppeteer = require('puppeteer-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:3000';
const shotDir = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\shots';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: 'new', args: ['--window-size=1440,900', '--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('401') && !m.text().includes('403')) errors.push('CONSOLE: ' + m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  const check = (name, cond) => console.log((cond ? 'PASS ' : 'FAIL ') + name);

  /* ===== ADMIN FLOW ===== */
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#loginScreen', { visible: true });
  await page.type('#loginUser', 'mehriddin0838');
  await page.type('#loginPass', '977850838');
  await page.click('#loginBtn');
  await page.waitForFunction(() => state && state.user && state.user.role === 'admin', { timeout: 8000 });
  await page.waitForSelector('.stat-card', { visible: true, timeout: 8000 });
  check('dashboard rendered', await page.$('.stat-card') !== null);
  check('nav items admin count', (await page.$$('.nav-item')).length === 16);
  const dashText = await page.evaluate(() => document.querySelector('#content').innerText);
  check('expense card on dashboard', dashText.includes('Bu oy xarajat'));
  check('profit shown', dashText.includes('Sof foyda'));
  await page.screenshot({ path: shotDir + '\\dashboard.png' });

  const pages = ['children', 'parents', 'groups', 'attendance', 'payments', 'expenses', 'meals', 'reports', 'teachers', 'notify', 'requests', 'backup', 'audit', 'users', 'settings'];
  for (const p of pages) {
    await page.evaluate(id => go(id), p);
    await new Promise(r => setTimeout(r, 900));
    const has = await page.evaluate(() => {
      const c = document.querySelector('#content').innerText;
      return c.length > 30 && !c.includes('Yuklanmoqda');
    });
    check('page ' + p + ' rendered', has);
    await page.screenshot({ path: shotDir + '\\' + p + '.png' });
  }

  // expenses page specifics
  await page.evaluate(() => go('expenses'));
  await new Promise(r => setTimeout(r, 900));
  check('expenses categories donut', await page.$('.donut') !== null);
  check('expenses rows', await page.$$('#expTbody tr').then(l => l.length >= 3));

  // attendance AUTO-SAVE: click status, must persist without save button
  await page.evaluate(() => go('attendance'));
  await new Promise(r => setTimeout(r, 900));
  const firstChild = await page.evaluate(() => {
    const row = document.querySelector('#attList .att-row');
    return row ? row.dataset.child : null;
  });
  const todayStr = new Date().toISOString().slice(0, 10);
  await page.evaluate(() => {
    const b = document.querySelector('#attList .att-row .att-switch button[data-s="absent"]');
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1300));
  const saveStateText = await page.evaluate(() => {
    const el = document.querySelector('#attSaveState');
    return el ? el.textContent : '';
  });
  check('attendance auto-saved indicator', saveStateText.includes('Saqlandi'), saveStateText);
  const savedStatus = await page.evaluate(async (child, date) => {
    const res = await fetch('/api/attendance?date=' + date);
    const data = await res.json();
    return data.map && data.map[child] ? data.map[child] : null;
  }, firstChild, todayStr);
  check('attendance persisted to DB', savedStatus === 'absent', savedStatus);
  const attRows = await page.$$('#attList .att-row');
  check('attendance list renders children', attRows.length >= 5);
  check('attendance no save button (auto)', await page.$('#attSave') === null);
  await page.screenshot({ path: shotDir + '\\attendance-auto.png' });

  // settings DANGER ZONE
  await page.evaluate(() => go('settings'));
  await new Promise(r => setTimeout(r, 900));
  check('settings danger zone visible', await page.evaluate(() => document.body.innerText.includes('Xavfli hudud')));
  await page.evaluate(() => resetConfirm('attendance', 'Davomat yozuvlari'));
  await new Promise(r => setTimeout(r, 400));
  check('reset modal opens with pw field', await page.$('#resetPw') !== null);
  await page.type('#resetPw', 'wrongpw');
  await page.click('#resetDoBtn');
  await new Promise(r => setTimeout(r, 900));
  check('wrong pw keeps modal open', await page.$('#resetPw') !== null);
  await page.evaluate(() => closeModal());
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: shotDir + '\\settings-danger.png' });

  // search works on teachers page
  await page.evaluate(() => go('teachers'));
  await new Promise(r => setTimeout(r, 900));
  await page.type('#teacherSearch', 'Nargiza');
  await new Promise(r => setTimeout(r, 300));
  const tRows = await page.evaluate(() => [...document.querySelectorAll('#content tbody tr')].filter(tr => tr.style.display !== 'none').length);
  check('teachers search filters rows', tRows === 1);

  // parents page
  await page.evaluate(() => go('parents'));
  await new Promise(r => setTimeout(r, 900));
  check('parents page renders', await page.evaluate(() => document.body.innerText.includes('Yangi ota-ona')));
  await page.screenshot({ path: shotDir + '\\parents.png' });

  // create teacher login via UI (username = teacher phone digits)
  await page.evaluate(() => go('teachers'));
  await new Promise(r => setTimeout(r, 900));
  await page.evaluate(() => teacherLogin(1, 'Nargiza Karimova', '+998901112233'));
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => { document.querySelector('#tl_pass').value = 'tarbiyachi123'; });
  await page.click('#tlSaveBtn');
  await new Promise(r => setTimeout(r, 900));
  check('teacher account created', await page.evaluate(() => document.body.innerText.includes('✅ 998901112233')));
  await page.screenshot({ path: shotDir + '\\teachers-login.png' });

  // add expense via modal
  await page.evaluate(() => expForm());
  await new Promise(r => setTimeout(r, 500));
  await page.type('#x_name', 'UI Test Xarajat');
  await page.evaluate(() => { document.querySelector('#x_amount').value = 77000; });
  await page.click('#saveExpBtn');
  await new Promise(r => setTimeout(r, 700));
  const expText = await page.evaluate(() => document.querySelector('#content').innerText);
  check('expense added via UI', expText.includes('UI Test Xarajat'));

  // reports page specifics
  await page.evaluate(() => go('reports'));
  await new Promise(r => setTimeout(r, 900));
  const repText = await page.evaluate(() => document.querySelector('#content').innerText);
  check('report profit card', repText.includes('Sof foyda'));
  check('report attendance card', repText.includes('Davomat'));
  await page.screenshot({ path: shotDir + '\\reports.png' });

  // payments: new payment with child dropdown
  await page.evaluate(() => { payState.month = new Date().toISOString().slice(0, 7); go('payments'); });
  await new Promise(r => setTimeout(r, 900));
  await page.evaluate(() => payForm(null));
  await new Promise(r => setTimeout(r, 600));
  check('payment child dropdown', await page.$('#pay_child') !== null);
  check('dropdown has children', await page.evaluate(() => document.querySelector('#pay_child').options.length >= 3));
  await page.evaluate(() => closeModal());

  // dark mode
  await page.click('#themeToggle');
  check('dark mode', await page.evaluate(() => document.documentElement.getAttribute('data-theme')) === 'dark');
  await page.screenshot({ path: shotDir + '\\dashboard-dark.png' });

  // logout
  await page.click('#logoutBtn');
  await page.waitForSelector('#loginScreen', { visible: true });
  check('admin logout', true);

  /* ===== OPERATOR FLOW ===== */
  await page.type('#loginUser', 'operator');
  await page.type('#loginPass', 'operator123');
  await page.click('#loginBtn');
  await page.waitForFunction(() => state && state.user && state.user.role === 'operator', { timeout: 8000 });
  await page.waitForSelector('.stat-card', { visible: true, timeout: 8000 });
  check('operator dashboard rendered', await page.$('.stat-card') !== null);

  const navLabels = await page.evaluate(() => [...document.querySelectorAll('.nav-item')].map(n => n.textContent.trim()));
  check('operator has no users nav', !navLabels.some(l => l.includes('Foydalanuvchilar')));
  check('operator has no settings nav', !navLabels.some(l => l.includes('Sozlamalar')));
  check('operator has no teachers nav', !navLabels.some(l => l.includes('Tarbiyachilar')));
  check('operator sees expenses', navLabels.some(l => l.includes('Xarajatlar')));
  check('operator sees reports', navLabels.some(l => l.includes('Hisobot')));
  check('operator nav count', navLabels.length === 9);

  // operator adds payment with dropdown
  await page.evaluate(() => go('payments'));
  await new Promise(r => setTimeout(r, 900));
  await page.evaluate(() => payForm(null));
  await new Promise(r => setTimeout(r, 600));
  check('operator payment dropdown', await page.$('#pay_child') !== null);
  await page.screenshot({ path: shotDir + '\\operator-payments.png' });
  await page.evaluate(() => closeModal());
  await new Promise(r => setTimeout(r, 300));

  // operator cannot access admin page directly
  await page.evaluate(() => go('users'));
  await new Promise(r => setTimeout(r, 900));
  check('operator blocked from users -> dashboard', await page.evaluate(() => document.querySelector('#content').innerText.includes('Xush kelibsiz')));

  // operator dashboard
  await page.evaluate(() => go('dashboard'));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: shotDir + '\\operator-dashboard.png' });

  await page.click('#logoutBtn');
  await page.waitForSelector('#loginScreen', { visible: true });
  check('operator logout', true);

  /* ===== TEACHER FLOW ===== */
  await page.type('#loginUser', '998901112233');
  await page.type('#loginPass', 'tarbiyachi123');
  await page.click('#loginBtn');
  await page.waitForFunction(() => state && state.user && state.user.role === 'teacher', { timeout: 8000 });
  await page.waitForSelector('.stat-card', { visible: true, timeout: 8000 });
  const tDash = await page.evaluate(() => document.querySelector('#content').innerText);
  check('teacher dashboard renders', tDash.includes('Bugungi vazifangiz'));
  check('teacher sees own group', tDash.includes('Quyoshcha'));
  check('teacher nav count', (await page.$$('.nav-item')).length === 4);
  const tNav = await page.evaluate(() => [...document.querySelectorAll('.nav-item')].map(n => n.textContent.trim()));
  check('teacher has no users', !tNav.some(l => l.includes('Foydalanuvchilar')));
  check('teacher has no payments', !tNav.some(l => l.includes('To\'lovlar')));
  check('teacher has no reports', !tNav.some(l => l.includes('Hisobot')));
  await page.screenshot({ path: shotDir + '\\teacher-dashboard.png' });

  await page.evaluate(() => go('t_children'));
  await new Promise(r => setTimeout(r, 900));
  const tKids = await page.evaluate(() => document.querySelector('#content').innerText);
  check('teacher children only own group', tKids.includes('Quyoshcha') && tKids.includes('Muhammadali'));

  await page.evaluate(() => go('t_attendance'));
  await new Promise(r => setTimeout(r, 900));
  const tAtt = await page.evaluate(() => document.querySelector('#content').innerText);
  check('teacher attendance page', tAtt.includes('Avtomatik saqlanadi'));

  await page.evaluate(() => go('users'));
  await new Promise(r => setTimeout(r, 900));
  check('teacher blocked from users -> dashboard', await page.evaluate(() => document.querySelector('#content').innerText.includes('Bugungi vazifangiz')));

  await page.click('#logoutBtn');
  await page.waitForSelector('#loginScreen', { visible: true });
  check('teacher logout', true);

  console.log('\n=== Browser errors: ' + errors.length + ' ===');
  errors.slice(0, 15).forEach(e => console.log('  ' + e));
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
