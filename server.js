const express = require('express');
process.on('uncaughtException', e => console.error('[FATAL uncaughtException]', e.stack));
process.on('unhandledRejection', e => console.error('[FATAL unhandledRejection]', e && e.stack || e));
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const bot = require('./bot');
const xlsx = require('./xlsx');
const pdfreport = require('./pdfreport');
const { today, currentMonth } = db.helpers;

/* ---------- Narx (to'lov) logikasi ----------
   • 3 yoshga kirmagan bola: 300 000 so'm
   • Ota-onada 2+ bola bo'lsa: har biriga 200 000 so'm
   • Aks holda: guruh narxi (standart 250 000 so'm) */
function childAge(birthDate) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

function siblingCount(parentId) {
  if (!parentId) return 0;
  return db.prepare("SELECT COUNT(*) c FROM children WHERE parent_id = ? AND status = 'active'").get(parentId).c;
}

function effectiveFee(r) {
  const age = r.age != null ? r.age : childAge(r.birth_date);
  if (age != null && age < 3) return 300000;
  if (siblingCount(r.parent_id) >= 2) return 200000;
  return r.fee_per_month || 250000;
}

/* ---------- SMS yuborish (smsapi.uz / v1/send.php) ---------- */
function getSmsSettings() {
  const s = getSettings();
  return { apiKey: (s.sms_api_key || '').trim(), from: (s.sms_sender || '').trim() };
}
function sendSms(phone, message) {
  return new Promise((resolve) => {
    const { apiKey } = getSmsSettings();
    if (!phone || !apiKey) return resolve({ sent: false, reason: !apiKey ? 'sms_api_yoq' : 'no_phone' });
    const phoneClean = String(phone).replace(/[^0-9]/g, '');
    const p = phoneClean.length === 9 ? '998' + phoneClean : phoneClean;
    const msg = String(message).substring(0, 160);
    const https = require('https');
    const postData = `api_key=${encodeURIComponent(apiKey)}&phone=${encodeURIComponent(p)}&message=${encodeURIComponent(msg)}&priority=${encodeURIComponent('normal')}`;
    const q = https.request('https://smsapi.uz/v1/send.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) }
    }, resp => {
      let d = ''; resp.on('data', c => d += c); resp.on('end', () => {
        let ok = false, detail = null;
        try { const j = JSON.parse(d); ok = !!(j && j.success); detail = (j && (j.message || j.error_code)) || null; } catch (e) { ok = resp.statusCode === 200; }
        resolve({ sent: ok, code: resp.statusCode, resp: d, reason: ok ? null : (detail || ('smsapi_' + resp.statusCode)) });
      });
    });
    q.on('error', e => resolve({ sent: false, reason: e.message }));
    q.setTimeout(15000, () => { q.destroy(); resolve({ sent: false, reason: 'timeout' }); });
    q.write(postData); q.end();
  });
}

function unpaidMonthsCount(c, fee) {
  const enrolledM = (c.enrolled_at || '').slice(0, 7);
  let n = 0;
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (enrolledM && m < enrolledM) break;
    const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND month = ? AND status = 'confirmed'").get(c.id, m).s;
    if (paid >= fee) break;
    n++;
  }
  return n;
}

function feeNote(r) {
  const age = r.age != null ? r.age : childAge(r.birth_date);
  if (age != null && age < 3) return '3 yoshdan kichik (300 000)';
  if (siblingCount(r.parent_id) >= 2) return '2+ bola, aka-uka chegirmasi (200 000)';
  return 'Standart (250 000)';
}

function applyFees(rows) {  return rows.map(r => {
    const fee = effectiveFee(r);
    return { ...r, effective_fee: fee, fee_note: feeNote(r) };
  });
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

/* Android TWA tekshiruvi (dotfile express'da bloklanadi, shu sabab static dan oldin) */
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '.well-known', 'assetlinks.json'), { dotfiles: 'allow' });
});

/* ===== Tez yuklash: APK + statik cache ===== */
app.get('/apk/:file', (req, res) => {
  const file = path.basename(req.params.file);
  const full = path.join(__dirname, 'public', 'apk', file);
  if (!fs.existsSync(full)) return res.status(404).end();
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
  res.download(full, file);
});

app.use(express.static('public', {
  etag: true,
  lastModified: true,
  setHeaders(res, filePath) {
    if (/\.(apk|png|jpe?g|webp|svg|ico|gif|woff2?)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

/* SQLite'da saqlanadigan sessiya — server qayta ishga tushsa ham login saqlanadi */
const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

function fmtMoney(v) {
  return new Intl.NumberFormat('uz-UZ').format(Number(v || 0));
}
class SqliteStore extends session.Store {
  constructor() {
    super();
    try { db.prepare('DELETE FROM sessions WHERE expire < ?').run(Date.now()); } catch (e) {}
    setInterval(() => { try { db.prepare('DELETE FROM sessions WHERE expire < ?').run(Date.now()); } catch (e) {} }, 60 * 60 * 1000);
  }
  _expireOf(sess) {
    const c = sess.cookie || {};
    if (c.expires) return new Date(c.expires).getTime();
    return Date.now() + (c.maxAge || SEVEN_DAYS);
  }
  get(sid, cb) {
    try {
      const row = db.prepare('SELECT sess, expire FROM sessions WHERE sid = ?').get(sid);
      if (!row) return cb(null, null);
      if (row.expire < Date.now()) { this.destroy(sid, () => {}); return cb(null, null); }
      cb(null, JSON.parse(row.sess));
    } catch (e) { cb(e); }
  }
  set(sid, sess, cb) {
    try {
      db.prepare('INSERT INTO sessions (sid, sess, expire) VALUES (?,?,?) ON CONFLICT(sid) DO UPDATE SET sess=excluded.sess, expire=excluded.expire')
        .run(sid, JSON.stringify(sess), this._expireOf(sess));
      cb && cb(null);
    } catch (e) { cb && cb(e); }
  }
  destroy(sid, cb) {
    try { db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid); cb && cb(null); } catch (e) { cb && cb(e); }
  }
  touch(sid, sess, cb) {
    try { db.prepare('UPDATE sessions SET expire = ? WHERE sid = ?').run(this._expireOf(sess), sid); cb && cb(null); } catch (e) { cb && cb(e); }
  }
}

app.use(session({
  secret: 'bogcha-secret-key-2026',
  store: new SqliteStore(),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: SEVEN_DAYS, httpOnly: true, sameSite: 'lax' }
}));

/* Parol o'zgartirilgan bo'lsa, eski sessiya yaroqsiz bo'ladi — qayta login talab qilinadi */
app.use('/api', (req, res, next) => {
  if (req.session && req.session.user) {
    try {
      const u = db.prepare('SELECT session_token FROM users WHERE id = ?').get(req.session.user.id);
      if (!u || !u.session_token || u.session_token !== req.session.user.token) {
        return req.session.destroy(() => res.status(401).json({ error: 'Sessiya tugagan' }));
      }
    } catch (e) {
      return res.status(401).json({ error: 'Sessiya tugagan' });
    }
  }
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Kirish talab qilinadi' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Kirish talab qilinadi' });
  if (req.session.user.role !== 'admin') return res.status(403).json({ error: 'Bu amal faqat administrator uchun' });
  next();
}

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const s = {};
  for (const r of rows) s[r.key] = r.value;
  return s;
}

function setSetting(k, v) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(k, String(v));
}

function sendGroup(text, opts) {
  try { bot.sendGroup(text, opts); } catch (e) {}
}

function audit(req, action, entity, detail = '') {
  try {
    const u = req.session.user || {};
    db.prepare('INSERT INTO audit_log (user_id, username, role, action, entity, detail) VALUES (?,?,?,?,?,?)')
      .run(u.id || null, u.username || 'anonim', u.role || 'anonim', action, entity, String(detail).slice(0, 500));
  } catch (e) { /* audit xatosi jiddiy emas */ }
}

function escapeCsv(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function csvFile(res, filename, header, rows) {
  const BOM = '\uFEFF';
  const lines = [header.join(';')].concat(rows.map(r => r.map(escapeCsv).join(';')));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(BOM + lines.join('\r\n'));
}

/* ---------- Auth ---------- */

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Login va parolni kiriting' });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Login yoki parol noto\'g\'ri' });
  }
  let token = user.session_token;
  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    db.prepare('UPDATE users SET session_token = ? WHERE id = ?').run(token, user.id);
  }
  req.session.user = { id: user.id, username: user.username, full_name: user.full_name, role: user.role, parent_id: user.parent_id || null, teacher_id: user.teacher_id || null, token };
  audit(req, 'kirish', 'auth', `${user.full_name} tizimga kirdi`);
  res.json({ user: req.session.user });
});

/* Ota-ona roli boshqa bo'limlarga kira olmaydi */
app.use('/api', (req, res, next) => {
  const u = req.session.user;
  if (u && u.role === 'parent') {
    const isChildProfile = req.path.startsWith('/children/') && req.path.endsWith('/profile');
    const allowed = req.path.startsWith('/parent/') || isChildProfile ||
      ['/me', '/settings', '/change-password', '/change-username', '/logout', '/badges', '/badges/mark-read', '/landing/data'].includes(req.path);
    if (!allowed) return res.status(403).json({ error: 'Bu bo\'lim faqat xodimlar uchun' });
  }
  next();
});

app.post('/api/logout', (req, res) => {
  audit(req, 'chiqish', 'auth', `${req.session.user?.full_name || ''} tizimdan chiqdi`);
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });
  res.json({ user: req.session.user });
});

