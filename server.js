const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const bot = require('./bot');
const xlsx = require('./xlsx');
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
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders(res, filePath) {
    if (/\.(apk|png|jpe?g|webp|svg|ico|gif|woff2?)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

/* SQLite'da saqlanadigan sessiya — server qayta ishga tushsa ham login saqlanadi */
const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;
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
      ['/me', '/settings', '/change-password', '/change-username', '/logout'].includes(req.path);
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
  const r = db.prepare('INSERT INTO parents (full_name, phone, email, address) VALUES (?,?,?,?)')
    .run(full_name, phone || '', email || '', address || '');
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

app.post('/api/parent/payments/request', requireParent, (req, res) => {
  const pid = currentParentId(req);
  const { child_id, amount } = req.body || {};
  const amt = Number(amount);
  if (!child_id || !Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'Bola va summani to\'g\'ri kiriting' });
  const own = parentChildren(pid, true).map(c => c.id);
  const cid = Number(child_id);
  if (!own.includes(cid)) return res.status(403).json({ error: 'Bu bola sizga tegishli emas' });
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(cid);
  const r = db.prepare(`
    INSERT INTO parent_requests (parent_id, child_id, child_name, type, text, amount, status)
    VALUES (?,?,?,?,?,?,?)
  `).run(pid, cid, child.full_name, 'payment', `${new Intl.NumberFormat('uz-UZ').format(amt)} so'm`, amt, 'yangi');
  const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(pid);
  try { bot.notifyPayRequestCreated({ parent_id: pid, parent_name: parent.full_name, child_name: child.full_name, amount: amt }); } catch (e) {}
  audit(req, 'yaratish', 'parent_request', `child=${cid}, ${amt} so'm`);
  res.json({ id: r.lastInsertRowid, ok: true });
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
        request.child_id, request.amount || 0, currentMonth(), today(),
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
  const { name, category, amount, expense_date, notes } = req.body || {};
  if (!name || !amount) return res.status(400).json({ error: 'Nom va summasi kiriting' });
  const r = db.prepare('INSERT INTO expenses (name, category, amount, expense_date, notes) VALUES (?,?,?,?,?)')
    .run(name, category || 'Boshqa', amount, expense_date || today(), notes || '');
  audit(req, 'yaratish', 'expense', `${name}, ${amount} so'm`);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/expenses/:id', requireStaff, (req, res) => {
  const { name, category, amount, expense_date, notes } = req.body || {};
  db.prepare('UPDATE expenses SET name=?, category=?, amount=?, expense_date=?, notes=? WHERE id=?')
    .run(name, category || 'Boshqa', amount, expense_date || today(), notes || '', req.params.id);
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

app.get('/api/export/report.xlsx', requireAuth, (req, res) => {
  const month = req.query.month || currentMonth();
  const r = monthlyReport(month);
  const siteName = (db.prepare("SELECT value FROM settings WHERE key = 'site_name'").get() || {}).value || 'Denov Kindergarden';

  const summaryRows = [
    ['Bog\'cha', siteName],
    ['Davr', monthName(month)],
    [],
    ['Daromad', r.income],
    ['Xarajat', r.expense],
    ['Sof foyda', r.profit],
    [],
    ['Jami qarz', r.totalDue],
    ['Qarzdor bolalar', r.debts.filter(d => d.due > 0).length],
    ['2+ oy to\'lovsizlar', r.over2.length],
    [],
    ['Davomat: keldi / kech / kelmadi', `${r.attTotals.present} / ${r.attTotals.late} / ${r.attTotals.absent}`]
  ];

  const payRows = [
    ['Bola', 'Guruh', 'Sana', 'Summa', 'Usul', 'Kvitansiya'],
    ...r.payments.map(p => [p.child_name, p.group_name || '', p.paid_date, p.amount, p.method, p.receipt_no || ''])
  ];

  const expRows = [
    ['Xarajat', 'Kategoriya', 'Sana', 'Summa', 'Izoh'],
    ...r.expenses.map(e => [e.name, e.category, e.expense_date, e.amount, e.notes || ''])
  ];

  const debtRows = [
    ['Bola', 'Guruh', 'Oylik narx', 'To\'langan', 'Qarz', 'To\'lovsiz oylar'],
    ...r.debts.map(d => [d.child_name, d.group_name, d.fee, d.paid, d.due, d.unpaidMonths])
  ];

  const buf = xlsx.buildXlsx([
    { name: 'Hisobot', rows: summaryRows },
    { name: 'To\'lovlar', rows: payRows },
    { name: 'Xarajatlar', rows: expRows },
    { name: 'Qarzdorlar', rows: debtRows }
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
  const m = currentMonth();

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
    ORDER BY pay.paid_date DESC, pay.id DESC LIMIT 6
  `).all();

  const last8 = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const row = db.prepare("SELECT COUNT(*) present FROM attendance WHERE date = ? AND status != 'absent'").get(ds);
    last8.push({ date: ds, present: row.present });
  }

  const monthAtt = db.prepare("SELECT status, COUNT(*) cnt FROM attendance WHERE substr(date,1,7) = ? GROUP BY status").all(m);
  const attTotals = { present: 0, absent: 0, late: 0 };
  for (const a of monthAtt) attTotals[a.status] = a.cnt;

  res.json({
    totalChildren, totalGroups, totalTeachers, todayPresent,
    incomeMonth, expenseMonth, profitMonth, dueTotal,
    groups, recentPayments, last8, monthAtt: attTotals
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
      ? `Hurmatli ${x.parent_name}! ${sname} bog'chasida bolangiz ${x.child_name} uchun ${month} oy to'lovi qarzi mavjud. Iltimos bog'chaga murojaat qiling.`
      : `Hurmatli ${x.parent_name}! ${sname} bog'chasida bolangiz ${x.child_name} bu oy ${x.absent_cnt} kun davomatsiz qayd etilgan. Iltimos bog'chaga murojaat qiling.`
  });

  res.json({
    month,
    payment: unpaid.map(x => build({ ...x, due: Math.max(0, (x.fee || 0) - (x.paid || 0)) }, 'payment')),
    attendance: absent.map(x => build(x, 'attendance'))
  });
});

app.post('/api/notifications/send', requireAdmin, (req, res) => {
  const { type, channel, recipients, month } = req.body || {};
  if (!type || !Array.isArray(recipients) || !recipients.length) return res.status(400).json({ error: 'Qabul qiluvchilarni tanlang' });
  const settings = getSettings();
  const ins = db.prepare('INSERT INTO notifications (parent_id, parent_name, phone, child_name, type, channel, message, status) VALUES (?,?,?,?,?,?,?,?)');
  const sent = [];
  for (const r of recipients) {
    ins.run(r.parent_id || null, r.parent_name || '', r.phone || '', r.child_name || '', type, channel || 'manual', r.message || '', 'yuborildi');
    sent.push({ parent_name: r.parent_name, phone: r.phone, message: r.message });
  }
  audit(req, 'xabarnoma', 'notification', `${type}: ${sent.length} ta yuborildi`);
  res.json({ ok: true, count: sent.length });
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

app.post('/api/announcements', requireAdmin, (req, res) => {
  const { title, text, send_tg } = req.body || {};
  if (!title || !text) return res.status(400).json({ error: 'Sarlavha va matn kiriting' });
  const r = db.prepare('INSERT INTO announcements (title, text, created_by) VALUES (?,?,?)')
    .run(title, text, req.session.user.full_name || req.session.user.username || '');
  audit(req, 'yaratish', 'announcement', title);
  if (send_tg) {
    try { bot.notifyAnnouncement(title, text); } catch (e) {}
  }
  res.json({ id: r.lastInsertRowid });
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

app.listen(PORT, () => {
  console.log(`Bog'cha tizimi ishga tushdi: http://localhost:${PORT}`);
  try {
    const accounts = db.prepare('SELECT username, role FROM users ORDER BY id').all();
    console.log('Foydalanuvchilar: ' + (accounts.length ? accounts.map(a => `${a.username} (${a.role})`).join(', ') : 'yo\'q'));
  } catch (e) {}
  try { bot.init(); } catch (e) { console.error('Bot init xatosi:', e.message); }
});
