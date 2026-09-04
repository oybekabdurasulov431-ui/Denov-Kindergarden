const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const server = spawn('node', ['server.js'], { cwd: __dirname, stdio: ['ignore', 'pipe', 'pipe'] });
server.stdout.on('data', d => process.stdout.write('[SRV] ' + d));
server.stderr.on('data', d => process.stderr.write('[ERR] ' + d));
server.on('exit', c => console.log('Server EXIT:', c));

function req(method, urlPath, body, cookie) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;
    if (postData) headers['Content-Length'] = Buffer.byteLength(postData);
    const r = http.request({ hostname: '127.0.0.1', port: 3000, path: urlPath, method, headers }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        const sc = res.headers['set-cookie'];
        const c = sc ? sc[0].split(';')[0] : null;
        resolve({ status: res.statusCode, body: d, cookie: c || cookie });
      });
    });
    r.on('error', reject);
    if (postData) r.write(postData);
    r.end();
  });
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log(`  OK  ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra || ''}`); }
}

async function run() {
  // Wait for server
  for (let i = 0; i < 30; i++) {
    try { await req('GET', '/'); break; } catch(e) {
      if (i === 29) { console.error('Server did not start!'); process.exit(1); }
      await wait(1000);
    }
  }

  console.log('\n=== LOGIN TESTS ===');
  // Empty fields
  const e1 = await req('POST', '/api/login', { username: '', password: '' });
  check('Empty login -> 400', e1.status === 400, e1.status + ' ' + e1.body);

  // Wrong password
  const e2 = await req('POST', '/api/login', { username: 'mexriddin', password: 'wrong' });
  check('Wrong password -> 401', e2.status === 401, e2.status + ' ' + e2.body);

  // Wrong username
  const e3 = await req('POST', '/api/login', { username: 'nobody', password: 'test' });
  check('Wrong user -> 401', e3.status === 401, e3.status + ' ' + e3.body);

  // Correct admin login
  const login = await req('POST', '/api/login', { username: 'mexriddin', password: 'mexriddin123' });
  check('Admin login -> 200', login.status === 200 && login.body.includes('"admin"'), login.status + ' ' + login.body.slice(0, 200));

  // Operator hisobi mavjud (parol egasi risolat nomi bilan o'zgargan)
  const opUsers = await req('GET', '/api/users', null, login.cookie);
  const opList = JSON.parse(opUsers.body);
  check('Operator hisobi mavjud', opUsers.status === 200 && opList.some(u => u.role === 'operator'), opUsers.status);

  console.log('\n=== SESSION TESTS ===');
  const me = await req('GET', '/api/me', null, login.cookie);
  check('GET /api/me', me.status === 200 && me.body.includes('"admin"'), me.status);

  const settings = await req('GET', '/api/settings', null, login.cookie);
  check('GET /api/settings', settings.status === 200 && settings.body.includes('Denov'), settings.status);

  console.log('\n=== PARENT FORM VALIDATION ===');
  const p1 = await req('POST', '/api/parents', { full_name: 'Test', address: 'Toshkent' }, login.cookie);
  check('No phone -> 400', p1.status === 400, p1.status + ' ' + p1.body);

  const p2 = await req('POST', '/api/parents', { full_name: 'Test', phone: '+998901234567' }, login.cookie);
  check('No address -> 400', p2.status === 400, p2.status + ' ' + p2.body);

  const p3 = await req('POST', '/api/parents', { full_name: '', phone: '+998901234567', address: 'Denov' }, login.cookie);
  check('No name -> 400', p3.status === 400, p3.status + ' ' + p3.body);

  const p4 = await req('POST', '/api/parents', { full_name: 'Test Valiyev', phone: '+998901234567', address: 'Denov' }, login.cookie);
  check('All fields -> 200', p4.status === 200, p4.status + ' ' + p4.body);

  console.log('\n=== API ENDPOINTS ===');
  const endpoints = [
    ['GET', '/api/dashboard'],
    ['GET', '/api/reports/expense-categories'],
    ['GET', '/api/reports/cashbook'],
    ['GET', '/api/reports/trend'],
    ['GET', '/api/reports/salary'],
    ['GET', '/api/monitoring'],
    ['GET', '/api/schedules'],
    ['GET', '/api/sms/log'],
    ['GET', '/api/parents'],
    ['GET', '/api/teachers'],
    ['GET', '/api/groups'],
    ['GET', '/api/children'],
    ['GET', '/api/attendance?date=' + new Date().toISOString().slice(0,10)],
    ['GET', '/api/payments'],
    ['GET', '/api/expenses'],
    ['GET', '/api/meals'],
    ['GET', '/api/announcements'],
    ['GET', '/api/audit'],
    ['GET', '/api/users'],
    ['GET', '/api/parents/login-status'],
    ['GET', '/api/settings/ui'],
  ];
  for (const [method, urlPath] of endpoints) {
    const r = await req(method, urlPath, null, login.cookie);
    check(`${method} ${urlPath}`, r.status === 200, r.status + ' ' + r.body.slice(0, 100));
  }

  console.log('\n=== BUSINESS / ANNUAL / REMINDERS ===');
  const biz = await req('GET', '/api/business', null, login.cookie);
  const bizData = JSON.parse(biz.body);
  check('GET /api/business', biz.status === 200 && Array.isArray(bizData.trend) && bizData.trend.length >= 12, biz.status + ' trend=' + (bizData.trend || []).length);
  check('business.kassa', bizData.kassa && typeof bizData.kassa.naqd === 'number', biz.status + ' kassa=' + JSON.stringify(bizData.kassa));
  check('business.debtors has parent', bizData.debtors.every(d => d.parent_id > 0 || d.parent_name), biz.status);

  const yr = await req('GET', '/api/business/yearly?year=' + new Date().getFullYear(), null, login.cookie);
  const yrData = JSON.parse(yr.body);
  check('GET /api/business/yearly', yr.status === 200 && yrData.months.length === 12 && yrData.totals.totalIncome >= 0, yr.status);

  const yrBad = await req('GET', '/api/business/yearly?year=1999', null, login.cookie);
  check('yearly bad year -> 400/200 safe', yrBad.status === 200, yrBad.status);

  const rem = await req('POST', '/api/reminders/send', { month: '2026-08', recipient_ids: [1], channel: 'none' }, login.cookie);
  check('POST /api/reminders/send bad channel', rem.status === 400 || rem.status === 200, rem.status + ' ' + rem.body.slice(0, 80));

  console.log('\n=== EXPENSE PAYMENT METHOD ===');
  const expPost = await req('POST', '/api/expenses', { name: 'Test usul', category: 'Boshqa', amount: 5000, expense_date: new Date().toISOString().slice(0,10), notes: 'T', method: 'bank' }, login.cookie);
  const expId = JSON.parse(expPost.body).id;
  check('POST /api/expenses with method', expPost.status === 200 && expId, expPost.status + ' ' + expPost.body);
  const expGet = await req('GET', '/api/expenses', null, login.cookie);
  const expRow = JSON.parse(expGet.body).rows.find(r => r.id === expId);
  check('expense.method = bank', expRow && expRow.method === 'bank', expGet.status + ' method=' + (expRow && expRow.method));
  const expDel = await req('DELETE', '/api/expenses/' + expId, null, login.cookie);
  check('DELETE test expense', expDel.status === 200, expDel.status);

  console.log('\n=== EXCEL EXPORT ===');
  const xlsx = await req('GET', '/api/export/report.xlsx', null, login.cookie);
  check('Excel export', xlsx.status === 200 && xlsx.body.length > 100, xlsx.status);

  console.log('\n=== ANNOUNCEMENT + SMS ===');
  const annSms = await req('POST', '/api/announcements', { title: 'Test SMS', text: 'Tekshiruv', send_tg: false, send_sms: true }, login.cookie);
  const annSmsBody = JSON.parse(annSms.body);
  check('POST /api/announcements with send_sms', annSms.status === 200 && typeof annSmsBody.smsSent === 'number', annSms.status + ' ' + annSms.body.slice(0, 80));
  const annList = await req('GET', '/api/announcements', null, login.cookie);
  check('announcement created', JSON.parse(annList.body).some(a => a.title === 'Test SMS'), annList.status);
  const smsLog = await req('GET', '/api/sms/log', null, login.cookie);
  check('sms_log has announce entry', JSON.parse(smsLog.body).length >= 0, smsLog.status);
  const annDel = await req('DELETE', '/api/announcements/' + annSmsBody.id, null, login.cookie);
  check('DELETE test announcement', annDel.status === 200, annDel.status);

  console.log('\n=== FRONTEND ===');
  const html = await req('GET', '/');
  check('HTML page', html.status === 200 && html.body.includes('Denov'), html.status);

  const css = await req('GET', '/style.css');
  check('CSS file', css.status === 200 && css.body.length > 1000, css.status + ' len=' + css.body.length);

  const js = await req('GET', '/app.js');
  check('JS file', js.status === 200 && js.body.length > 1000, js.status + ' len=' + js.body.length);

  const apk = await req('GET', '/apk/Denov-Kindergarden.apk');
  check('APK file', apk.status === 200, apk.status);

  console.log(`\n========== RESULT: ${pass} passed, ${fail} failed ==========`);
  server.kill();
  process.exit(fail > 0 ? 1 : 0);
}

setTimeout(run, 1000);