app.post('/api/change-password', requireAuth, (req, res) => {
  const { old_password, new_password } = req.body || {};
  if (!old_password || !new_password || new_password.length < 4) {
    return res.status(400).json({ error: 'Eski parol va yangi parolni kiriting (kamida 4 belgi)' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);
  if (!bcrypt.compareSync(old_password, user.password_hash)) {
    return res.status(400).json({ error: 'Eski parol noto\'g\'ri' });
  }
  const newToken = crypto.randomBytes(24).toString('hex');
  db.prepare('UPDATE users SET password_hash = ?, session_token = ? WHERE id = ?').run(bcrypt.hashSync(new_password, 10), newToken, user.id);
  req.session.user.token = newToken;
  audit(req, 'o\'zgartirish', 'parol', 'parol o\'zgartirildi');
  res.json({ ok: true });
});

app.post('/api/change-username', requireAuth, (req, res) => {
  const { password, new_username } = req.body || {};
  const name = String(new_username || '').trim();
  if (!password || !name || name.length < 3) {
    return res.status(400).json({ error: 'Parol va yangi loginni kiriting (kamida 3 belgi)' });
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(name)) {
    return res.status(400).json({ error: 'Login faqat harf, raqam, nuqta, tire va pastki chiziqdan iborat bo\'lishi kerak' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);
  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(400).json({ error: 'Parol noto\'g\'ri' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(name, user.id);
  if (exists) return res.status(400).json({ error: 'Bu login allaqachon band' });
  db.prepare('UPDATE users SET username = ? WHERE id = ?').run(name, user.id);
  req.session.user.username = name;
  audit(req, 'o\'zgartirish', 'login', name);
  res.json({ ok: true, username: name });
});

/* ---------- Reset / Tozalash ---------- */

app.post('/api/reset', requireAdmin, (req, res) => {
  const { what, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);
  if (!bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(403).json({ error: 'Parol noto\'g\'ri. Amal bajarilmadi.' });
  }
  const allowed = ['attendance', 'payments', 'expenses', 'children', 'parents', 'groups', 'teachers'];
  const order = ['attendance', 'payments', 'expenses', 'children', 'parents', 'groups', 'teachers'];
  let removed = 0;
  if (what === 'all') {
    for (const t of order) {
      removed += db.prepare(`DELETE FROM ${t}`).run().changes;
    }
  } else if (what === 'children') {
    removed += db.prepare('DELETE FROM children').run().changes;
    removed += db.prepare('DELETE FROM parents WHERE id NOT IN (SELECT DISTINCT parent_id FROM children WHERE parent_id IS NOT NULL)').run().changes;
  } else if (allowed.includes(what)) {
    removed += db.prepare(`DELETE FROM ${what}`).run().changes;
  } else {
    return res.status(400).json({ error: 'Noto\'g\'ri parametr' });
  }
  audit(req, 'tozalash', 'reset', `${what}: ${removed} ta o'chirildi`);
  res.json({ ok: true, removed });
});

app.get('/api/users', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT id, username, full_name, role, created_at FROM users').all());
});

app.post('/api/users', requireAdmin, (req, res) => {
  const { username, password, full_name, role } = req.body || {};
  if (!username || !password || !full_name) return res.status(400).json({ error: 'Ma\'lumotlar to\'liq emas' });
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) return res.status(400).json({ error: 'Bu login band' });
  const r = db.prepare('INSERT INTO users (username, password_hash, full_name, role) VALUES (?,?,?,?)')
    .run(username, bcrypt.hashSync(password, 10), full_name, role || 'operator');
  audit(req, 'yaratish', 'user', `${username} (${role || 'operator'})`);
  res.json({ id: r.lastInsertRowid });
});

app.delete('/api/users/:id', requireAdmin, (req, res) => {
  if (Number(req.params.id) === req.session.user.id) return res.status(400).json({ error: 'O\'zingizni o\'chira olmaysiz' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  audit(req, 'o\'chirish', 'user', `id=${req.params.id}`);
  res.json({ ok: true });
});

/* ---------- Settings ---------- */

app.get('/api/settings', requireAuth, (req, res) => {
  res.json(getSettings());
});

app.put('/api/settings', requireAdmin, (req, res) => {
  const body = req.body || {};
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  for (const [k, v] of Object.entries(body)) stmt.run(k, String(v));
  audit(req, 'yangilash', 'settings', Object.keys(body).join(', '));
  const keys = Object.keys(body);
  if (keys.some(k => k.startsWith('tg_') || k.startsWith('reminder'))) bot.restart();
  res.json(getSettings());
});

/* ---------- Groups ---------- */

app.get('/api/groups', requireAuth, (req, res) => {
  if (req.session.user.role === 'teacher') {
    const t = db.prepare('SELECT group_id FROM teachers WHERE id = ?').get(req.session.user.teacher_id);
    if (!t || !t.group_id) return res.json([]);
    const row = db.prepare(`
      SELECT g.*, COUNT(c.id) AS child_count,
        (SELECT t2.full_name FROM teachers t2 WHERE t2.group_id = g.id LIMIT 1) AS teacher_name
      FROM groups g
      LEFT JOIN children c ON c.group_id = g.id AND c.status = 'active'
      WHERE g.id = ?
      GROUP BY g.id
    `).get(t.group_id);
    return res.json(row ? [row] : []);
  }
  const rows = db.prepare(`
    SELECT g.*, COUNT(c.id) AS child_count,
      (SELECT t.full_name FROM teachers t WHERE t.group_id = g.id LIMIT 1) AS teacher_name
    FROM groups g
    LEFT JOIN children c ON c.group_id = g.id AND c.status = 'active'
    GROUP BY g.id
    ORDER BY g.age_min
  `).all();
  res.json(rows);
});

app.post('/api/groups', requireAdmin, (req, res) => {
  const { name, age_min, age_max, capacity, fee_per_month, color } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Guruh nomini kiriting' });
  const r = db.prepare('INSERT INTO groups (name, age_min, age_max, capacity, fee_per_month, color) VALUES (?,?,?,?,?,?)')
    .run(name, age_min || 1, age_max || 6, capacity || 20, fee_per_month || 250000, color || '#6366f1');
  audit(req, 'yaratish', 'group', name);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/groups/:id', requireAdmin, (req, res) => {
  const { name, age_min, age_max, capacity, fee_per_month, color } = req.body || {};
  db.prepare('UPDATE groups SET name=?, age_min=?, age_max=?, capacity=?, fee_per_month=?, color=? WHERE id=?')
    .run(name, age_min, age_max, capacity, fee_per_month, color, req.params.id);
  audit(req, 'yangilash', 'group', String(name));
  res.json({ ok: true });
});

app.delete('/api/groups/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM groups WHERE id = ?').run(req.params.id);
  audit(req, 'o\'chirish', 'group', `id=${req.params.id}`);
  res.json({ ok: true });
});

/* ---------- Teachers ---------- */

app.get('/api/teachers', requireAuth, (req, res) => {
  res.json(db.prepare(`
    SELECT t.*, g.name AS group_name
    FROM teachers t LEFT JOIN groups g ON g.id = t.group_id
    ORDER BY t.full_name
  `).all());
});

app.post('/api/teachers', requireAdmin, (req, res) => {
  const { full_name, phone, position, salary, group_id, hired_at, birth_date } = req.body || {};
  if (!full_name) return res.status(400).json({ error: 'Ism kiriting' });
  const r = db.prepare('INSERT INTO teachers (full_name, phone, position, salary, group_id, hired_at, birth_date) VALUES (?,?,?,?,?,?,?)')
    .run(full_name, phone || '', position || 'Tarbiyachi', salary || 0, group_id || null, hired_at || today(), birth_date || '');
  audit(req, 'yaratish', 'teacher', full_name);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/teachers/:id', requireAdmin, (req, res) => {
  const { full_name, phone, position, salary, group_id, hired_at, birth_date } = req.body || {};
  db.prepare('UPDATE teachers SET full_name=?, phone=?, position=?, salary=?, group_id=?, hired_at=?, birth_date=? WHERE id=?')
    .run(full_name, phone || '', position || 'Tarbiyachi', salary || 0, group_id || null, hired_at || today(), birth_date || '', req.params.id);
  res.json({ ok: true });
});

app.delete('/api/teachers/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.get('/api/teachers/login-status', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT t.id AS teacher_id, t.full_name, t.phone, u.id AS user_id, u.username
    FROM teachers t LEFT JOIN users u ON u.teacher_id = t.id
    ORDER BY t.full_name
  `).all();
  res.json(rows);
});

app.post('/api/teachers/:id/login', requireAdmin, (req, res) => {
  const { password } = req.body || {};
  const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
  if (!teacher) return res.status(404).json({ error: 'Tarbiyachi topilmadi' });
  const existing = db.prepare('SELECT * FROM users WHERE teacher_id = ?').get(teacher.id);
  const username = teacher.phone && teacher.phone !== '' ? String(teacher.phone).replace(/\D/g, '') : 'tarbiyachi' + teacher.id;
  const pw = password || 'tarbiyachi123';
  if (existing) {
    db.prepare('UPDATE users SET username=?, password_hash=?, full_name=?, session_token=NULL WHERE id=?')
      .run(username, bcrypt.hashSync(pw, 10), teacher.full_name, existing.id);
    audit(req, 'yangilash', 'teacher_login', `${teacher.full_name} login yangilandi`);
    return res.json({ ok: true, username, password: pw, created: false });
  }
  const dup = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (dup) return res.status(400).json({ error: `'${username}' login band` });
  const r = db.prepare('INSERT INTO users (username, password_hash, full_name, role, teacher_id) VALUES (?,?,?,?,?)')
    .run(username, bcrypt.hashSync(pw, 10), teacher.full_name, 'teacher', teacher.id);
  audit(req, 'yaratish', 'teacher_login', `${teacher.full_name} → ${username}`);
  res.json({ ok: true, username, password: pw, created: true });
});

/* ---------- Tarbiyachilar paneli ---------- */

function teacherGroupId(req) {
  const u = req.session.user;
  if (!u || u.role !== 'teacher') return null;
  const t = db.prepare('SELECT group_id FROM teachers WHERE id = ?').get(u.teacher_id);
  return t ? t.group_id : null;
}

function requireTeacher(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Kirish talab qilinadi' });
  if (req.session.user.role !== 'teacher' && req.session.user.role !== 'admin') return res.status(403).json({ error: 'Bu bo\'lim faqat tarbiyachilar uchun' });
  next();
}

function requireStaff(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Kirish talab qilinadi' });
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'operator') return res.status(403).json({ error: 'Bu amal faqat xodimlar uchun' });
  next();
}

function requireParent(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Kirish talab qilinadi' });
  if (req.session.user.role !== 'parent') return res.status(403).json({ error: 'Bu bo\'lim faqat ota-onalar uchun' });
  next();
}

function currentParentId(req) {
  const u = req.session.user;
  return u && u.parent_id ? u.parent_id : null;
}

function addParentNotification(parentId, type, title, message) {
  if (!parentId) return;
  try {
    db.prepare('INSERT INTO parent_notifications (parent_id, type, title, message) VALUES (?,?,?,?)')
      .run(parentId, type || 'xabar', title || '', message || '');
  } catch (e) { /* yo'q */ }
}

function addParentNotificationsForAll(type, title, message) {
  try { db.prepare('INSERT INTO parent_notifications (parent_id, type, title, message) SELECT id, ?, ?, ? FROM parents').run(type || 'xabar', title || '', message || ''); }
  catch (e) { /* yo'q */ }
}

function parentChildren(parentId, activeOnly) {
  const where = activeOnly ? "parent_id = ? AND status = 'active'" : 'parent_id = ?';
  return db.prepare(`
    SELECT c.*, g.name AS group_name, g.color AS group_color, g.fee_per_month
    FROM children c LEFT JOIN groups g ON g.id = c.group_id
    WHERE ${where} ORDER BY c.full_name
  `).all(parentId);
}

app.get('/api/teacher/group', requireTeacher, (req, res) => {
  const gid = teacherGroupId(req);
  if (gid == null) {
    return res.json({ group: null, children: [], today: { present: 0, total: 0 }, monthAtt: { present: 0, absent: 0, late: 0 } });
  }
  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(gid);
  const children = db.prepare('SELECT * FROM children WHERE group_id = ? AND status = \'active\' ORDER BY full_name').all(gid);
  const ids = children.map(c => c.id);
  const t = today();
  const present = ids.length ? db.prepare(`SELECT COUNT(*) c FROM attendance WHERE date = ? AND status != 'absent' AND child_id IN (${ids.map(() => '?').join(',')})`).get(t, ...ids).c : 0;
  const m = currentMonth();
  const att = ids.length ? db.prepare(`SELECT status, COUNT(*) cnt FROM attendance WHERE substr(date,1,7) = ? AND child_id IN (${ids.map(() => '?').join(',')}) GROUP BY status`).all(m, ...ids) : [];
  const monthAtt = { present: 0, absent: 0, late: 0 };
  for (const a of att) monthAtt[a.status] = a.cnt;
  res.json({ group, children, today: { present, total: children.length }, monthAtt });
});

/* ---------- Parents ---------- */

app.get('/api/parents', requireAuth, (req, res) => {
  res.json(db.prepare(`
    SELECT p.*, COUNT(c.id) AS child_count
    FROM parents p LEFT JOIN children c ON c.parent_id = p.id
    GROUP BY p.id ORDER BY p.full_name
  `).all());
});

app.post('/api/parents', requireStaff, (req, res) => {
  const { full_name, phone, email, address } = req.body || {};
  if (!full_name) return res.status(400).json({ error: 'Ism kiriting' });
  if (!phone) return res.status(400).json({ error: 'Telefon raqamini kiriting' });
  if (!address) return res.status(400).json({ error: 'Manzilni kiriting' });
  const r = db.prepare('INSERT INTO parents (full_name, phone, email, address) VALUES (?,?,?,?)')
    .run(full_name, phone, email || '', address);
  audit(req, 'yaratish', 'parent', full_name);
  try { bot.notifyNewParent({ id: r.lastInsertRowid, full_name, phone: phone || '' }); } catch (e) {}
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/parents/:id', requireStaff, (req, res) => {
  const { full_name, phone, email, address } = req.body || {};
  db.prepare('UPDATE parents SET full_name=?, phone=?, email=?, address=? WHERE id=?')
    .run(full_name, phone || '', email || '', address || '', req.params.id);
  audit(req, 'yangilash', 'parent', String(full_name));
  res.json({ ok: true });
});

app.delete('/api/parents/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM parents WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM users WHERE parent_id = ?').run(req.params.id);
  audit(req, 'o\'chirish', 'parent', `id=${req.params.id}`);
  res.json({ ok: true });
});

/* ---------- Ota-ona login (admin panel) ---------- */

app.get('/api/parents/login-status', requireStaff, (req, res) => {
  const rows = db.prepare(`
    SELECT p.id AS parent_id, p.full_name, p.phone, u.id AS user_id, u.username, u.role
    FROM parents p LEFT JOIN users u ON u.parent_id = p.id
    ORDER BY p.full_name
  `).all();
  res.json(rows);
});

app.post('/api/parents/:id/login', requireStaff, (req, res) => {
  const { password } = req.body || {};
  const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(req.params.id);
  if (!parent) return res.status(404).json({ error: 'Ota-ona topilmadi' });
  const existing = db.prepare('SELECT * FROM users WHERE parent_id = ?').get(parent.id);
  let username = String(parent.phone || '').replace(/\D/g, '');
  if (!username) username = 'ota' + parent.id;
  const pw = password || String(Math.floor(1000 + Math.random() * 9000));
  if (existing) {
    db.prepare('UPDATE users SET username=?, password_hash=?, full_name=?, role=?, session_token=NULL WHERE id=?')
      .run(username, bcrypt.hashSync(pw, 10), parent.full_name, 'parent', existing.id);
    audit(req, 'yangilash', 'parent_login', `${parent.full_name} login yangilandi`);
    return res.json({ ok: true, username, password: pw, created: false });
  }
  const dup = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (dup) return res.status(400).json({ error: `'${username}' login band. Boshqa raqam/parol tanlang` });
  const r = db.prepare('INSERT INTO users (username, password_hash, full_name, role, parent_id) VALUES (?,?,?,?,?)')
    .run(username, bcrypt.hashSync(pw, 10), parent.full_name, 'parent', parent.id);
  audit(req, 'yaratish', 'parent_login', `${parent.full_name} → ${username}`);
  res.json({ ok: true, username, password: pw, created: true });
});

/* ---------- Ota-ona paneli (web) ---------- */

app.get('/api/parent/me', requireParent, (req, res) => {
  const pid = currentParentId(req);
  const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(pid);
  if (!parent) return res.status(404).json({ error: 'Ota-ona topilmadi' });
  const children = applyFees(parentChildren(pid, false));
  const ann = db.prepare('SELECT * FROM announcements ORDER BY id DESC LIMIT 6').all();
  res.json({ parent, children, announcements: ann });
});

app.get('/api/parent/overview', requireParent, (req, res) => {
  const pid = currentParentId(req);
  const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(pid);
  const month = req.query.month || currentMonth();
  const children = parentChildren(pid, true);
  const ids = children.map(c => c.id);

  const att = { present: 0, absent: 0, late: 0 };
  if (ids.length) {
    const rows = db.prepare(`SELECT status, COUNT(*) cnt FROM attendance WHERE substr(date,1,7) = ? AND child_id IN (${ids.map(() => '?').join(',')}) GROUP BY status`).all(month, ...ids);
    for (const r of rows) if (att[r.status] != null) att[r.status] = r.cnt;
  }

  const paidRows = ids.length ? db.prepare(`SELECT child_id, SUM(amount) total FROM payments WHERE month = ? AND status = 'confirmed' AND child_id IN (${ids.map(() => '?').join(',')}) GROUP BY child_id`).all(month, ...ids) : [];
  const pmap = {};
  for (const r of paidRows) pmap[r.child_id] = r.total;
  const childrenStatus = children.map(c => {
    const fee = effectiveFee(c);
    const paid = pmap[c.id] || 0;
    return { ...c, fee, paid, due: Math.max(0, fee - paid), paid_full: fee > 0 && paid >= fee, fee_note: feeNote(c) };
  });

  const totalDue = childrenStatus.reduce((s, c) => s + c.due, 0);
  const totalPaid = childrenStatus.reduce((s, c) => s + c.paid, 0);

  const recentPayments = ids.length ? db.prepare(`SELECT pay.*, c.full_name AS child_name FROM payments pay JOIN children c ON c.id = pay.child_id WHERE pay.child_id IN (${ids.map(() => '?').join(',')}) ORDER BY pay.paid_date DESC, pay.id DESC LIMIT 6`).all(...ids) : [];

  const requests = db.prepare('SELECT * FROM parent_requests WHERE parent_id = ? ORDER BY id DESC LIMIT 5').all(pid);
  const notifications = db.prepare('SELECT * FROM notifications WHERE parent_id = ? ORDER BY id DESC LIMIT 5').all(pid);
  const pnotifs = db.prepare('SELECT * FROM parent_notifications WHERE parent_id = ? ORDER BY id DESC LIMIT 6').all(pid);
  const unreadPnotifs = db.prepare('SELECT COUNT(*) c FROM parent_notifications WHERE parent_id = ? AND read = 0').get(pid).c;
  const announcements = db.prepare('SELECT * FROM announcements ORDER BY id DESC LIMIT 6').all();

  res.json({
    parent,
    month,
    children: childrenStatus,
    att,
    totalDue,
    totalPaid,
    recentPayments,
    requests,
    pnotifs,
    unreadPnotifs,
    notifications,
    announcements
  });
});

app.get('/api/parent/attendance', requireParent, (req, res) => {
  const pid = currentParentId(req);
  const month = req.query.month || currentMonth();
  const children = parentChildren(pid, false);
  const result = children.map(c => {
    const rows = db.prepare('SELECT status, COUNT(*) cnt FROM attendance WHERE child_id = ? AND substr(date,1,7) = ? GROUP BY status').all(c.id, month);
    const att = { present: 0, absent: 0, late: 0 };
    for (const r of rows) if (att[r.status] != null) att[r.status] = r.cnt;
    const days = db.prepare('SELECT date, status FROM attendance WHERE child_id = ? AND substr(date,1,7) = ? ORDER BY date DESC').all(c.id, month);
    return { child: c, att, days };
  });
  res.json({ month, result });
});

app.get('/api/parent/payments', requireParent, (req, res) => {
  const pid = currentParentId(req);
  const month = req.query.month || '';
  const children = parentChildren(pid, false);
  const ids = children.map(c => c.id);
  if (!ids.length) return res.json({ month, rows: [], total: 0 });
  const where = month ? 'AND pay.month = ?' : '';
  const params = month ? [...ids, month] : ids;
  const rows = db.prepare(`
    SELECT pay.*, c.full_name AS child_name, g.name AS group_name
    FROM payments pay JOIN children c ON c.id = pay.child_id LEFT JOIN groups g ON g.id = c.group_id
    WHERE pay.child_id IN (${ids.map(() => '?').join(',')}) ${where}
    ORDER BY pay.paid_date DESC, pay.id DESC LIMIT 100
  `).all(...params);
  const total = rows.reduce((s, r) => s + (r.status === 'confirmed' ? r.amount : 0), 0);
  res.json({ month, rows, total });
});

app.post('/api/parent/payments/request', requireAdmin, (req, res) => {
  res.status(403).json({ error: 'To\'lov so\'rashi o\'chirilgan. To\'lov uchun bog\'chaga murojaat qiling.' });
});

app.get('/api/parent/requests', requireParent, (req, res) => {
  const pid = currentParentId(req);
  const rows = db.prepare('SELECT * FROM parent_requests WHERE parent_id = ? ORDER BY id DESC').all(pid);
  res.json(rows);
});

/* ---------- Talabnomalar (admin) ---------- */

app.get('/api/requests', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, p.full_name AS parent_name, p.phone
    FROM parent_requests r LEFT JOIN parents p ON p.id = r.parent_id
    ORDER BY CASE r.status WHEN 'yangi' THEN 0 ELSE 1 END, r.id DESC
  `).all();
  res.json(rows);
});

app.patch('/api/requests/:id', requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'Holat kiriting' });
  const request = db.prepare('SELECT * FROM parent_requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Ariza topilmadi' });
  if (request.status !== status) {
    if (request.type === 'payment' && status === 'tasdiqlandi') {
      const payment = db.prepare(`
        INSERT INTO payments (child_id, amount, month, paid_date, method, receipt_no, notes)
        VALUES (?,?,?,?,?,?,?)
      `).run(
        request.child_id, request.amount || 0, request.month || currentMonth(), today(),
        'telegram', 'TG-' + String(req.params.id).padStart(6, '0'), 'Bot orqali so\'rov #' + request.id
      );
      const full = db.prepare('SELECT * FROM payments WHERE id = ?').get(payment.lastInsertRowid);
      try { bot.notifyPayApproved(request, full); } catch (e) {}
    }
    db.prepare('UPDATE parent_requests SET status = ? WHERE id = ?').run(status, req.params.id);
    request.status = status;
    if (request.type === 'payment' && status === 'bekor qilindi') {
      try { bot.notifyPayRejected(request); } catch (e) {}
    }
  }
  audit(req, 'yangilash', 'request', `id=${req.params.id} → ${status}`);
  res.json({ ok: true });
});

/* ---------- Children ---------- */

function childListQuery(where = '1=1', params = []) {
  return db.prepare(`
    SELECT c.*, g.name AS group_name, g.color AS group_color, g.fee_per_month,
           p.full_name AS parent_name, p.phone AS parent_phone,
           CASE
             WHEN c.birth_date = '' THEN NULL
             ELSE CAST((julianday(date('now')) - julianday(c.birth_date)) / 365.25 AS INTEGER)
           END AS age
    FROM children c
    LEFT JOIN groups g ON g.id = c.group_id
    LEFT JOIN parents p ON p.id = c.parent_id
    WHERE ${where}
    ORDER BY c.status ASC, c.full_name
  `).all(...params);
}

app.get('/api/children', requireAuth, (req, res) => {
  const gid = teacherGroupId(req);
  if (gid != null) return res.json(applyFees(childListQuery('c.group_id = ? AND c.status = \'active\'', [gid])));
  const q = req.query;
  if (q.group_id) return res.json(applyFees(childListQuery('c.group_id = ?', [q.group_id])));
  if (q.status) return res.json(applyFees(childListQuery('c.status = ?', [q.status])));
  const search = q.q;
  if (search) return res.json(applyFees(childListQuery('c.full_name LIKE ? OR p.full_name LIKE ? OR p.phone LIKE ?', [`%${search}%`, `%${search}%`, `%${search}%`])));
  res.json(applyFees(childListQuery()));
});

app.get('/api/children/:id', requireAuth, (req, res) => {
  const row = childListQuery('c.id = ?', [req.params.id])[0];
  if (!row) return res.status(404).json({ error: 'Topilmadi' });
  res.json(applyFees([row])[0]);
});

app.get('/api/children/:id/profile', requireAuth, (req, res) => {
  const child = childListQuery('c.id = ?', [req.params.id])[0];
  if (!child) return res.status(404).json({ error: 'Topilmadi' });
  if (req.session.user.role === 'parent') {
    const own = parentChildren(currentParentId(req), false).some(c => c.id === child.id);
    if (!own) return res.status(403).json({ error: 'Bu bola sizga tegishli emas' });
  }
  const month = req.query.month || currentMonth();
  const attRows = db.prepare('SELECT status, COUNT(*) cnt FROM attendance WHERE child_id = ? AND substr(date,1,7) = ? GROUP BY status').all(req.params.id, month);
  const att = { present: 0, absent: 0, late: 0 };
  for (const r of attRows) if (att[r.status] != null) att[r.status] = r.cnt;
  const attDays = db.prepare('SELECT date, status FROM attendance WHERE child_id = ? AND substr(date,1,7) = ? ORDER BY date DESC').all(req.params.id, month);
  const pays = db.prepare('SELECT * FROM payments WHERE child_id = ? ORDER BY paid_date DESC, id DESC LIMIT 30').all(req.params.id);
  const totalPaid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND status = 'confirmed'").get(req.params.id).s;
  const fee = effectiveFee(child);
  const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND month = ? AND status = 'confirmed'").get(req.params.id, month).s;
  res.json({ child: { ...child, effective_fee: fee, fee_note: feeNote(child) }, month, att, attDays, pays, totalPaid, monthPaid: paid, due: Math.max(0, fee - paid) });
});

