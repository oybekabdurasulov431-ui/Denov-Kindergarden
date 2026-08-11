const BASE = 'http://localhost:3000';

async function raw(method, path, body, cookie) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('json') ? await res.json() : await res.text();
  return { status: res.status, data };
}

async function login(username, password) {
  const res = await fetch(BASE + '/api/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const sc = res.headers.get('set-cookie');
  return sc ? sc.split(';')[0] : null;
}

(async () => {
  let ok = 0, fail = 0;
  const check = (name, cond, extra) => {
    if (cond) { ok++; console.log('PASS', name); }
    else { fail++; console.log('FAIL', name, JSON.stringify(extra)); }
  };
  const req = (m, p, b, c) => raw(m, p, b, c);
  const m0 = new Date().toISOString().slice(0, 7);
  const prev = new Date(); prev.setMonth(prev.getMonth() - 1);
  const m1 = prev.toISOString().slice(0, 7);

  const admin = await login('mehriddin0838', '977850838');
  const op = await login('operator', 'operator123');
  check('admin login', !!admin);
  check('operator login', !!op);

  let r = await req('GET', '/api/me', null, op);
  check('operator role', r.data.user.role === 'operator', r);

  r = await req('GET', '/api/dashboard', null, admin);
  check('dashboard has expense/profit', r.data.expenseMonth >= 0 && typeof r.data.profitMonth === 'number', r);

  // expenses
  r = await req('GET', '/api/expenses?month=' + m0, null, admin);
  check('expenses list', r.status === 200 && r.data.rows.length >= 3 && r.data.total > 0, r);

  r = await req('POST', '/api/expenses', { name: 'Sinov xarajat', category: 'Boshqa', amount: 50000, expense_date: new Date().toISOString().slice(0, 10) }, op);
  check('operator adds expense', r.status === 200, r);
  const expId = r.data.id;

  r = await req('GET', '/api/expenses?month=' + m0, null, admin);
  check('expense saved', r.data.rows.some(x => x.id === expId), r);

  r = await req('DELETE', '/api/expenses/' + expId, null, op);
  check('operator CANNOT delete expense', r.status === 403, r);

  r = await req('DELETE', '/api/expenses/' + expId, null, admin);
  check('admin deletes expense', r.status === 200, r);

  // payments - operator can add, cannot delete
  r = await req('POST', '/api/payments', { child_id: 1, amount: 100000, month: m0, paid_date: new Date().toISOString().slice(0, 10), method: 'naqd' }, op);
  check('operator adds payment', r.status === 200, r);
  const payId = r.data.id;

  r = await req('DELETE', '/api/payments/' + payId, null, op);
  check('operator CANNOT delete payment', r.status === 403, r);
  r = await req('DELETE', '/api/payments/' + payId, null, admin);
  check('admin deletes payment', r.status === 200, r);

  // children - operator can add/edit, cannot delete
  r = await req('POST', '/api/children', { full_name: 'Operator Test Bola', group_id: 1 }, op);
  check('operator adds child', r.status === 200, r);
  const cid = r.data.id;
  r = await req('PUT', '/api/children/' + cid, { full_name: 'Operator Test Bola 2' }, op);
  check('operator edits child', r.status === 200, r);
  r = await req('DELETE', '/api/children/' + cid, null, op);
  check('operator CANNOT delete child', r.status === 403, r);
  r = await req('DELETE', '/api/children/' + cid, null, admin);
  check('admin deletes child', r.status === 200, r);

  // attendance - operator can save
  r = await req('GET', '/api/attendance', null, op);
  const children = r.data.children;
  const recs = children.map((c, i) => ({ child_id: c.id, status: i % 2 ? 'absent' : 'present' }));
  r = await req('POST', '/api/attendance', { date: new Date().toISOString().slice(0, 10), records: recs }, op);
  check('operator saves attendance', r.status === 200, r);

  // users/settings admin only
  r = await req('GET', '/api/users', null, op);
  check('operator CANNOT view users', r.status === 403, r);
  r = await req('POST', '/api/users', { username: 'hacker', password: 'x123', full_name: 'H' }, op);
  check('operator CANNOT create user', r.status === 403, r);
  r = await req('PUT', '/api/settings', { site_name: 'Hacked' }, op);
  check('operator CANNOT change settings', r.status === 403, r);

  // groups/teachers admin only write
  r = await req('POST', '/api/groups', { name: 'SinovG' }, op);
  check('operator CANNOT create group', r.status === 403, r);
  r = await req('POST', '/api/teachers', { full_name: 'T' }, op);
  check('operator CANNOT create teacher', r.status === 403, r);

  // reports
  r = await req('GET', '/api/reports/monthly?month=' + m0, null, op);
  check('operator views report', r.status === 200 && r.data.income >= 0 && typeof r.data.profit === 'number', r);

  // wrong passwords
  r = await req('POST', '/api/login', { username: 'operator', password: 'wrong' });
  check('operator wrong password', r.status === 401, r);

  // unauthorized
  r = await req('GET', '/api/dashboard');
  check('unauthorized blocked', r.status === 401, r);

  // reset (tozalash) — operator/parolsiz taqiqlanadi
  r = await req('POST', '/api/reset', { what: 'attendance', password: 'admin123' }, op);
  check('operator CANNOT reset', r.status === 403, r);
  r = await req('POST', '/api/reset', { what: 'attendance', password: 'wrong' }, admin);
  check('reset wrong password blocked', r.status === 403, r);
  r = await req('POST', '/api/reset', { what: 'attendance', password: '977850838' }, admin);
  check('admin resets attendance', r.status === 200 && r.data.removed >= 1, r);
  r = await req('GET', '/api/attendance', null, admin);
  check('attendance empty after reset', r.status === 200 && Object.keys(r.data.map).length === 0, r);
  r = await req('POST', '/api/reset', { what: 'bogus', password: '977850838' }, admin);
  check('invalid reset target blocked', r.status === 400, r);

  // davomatni UI testlari uchun qayta tiklash
  r = await req('GET', '/api/attendance', null, admin);
  const kids2 = r.data.children;
  const recs2 = kids2.map((c, i) => ({ child_id: c.id, status: i % 2 ? 'absent' : 'present' }));
  r = await req('POST', '/api/attendance', { date: new Date().toISOString().slice(0, 10), records: recs2 }, admin);
  check('attendance restored for UI', r.status === 200, r);

  // menyu (ovqatlanish)
  r = await req('GET', '/api/meals', null, admin);
  check('meals list has week', r.status === 200 && r.data.rows.length >= 3 && r.data.week.length === 7, r);
  r = await req('POST', '/api/meals', { meal_date: '2026-08-15', meal_type: 'tushlik', title: 'Test taom' }, op);
  check('operator CANNOT create meal', r.status === 403, r);
  r = await req('POST', '/api/meals', { meal_date: '2026-08-15', meal_type: 'tushlik', title: 'Test taom', items: 'guruch, go\'sht' }, admin);
  check('admin creates meal', r.status === 200, r);
  const mealId = r.data.id;
  r = await req('DELETE', '/api/meals/' + mealId, null, admin);
  check('admin deletes meal', r.status === 200, r);

  // eksport
  r = await req('GET', '/api/export/payments.csv?month=' + m0, null, admin);
  check('payments CSV export', r.status === 200 && String(r.data).includes(';'), r);
  r = await req('GET', '/api/export/children.csv', null, op);
  check('children CSV export', r.status === 200, r);

  // xabarnomalar
  r = await req('GET', '/api/notifications/prepare?month=' + m0, null, admin);
  check('notifications prepared', r.status === 200 && r.data.payment.length >= 1, r);
  const firstRecipient = r.data.payment[0];
  r = await req('POST', '/api/notifications/send', { type: 'payment', channel: 'manual', recipients: [firstRecipient], month: m0 }, admin);
  check('notification sent', r.status === 200 && r.data.count === 1, r);
  r = await req('GET', '/api/notifications/log', null, admin);
  check('notification log', r.status === 200 && r.data.length >= 1, r);

  // audit
  r = await req('GET', '/api/audit?limit=20', null, admin);
  check('audit log', r.status === 200 && r.data.length >= 1, r);
  r = await req('GET', '/api/audit', null, op);
  check('operator CANNOT view audit', r.status === 403, r);

  // backup / restore
  r = await req('GET', '/api/backup', null, admin);
  const backup = r.data;
  check('backup has tables', r.status === 200 && backup.data && Object.keys(backup.data).length === 12, r);
  r = await req('POST', '/api/backup/restore', { data: backup.data }, admin);
  check('backup restored', r.status === 200, r);
  r = await req('GET', '/api/dashboard', null, admin);
  check('data intact after restore', r.data.totalChildren === 12, r);

  // ota-ona portali butunlay o'chirilgan
  r = await req('POST', '/api/parents/1/portal', { password: 'portal123' }, admin);
  check('parent portal account endpoint removed', r.status === 404, r);
  r = await req('GET', '/api/portal/children', null, admin);
  check('portal children endpoint removed', r.status === 404, r);
  r = await req('GET', '/api/portal/payments', null, admin);
  check('portal payments endpoint removed', r.status === 404, r);
  r = await req('POST', '/api/portal/payments', { child_id: 1, amount: 500000, month: m0, method: 'karta' }, admin);
  check('online payment endpoint removed', r.status === 404, r);
  r = await req('GET', '/api/payments/pending', null, admin);
  check('pending payments endpoint removed', r.status === 404, r);
  r = await req('PATCH', '/api/payments/1/confirm', null, admin);
  check('payment confirm endpoint removed', r.status === 404, r);

  // arizalar (admin tarafi qoladi)
  r = await req('GET', '/api/requests', null, admin);
  check('admin requests list', r.status === 200, r);
  r = await req('GET', '/api/requests', null, op);
  check('operator CANNOT view requests', r.status === 403, r);

  /* ===== TARBIYACHILAR PANELI ===== */

  r = await req('POST', '/api/teachers/1/login', { password: 'tarbiyachi123' }, admin);
  check('teacher login account', r.status === 200 && r.data.username === '998901112233', r);
  const teacher = await login('998901112233', 'tarbiyachi123');
  check('teacher login', !!teacher);

  r = await req('GET', '/api/me', null, teacher);
  check('teacher role', r.data.user.role === 'teacher', r);

  r = await req('GET', '/api/teacher/group', null, teacher);
  check('teacher group', r.status === 200 && r.data.group && r.data.group.name === 'Quyoshcha' && r.data.children.length >= 3, r);

  r = await req('GET', '/api/attendance', null, teacher);
  check('teacher attendance only own group', r.status === 200 && r.data.children.every(c => c.group_name === 'Quyoshcha'), r);

  r = await req('GET', '/api/children', null, teacher);
  check('teacher children only own group', r.status === 200 && r.data.every(c => c.group_name === 'Quyoshcha'), r);

  const ownChildId = r.data[0].id;
  r = await req('POST', '/api/attendance', { date: new Date().toISOString().slice(0, 10), records: [{ child_id: ownChildId, status: 'present' }] }, teacher);
  check('teacher saves own group attendance', r.status === 200, r);

  r = await req('POST', '/api/attendance', { date: new Date().toISOString().slice(0, 10), records: [{ child_id: 10, status: 'present' }] }, teacher);
  check('teacher CANNOT touch other group', r.status === 403, r);

  r = await req('GET', '/api/users', null, teacher);
  check('teacher CANNOT view users', r.status === 403, r);
  r = await req('POST', '/api/payments', { child_id: 1, amount: 1000, month: m0 }, teacher);
  check('teacher CANNOT add payment', r.status === 403, r);
  r = await req('POST', '/api/expenses', { name: 'x', amount: 1000 }, teacher);
  check('teacher CANNOT add expense', r.status === 403, r);
  r = await req('GET', '/api/portal/children', null, teacher);
  check('parent portal removed (404 for all roles)', r.status === 404, r);

  console.log('\n=== RESULT:', ok, 'passed,', fail, 'failed ===');
  process.exit(fail ? 1 : 0);
})();