app.post('/api/children', requireStaff, (req, res) => {
  const { full_name, birth_date, gender, group_id, parent_id, enrolled_at, status, notes } = req.body || {};
  if (!full_name) return res.status(400).json({ error: 'Bolaning ismini kiriting' });
  const r = db.prepare('INSERT INTO children (full_name, birth_date, gender, group_id, parent_id, enrolled_at, status, notes) VALUES (?,?,?,?,?,?,?,?)')
    .run(full_name, birth_date || '', gender || 'erkak', group_id || null, parent_id || null, enrolled_at || today(), status || 'active', notes || '');
  audit(req, 'yaratish', 'child', full_name);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/children/:id', requireStaff, (req, res) => {
  const { full_name, birth_date, gender, group_id, parent_id, enrolled_at, status, notes } = req.body || {};
  db.prepare('UPDATE children SET full_name=?, birth_date=?, gender=?, group_id=?, parent_id=?, enrolled_at=?, status=?, notes=? WHERE id=?')
    .run(full_name, birth_date || '', gender || 'erkak', group_id || null, parent_id || null, enrolled_at || today(), status || 'active', notes || '', req.params.id);
  audit(req, 'yangilash', 'child', String(full_name));
  res.json({ ok: true });
});

app.delete('/api/children/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM children WHERE id = ?').run(req.params.id);
  audit(req, 'o\'chirish', 'child', `id=${req.params.id}`);
  res.json({ ok: true });
});

/* ---------- Attendance ---------- */

app.get('/api/attendance', requireAuth, (req, res) => {
  const date = req.query.date || today();
  const rows = db.prepare('SELECT a.child_id, a.status, a.date FROM attendance a WHERE a.date = ?').all(date);
  const map = {};
  for (const r of rows) map[r.child_id] = r.status;
  const gid = teacherGroupId(req);
  const children = gid != null
    ? db.prepare('SELECT c.id, c.full_name, g.name AS group_name, g.color AS group_color FROM children c LEFT JOIN groups g ON g.id = c.group_id WHERE c.status = \'active\' AND c.group_id = ? ORDER BY c.full_name').all(gid)
    : db.prepare('SELECT c.id, c.full_name, g.name AS group_name, g.color AS group_color FROM children c LEFT JOIN groups g ON g.id = c.group_id WHERE c.status = \'active\' ORDER BY g.age_min, c.full_name').all();
  res.json({ date, map, children });
});

app.post('/api/attendance', requireAuth, (req, res) => {
  const { date, records } = req.body || {};
  if (!date || !Array.isArray(records)) return res.status(400).json({ error: 'Noto\'g\'ri ma\'lumot' });
  if (req.session.user.role === 'teacher') {
    const gid = teacherGroupId(req);
    const own = gid != null ? db.prepare('SELECT id FROM children WHERE group_id = ? AND status = \'active\'').all(gid).map(r => r.id) : [];
    if (records.some(r => !own.includes(Number(r.child_id)))) {
      return res.status(403).json({ error: 'Faqat o\'z guruhingiz davomatini saqlashingiz mumkin' });
    }
  }
  const stmt = db.prepare(`
    INSERT INTO attendance (child_id, date, status) VALUES (?, ?, ?)
    ON CONFLICT(child_id, date) DO UPDATE SET status = excluded.status
  `);
  db.exec('BEGIN');
  try {
    for (const r of records) stmt.run(r.child_id, date, r.status || 'present');
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  audit(req, 'saqlash', 'attendance', `${date}: ${records.length} ta yozuv`);
  res.json({ ok: true });
});

app.get('/api/attendance/month', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const rows = db.prepare(`
    SELECT a.date, a.status, COUNT(*) AS cnt
    FROM attendance a WHERE substr(a.date, 1, 7) = ?
    GROUP BY a.date, a.status ORDER BY a.date
  `).all(month);
  const byDate = {};
  for (const r of rows) {
    if (!byDate[r.date]) byDate[r.date] = { present: 0, absent: 0, late: 0 };
    byDate[r.date][r.status] = r.cnt;
  }
  res.json({ month, byDate });
});

/* ---------- Payments ---------- */

app.get('/api/payments', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const rows = db.prepare(`
    SELECT pay.*, c.full_name AS child_name, g.name AS group_name
    FROM payments pay
    JOIN children c ON c.id = pay.child_id
    LEFT JOIN groups g ON g.id = c.group_id
    WHERE pay.month = ?
    ORDER BY pay.paid_date DESC, pay.id DESC
  `).all(month);
  const total = rows.reduce((s, r) => s + (r.status === 'confirmed' ? r.amount : 0), 0);
  res.json({ month, total, rows });
});

app.get('/api/payments/status', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const children = db.prepare(`
    SELECT c.id, c.full_name, c.birth_date, c.parent_id, g.name AS group_name, g.fee_per_month, g.color AS group_color
    FROM children c LEFT JOIN groups g ON g.id = c.group_id
    WHERE c.status = 'active'
  `).all();
  const paid = db.prepare('SELECT child_id, SUM(amount) AS total FROM payments WHERE month = ? AND status = \'confirmed\' GROUP BY child_id').all(month);
  const pmap = {};
  for (const p of paid) pmap[p.child_id] = p.total;
  const result = children.map(c => {
    const paidAmt = pmap[c.id] || 0;
    const fee = effectiveFee(c);
    return { ...c, paid: paidAmt, fee, fee_note: feeNote(c), due: Math.max(0, fee - paidAmt), paid_full: paidAmt >= fee };
  });
  const totalPaid = result.reduce((s, r) => s + r.paid, 0);
  const totalDue = result.reduce((s, r) => s + r.due, 0);
  const paidCount = result.filter(r => r.paid_full).length;
  res.json({ month, totalPaid, totalDue, paidCount, total: children.length, children: result });
});

app.post('/api/payments', requireStaff, (req, res) => {
  const { child_id, amount, month, paid_date, method, receipt_no, notes } = req.body || {};
  if (!child_id || !amount || !month) return res.status(400).json({ error: 'To\'liq ma\'lumot kiriting' });
  const r = db.prepare('INSERT INTO payments (child_id, amount, month, paid_date, method, receipt_no, notes) VALUES (?,?,?,?,?,?,?)')
    .run(child_id, amount, month, paid_date || today(), method || 'naqd', receipt_no || '', notes || '');
  const child = db.prepare('SELECT full_name FROM children WHERE id = ?').get(child_id);
  try {
    bot.notifyPaymentConfirmed({ amount, month, receipt_no: receipt_no || '' }, child ? child.full_name : '');
  } catch (e) {}
  audit(req, 'yaratish', 'payment', `child=${child_id}, ${amount} so'm, ${month}`);
  res.json({ id: r.lastInsertRowid });
});

app.delete('/api/payments/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.id);
  audit(req, 'o\'chirish', 'payment', `id=${req.params.id}`);
  res.json({ ok: true });
});

/* ---------- Expenses ---------- */

app.get('/api/expenses', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const rows = db.prepare('SELECT * FROM expenses WHERE substr(expense_date, 1, 7) = ? ORDER BY expense_date DESC, id DESC').all(month);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  res.json({ month, total, rows });
});

app.post('/api/expenses', requireStaff, (req, res) => {
  const { name, category, amount, expense_date, notes, method } = req.body || {};
  if (!name || !amount) return res.status(400).json({ error: 'Nom va summasi kiriting' });
  const r = db.prepare('INSERT INTO expenses (name, category, amount, expense_date, notes, method) VALUES (?,?,?,?,?,?)')
    .run(name, category || 'Boshqa', amount, expense_date || today(), notes || '', method || 'naqd');
  audit(req, 'yaratish', 'expense', `${name}, ${amount} so'm`);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/expenses/:id', requireStaff, (req, res) => {
  const { name, category, amount, expense_date, notes, method } = req.body || {};
  db.prepare('UPDATE expenses SET name=?, category=?, amount=?, expense_date=?, notes=?, method=? WHERE id=?')
    .run(name, category || 'Boshqa', amount, expense_date || today(), notes || '', method || 'naqd', req.params.id);
  audit(req, 'yangilash', 'expense', String(name));
  res.json({ ok: true });
});

app.delete('/api/expenses/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  audit(req, 'o\'chirish', 'expense', `id=${req.params.id}`);
  res.json({ ok: true });
});

/* ---------- Reports ---------- */

app.get('/api/reports/monthly', requireAuth, (req, res) => {
  res.json(monthlyReport(req.query.month || currentMonth()));
});

function monthlyReport(month) {
  const income = db.prepare('SELECT IFNULL(SUM(amount),0) s FROM payments WHERE month = ? AND status = \'confirmed\'').get(month).s;
  const expense = db.prepare('SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE substr(expense_date,1,7) = ?').get(month).s;
  const profit = income - expense;

  const payments = db.prepare(`
    SELECT pay.*, c.full_name AS child_name, g.name AS group_name
    FROM payments pay JOIN children c ON c.id = pay.child_id LEFT JOIN groups g ON g.id = c.group_id
    WHERE pay.month = ? ORDER BY pay.paid_date
  `).all(month);

  const expenses = db.prepare('SELECT * FROM expenses WHERE substr(expense_date,1,7) = ? ORDER BY expense_date').all(month);

  const byMethod = db.prepare('SELECT method, COUNT(*) cnt, SUM(amount) total FROM payments WHERE month = ? AND status = \'confirmed\' GROUP BY method').all(month);
  const byCategory = db.prepare('SELECT category, COUNT(*) cnt, SUM(amount) total FROM expenses WHERE substr(expense_date,1,7) = ? GROUP BY category').all(month);

  const att = db.prepare("SELECT status, COUNT(*) cnt FROM attendance WHERE substr(date,1,7) = ? GROUP BY status").all(month);
  const attTotals = { present: 0, absent: 0, late: 0 };
  for (const a of att) attTotals[a.status] = a.cnt;

  const kids = db.prepare(`
    SELECT c.id, c.full_name, c.birth_date, c.parent_id, c.enrolled_at,
           g.name AS group_name, g.fee_per_month
    FROM children c LEFT JOIN groups g ON g.id = c.group_id
    WHERE c.status = 'active'
  `).all();
  const debts = kids.map(k => {
    const fee = effectiveFee(k);
    const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND month = ? AND status = 'confirmed'").get(k.id, month).s;
    const due = Math.max(0, fee - paid);
    const unpaidMonths = unpaidMonthsCount(k, fee);
    return { child_id: k.id, child_name: k.full_name, group_name: k.group_name || '', fee, paid, due, unpaidMonths };
  });
  const totalDue = debts.reduce((a, d) => a + d.due, 0);
  const over2 = debts.filter(d => d.unpaidMonths >= 2);

  return { month, income, expense, profit, payments, expenses, byMethod, byCategory, attTotals, debts, totalDue, over2 };
}

app.get('/api/export/report.pdf', requireAuth, async (req, res) => {
  try {
    const month = req.query.month || currentMonth();
    const r = monthlyReport(month);
    const siteName = (db.prepare("SELECT value FROM settings WHERE key = 'site_name'").get() || {}).value || 'Denov Kindergarden';

    if (!pdfreport.fontOk()) {
      return res.status(500).send('PDF fontlar topilmadi');
    }

    const pdf = await pdfreport.buildReportPdf({
      siteName,
      month,
      income: r.income,
      expense: r.expense,
      profit: r.profit,
      att: r.attTotals,
      payments: r.payments,
      expenses: r.expenses,
      debts: r.debts
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="hisobot_${month}.pdf"`);
    res.send(Buffer.from(pdf));
  } catch (e) {
    console.error('PDF generatsiya xatosi:', e.stack);
    res.status(500).json({ error: 'PDF generatsiya xatosi: ' + e.message });
  }
});

app.get('/api/export/report.xlsx', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const r = monthlyReport(month);
  const siteName = (db.prepare("SELECT value FROM settings WHERE key = 'site_name'").get() || {}).value || 'Denov Kindergarden';

  const fmt = v => ({ _num: Number(v) || 0 });

  // ===== Sheet 1: Umumiy hisobot =====
  const titleRow = 2;
  const summaryRows = [
    [],
    [siteName, '', '', ''],
    [monthName(month) + ' — Moliyaviy hisobot', '', '', ''],
    [],
    ['Ko\'rsatkich', 'Summa', 'Ta\'rif', ''],
    ['Daromad', fmt(r.income), 'Jami to\'lovlar', ''],
    ['Xarajat', fmt(r.expense), 'Jami xarajatlar', ''],
    ['Sof foyda', fmt(r.profit), r.profit >= 0 ? 'Foyda' : 'Zarar', ''],
    [],
    ['Davomat', '', '', ''],
    ['Keldi', r.attTotals.present, ' bola', ''],
    ['Kech keldi', r.attTotals.late, ' bola', ''],
    ['Kelmadi', r.attTotals.absent, ' bola', ''],
    [],
    ['Qarzlar', '', '', ''],
    ['Jami qarz', fmt(r.totalDue), '', ''],
    ['Qarzdor bolalar', r.debts.filter(d => d.due > 0).length, ' ta', ''],
    ['2+ oy to\'lovsizlar', r.over2.length, ' ta', '']
  ];
  summaryRows.styles = [];
  summaryRows.styles[1] = 2;
  summaryRows.styles[2] = 8;
  summaryRows.styles[4] = 3;
  summaryRows.styles[5] = 5;
  summaryRows.styles[6] = 5;
  summaryRows.styles[7] = 5;
  summaryRows.styles[9] = 3;
  summaryRows.styles[13] = 3;
  summaryRows.styles[14] = 5;
  for (let i = 5; i <= 7; i++) { if (summaryRows.styles[i] === undefined) summaryRows.styles[i] = 5; }
  summaryRows.colWidths = [30, 20, 20, 10];
  summaryRows.merges = ['A1:D1', 'A2:D2', 'A3:D3'];

  // ===== Sheet 2: To'lovlar =====
  const payRows = [
    ['№', 'Bola', 'Guruh', 'Oy', 'Sana', 'Summa (so\'m)', 'Usul', 'Kvitansiya'],
    ...r.payments.map((p, i) => [i + 1, p.child_name, p.group_name || '', p.month, p.paid_date, fmt(p.amount), p.method === 'naqd' ? 'Naqd' : p.method === 'karta' ? 'Plastik karta' : 'O\'tkazma', p.receipt_no || ''])
  ];
  payRows.styles = [];
  payRows.styles[0] = 3;
  for (let i = 1; i < payRows.length; i++) {
    payRows.styles[i] = i % 2 === 0 ? 4 : 6;
  }
  payRows.styles[0] = 3;
  payRows.colWidths = [6, 25, 18, 12, 14, 18, 16, 16];

  // ===== Sheet 3: Xarajatlar =====
  const expRows = [
    ['№', 'Xarajat nomi', 'Kategoriya', 'Sana', 'Summa (so\'m)', 'Izoh'],
    ...r.expenses.map((e, i) => [i + 1, e.name, e.category, e.expense_date, fmt(e.amount), e.notes || ''])
  ];
  expRows.styles = [];
  expRows.styles[0] = 3;
  for (let i = 1; i < expRows.length; i++) {
    expRows.styles[i] = i % 2 === 0 ? 4 : 6;
  }
  expRows.colWidths = [6, 25, 18, 14, 18, 25];

  // ===== Sheet 4: Qarzdorlar =====
  const debtRows = [
    ['№', 'Bola', 'Guruh', 'Oylik narx', 'To\'langan', 'Qarz', 'To\'lovsiz oylar'],
    ...r.debts.filter(d => d.due > 0 || d.unpaidMonths > 0).map((d, i) => [
      i + 1, d.child_name, d.group_name, fmt(d.fee), fmt(d.paid), fmt(d.due), d.unpaidMonths
    ])
  ];
  debtRows.styles = [];
  debtRows.styles[0] = 3;
  for (let i = 1; i < debtRows.length; i++) {
    debtRows.styles[i] = i % 2 === 0 ? 4 : 6;
  }
  debtRows.colWidths = [6, 25, 18, 16, 16, 16, 16];

  // ===== Sheet 5: Kassa kitobi =====
  const allPayments = db.prepare(`
    SELECT pay.*, c.full_name AS child_name, g.name AS group_name
    FROM payments pay JOIN children c ON c.id = pay.child_id LEFT JOIN groups g ON g.id = c.group_id
    WHERE pay.month = ? AND pay.status = 'confirmed'
    ORDER BY pay.paid_date, pay.id
  `).all(month);
  const allExpenses = db.prepare('SELECT * FROM expenses WHERE substr(expense_date,1,7) = ? ORDER BY expense_date, id').all(month);

  const cashRows = [
    ['KASSA KITOBI — ' + monthName(month), '', '', '', '', ''],
    ['Sana', 'Tavsif', 'Tur', 'Kirim (so\'m)', 'Chiqim (so\'m)', 'Qoldiq (so\'m)'],
  ];
  let balance = 0;
  const dayMap = {};

  for (const p of allPayments) {
    const d = p.paid_date || month;
    if (!dayMap[d]) dayMap[d] = { income: 0, expense: 0, items: [] };
    dayMap[d].income += p.amount;
    dayMap[d].items.push({ desc: p.child_name + ' — to\'lov', type: 'Kirim', amount: p.amount });
  }
  for (const e of allExpenses) {
    const d = e.expense_date || month;
    if (!dayMap[d]) dayMap[d] = { income: 0, expense: 0, items: [] };
    dayMap[d].expense += e.amount;
    dayMap[d].items.push({ desc: e.name + ' (' + e.category + ')', type: 'Chiqim', amount: e.amount });
  }

  const sortedDays = Object.keys(dayMap).sort();
  for (const d of sortedDays) {
    for (const item of dayMap[d].items) {
      if (item.type === 'Kirim') {
        balance += item.amount;
        cashRows.push([d, item.desc, 'Kirim', fmt(item.amount), '', fmt(balance)]);
      } else {
        balance -= item.amount;
        cashRows.push([d, item.desc, 'Chiqim', '', fmt(item.amount), fmt(balance)]);
      }
    }
    if (dayMap[d].items.length > 1) {
      cashRows.push([d, 'KUNLIK XULOSA', '', fmt(dayMap[d].income), fmt(dayMap[d].expense), fmt(balance)]);
    }
  }

  cashRows.push([]);
  cashRows.push(['', 'JAMI', '', fmt(allPayments.reduce((s, p) => s + p.amount, 0)), fmt(allExpenses.reduce((s, e) => s + e.amount, 0)), fmt(balance)]);
  cashRows.push(['', 'KASSA QOLDIG\'I', '', '', '', fmt(balance)]);

  cashRows.styles = [];
  cashRows.styles[0] = 2;
  cashRows.styles[1] = 3;
  for (let i = 2; i < cashRows.length; i++) {
    const row = cashRows[i];
    if (row[1] === 'KUNLIK XULOSA' || row[1] === 'JAMI' || row[1] === 'KASSA QOLDIG\'I') {
      cashRows.styles[i] = 5;
    } else {
      cashRows.styles[i] = row[2] === 'Kirim' ? undefined : row[2] === 'Chiqim' ? undefined : 4;
    }
  }
  cashRows.colWidths = [14, 30, 12, 18, 18, 18];
  cashRows.merges = ['A1:F1'];

  const buf = xlsx.buildXlsx([
    { name: 'Umumiy hisobot', rows: summaryRows },
    { name: 'To\'lovlar', rows: payRows },
    { name: 'Xarajatlar', rows: expRows },
    { name: 'Qarzdorlar', rows: debtRows },
    { name: 'Kassa kitobi', rows: cashRows }
  ]);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="hisobot_${month}.xlsx"`);
  res.send(buf);
});

function monthName(m) {
  const MONTHS = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const mm = Number(String(m).slice(5, 7));
  return (MONTHS[mm] || m) + ' ' + String(m).slice(0, 4);
}

/* ---------- Dashboard ---------- */

app.get('/api/dashboard', requireAuth, (req, res) => {
  const t = today();
  const m = req.query.month && /^\d{4}-\d{2}$/.test(req.query.month) ? req.query.month : currentMonth();
  const isCurrent = m === currentMonth();

  const totalChildren = db.prepare("SELECT COUNT(*) c FROM children WHERE status = 'active'").get().c;
  const totalGroups = db.prepare('SELECT COUNT(*) c FROM groups').get().c;
  const totalTeachers = db.prepare('SELECT COUNT(*) c FROM teachers').get().c;
  const todayPresent = db.prepare("SELECT COUNT(*) c FROM attendance WHERE date = ? AND status != 'absent'").get(t).c;

  const incomeMonth = db.prepare('SELECT IFNULL(SUM(amount),0) s FROM payments WHERE month = ? AND status = \'confirmed\'').get(m).s;
  const expenseMonth = db.prepare('SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE substr(expense_date,1,7) = ?').get(m).s;
  const profitMonth = incomeMonth - expenseMonth;

  const dueTotal = (() => {
    const kids = db.prepare(`
      SELECT c.id, c.birth_date, c.parent_id, g.fee_per_month
      FROM children c LEFT JOIN groups g ON g.id = c.group_id
      WHERE c.status = 'active'
    `).all();
    let s = 0;
    for (const k of kids) {
      const fee = effectiveFee(k);
      const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND month = ? AND status = 'confirmed'").get(k.id, m).s;
      s += Math.max(0, fee - paid);
    }
    return s;
  })();

  const groups = db.prepare(`
    SELECT g.name, g.color, COUNT(c.id) AS cnt FROM groups g
    LEFT JOIN children c ON c.group_id = g.id AND c.status = 'active'
    GROUP BY g.id ORDER BY g.age_min
  `).all();

  const recentPayments = db.prepare(`
    SELECT pay.*, c.full_name AS child_name FROM payments pay
    JOIN children c ON c.id = pay.child_id
    WHERE pay.month = ?
    ORDER BY pay.paid_date DESC, pay.id DESC LIMIT 6
  `).all(m);

  let attDays;
  if (isCurrent) {
    attDays = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const row = db.prepare("SELECT COUNT(*) present FROM attendance WHERE date = ? AND status != 'absent'").get(ds);
      attDays.push({ date: ds, present: row.present });
    }
  } else {
    const rows = db.prepare(`
      SELECT date, COUNT(*) present FROM attendance
      WHERE substr(date,1,7) = ? AND status != 'absent'
      GROUP BY date ORDER BY date
    `).all(m);
    attDays = rows.map(r => ({ date: r.date, present: r.present }));
  }

  const monthAtt = db.prepare("SELECT status, COUNT(*) cnt FROM attendance WHERE substr(date,1,7) = ? GROUP BY status").all(m);
  const attTotals = { present: 0, absent: 0, late: 0 };
  for (const a of monthAtt) attTotals[a.status] = a.cnt;

  const availableMonths = (() => {
    const set = new Set();
    for (const r of db.prepare("SELECT DISTINCT month m FROM payments WHERE status = 'confirmed'").all()) if (r.m) set.add(r.m);
    for (const r of db.prepare("SELECT DISTINCT substr(expense_date,1,7) m FROM expenses").all()) if (r.m) set.add(r.m);
    for (const r of db.prepare("SELECT DISTINCT substr(date,1,7) m FROM attendance").all()) if (r.m) set.add(r.m);
    set.add(currentMonth());
    return [...set].sort();
  })();

  res.json({
    month: m, isCurrent, availableMonths,
    totalChildren, totalGroups, totalTeachers, todayPresent,
    incomeMonth, expenseMonth, profitMonth, dueTotal,
    groups, recentPayments, attDays, monthAtt: attTotals
  });
});

/* ---------- Menyu (ovqatlanish) ---------- */

app.get('/api/meals', requireAuth, (req, res) => {
  const date = req.query.date || today();
  const rows = db.prepare('SELECT * FROM meals WHERE meal_date = ? ORDER BY CASE meal_type WHEN \'nonushta\' THEN 1 WHEN \'tushlik\' THEN 2 ELSE 3 END').all(date);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    week.push(d.toISOString().slice(0, 10));
  }
  res.json({ date, rows, week });
});

app.get('/api/meals/week', requireAuth, (req, res) => {
  const start = req.query.start || today();
  const rows = db.prepare('SELECT * FROM meals WHERE meal_date >= ? ORDER BY meal_date').all(start);
  res.json(rows);
});

app.post('/api/meals', requireAdmin, (req, res) => {
  const { meal_date, meal_type, title, items } = req.body || {};
  if (!meal_date || !title) return res.status(400).json({ error: 'Sana va nom kiriting' });
  const r = db.prepare('INSERT INTO meals (meal_date, meal_type, title, items) VALUES (?,?,?,?)')
    .run(meal_date, meal_type || 'tushlik', title, items || '');
  audit(req, 'yaratish', 'meal', `${meal_date} ${meal_type}: ${title}`);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/meals/:id', requireAdmin, (req, res) => {
  const { meal_date, meal_type, title, items } = req.body || {};
  db.prepare('UPDATE meals SET meal_date=?, meal_type=?, title=?, items=? WHERE id=?')
    .run(meal_date, meal_type || 'tushlik', title, items || '', req.params.id);
  audit(req, 'yangilash', 'meal', String(title));
  res.json({ ok: true });
});

app.delete('/api/meals/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM meals WHERE id = ?').run(req.params.id);
  audit(req, 'o\'chirish', 'meal', `id=${req.params.id}`);
  res.json({ ok: true });
});

/* ---------- Eksport (Excel/CSV) ---------- */

app.get('/api/export/payments.csv', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const rows = db.prepare(`
    SELECT pay.paid_date, c.full_name, g.name, pay.method, pay.amount, pay.receipt_no, pay.status
    FROM payments pay JOIN children c ON c.id = pay.child_id LEFT JOIN groups g ON g.id = c.group_id
    WHERE pay.month = ? AND pay.status = 'confirmed' ORDER BY pay.paid_date
  `).all(month);
  csvFile(res, `to\'lovlar-${month}.csv`,
    ['Sana', 'Bola', 'Guruh', 'Usul', 'Summa', 'Kvitansiya'],
    rows.map(r => [r.paid_date, r.full_name, r.name || '', r.method, r.amount, r.receipt_no || '']));
});

app.get('/api/export/expenses.csv', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const rows = db.prepare('SELECT expense_date, name, category, amount, notes FROM expenses WHERE substr(expense_date,1,7) = ? ORDER BY expense_date').all(month);
  csvFile(res, `xarajatlar-${month}.csv`,
    ['Sana', 'Xarajat', 'Kategoriya', 'Summa', 'Izoh'],
    rows.map(r => [r.expense_date, r.name, r.category, r.amount, r.notes || '']));
});

app.get('/api/export/children.csv', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT c.full_name, c.birth_date, c.gender, g.name AS group_name, p.full_name AS parent_name, p.phone, c.status
    FROM children c LEFT JOIN groups g ON g.id = c.group_id LEFT JOIN parents p ON p.id = c.parent_id
    ORDER BY c.full_name
  `).all();
  csvFile(res, 'bolalar.csv',
    ['Bola', 'Tug\'ilgan sana', 'Jinsi', 'Guruh', 'Ota-ona', 'Telefon', 'Holat'],
    rows.map(r => [r.full_name, r.birth_date, r.gender, r.group_name || '', r.parent_name || '', r.phone || '', r.status]));
});

app.get('/api/export/attendance.csv', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const rows = db.prepare(`
    SELECT a.date, c.full_name, g.name AS group_name, a.status
    FROM attendance a JOIN children c ON c.id = a.child_id LEFT JOIN groups g ON g.id = c.group_id
    WHERE substr(a.date,1,7) = ? ORDER BY a.date, c.full_name
  `).all(month);
  csvFile(res, `davomat-${month}.csv`,
    ['Sana', 'Bola', 'Guruh', 'Holat'],
    rows.map(r => [r.date, r.full_name, r.group_name || '', r.status === 'present' ? 'Keldi' : r.status === 'late' ? 'Kech' : 'Keldi yo\'q']));
});

/* ---------- Backup/Restore ---------- */

app.get('/api/export/backup.db', requireAdmin, (req, res) => {
  const path = require('path');
  const dbPath = path.join(__dirname, 'data', 'bogcha.db');
  res.download(dbPath, 'bogcha_backup_' + new Date().toISOString().slice(0,10) + '.db');
});

const ALLOWED_TABLES = ['users','groups','teachers','parents','children','attendance','payments','expenses','meals','notifications','parent_requests','announcements','ratings','chat_messages','settings','tg_links','schedules','audit_log','sms_log','bot_reminders','month_archives'];

app.get('/api/table/:name', requireAdmin, (req, res) => {
  const t = req.params.name;
  if (!ALLOWED_TABLES.includes(t)) return res.status(400).json({ error: 'Noto\'g\'ri jadval' });
  try { const rows = db.prepare(`SELECT * FROM ${t}`).all(); res.json(rows); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/table/:name', requireAdmin, (req, res) => {
  const t = req.params.name;
  if (!ALLOWED_TABLES.includes(t)) return res.status(400).json({ error: 'Noto\'g\'ri jadval' });
  const rows = req.body.rows;
  if (!Array.isArray(rows) || !rows.length) return res.status(400).json({ error: 'Ma\'lumot yo\'q' });
  try {
    db.prepare(`DELETE FROM ${t}`).run();
    const cols = Object.keys(rows[0]);
    const placeholders = cols.map(() => '?').join(',');
    const stmt = db.prepare(`INSERT INTO ${t} (${cols.join(',')}) VALUES (${placeholders})`);
    const ins = db.transaction((rs) => { for (const r of rs) stmt.run(...cols.map(c => r[c] ?? null)); });
    ins(rows);
    res.json({ ok: true, inserted: rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- Xabarnomalar ---------- */

app.get('/api/notifications/prepare', requireAdmin, (req, res) => {
  const month = req.query.month || currentMonth();
  const settings = getSettings();
  const sname = settings.site_name || 'Denov Kindergarden';

  const unpaid = db.prepare(`
    SELECT p.id AS parent_id, p.full_name AS parent_name, p.phone, c.id AS child_id, c.full_name AS child_name, g.name AS group_name, g.fee_per_month AS fee,
      (SELECT IFNULL(SUM(amount),0) FROM payments WHERE child_id = c.id AND month = ? AND status = 'confirmed') AS paid
    FROM parents p JOIN children c ON c.parent_id = p.id AND c.status = 'active'
    LEFT JOIN groups g ON g.id = c.group_id
    WHERE (SELECT IFNULL(SUM(amount),0) FROM payments WHERE child_id = c.id AND month = ? AND status = 'confirmed') < g.fee_per_month
    ORDER BY p.full_name
  `).all(month, month);

  const absent = db.prepare(`
    SELECT p.id AS parent_id, p.full_name AS parent_name, p.phone, c.id AS child_id, c.full_name AS child_name, g.name AS group_name,
      (SELECT COUNT(*) FROM attendance WHERE child_id = c.id AND status = 'absent') AS absent_cnt
    FROM parents p JOIN children c ON c.parent_id = p.id AND c.status = 'active'
    LEFT JOIN groups g ON g.id = c.group_id
    WHERE (SELECT COUNT(*) FROM attendance WHERE child_id = c.id AND status = 'absent') > 0
    ORDER BY p.full_name
  `).all();

  const build = (x, kind) => ({
    parent_id: x.parent_id, parent_name: x.parent_name, phone: x.phone || '',
    child_name: x.child_name,
    message: kind === 'payment'
      ? `Hurmatli ${x.parent_name}! ${sname} bog'chasida bolangiz ${x.child_name} uchun ${month} oy to'lov qarzi mavjud. Iltimos to'lovni amalga oshiring.`
      : `Hurmatli ${x.parent_name}! ${sname} bog'chasida bolangiz ${x.child_name} bu oy ${x.absent_cnt} kun davomatsiz qayd etilgan. Iltimos bog'chaga murojaat qiling.`
  });

  res.json({
    month,
    payment: unpaid.map(x => build({ ...x, due: Math.max(0, (x.fee || 0) - (x.paid || 0)) }, 'payment')),
    attendance: absent.map(x => build(x, 'attendance'))
  });
});

app.post('/api/notifications/send', requireAdmin, async (req, res) => {
  const { type, channel, recipients, month } = req.body || {};
  if (!type || !Array.isArray(recipients) || !recipients.length) return res.status(400).json({ error: 'Qabul qiluvchilarni tanlang' });
  const settings = getSettings();
  const apiKey = (settings.sms_api_key || '').trim();
  const ins = db.prepare('INSERT INTO notifications (parent_id, parent_name, phone, child_name, type, channel, message, status) VALUES (?,?,?,?,?,?,?,?)');
  const insSms = db.prepare('INSERT INTO sms_log (phone, message, status) VALUES (?,?,?)');
  const sent = [];
  let smsCount = 0;

  for (const r of recipients) {
    let status = 'yuborildi';
    if (r.phone && apiKey) {
      try {
        const res2 = await sendSms(r.phone, r.message || '');
        if (res2.sent) { insSms.run(r.phone, r.message || '', 'yuborildi'); smsCount++; }
        else { insSms.run(r.phone, r.message || '', 'xato'); status = 'sms_xato'; }
      } catch (e) {
        insSms.run(r.phone, r.message || '', 'xato');
        status = 'sms_xato';
      }
    } else if (r.phone && !apiKey) {
      status = 'api_yoq';
    }
    ins.run(r.parent_id || null, r.parent_name || '', r.phone || '', r.child_name || '', type, channel || 'manual', r.message || '', status);
    if (r.parent_id) {
      addParentNotification(r.parent_id, type === 'payment' ? 'to\'lov' : 'xabarnoma', '', r.message || '');
    }
    sent.push({ parent_name: r.parent_name, phone: r.phone, message: r.message });
  }

  try { if (bot && bot.sendGroup) bot.sendGroup(recipients.map(r => r.message || '').join('\n\n')); } catch (e) {}

  audit(req, 'xabarnoma', 'notification', `${type}: ${sent.length} ta yuborildi (${smsCount} SMS)`);
  res.json({ ok: true, count: sent.length, smsCount });
});

app.get('/api/notifications/log', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM notifications ORDER BY id DESC LIMIT 100').all();
  res.json(rows);
});

/* ---------- E'lonlar ---------- */

app.get('/api/announcements', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM announcements ORDER BY id DESC LIMIT 50').all();
  res.json(rows);
});

app.post('/api/announcements', requireAdmin, async (req, res) => {
  const { title, text, send_tg, send_sms } = req.body || {};
  if (!title || !text) return res.status(400).json({ error: 'Sarlavha va matn kiriting' });
  const r = db.prepare('INSERT INTO announcements (title, text, created_by) VALUES (?,?,?)')
    .run(title, text, req.session.user.full_name || req.session.user.username || '');
  audit(req, 'yaratish', 'announcement', title);
  addParentNotificationsForAll('e\'lon', title, text);
  if (send_tg) {
    try { bot.notifyAnnouncement(title, text); } catch (e) {}
  }
  let smsSent = 0;
  if (send_sms) {
    const settings = getSettings();
    const hasApi = (settings.sms_api_key || '').trim();
    if (!hasApi) return res.status(400).json({ error: 'SMS xizmati sozlanmagan. Sozlamalar → SMS maydonini to\'ldiring', id: r.lastInsertRowid });
    const phones = db.prepare("SELECT DISTINCT phone FROM parents WHERE phone IS NOT NULL AND phone != ''").all().map(p => p.phone);
    const insN = db.prepare('INSERT INTO notifications (parent_name, phone, type, channel, message, status) VALUES (?,?,?,?,?,?)');
    const insS = db.prepare('INSERT INTO sms_log (phone, message, status) VALUES (?,?,?)');
    const msg = `${title}\n${text}. Batafsil: ${settings.site_name || 'Denov Kindergarden'}`.slice(0, 160);
    for (const phone of phones) {
      const res2 = await sendSms(phone, msg);
      const status = res2.sent ? 'yuborildi' : 'xato';
      insN.run('', phone, 'e\'lon', 'sms', msg, status);
      insS.run(phone, msg, status);
      if (res2.sent) smsSent++;
    }
  }
  res.json({ id: r.lastInsertRowid, smsSent });
});

app.delete('/api/announcements/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
  audit(req, 'o\'chirish', 'announcement', `id=${req.params.id}`);
  res.json({ ok: true });
});

/* ---------- Bola fotosi ---------- */

app.post('/api/children/:id/photo', requireStaff, (req, res) => {
  const { photo } = req.body || {};
  if (typeof photo !== 'string' || !photo) return res.status(400).json({ error: 'Rasm tanlanmadi' });
  const child = db.prepare('SELECT id, full_name FROM children WHERE id = ?').get(req.params.id);
  if (!child) return res.status(404).json({ error: 'Bola topilmadi' });
  const m = photo.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);
  if (!m) return res.status(400).json({ error: 'Noto\'g\'ri rasm formati' });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 8 * 1024 * 1024) return res.status(400).json({ error: 'Rasm juda katta (maksimal 8MB)' });
  const ext = m[1].toLowerCase() === 'png' ? 'png' : m[1].toLowerCase() === 'webp' ? 'webp' : 'jpg';
  const dir = path.join(__dirname, 'public', 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  const name = 'child_' + child.id + '_' + Date.now() + '.' + ext;
  fs.writeFileSync(path.join(dir, name), buf);
  const url = '/uploads/' + name;
  db.prepare('UPDATE children SET photo = ? WHERE id = ?').run(url, child.id);
  audit(req, 'yangilash', 'child_photo', child.full_name);
  res.json({ ok: true, photo: url });
});

app.delete('/api/children/:id/photo', requireStaff, (req, res) => {
  const child = db.prepare('SELECT id, photo FROM children WHERE id = ?').get(req.params.id);
  if (!child) return res.status(404).json({ error: 'Bola topilmadi' });
  if (child.photo && child.photo.startsWith('/uploads/')) {
    const f = path.join(__dirname, 'public', child.photo);
    try { fs.unlinkSync(f); } catch (e) {}
  }
  db.prepare("UPDATE children SET photo = '' WHERE id = ?").run(child.id);
  res.json({ ok: true });
});

/* ---------- Tug'ilgan kunlar ---------- */

function fmtDateStr(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function addDays(dateStr, n) {
  const p = String(dateStr).split('-');
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  d.setDate(d.getDate() + n);
  return fmtDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function nextBirthday(birthDate, refDate) {
  if (!birthDate) return null;
  const parts = String(birthDate).split('-');
  if (parts.length < 3) return null;
  const mm = Number(parts[1]), dd = Number(parts[2]);
  if (!mm || !dd) return null;
  const t = String(refDate || today());
  const tp = t.split('-');
  const now = new Date(Number(tp[0]), Number(tp[1]) - 1, Number(tp[2]));
  let occ = new Date(now.getFullYear(), mm - 1, dd);
  if (occ < now) occ = new Date(now.getFullYear() + 1, mm - 1, dd);
  return fmtDateStr(occ.getFullYear(), occ.getMonth() + 1, occ.getDate());
}

function daysUntil(from, to) {
  const a = new Date(Number(from.slice(0, 4)), Number(from.slice(5, 7)) - 1, Number(from.slice(8, 10)));
  const b = new Date(Number(to.slice(0, 4)), Number(to.slice(5, 7)) - 1, Number(to.slice(8, 10)));
  return Math.round((b - a) / 86400000);
}

app.get('/api/birthdays', requireAuth, (req, res) => {
  const t = today();
  const t0 = t + 'T00:00:00';
  const all = [];

  const kids = db.prepare(`
    SELECT c.id, c.full_name, c.birth_date, c.gender, g.name AS group_name, g.color AS group_color,
           p.phone AS parent_phone
    FROM children c
    LEFT JOIN groups g ON g.id = c.group_id
    LEFT JOIN parents p ON p.id = c.parent_id
    WHERE c.status = 'active' AND c.birth_date != ''
  `).all();
  for (const k of kids) {
    const nb = nextBirthday(k.birth_date, t);
    if (nb) all.push({ kind: 'child', id: k.id, full_name: k.full_name, birth_date: k.birth_date, next: nb, in_days: daysUntil(t, nb), group_name: k.group_name || '', group_color: k.group_color || '', parent_phone: k.parent_phone || '', age_turns: new Date(nb).getFullYear() - Number(k.birth_date.split('-')[0]) });
  }

  const staff = db.prepare(`SELECT id, full_name, birth_date, position, phone FROM teachers WHERE birth_date != ''`).all();
  for (const s of staff) {
    const nb = nextBirthday(s.birth_date, t);
    if (nb) all.push({ kind: 'teacher', id: s.id, full_name: s.full_name, birth_date: s.birth_date, next: nb, in_days: daysUntil(t, nb), group_name: s.position || 'Xodim', group_color: '#8b5cf6', parent_phone: s.phone || '', age_turns: new Date(nb).getFullYear() - Number(s.birth_date.split('-')[0]) });
  }

  const sorted = all.sort((a, b) => a.in_days - b.in_days);
  const todayList = sorted.filter(x => x.in_days === 0);
  const weekList = sorted.filter(x => x.in_days >= 0 && x.in_days <= 7);

  const month = String(t).slice(0, 7);
  const monthList = all
    .filter(x => x.next.slice(0, 7) === month)
    .sort((a, b) => (a.next.slice(5) < b.next.slice(5) ? -1 : 1))
    .slice(0, 200);

  res.json({ today: todayList, upcoming: weekList, month, monthList });
});

/* ---------- Backup / Restore ---------- */

function dumpData() {
  const tables = ['users', 'groups', 'teachers', 'parents', 'children', 'attendance', 'payments', 'expenses', 'meals', 'notifications', 'parent_requests', 'settings'];
  const data = {};
  for (const t of tables) data[t] = db.prepare(`SELECT * FROM ${t}`).all();
  return data;
}

app.get('/api/backup', requireAdmin, (req, res) => {
  const data = dumpData();
  res.setHeader('Content-Disposition', `attachment; filename="bogcha-backup-${today()}.json"`);
  res.setHeader('Content-Type', 'application/json');
  audit(req, 'zaxiralash', 'backup', `${today()} backup yaratildi`);
  res.send(JSON.stringify({ app: 'bogcham', version: 1, exported_at: new Date().toISOString(), data }, null, 2));
});

app.post('/api/backup/restore', requireAdmin, (req, res) => {
  const { data } = req.body || {};
  if (!data || typeof data !== 'object') return res.status(400).json({ error: 'Yaroqli backup ma\'lumoti emas' });
  const tables = ['users', 'groups', 'teachers', 'parents', 'children', 'attendance', 'payments', 'expenses', 'meals', 'notifications', 'parent_requests', 'settings'];
  db.exec('PRAGMA foreign_keys = OFF');
  db.exec('BEGIN');
  try {
    for (const t of tables) db.prepare(`DELETE FROM ${t}`).run();
    for (const t of tables) {
      const rows = data[t];
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        const insertCols = Object.keys(row);
        if (!insertCols.length) continue;
        const q = `INSERT INTO ${t} (${insertCols.join(',')}) VALUES (${insertCols.map(() => '?').join(',')})`;
        db.prepare(q).run(...insertCols.map(k => row[k] ?? null));
      }
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    return res.status(400).json({ error: 'Restore xatosi: ' + e.message });
  } finally {
    db.exec('PRAGMA foreign_keys = ON');
  }
  audit(req, 'tiklash', 'backup', 'backup tiklandi');
  res.json({ ok: true });
});

/* ---------- Audit jurnali ---------- */

app.get('/api/audit', requireAdmin, (req, res) => {
  const q = req.query;
  const limit = Math.min(Number(q.limit) || 100, 500);
  let sql = 'SELECT * FROM audit_log';
  const params = [];
  if (q.entity) { sql += ' WHERE entity = ?'; params.push(q.entity); }
  sql += ' ORDER BY id DESC LIMIT ?';
  params.push(limit);
  res.json(db.prepare(sql).all(...params));
});

/* ===== Scheduled hisobotlar (2) ===== */
const cron = require('node-cron');
let reportsSentThisMonth = {};

// 1-) Oylik hisobot yuborish (her oy 1-sana 00:00)
cron.schedule('0 0 1 * *', async () => {
  try {
    const month = currentMonth();
    const kids = db.prepare(`
      SELECT c.id, c.full_name, c.parent_id, c.birth_date, g.fee_per_month, g.name AS group_name
      FROM children c LEFT JOIN groups g ON g.id = c.group_id
      WHERE c.status = 'active'
    `).all();
    const debtors = [];
    for (const k of kids) {
      const fee = effectiveFee(k);
      const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND month = ? AND status = 'confirmed'").get(k.id, month).s;
      if (paid < fee) debtors.push({ ...k, due: fee - paid });
    }
    setSetting('reports_last', month);
    if (!debtors.length) return;
    
    let text = `📢 <b>Oylik hisobot</b> — ${monthName(month)}\n\nQarzdor bolalar:\n`;
    for (const d of debtors.slice(0, 15)) {
      text += `• ${d.full_name} (${d.group_name || '—'}): qarzi <b>${fmtMoney(d.due)}</b> so'm\n`;
    }
    if (debtors.length > 15) text += `\nva yana ${debtors.length - 15} ta bola...`;
    text += `\n\nIltimos to\'lovlarni amalga oshiring. Rahmat! 💐`;
    sendGroup(text, { parse_mode: 'HTML' });
    
    // Maxsulotlar bo‘yicha maxsus xabar
    const byParent = {};
    for (const d of debtors) {
      if (!byParent[d.parent_id]) byParent[d.parent_id] = [];
      byParent[d.parent_id].push(d);
    }
    for (const [pid, ds] of Object.entries(byParent)) {
      const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(pid);
      if (!parent) continue;
      const link = db.prepare('SELECT chat_id FROM tg_links WHERE parent_id = ?').get(pid);
      if (!link) continue;
      let t = `⚠️ <b>Hurmatli ${parent.full_name}!</b>\n\nTo'lov eslatmasi (${monthName(month)}):\n`;
      for (const d of ds) t += `• ${d.full_name}: qarzi <b>${fmtMoney(d.due)}</b> so'm\n`;
      t += `\nIltimos bog'chaga murojaat qiling yoki bot orqali to'lov so'rang. Rahmat!`;
      sendGroup(t, { parse_mode: 'HTML' });
    }
    setSetting('reports_sent_' + month, 'true');
    console.log('Scheduled hisobot yuborildi:', month);
  } catch (e) {
    console.error('[bot] scheduled report xatosi:', e.message);
  }
});

/* ===== Fayl yuklab olish va QR code (3) ===== */
const multer = require('multer');
const qrcode = require('qrcode');

// Fayl yuklash konfiguratsiyasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

// 2) QR code generatori endpoint
app.get('/api/qr/:text', async (req, res) => {
  try {
    const text = req.params.text;
    const url = await qrcode.toDataURL(text);
    res.send(`<img src="${url}" alt="QR code">`);
  } catch (e) {
    res.status(500).json({ error: 'QR code generatsiya xatosi' });
  }
});

// 3) Fayl yuklash endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fayl yuklanmadi' });
  res.json({ 
    ok: true, 
    filename: req.file.filename, 
    path: req.file.path,
    size: req.file.size
  });
});

/* ============================================================
   KUN JURNALI (day_journal) — tarbiyachi kunlik faoliyat kiritadi
   ============================================================ */
app.get('/api/journal', requireAuth, (req, res) => {
  const { date, group_id } = req.query;
  const where = [];
  const params = [];
  if (date) { where.push('journal_date = ?'); params.push(date); }
  if (group_id) { where.push('group_id = ?'); params.push(Number(group_id)); }
  const sql = `SELECT j.*, g.name AS group_name FROM day_journal j
               LEFT JOIN groups g ON g.id = j.group_id
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY j.journal_date DESC, j.id DESC LIMIT 200`;
  res.json(db.prepare(sql).all(...params));
});

app.post('/api/journal', requireStaff, (req, res) => {
  const { group_id, journal_date, title, activities, summary } = req.body || {};
  if (!journal_date || !title) return res.status(400).json({ error: 'Sana va sarlavha kiritilishi shart' });
  db.prepare(`INSERT INTO day_journal (group_id, journal_date, title, activities, summary, created_by)
              VALUES (?,?,?,?,?,?)
              ON CONFLICT(group_id, journal_date) DO UPDATE SET title = excluded.title, activities = excluded.activities, summary = excluded.summary, created_by = excluded.created_by`)
    .run(group_id || null, journal_date, title, activities || '', summary || '', req.session.user.full_name || req.session.user.username);
  audit(req, 'yaratish/yangilash', 'journal', `${journal_date}: ${title}`);
  res.json({ ok: true });
});

app.delete('/api/journal/:id', requireStaff, (req, res) => {
  db.prepare('DELETE FROM day_journal WHERE id = ?').run(req.params.id);
  audit(req, 'o\'chirish', 'journal', `id=${req.params.id}`);
  res.json({ ok: true });
});

/* ============================================================
   FOTOGALEREYA (gallery)
   ============================================================ */
app.get('/api/gallery', requireAuth, (req, res) => {
  const group_id = req.query.group_id;
  if (group_id) {
    return res.json(db.prepare('SELECT * FROM gallery WHERE group_id = ? ORDER BY created_at DESC').all(Number(group_id)));
  }
  res.json(db.prepare(`SELECT g.*, gr.name AS group_name FROM gallery g
                       LEFT JOIN groups gr ON gr.id = g.group_id
                       ORDER BY g.created_at DESC LIMIT 200`).all());
});

app.post('/api/gallery', requireStaff, (req, res) => {
  const { title, image, group_id } = req.body || {};
  if (!image) return res.status(400).json({ error: 'Rasm tanlanmagan' });
  const r = db.prepare('INSERT INTO gallery (group_id, title, image, created_by) VALUES (?,?,?,?)')
    .run(group_id || null, title || '', image, req.session.user.full_name || req.session.user.username);
  audit(req, 'yaratish', 'gallery', title || image);
  res.json({ id: r.lastInsertRowid });
});

app.delete('/api/gallery/:id', requireStaff, (req, res) => {
  const row = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  if (row && row.image && !row.image.startsWith('http')) {
    const imgPath = path.join(__dirname, 'uploads', path.basename(row.image));
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  audit(req, 'o\'chirish', 'gallery', `id=${req.params.id}`);
  res.json({ ok: true });
});

/* Bola rasmini yangilash: multer bilan yuklash yoki URL */
app.post('/api/children/:id/photo', requireStaff, upload.single('file'), (req, res) => {
  const id = req.params.id;
  const child = db.prepare('SELECT id FROM children WHERE id = ?').get(id);
  if (!child) return res.status(404).json({ error: 'Bola topilmadi' });
  const photoFromReq = req.body && req.body.photo;
  let photo = photoFromReq || '';
  if (req.file) photo = req.file.filename;
  if (!photo) return res.status(400).json({ error: 'Rasm tanlanmagan' });
  db.prepare('UPDATE children SET photo = ? WHERE id = ?').run(photo, id);
  audit(req, 'yangilash', 'child_photo', `id=${id}`);
  res.json({ ok: true, filename: photo });
});

/* Kurslar va landing arizalari */
app.get('/api/courses', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM courses ORDER BY sort, id').all());
});

app.post('/api/courses', requireAdmin, (req, res) => {
  const { name, description, price, duration, icon, sort } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Kurs nomi kiritilishi shart' });
  const r = db.prepare('INSERT INTO courses (name, description, price, duration, icon, sort) VALUES (?,?,?,?,?,?)')
    .run(name, description || '', Number(price) || 0, duration || '', icon || '🎨', Number(sort) || 0);
  audit(req, 'yaratish', 'course', name);
  res.json({ id: r.lastInsertRowid });
});

app.delete('/api/courses/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  audit(req, 'o\'chirish', 'course', `id=${req.params.id}`);
  res.json({ ok: true });
});

app.get('/api/landing/leads', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM landing_leads ORDER BY created_at DESC LIMIT 200').all());
});

app.post('/api/landing/lead', (req, res) => {
  const { parent_name, phone, child_name, message } = req.body || {};
  if (!parent_name || !phone) return res.status(400).json({ error: 'Ism va telefon kiritilishi shart' });
  const r = db.prepare('INSERT INTO landing_leads (child_name, parent_name, phone, message) VALUES (?,?,?,?)')
    .run(child_name || '', parent_name, phone, message || '');
  res.json({ ok: true, id: r.lastInsertRowid });
});

/* Uploded fayllarni serve qilish (rasmlar) */
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '30d' }));

/* ===== Qo'shimcha hisobotlar (4) ===== */
function fmtMoney(v) {
  return new Intl.NumberFormat('uz-UZ').format(Number(v || 0));
}

// 3) Bolalar umr bo'yiga ko'shirilgan xarajatlar
app.get('/api/reports/lifetime-expenditure', requireAuth, (req, res) => {
  const kids = db.prepare(`
    SELECT c.id, c.full_name, c.birth_date, c.parent_id, g.fee_per_month, g.name AS group_name
    FROM children c LEFT JOIN groups g ON g.id = c.group_id
    WHERE c.status = 'active'
  `).all();
  const debts = [];
  for (const k of kids) {
    const fee = effectiveFee(k);
    const totalPaid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ?").get(k.id).s;
    const due = Math.max(0, fee * 12 * 4 - totalPaid); // approximate lifetime
    debts.push({ child_name: k.full_name, group_name: k.group_name || '', fee: fee, totalPaid, due });
  }
  const totalDue = debts.reduce((a, d) => a + d.due, 0);
  res.json({ debts, totalDue, totalChildren: kids.length });
});

// 4) Oylik statistika
app.get('/api/reports/monthly-stats', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const kids = db.prepare(`
    SELECT c.id, c.full_name, c.birth_date, c.parent_id, g.fee_per_month, g.name AS group_name
    FROM children c LEFT JOIN groups g ON g.id = c.group_id
    WHERE c.status = 'active'
  `).all();
  const income = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE month = ? AND status = 'confirmed'").get(month).s;
  const expense = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE substr(expense_date,1,7) = ?").get(month).s;
  const profit = income - expense;
  const kidsStats = kids.map(k => {
    const fee = effectiveFee(k);
    const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND month = ? AND status = 'confirmed'").get(k.id, month).s;
    return { child_name: k.full_name, group_name: k.group_name || '', fee, paid, due: Math.max(0, fee - paid) };
  });
  res.json({ month, income, expense, profit, kidsStats });
});

/* ===== Sozlamalar qo'shimi (5) ===== */
// 5) QR code login sozlamalari
app.get('/api/settings/qr-login', requireAuth, (req, res) => {
  const s = getSettings();
  res.json({ qrLogin: s.qrLogin === '1' });
});

app.post('/api/settings/qr-login', requireAdmin, (req, res) => {
  const { enabled } = req.body || {};
  setSetting('qrLogin', enabled ? '1' : '0');
  res.json({ ok: true, qrLogin: enabled ? '1' : '0' });
});

// 5) Xavfli kirish sozlamalari
app.get('/api/settings/security', requireAuth, (req, res) => {
  const s = getSettings();
  res.json({ 
    twoFactor: s.twoFactor || '0', 
    loginAttempts: s.loginAttempts || '0',
    sessionTimeout: s.sessionTimeout || '24'
  });
});

app.post('/api/settings/security', requireAdmin, (req, res) => {
  const { twoFactor, loginAttempts, sessionTimeout } = req.body || {};
  if (twoFactor !== undefined) setSetting('twoFactor', twoFactor);
  if (loginAttempts !== undefined) setSetting('loginAttempts', loginAttempts);
  if (sessionTimeout !== undefined) setSetting('sessionTimeout', sessionTimeout);
  res.json({ ok: true });
});

/* ===== Yangi funksiyalar ===== */

/* --- 1) Grafik: oylik daromad/xarajat trendi --- */
app.get('/api/reports/trend', requireAuth, (req, res) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  const trend = months.map(m => {
    const income = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE month = ? AND status = 'confirmed'").get(m).s;
    const expense = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE substr(expense_date,1,7) = ?").get(m).s;
    return { month: m, income, expense, profit: income - expense };
  });
  res.json({ trend });
});

/* --- 1b) Xarajat kategoriyalari (pie chart) --- */
app.get('/api/reports/expense-categories', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const rows = db.prepare(`
    SELECT category, SUM(amount) AS total, COUNT(*) AS count
    FROM expenses WHERE substr(expense_date,1,7) = ?
    GROUP BY category ORDER BY total DESC
  `).all(month);
  const grandTotal = rows.reduce((s, r) => s + r.total, 0);
  const data = rows.map(r => ({
    category: r.category, total: r.total, count: r.count,
    pct: grandTotal > 0 ? Math.round(r.total / grandTotal * 100) : 0
  }));
  res.json({ month, grandTotal, data });
});

/* --- 1c) Kassa kitobi (cashbook) --- */
app.get('/api/reports/cashbook', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const payments = db.prepare(`
    SELECT pay.*, c.full_name AS child_name, g.name AS group_name
    FROM payments pay JOIN children c ON c.id = pay.child_id LEFT JOIN groups g ON g.id = c.group_id
    WHERE pay.month = ? AND pay.status = 'confirmed'
    ORDER BY pay.paid_date, pay.id
  `).all(month);
  const expenses = db.prepare('SELECT * FROM expenses WHERE substr(expense_date,1,7) = ? ORDER BY expense_date, id').all(month);

  const dayMap = {};
  for (const p of payments) {
    const d = p.paid_date || month;
    if (!dayMap[d]) dayMap[d] = [];
    dayMap[d].push({ date: d, desc: p.child_name + ' — to\'lov', type: 'income', amount: p.amount });
  }
  for (const e of expenses) {
    const d = e.expense_date || month;
    if (!dayMap[d]) dayMap[d] = [];
    dayMap[d].push({ date: d, desc: e.name + ' (' + e.category + ')', type: 'expense', amount: e.amount });
  }

  const entries = [];
  let balance = 0;
  for (const d of Object.keys(dayMap).sort()) {
    for (const item of dayMap[d]) {
      if (item.type === 'income') balance += item.amount;
      else balance -= item.amount;
      entries.push({ ...item, balance });
    }
  }
  const totalIncome = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  res.json({ month, entries, totalIncome, totalExpense, closingBalance: balance });
});

/* --- 2) Qarzdorlar avtomatik eslatma --- */
app.post('/api/notifications/remind-debtors', requireAdmin, (req, res) => {
  const { month } = req.body || {};
  const m = month || currentMonth();
  const settings = getSettings();
  const sname = settings.site_name || 'Denov Kindergarden';
  const kids = db.prepare(`
    SELECT c.id, c.full_name, c.parent_id, g.fee_per_month, g.name AS group_name
    FROM children c LEFT JOIN groups g ON g.id = c.group_id WHERE c.status = 'active'
  `).all();
  const debtors = [];
  for (const k of kids) {
    const fee = effectiveFee(k);
    const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND month = ? AND status = 'confirmed'").get(k.id, m).s;
    if (paid < fee) {
      const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(k.parent_id);
      if (parent) debtors.push({ child: k, parent, due: fee - paid });
    }
  }
  let sent = 0;
  for (const d of debtors) {
    const msg = `Hurmatli ${d.parent.full_name}! ${sname} bog'chasida bolangiz ${d.child.full_name} uchun ${m} oy to'lov qarzi: ${fmtMoney(d.due)} so'm. Iltimos to'lovni amalga oshiring.`;
    try {
      db.prepare('INSERT INTO notifications (parent_id, parent_name, phone, child_name, type, channel, message, status) VALUES (?,?,?,?,?,?,?,?)')
        .run(d.parent.id, d.parent.full_name, d.parent.phone || '', d.child.full_name, 'eslatma', 'manual', msg, 'yuborildi');
      const link = db.prepare('SELECT chat_id FROM tg_links WHERE parent_id = ?').get(d.parent.id);
      if (link) sendGroup(`⚠️ <b>Eslatma:</b> ${msg}`);
      sent++;
    } catch (e) {}
  }
  audit(req, 'eslatma', 'debtors', `${m}: ${sent} ta eslatma yuborildi`);
  res.json({ ok: true, sent, total: debtors.length });
});

/* --- 3) Ish jadvali (schedules) --- */
app.get('/api/schedules', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, t.full_name AS teacher_name, g.name AS group_name
    FROM schedules s
    LEFT JOIN teachers t ON t.id = s.teacher_id
    LEFT JOIN groups g ON g.id = t.group_id
    ORDER BY s.day_of_week, s.start_time
  `).all();
  res.json(rows);
});

app.post('/api/schedules', requireAdmin, (req, res) => {
  const { teacher_id, day_of_week, start_time, end_time, subject, notes } = req.body || {};
  if (!teacher_id || day_of_week == null) return res.status(400).json({ error: 'Tarbiyachi va kun kiriting' });
  const r = db.prepare('INSERT INTO schedules (teacher_id, day_of_week, start_time, end_time, subject, notes) VALUES (?,?,?,?,?,?)')
    .run(teacher_id, day_of_week, start_time || '08:00', end_time || '17:00', subject || '', notes || '');
  audit(req, 'yaratish', 'schedule', `teacher=${teacher_id}, kun=${day_of_week}`);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/schedules/:id', requireAdmin, (req, res) => {
  const { teacher_id, day_of_week, start_time, end_time, subject, notes } = req.body || {};
  db.prepare('UPDATE schedules SET teacher_id=?, day_of_week=?, start_time=?, end_time=?, subject=?, notes=? WHERE id=?')
    .run(teacher_id, day_of_week, start_time, end_time, subject || '', notes || '', req.params.id);
  res.json({ ok: true });
});

app.delete('/api/schedules/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM schedules WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* --- 4) Oylik ish haqi hisob-kitobi --- */
app.get('/api/reports/salary', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const teachers = db.prepare('SELECT * FROM teachers ORDER BY full_name').all();
  const result = teachers.map(t => {
    const daysInMonth = new Date(Number(month.slice(0,4)), Number(month.slice(5,7)), 0).getDate();
    const workDays = db.prepare(`
      SELECT COUNT(DISTINCT s.day_of_week) as days FROM schedules s WHERE s.teacher_id = ?
    `).get(t.id);
    const scheduledDays = workDays ? workDays.days : 0;
    const totalDays = scheduledDays || 22;
    const salary = t.salary || 0;
    const perDay = totalDays > 0 ? salary / totalDays : 0;
    const attendance = db.prepare(`
      SELECT COUNT(DISTINCT a.date) as days FROM attendance a
      JOIN children c ON c.id = a.child_id
      WHERE c.group_id = ? AND substr(a.date,1,7) = ? AND a.status != 'absent'
    `).get(t.group_id, month);
    const presentDays = attendance ? attendance.days : 0;
    const bonus = presentDays >= totalDays ? Math.round(salary * 0.1) : 0;
    const deduction = Math.max(0, (totalDays - presentDays) * perDay);
    const net = salary + bonus - deduction;
    return {
      teacher_id: t.id, full_name: t.full_name, position: t.position,
      base_salary: salary, total_days: totalDays, present_days: presentDays,
      per_day: Math.round(perDay), bonus, deduction: Math.round(deduction), net_salary: Math.round(net)
    };
  });
  const totalNet = result.reduce((s, r) => s + r.net_salary, 0);
  res.json({ month, teachers: result, totalNet });
});

/* --- 5) SMS xabarnoma (smsapi.uz) --- */
app.post('/api/sms/send', requireAdmin, async (req, res) => {
  const { phone, message } = req.body || {};
  if (!phone || !message) return res.status(400).json({ error: 'Telefon va xabar kiriting' });
  const apiKey = (getSettings().sms_api_key || '').trim();
  if (!apiKey) return res.status(400).json({ error: 'SMS API sozlanmagan. Settings bo\'limidan API kalitni kiriting.' });
  try {
    const result = await sendSms(phone, message);
    if (result.sent) {
      db.prepare('INSERT INTO sms_log (phone, message, status) VALUES (?,?,?)').run(phone, message, 'yuborildi');
      audit(req, 'sms', 'notification', `${phone}: yuborildi`);
      res.json({ ok: true, result });
    } else {
      db.prepare('INSERT INTO sms_log (phone, message, status) VALUES (?,?,?)').run(phone, message, 'xato');
      res.status(500).json({ error: 'SMS yuborishda xatolik: ' + (result.reason || 'xato') });
    }
  } catch (e) {
    db.prepare('INSERT INTO sms_log (phone, message, status) VALUES (?,?,?)').run(phone, message, 'xato');
    res.status(500).json({ error: 'SMS yuborishda xatolik: ' + e.message });
  }
});

app.get('/api/sms/log', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM sms_log ORDER BY id DESC LIMIT 100').all();
  res.json(rows);
});

app.put('/api/settings/sms', requireAdmin, (req, res) => {
  const { sms_login, sms_api_key } = req.body || {};
  if (sms_login !== undefined) setSetting('sms_login', sms_login);
  if (sms_api_key !== undefined) setSetting('sms_api_key', sms_api_key);
  res.json({ ok: true });
});

/* --- 6) Real-time monitoring --- */
app.get('/api/monitoring', requireAuth, (req, res) => {
  const t = today();
  const m = currentMonth();
  const totalChildren = db.prepare("SELECT COUNT(*) c FROM children WHERE status = 'active'").get().c;
  const todayPresent = db.prepare("SELECT COUNT(*) c FROM attendance WHERE date = ? AND status = 'present'").get(t).c;
  const todayLate = db.prepare("SELECT COUNT(*) c FROM attendance WHERE date = ? AND status = 'late'").get(t).c;
  const todayAbsent = db.prepare("SELECT COUNT(*) c FROM attendance WHERE date = ? AND status = 'absent'").get(t).c;
  const totalTeachers = db.prepare('SELECT COUNT(*) c FROM teachers').get().c;
  const onlineUsers = db.prepare("SELECT COUNT(*) c FROM users WHERE session_token IS NOT NULL").get().c;
  const monthIncome = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE month = ? AND status = 'confirmed'").get(m).s;
  const monthExpense = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE substr(expense_date,1,7) = ?").get(m).s;
  const latestPayments = db.prepare(`
    SELECT pay.*, c.full_name AS child_name FROM payments pay
    JOIN children c ON c.id = pay.child_id
    ORDER BY pay.id DESC LIMIT 5
  `).all();
  const latestAudit = db.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT 10').all();
  const serverTime = new Date().toISOString();
  res.json({
    serverTime, totalChildren, todayPresent, todayLate, todayAbsent,
    totalTeachers, onlineUsers, monthIncome, monthExpense,
    monthProfit: monthIncome - monthExpense, latestPayments, latestAudit
  });
});

/* --- 7) Dark mode + Language sozlamalari --- */
app.get('/api/settings/ui', requireAuth, (req, res) => {
  const s = getSettings();
  res.json({ theme: s.ui_theme || 'light', language: s.ui_language || 'uz' });
});

app.put('/api/settings/ui', requireAuth, (req, res) => {
  const { theme, language } = req.body || {};
  if (theme) setSetting('ui_theme', theme);
  if (language) setSetting('ui_language', language);
  res.json({ ok: true });
});

/* ===== Yangi hisobotlar (1) ===== */
// 2) Avtom hisobotlar yuborish — avval defined bo'lgan cron va sendGroup funksiyalari ishlatiladi

/* ========== BIZNES — TO'LIQ OYLIK HISOBOT ========== */
app.get('/api/business', requireAdmin, (req, res) => {
  const month = req.query.month || currentMonth();
  const settings = getSettings();
  const sname = settings.site_name || 'Denov Kindergarden';

  /* --- Oidlik — bola guruhi, to'lov, qarz --- */
  const allChildren = db.prepare("SELECT c.*, g.name AS group_name, g.fee_per_month AS group_fee FROM children c LEFT JOIN groups g ON g.id = c.group_id WHERE c.status = 'active'").all();
  const totalChildren = allChildren.length;
  const activeChildIds = allChildren.map(c => c.id);

  const paidRows = activeChildIds.length ? db.prepare(`SELECT child_id, SUM(amount) total FROM payments WHERE month = ? AND status = 'confirmed' AND child_id IN (${activeChildIds.map(() => '?').join(',')}) GROUP BY child_id`).all(month, ...activeChildIds) : [];
  const pmap = {};
  for (const r of paidRows) pmap[r.child_id] = r.total;

  const feeByChild = allChildren.map(c => {
    const fee = effectiveFee(c);
    const paid = pmap[c.id] || 0;
    return { id: c.id, name: c.full_name, group: c.group_name || '—', fee, paid, due: Math.max(0, fee - paid) };
  });

  const totalFee = feeByChild.reduce((s, c) => s + c.fee, 0);
  const totalPaid = feeByChild.reduce((s, c) => s + c.paid, 0);
  const totalDue = feeByChild.reduce((s, c) => s + c.due, 0);
  const paidChildren = feeByChild.filter(c => c.paid >= c.fee).length;
  const partialChildren = feeByChild.filter(c => c.paid > 0 && c.paid < c.fee).length;
  const unpaidChildren = feeByChild.filter(c => c.paid === 0).length;
  const collectionRate = totalFee > 0 ? Math.round(totalPaid / totalFee * 100) : 0;

  /* --- Guruhlar bo'yicha --- */
  const groupMap = {};
  for (const c of feeByChild) {
    if (!groupMap[c.group]) groupMap[c.group] = { name: c.group, count: 0, fee: 0, paid: 0, due: 0 };
    groupMap[c.group].count++;
    groupMap[c.group].fee += c.fee;
    groupMap[c.group].paid += c.paid;
    groupMap[c.group].due += c.due;
  }
  const groupStats = Object.values(groupMap).map(g => ({ ...g, rate: g.fee > 0 ? Math.round(g.paid / g.fee * 100) : 0 }));

  /* --- To'lov turlari (karta/click/naqd/...) --- */
  const methodRows = db.prepare(`SELECT method, COUNT(*) cnt, SUM(amount) total FROM payments WHERE month = ? AND status = 'confirmed' GROUP BY method ORDER BY total DESC`).all(month);

  /* --- Xarajatlar --- */
  const expenses = db.prepare('SELECT * FROM expenses WHERE substr(expense_date,1,7) = ? ORDER BY expense_date, id').all(month);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  const catMap = {};
  for (const e of expenses) {
    if (!catMap[e.category]) catMap[e.category] = { category: e.category, total: 0, count: 0 };
    catMap[e.category].total += e.amount;
    catMap[e.category].count++;
  }
  const expenseByCategory = Object.values(catMap).sort((a, b) => b.total - a.total);

  /* --- Davomat --- */
  const attMonth = db.prepare("SELECT status, COUNT(*) cnt FROM attendance WHERE substr(date,1,7) = ? GROUP BY status").all(month);
  const attStats = { present: 0, absent: 0, late: 0 };
  for (const r of attMonth) if (attStats[r.status] != null) attStats[r.status] = r.cnt;
  const totalAttDays = attStats.present + attStats.absent + attStats.late;
  const attRate = totalAttDays > 0 ? Math.round(attStats.present / totalAttDays * 100) : 0;

  /* --- O'qituvchilar — ish haqi --- */
  const teachers = db.prepare('SELECT t.*, g.name AS group_name FROM teachers t LEFT JOIN groups g ON g.id = t.group_id ORDER BY t.full_name').all();
  const totalSalary = teachers.reduce((s, t) => s + (t.salary || 0), 0);

  /* --- Oylik o'sish (oxirgi 12 oy) --- */
  const months12 = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months12.push(d.toISOString().slice(0, 7));
  }
  const trend12 = months12.map(m => {
    const inc = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE month = ? AND status = 'confirmed'").get(m).s;
    const exp = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE substr(expense_date,1,7) = ?").get(m).s;
    return { month: m, income: inc, expense: exp, profit: inc - exp };
  });
  const trend = trend12;

  /* --- Kassa kitobi (oylik) --- */
  const paymentsList = db.prepare(`
    SELECT pay.*, c.full_name AS child_name, g.name AS group_name
    FROM payments pay JOIN children c ON c.id = pay.child_id LEFT JOIN groups g ON g.id = c.group_id
    WHERE pay.month = ? AND pay.status = 'confirmed' ORDER BY pay.paid_date, pay.id
  `).all(month);

  const dayMap = {};
  for (const p of paymentsList) {
    const d = p.paid_date || month;
    if (!dayMap[d]) dayMap[d] = [];
    dayMap[d].push({ date: d, desc: p.child_name + ' — to\'lov', type: 'kirim', amount: p.amount });
  }
  for (const e of expenses) {
    const d = e.expense_date || month;
    if (!dayMap[d]) dayMap[d] = [];
    dayMap[d].push({ date: d, desc: e.name + ' (' + e.category + ')', type: 'chiqim', amount: e.amount });
  }
  const cashbook = [];
  let bal = 0;
  for (const d of Object.keys(dayMap).sort()) {
    for (const item of dayMap[d]) {
      if (item.type === 'kirim') bal += item.amount;
      else bal -= item.amount;
      cashbook.push({ ...item, balance: bal });
    }
  }

  /* --- Qarzdorlar ro'yxati --- */
  const debtorRows = db.prepare(`
    SELECT c.id AS child_id, c.full_name AS name, g.name AS group_name, p.id AS parent_id, p.full_name AS parent_name, p.phone
    FROM children c
    LEFT JOIN groups g ON g.id = c.group_id
    LEFT JOIN parents p ON p.id = c.parent_id
    WHERE c.status = 'active'
  `).all();
  const pphone = {};
  for (const dr of debtorRows) pphone[dr.child_id] = dr;
  const debtors = feeByChild.filter(c => c.due > 0).sort((a, b) => b.due - a.due)
    .map(c => {
      const d = pphone[c.id] || {};
      return { ...c, parent_id: d.parent_id || null, parent_name: d.parent_name || '—', parent_phone: d.phone || '' };
    });

  /* --- Kassa / Naqd va Bank balansi --- */
  const methodNames = ['naqd', 'karta', 'click', 'payme', 'paynet', 'bank', 'telegram'];
  const kassa = { naqd: 0, bank: 0, opening_naqd: Number(settings.cash_naqd || 0), opening_bank: Number(settings.cash_bank || 0), monthIn: 0, monthOut: 0 };
  const methodIn = {};
  for (const r of db.prepare("SELECT method, IFNULL(SUM(amount),0) s FROM payments WHERE status = 'confirmed' AND method != '' GROUP BY method").all()) methodIn[r.method] = r.s;
  const methodOut = {};
  for (const r of db.prepare("SELECT method, IFNULL(SUM(amount),0) s FROM expenses GROUP BY method").all()) methodOut[r.method] = r.s;
  for (const mn of methodNames) {
    const inc = methodIn[mn] || 0;
    const out = methodOut[mn] || 0;
    if (mn === 'naqd') kassa.naqd = kassa.opening_naqd + inc - out;
    else kassa.bank = kassa.opening_bank + inc - out;
  }
  const mIn = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE month = ? AND status = 'confirmed'").get(month).s;
  const mOut = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE substr(expense_date,1,7) = ?").get(month).s;
  kassa.monthIn = mIn; kassa.monthOut = mOut;

  /* --- Umumiy natija --- */
  const totalIncome = totalPaid;
  const netProfit = totalIncome - totalExpense;
  const netAfterSalary = netProfit - totalSalary;

  res.json({
    month,
    name: sname,
    /* Umumiy */
    totalChildren, totalFee, totalPaid, totalDue,
    paidChildren, partialChildren, unpaidChildren, collectionRate,
    /* Guruhlar */
    groupStats,
    /* To'lov usullari */
    methodStats: methodRows,
    /* Xarajatlar */
    totalExpense, expenseByCategory,
    /* Davomat */
    attStats, attRate, totalAttDays,
    /* O'qituvchilar */
    teachers: teachers.map(t => ({ id: t.id, name: t.full_name, salary: t.salary || 0, group: t.group_name || '—', position: t.position })),
    totalSalary,
    /* Moliya */
    totalIncome, netProfit, netAfterSalary,
    /* Trend (6 oy) */
    trend,
    /* Kassa kitobi */
    cashbook,
    /* Qarzdorlar */
    debtors,
    /* Kassa / Naqd va Bank */
    kassa,
    /* Bola ro'yxati (batafsil) */
    childDetails: feeByChild
  });
});

/* Yillik hisobot */
app.get('/api/business/yearly', requireAdmin, (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const settings = getSettings();
  const months = [];
  for (let i = 0; i < 12; i++) {
    const ym = `${year}-${String(i + 1).padStart(2, '0')}`;
    const inc = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE month = ? AND status = 'confirmed'").get(ym).s;
    const exp = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE substr(expense_date,1,7) = ?").get(ym).s;
    const salary = db.prepare("SELECT IFNULL(SUM(salary),0) s FROM teachers WHERE salary > 0").get().s;
    const kids = db.prepare("SELECT COUNT(*) c FROM children WHERE status='active' AND (enrolled_at IS NULL OR substr(enrolled_at,1,7) <= ?)").get(ym).c;
    months.push({ month: ym, income: inc, expense: exp, profit: inc - exp, salary, children: kids });
  }
  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalExpense = months.reduce((s, m) => s + m.expense, 0);
  const totalProfit = totalIncome - totalExpense;
  const avgMonthly = Math.round(totalIncome / 12);
  res.json({ year, name: settings.site_name || 'Denov Kindergarden', months, totals: { totalIncome, totalExpense, totalProfit, avgMonthly } });
});

/* Aqlli eslatma — tanlangan qarzdorlarga Telegram/SMS yuborish */
app.post('/api/reminders/send', requireAdmin, async (req, res) => {
  const { month, recipient_ids, channel } = req.body || {};
  if (!month) return res.status(400).json({ error: 'Oy tanlanmadi' });
  if (!Array.isArray(recipient_ids) || !recipient_ids.length) return res.status(400).json({ error: 'Qabul qiluvchilarni tanlang' });
  const settings = getSettings();
  const sname = settings.site_name || 'Denov Kindergarden';

  const ids = [...new Set(recipient_ids.map(Number))];
  const ph = ids.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT c.id AS child_id, c.full_name AS child_name, g.name AS group_name, g.fee_per_month AS fee,
      p.id AS parent_id, p.full_name AS parent_name, p.phone
    FROM children c
    LEFT JOIN groups g ON g.id = c.group_id
    LEFT JOIN parents p ON p.id = c.parent_id
    WHERE c.id IN (${ph}) AND c.status = 'active'
  `).all(...ids);

  const apiKey = (settings.sms_api_key || '').trim();
  const ins = db.prepare('INSERT INTO notifications (parent_id, parent_name, phone, child_name, type, channel, message, status) VALUES (?,?,?,?,?,?,?,?)');
  const insSms = db.prepare('INSERT INTO sms_log (phone, message, status) VALUES (?,?,?)');
  let sent = 0, tgSent = 0, smsSent = 0;

  for (const r of rows) {
    const fee = effectiveFee(r);
    const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND month = ? AND status = 'confirmed'").get(r.child_id, month).s;
    const due = Math.max(0, fee - paid);
    const msg = `Hurmatli ${r.parent_name || 'ota-ona'}! ${sname} bog'chasida bolangiz ${r.child_name} uchun ${month} oy to'lov qarzi: ${fmtMoney(due)} so'm. Iltimos to'lovni amalga oshiring.`;
    let status = 'yuborildi';
    if (channel === 'telegram' || channel === 'both') {
      try {
        if (r.parent_id) { await bot.sendToParent({ id: r.parent_id }, msg); tgSent++; }
        else status = 'tg_ulashtirilmagan';
      } catch (e) { status = 'tg_xato'; }
    }
    if (channel === 'sms' || channel === 'both') {
      if (r.phone && apiKey) {
        const res2 = await sendSms(r.phone, msg);
        if (res2.sent) { insSms.run(r.phone, msg, 'yuborildi'); smsSent++; }
        else { insSms.run(r.phone, msg, 'xato'); status = 'sms_xato'; }
      } else if (r.phone && !apiKey) { status = 'sms_api_yoq'; }
    }
    ins.run(r.parent_id || null, r.parent_name || '', r.phone || '', r.child_name || '', 'to\'lov eslatmasi', 'manual', msg, status);
    sent++;
  }
  audit(req, 'eslatma', 'debtors', `${month}: ${rows.length} qarzdorga yuborildi (TG:${tgSent}, SMS:${smsSent})`);
  res.json({ ok: true, sent, tgSent, smsSent });
});

/* Landing uchun ochiq ma'lumotlar (authsiz) */
app.get('/api/landing/data', (req, res) => {
  const s = k => (db.prepare('SELECT value FROM settings WHERE key = ?').get(k) || {}).value || '';
  const stats = {
    groups: db.prepare('SELECT COUNT(*) c FROM groups').get().c,
    children: db.prepare("SELECT COUNT(*) c FROM children WHERE status = 'active'").get().c,
    teachers: db.prepare("SELECT COUNT(*) c FROM users WHERE role = 'teacher'").get().c
  };
  res.json({
    site: {
      name: s('site_name'),
      address: s('address'),
      phone: s('phone'),
      email: s('email'),
      work_hours: s('work_hours'),
      login_top_text: s('login_top_text'),
      logo_url: s('logo_url')
    },
    stats,
    courses: db.prepare('SELECT * FROM courses ORDER BY sort, id').all(),
    gallery: db.prepare('SELECT id, title, image FROM gallery ORDER BY created_at DESC LIMIT 12').all()
  });
});

app.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

/* ========== OYLIK ARCHIVE ========== */
function createArchive(month) {
  const biz = db.prepare(`SELECT * FROM month_archives WHERE month = ?`).get(month);
  if (biz) return; // allaqachon arxivlangan

  // Business API bilan bir xil ma'lumotlarni yig'amiz
  const allChildren = db.prepare("SELECT c.*, g.name AS group_name, g.fee_per_month AS group_fee FROM children c LEFT JOIN groups g ON g.id = c.group_id WHERE c.status = 'active'").all();
  const totalChildren = allChildren.length;
  const activeChildIds = allChildren.map(c => c.id);
  const paidRows = activeChildIds.length ? db.prepare(`SELECT child_id, SUM(amount) total FROM payments WHERE month = ? AND status = 'confirmed' AND child_id IN (${activeChildIds.map(() => '?').join(',')}) GROUP BY child_id`).all(month, ...activeChildIds) : [];
  const pmap = {};
  for (const r of paidRows) pmap[r.child_id] = r.total;
  const feeByChild = allChildren.map(c => {
    const fee = effectiveFee(c);
    const paid = pmap[c.id] || 0;
    return { id: c.id, name: c.full_name, group: c.group_name || '—', fee, paid, due: Math.max(0, fee - paid) };
  });
  const totalFee = feeByChild.reduce((s, c) => s + c.fee, 0);
  const totalPaid = feeByChild.reduce((s, c) => s + c.paid, 0);
  const totalDue = feeByChild.reduce((s, c) => s + c.due, 0);
  const expenses = db.prepare('SELECT * FROM expenses WHERE substr(expense_date,1,7) = ? ORDER BY expense_date, id').all(month);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const teachers = db.prepare('SELECT * FROM teachers').all();
  const totalSalary = teachers.reduce((s, t) => s + (t.salary || 0), 0);
  const attMonth = db.prepare("SELECT status, COUNT(*) cnt FROM attendance WHERE substr(date,1,7) = ? GROUP BY status").all(month);
  const attStats = { present: 0, absent: 0, late: 0 };
  for (const r of attMonth) if (attStats[r.status] != null) attStats[r.status] = r.cnt;
  const totalAttDays = attStats.present + attStats.absent + attStats.late;
  const attRate = totalAttDays > 0 ? Math.round(attStats.present / totalAttDays * 100) : 0;
  const collectionRate = totalFee > 0 ? Math.round(totalPaid / totalFee * 100) : 0;

  const snapshot = JSON.stringify({ totalChildren, totalFee, totalPaid, totalDue, totalExpense, totalSalary, attStats, collectionRate, attRate, childDetails: feeByChild, expenses: expenses.map(e => ({ name: e.name, category: e.category, amount: e.amount, date: e.expense_date })), debtors: feeByChild.filter(c => c.due > 0) });

  db.prepare(`INSERT OR REPLACE INTO month_archives (month, total_children, total_fee, total_paid, total_expense, total_salary, total_debt, collection_rate, att_rate, snapshot_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(month, totalChildren, totalFee, totalPaid, totalExpense, totalSalary, totalDue, collectionRate, attRate, snapshot);
}

app.get('/api/archives', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, month, total_children, total_fee, total_paid, total_expense, total_salary, total_debt, collection_rate, att_rate, created_at FROM month_archives ORDER BY month DESC LIMIT 36').all();
  res.json(rows);
});

app.get('/api/archives/:month', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM month_archives WHERE month = ?').get(req.params.month);
  if (!row) return res.status(404).json({ error: 'Arxiv topilmadi' });
  row.snapshot = JSON.parse(row.snapshot_json);
  res.json(row);
});

app.post('/api/archives', requireAdmin, (req, res) => {
  const month = req.body.month || currentMonth();
  createArchive(month);
  audit(req, 'create', 'archive', month);
  res.json({ ok: true, message: `${month} arxivlandi` });
});

/* ========== OYLIK AVTOMATIK YANGILANISH ========== */
/* Har oy 1-kuni soat 00:05 da eski oy hisobotini arxivlaydi */
cron.schedule('5 0 1 * *', () => {
  try {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prev.toISOString().slice(0, 7);
    const sname = getSettings().site_name || 'Denov Kindergarden';
    const inc = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE month = ? AND status = 'confirmed'").get(prevMonth).s;
    const exp = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE substr(expense_date,1,7) = ?").get(prevMonth).s;
    const debt = db.prepare(`
      SELECT IFNULL(SUM(g.fee_per_month - IFNULL(p.total,0)),0) s
      FROM children c LEFT JOIN groups g ON g.id = c.group_id
      LEFT JOIN (SELECT child_id, SUM(amount) total FROM payments WHERE month = ? AND status = 'confirmed' GROUP BY child_id) p ON p.child_id = c.id
      WHERE c.status = 'active' AND g.fee_per_month > IFNULL(p.total,0)
    `).get(prevMonth).s;
    const msg = `📊 <b>${prevMonth} oylik avtomatik hisobot (${sname})</b>\n\n💰 Daromad: ${fmtMoney(inc)}\n💸 Xarajat: ${fmtMoney(exp)}\n📈 Foyda: ${fmtMoney(inc - exp)}\n📋 Qarz: ${fmtMoney(debt)}`;
    sendGroup(msg, { parse_mode: 'HTML' });
    // Arxiv yaratish
    try { createArchive(prevMonth); } catch (ae) { console.error('[CRON] Arxiv xatosi:', ae.message); }
    audit({ session: { user: { username: 'cron', role: 'admin', full_name: 'Avtomatik' } } }, 'avto-hisobot', 'business', `${prevMonth}: daromad=${inc}, xarajat=${exp}`);
    console.log(`[CRON] ${prevMonth} oylik hisobot yuborildi + arxivlandi`);
  } catch (e) {
    console.error('[CRON] Hisobot xatosi:', e.message);
  }
});

/* ========== SMS AVTOMATIK ESLATMA ========== */
app.post('/api/sms-reminder/send', requireAdmin, async (req, res) => {
  const month = req.query.month || currentMonth();
  const settings = getSettings();
  const apiKey = (settings.sms_api_key || '').trim();
  const sname = settings.site_name || 'Denov Kindergarden';
  if (!apiKey) return res.status(400).json({ error: 'SMS sozlamalari to\'ldirilmagan' });

  const debtors = db.prepare(`
    SELECT p.id AS parent_id, p.full_name, p.phone, c.full_name AS child_name,
      g.name AS group_name, g.fee_per_month,
      (SELECT IFNULL(SUM(amount),0) FROM payments WHERE child_id = c.id AND month = ? AND status = 'confirmed') AS paid
    FROM parents p JOIN children c ON c.parent_id = p.id AND c.status = 'active'
    LEFT JOIN groups g ON g.id = c.group_id
    WHERE (SELECT IFNULL(SUM(amount),0) FROM payments WHERE child_id = c.id AND month = ? AND status = 'confirmed') < g.fee_per_month
  `).all(month, month);

  if (!debtors.length) return res.json({ ok: true, count: 0, message: 'Qarzdorlar yo\'q' });

  const https = require('https');
  let sentCount = 0;
  const insSms = db.prepare('INSERT INTO sms_log (phone, message, status) VALUES (?,?,?)');

  for (const d of debtors) {
    if (!d.phone) continue;
    const fee = d.fee_per_month || 250000;
    const due = fee - (d.paid || 0);
    const msg = `Hurmatli ${d.full_name}! ${sname} bog'chasida bolangiz ${d.child_name} uchun ${month} oy to'lov qarzi: ${fmtMoney(due)} so'm. Iltimos to'lovni amalga oshiring.`;

    try {
      const res2 = await sendSms(d.phone, msg);
      if (res2.sent) { insSms.run(d.phone, msg, 'yuborildi'); sentCount++; }
      else { insSms.run(d.phone, msg, 'xato'); }
    } catch (e) {
      insSms.run(d.phone, msg, 'xato');
    }
    addParentNotification(d.parent_id, 'to\'lov', month + ' oy to\'lov eslatmasi', msg);
  }

  audit(req, 'sms-eslatma', 'sms', `${month}: ${sentCount}/${debtors.length} ta yuborildi`);
  res.json({ ok: true, count: sentCount, total: debtors.length });
});

/* ========== HAFTALIK OVQAT MENYU ========== */
app.get('/api/meals/weekly', requireAuth, (req, res) => {
  const start = req.query.start || today();
  const endD = new Date(new Date(start).getTime() + 6 * 86400000);
  const end = endD.toISOString().slice(0, 10);
  const rows = db.prepare('SELECT * FROM meals WHERE meal_date >= ? AND meal_date <= ? ORDER BY meal_date, CASE meal_type WHEN \'nonushta\' THEN 1 WHEN \'tushlik\' THEN 2 ELSE 3 END').all(start, end);

  const week = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(new Date(start).getTime() + i * 86400000);
    const ds = d.toISOString().slice(0, 10);
    week[ds] = { date: ds, day: WEEKDAYS[i], meals: [] };
  }
  for (const r of rows) {
    if (week[r.meal_date]) week[r.meal_date].meals.push(r);
  }
  res.json({ start, end, week: Object.values(week) });
});

const WEEKDAYS = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];

/* ========== O'qituvchi uchun dashboard ========== */
app.get('/api/parent/dashboard', requireAuth, (req, res) => {
  if (!req.session.user || req.session.user.role !== 'parent') return res.status(403).json({ error: 'Ruxsat yo\'q' });
  const parentId = req.session.user.parent_id;
  const month = currentMonth();
  const kids = db.prepare(`
    SELECT c.*, g.name AS group_name, g.fee_per_month, g.color AS group_color
    FROM children c LEFT JOIN groups g ON g.id = c.group_id
    WHERE c.parent_id = ? AND c.status = 'active'
  `).all(parentId);

  const result = kids.map(k => {
    const fee = effectiveFee(k);
    const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND month = ? AND status = 'confirmed'").get(k.id, month).s;
    const att = db.prepare("SELECT status, COUNT(*) cnt FROM attendance WHERE child_id = ? AND substr(date,1,7) = ? GROUP BY status").all(k.id, month);
    const attMap = { present: 0, absent: 0, late: 0 };
    for (const a of att) if (attMap[a.status] != null) attMap[a.status] = a.cnt;
    return { ...k, fee, paid, due: Math.max(0, fee - paid), attendance: attMap, photo: k.photo || null };
  });

  const announcements = db.prepare('SELECT * FROM announcements ORDER BY id DESC LIMIT 5').all();
  res.json({ children: result, month, announcements });
});

// ===== OPERATOR: Kunlik hisobot =====
app.get('/api/operator/daily-report', requireAuth, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const totalKids = db.prepare("SELECT COUNT(*) c FROM children WHERE status='active'").get().c;
  const presentToday = db.prepare("SELECT COUNT(*) c FROM attendance WHERE date=? AND status='present'").get(today).c;
  const absentToday = db.prepare("SELECT COUNT(*) c FROM attendance WHERE date=? AND status='absent'").get(today).c;
  const lateToday = db.prepare("SELECT COUNT(*) c FROM attendance WHERE date=? AND status='late'").get(today).c;
  const tushgan = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE substr(paid_date,1,10)=? AND status='confirmed'").get(today).s;
  const monthIncome = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE substr(month,1,7)=? AND status='confirmed'").get(month).s;
  const monthExpense = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE substr(expense_date,1,7)=?").get(month).s;
  const childCount = db.prepare("SELECT COUNT(*) c FROM children WHERE status='active'").get().c;
  const parentCount = db.prepare("SELECT COUNT(*) c FROM parents").get().c;
  const teacherCount = db.prepare("SELECT COUNT(*) c FROM users WHERE role='teacher'").get().c;
  const pendingRequests = db.prepare("SELECT COUNT(*) c FROM parent_requests WHERE status='yangi'").get().c;
  res.json({
    today, month,
    totalKids, presentToday, absentToday, lateToday,
    tushgan, monthIncome, monthExpense,
    childCount, parentCount, teacherCount, pendingRequests
  });
});

// ===== OPERATOR: Qarzdorlar =====
app.get('/api/operator/debtors', requireAuth, (req, res) => {
  const month = new Date().toISOString().slice(0, 7);
  const kids = db.prepare(`
    SELECT c.id, c.full_name, c.parent_id, c.birth_date, c.enrolled_at,
           g.name AS group_name, g.fee_per_month
    FROM children c LEFT JOIN groups g ON g.id = c.group_id
    WHERE c.status = 'active'
  `).all();
  const debtors = [];
  let totalDebt = 0;
  for (const k of kids) {
    const fee = effectiveFee(k);
    const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id=? AND month=? AND status='confirmed'").get(k.id, month).s;
    const due = Math.max(0, fee - paid);
    if (due > 0) {
      const parent = db.prepare('SELECT * FROM parents WHERE id=?').get(k.parent_id);
      const paidMonths = db.prepare("SELECT DISTINCT month FROM payments WHERE child_id=? AND status='confirmed'").all(k.id).map(r => r.month);
      let unpaidN = 0;
      const now = new Date();
      for (let i = 0; i < 36; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const m = d.toISOString().slice(0, 7);
        if (m > month) continue;
        if (!paidMonths.includes(m)) unpaidN++;
      }
      debtors.push({ id: k.id, full_name: k.full_name, group_name: k.group_name || '—', parent_name: parent ? parent.full_name : '—', parent_phone: parent ? parent.phone : '', fee, paid, due, unpaidN });
      totalDebt += due;
    }
  }
  debtors.sort((a, b) => b.due - a.due);
  res.json({ month, debtors, totalDebt });
});

// ===== OPERATOR: Eslatma sozlashlari =====
app.get('/api/operator/reminders', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM bot_reminders ORDER BY id DESC LIMIT 50').all();
  res.json(rows);
});

// ===== OPERATOR: Kunlik hisobot export =====
app.get('/api/operator/daily-export', requireAuth, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const kids = db.prepare(`SELECT c.id, c.full_name, g.name AS group_name FROM children c LEFT JOIN groups g ON g.id=c.group_id WHERE c.status='active'`).all();
  const rows = kids.map(k => {
    const att = db.prepare("SELECT status FROM attendance WHERE child_id=? AND date=?").get(k.id, today);
    const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id=? AND month=? AND status='confirmed'").get(k.id, month).s;
    return { id: k.id, name: k.full_name, group: k.group_name || '—', attendance: att ? att.status : 'yo\'q', paid };
  });
  res.json(rows);
});

// ===== Ota-ona xabarlari (markaz) =====
app.get('/api/parent/notifs', requireParent, (req, res) => {
  const pid = currentParentId(req);
  const rows = db.prepare('SELECT * FROM parent_notifications WHERE parent_id = ? ORDER BY id DESC LIMIT 100').all(pid);
  res.json(rows);
});

app.post('/api/parent/notifs/read', requireParent, (req, res) => {
  const pid = currentParentId(req);
  const { id, all } = req.body || {};
  try {
    if (all) db.prepare('UPDATE parent_notifications SET read = 1 WHERE parent_id = ?').run(pid);
    else if (id) db.prepare('UPDATE parent_notifications SET read = 1 WHERE id = ? AND parent_id = ?').run(id, pid);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== Ota-ona galereyasi (faqat o'z farzandlari guruhlari) =====
app.get('/api/parent/gallery', requireParent, (req, res) => {
  try {
    const pid = currentParentId(req);
    const kids = db.prepare("SELECT DISTINCT group_id FROM children WHERE parent_id = ? AND group_id IS NOT NULL").all(pid);
    const groupIds = kids.map(k => k.group_id).filter(Boolean);
    let rows = [];
    if (groupIds.length) {
      const ph = groupIds.map(() => '?').join(',');
      rows = db.prepare(`
        SELECT g.id, g.title, g.image, g.group_id, g.created_at, gr.name AS group_name
        FROM gallery g LEFT JOIN groups gr ON gr.id = g.group_id
        WHERE g.group_id IS NULL OR g.group_id IN (${ph})
        ORDER BY g.created_at DESC LIMIT 200
      `).all(...groupIds);
    } else {
      rows = db.prepare("SELECT g.id, g.title, g.image, g.group_id, g.created_at, gr.name AS group_name FROM gallery g LEFT JOIN groups gr ON gr.id = g.group_id WHERE g.group_id IS NULL ORDER BY g.created_at DESC LIMIT 200").all();
    }
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== Ota-ona kunlik jurnali (day_journal) =====
app.get('/api/parent/journal', requireParent, (req, res) => {
  try {
    const pid = currentParentId(req);
    const kids = db.prepare("SELECT id, full_name, group_id FROM children WHERE parent_id = ?").all(pid);
    const groupIds = kids.map(k => k.group_id).filter(Boolean);
    let rows = [];
    if (groupIds.length) {
      const ph = groupIds.map(() => '?').join(',');
      rows = db.prepare(`
        SELECT j.*, g.name AS group_name
        FROM day_journal j LEFT JOIN groups g ON g.id = j.group_id
        WHERE j.group_id IN (${ph})
        ORDER BY j.journal_date DESC, j.id DESC LIMIT 100
      `).all(...groupIds);
    }
    res.json({ groups: kids, rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== Badge sonlari (nav uchun) =====
app.get('/api/badges', requireAuth, (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const month = new Date().toISOString().slice(0, 7);
    const pendingRequests = db.prepare("SELECT COUNT(*) c FROM parent_requests WHERE status='yangi'").get().c;
    const unreadNotify = db.prepare("SELECT COUNT(*) c FROM notifications WHERE status='yuborildi'").get().c;
    const pendingPay = db.prepare("SELECT COUNT(*) c FROM parent_requests WHERE status='yangi' AND type='payment'").get().c;
    const chatMessages = db.prepare("SELECT COUNT(*) c FROM chat_messages WHERE read = 0 AND from_admin = 0").get().c;
    const smsPending = db.prepare("SELECT COUNT(*) c FROM sms_log WHERE status='kutilmoqda'").get().c;
    const expensesToday = db.prepare("SELECT COUNT(*) c FROM expenses WHERE expense_date = ?").get(today).c;
    const attendancePending = db.prepare("SELECT COUNT(*) c FROM attendance WHERE date = ?").get(today).c;
    const newChildren = db.prepare("SELECT COUNT(*) c FROM children WHERE status='active' AND enrolled_at >= ?").get(today).c;
    const parentNotifs = req.session.user && req.session.user.role === 'parent' && req.session.user.parent_id
      ? db.prepare('SELECT COUNT(*) c FROM parent_notifications WHERE parent_id = ? AND read = 0').get(req.session.user.parent_id).c
      : 0;
    const totalAlerts = pendingRequests + unreadNotify + pendingPay + chatMessages;
    res.json({ pendingRequests, unreadNotify, pendingPay, chatMessages, smsPending, expensesToday, attendancePending, newChildren, parentNotifs, totalAlerts });
  } catch (e) {
    res.json({ pendingRequests: 0, unreadNotify: 0, pendingPay: 0, chatMessages: 0, smsPending: 0, expensesToday: 0, attendancePending: 0, newChildren: 0, parentNotifs: 0, totalAlerts: 0 });
  }
});

// ===== Mark notifications read =====
app.post('/api/badges/mark-read', requireAuth, (req, res) => {
  try {
    const { table, all } = req.body || {};
    const target = all ? 'all' : table;
    if (target === 'requests' || target === 'all') {
      db.prepare("UPDATE parent_requests SET status='qabul' WHERE status='yangi'").run();
    }
    if (target === 'notifications' || target === 'all') {
      db.prepare("UPDATE notifications SET status = ? WHERE status = 'yuborildi'").run("o'qilgan");
    }
    if (target === 'sms' || target === 'all') {
      db.prepare("UPDATE sms_log SET status = ? WHERE status IN ('xato','kutilmoqda')").run("o'qildi");
      db.prepare("UPDATE chat_messages SET read = 1 WHERE read = 0 AND from_admin = 0").run();
    }
    res.json({ ok: true });
  } catch (e) { res.json({ ok: true }); }
});

app.get('/api/tg-links', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT t.*, p.full_name AS parent_name, p.phone AS parent_phone
    FROM tg_links t LEFT JOIN parents p ON p.id = t.parent_id
    ORDER BY t.id DESC
  `).all();
  res.json(rows);
});

// ===== Bell xabarnoma markazi (admin/operator) =====
app.get('/api/bell', requireAuth, (req, res) => {
  try {
    const isStaff = req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'operator' || req.session.user.role === 'methodist');
    const items = [];
    if (isStaff) {
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date().toISOString();
      const recent = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // 1) Yangi arizalar (so'rovlar)
      const reqs = db.prepare("SELECT r.id, r.child_name, r.type, r.status, r.created_at, r.text, COALESCE(p.full_name, 'Ota-ona') AS parent_name FROM parent_requests r LEFT JOIN parents p ON p.id = r.parent_id WHERE r.status='yangi' ORDER BY r.id DESC LIMIT 30").all();
      reqs.forEach(r => items.push({
        kind: 'request', icon: '✍️', priority: 'high', text: (r.type === 'payment' ? 'To\'lov so\'rovi' : r.type === 'uzr' ? 'Uzr arizasi' : 'Ma\'lumot so\'rovi'),
        name: (r.parent_name || 'Ota-ona'), desc: (r.child_name || 'Bola') + (r.text ? ' — ' + r.text : ''),
        time: r.created_at, go: 'requests', goId: r.id, color: '#ef4444'
      }));

      // 2) O'qilmagan chat xabarlari
      const unreadChat = db.prepare("SELECT id, parent_name, message, created_at FROM chat_messages WHERE read = 0 AND from_admin = 0 ORDER BY id DESC LIMIT 30").all();
      unreadChat.forEach(c => items.push({
        kind: 'chat', icon: '💬', priority: 'high', text: 'Yangi xabar', name: (c.parent_name || 'Ota-ona'),
        desc: c.message, time: c.created_at, go: 'chat', goId: c.id, color: '#8b5cf6'
      }));

      // 3) SMS holati (yuborilmagan / xato)
      const sms = db.prepare("SELECT id, phone, message, created_at, status FROM sms_log WHERE status != 'yuborildi' AND status IN ('xato','kutilmoqda') ORDER BY id DESC LIMIT 30").all();
      sms.forEach(s => items.push({
        kind: 'sms', icon: s.status === 'xato' ? '⚠️' : '📨', priority: s.status === 'xato' ? 'high' : 'normal',
        text: s.status === 'xato' ? 'SMS yuborilmadi' : 'SMS kutmoqda', name: '+998' + (s.phone || '').slice(-9),
        desc: (s.message || '').slice(0, 80), time: s.created_at, go: 'sms', goId: s.id, color: s.status === 'xato' ? '#ef4444' : '#f59e0b'
      }));

      // 4) Bugungi kirim/chiqim
      const expenses = db.prepare("SELECT id, name, category, amount, notes, expense_date FROM expenses WHERE expense_date = ?").all(today);
      expenses.forEach(e => items.push({
        kind: 'expense', icon: '💸', priority: 'normal', text: 'Kassa: chiqim',
        name: new Intl.NumberFormat('uz-UZ').format(Number(e.amount || 0)) + ' so\'m',
        desc: (e.name || e.notes || e.category || '').slice(0, 80), time: e.expense_date, go: 'expenses', goId: e.id,
        color: '#ef4444'
      }));

      // 5) Yangi tug'ilgan kunlar (bugun)
      const todayStr = today.slice(5).replace('-', '-');
      const bdChildren = db.prepare("SELECT id, full_name, birth_date FROM children WHERE substr(birth_date,6,5) = ? AND status='active'").all(today.slice(5));
      bdChildren.forEach(c => items.push({
        kind: 'birthday', icon: '🎂', priority: 'high', text: 'Tug\'ilgan kun!',
        name: c.full_name, desc: 'Bugun tug\'ilgan kuni 🎉', time: today, go: 'children', goId: c.id, color: '#ec4899'
      }));

      // 6) Yangi bolalar (oxirgi 24 soat)
      const newKids = db.prepare("SELECT id, full_name, created_at FROM children WHERE status='active' AND created_at >= ? ORDER BY id DESC LIMIT 20").all(recent);
      newKids.forEach(c => items.push({
        kind: 'child', icon: '👶', priority: 'normal', text: 'Yangi bola', name: c.full_name,
        desc: 'Ro\'yxatga qo\'shildi', time: c.created_at, go: 'children', goId: c.id, color: '#3b82f6'
      }));

      // 7) Yangi ota-ona (oxirgi 24 soat)
      const newParents = db.prepare("SELECT id, full_name, phone, created_at FROM parents WHERE created_at >= ? ORDER BY id DESC LIMIT 20").all(recent);
      newParents.forEach(p => items.push({
        kind: 'parent', icon: '🧑', priority: 'normal', text: 'Yangi ota-ona', name: p.full_name,
        desc: p.phone || 'telefon yo\'q', time: p.created_at, go: 'parents', goId: p.id, color: '#059669'
      }));

      // 8) Yangi e'lonlar (oxirgi 24 soat)
      const anns = db.prepare("SELECT id, title, text, created_at FROM announcements WHERE created_at >= ? ORDER BY id DESC LIMIT 20").all(recent);
      anns.forEach(a => items.push({
        kind: 'announcement', icon: '📢', priority: 'normal', text: 'Yangi e\'lon', name: a.title,
        desc: (a.text || '').slice(0, 80), time: a.created_at, go: 'eklon', goId: a.id, color: '#f59e0b'
      }));

      // 9) Bugun davomatsiz bolalar
      const absentToday = db.prepare("SELECT c.full_name, a.date FROM attendance a JOIN children c ON c.id = a.child_id WHERE a.date = ? AND a.status = 'absent' LIMIT 30").all(today);
      absentToday.forEach(x => items.push({
        kind: 'absent', icon: '❌', priority: 'normal', text: 'Davomatsiz', name: x.full_name,
        desc: 'Bugun kelmadi (' + x.date + ')', time: x.date, go: 'attendance', color: '#f43f5e'
      }));

      // 10) Yuborilgan xabarnomalar (notifications jadvali)
      const notifs = db.prepare("SELECT id, parent_name, child_name, type, message, channel, status, created_at FROM notifications WHERE status = 'yuborildi' ORDER BY id DESC LIMIT 40").all();
      notifs.forEach(n => {
        const typeInfo = n.type === 'payment' ? { ic: '💳', txt: 'To\'lov xabarnomasi', col: '#f59e0b' }
          : n.type === 'attendance' ? { ic: '📅', txt: 'Davomat xabarnomasi', col: '#3b82f6' }
          : n.type === 'el\'on' || n.type === 'e\'lon' ? { ic: '📢', txt: 'E\'lon', col: '#f59e0b' }
          : { ic: '🔔', txt: 'Xabarnoma', col: '#6366f1' };
        items.push({
          kind: 'notification', icon: typeInfo.ic, priority: 'normal', text: typeInfo.txt,
          name: n.parent_name || 'Ota-ona', desc: (n.child_name ? n.child_name + ' — ' : '') + (n.message || '').slice(0, 90),
          time: n.created_at, go: 'notify', goId: n.id, color: typeInfo.col
        });
      });
    }
    // Vaqt bo'yicha tartiblash (eng yangi tepada), priority bo'yicha og'irlik
    items.sort((a, b) => {
      const pa = a.priority === 'high' ? 1 : 0, pb = b.priority === 'high' ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return (b.time || '').localeCompare(a.time || '');
    });
    res.json({ items });
  } catch (e) {
    res.json({ items: [], error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Bog'cha tizimi ishga tushdi: http://localhost:${PORT}`);
  try {
    const accounts = db.prepare('SELECT username, role FROM users ORDER BY id').all();
    console.log('Foydalanuvchilar: ' + (accounts.length ? accounts.map(a => `${a.username} (${a.role})`).join(', ') : 'yo\'q'));
  } catch (e) {}
  try { bot.init(); } catch (e) { console.error('Bot init xatosi:', e.message); }
});
