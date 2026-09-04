const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'bogcha.db');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'operator',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age_min INTEGER DEFAULT 1,
      age_max INTEGER DEFAULT 6,
      capacity INTEGER DEFAULT 20,
      fee_per_month REAL DEFAULT 0,
      color TEXT DEFAULT '#6366f1',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      position TEXT DEFAULT 'Tarbiyachi',
      salary REAL DEFAULT 0,
      group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
      hired_at TEXT DEFAULT (date('now')),
      birth_date TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS parents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      address TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS children (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      birth_date TEXT DEFAULT '',
      gender TEXT DEFAULT 'erkak',
      group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
      parent_id INTEGER REFERENCES parents(id) ON DELETE SET NULL,
      enrolled_at TEXT DEFAULT (date('now')),
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'present',
      UNIQUE(child_id, date)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      month TEXT NOT NULL,
      paid_date TEXT DEFAULT (date('now')),
      method TEXT DEFAULT 'naqd',
      receipt_no TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'Boshqa',
      amount REAL NOT NULL,
      expense_date TEXT DEFAULT (date('now')),
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_date TEXT NOT NULL,
      meal_type TEXT NOT NULL DEFAULT 'tushlik',
      title TEXT NOT NULL,
      items TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER,
      parent_name TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      child_name TEXT DEFAULT '',
      type TEXT NOT NULL DEFAULT 'payment',
      channel TEXT DEFAULT 'manual',
      message TEXT DEFAULT '',
      status TEXT DEFAULT 'tayyor',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT DEFAULT '',
      role TEXT DEFAULT '',
      action TEXT NOT NULL,
      entity TEXT DEFAULT '',
      detail TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS parent_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER,
      child_id INTEGER,
      child_name TEXT DEFAULT '',
      type TEXT DEFAULT 'uzr',
      text TEXT DEFAULT '',
      status TEXT DEFAULT 'yangi',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tg_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
      chat_id INTEGER NOT NULL,
      first_name TEXT DEFAULT '',
      username TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(parent_id)
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      created_by TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL DEFAULT '08:00',
      end_time TEXT NOT NULL DEFAULT '17:00',
      subject TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sms_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'yuborildi',
      provider TEXT DEFAULT 'eskiz',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS month_archives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL UNIQUE,
      total_children INTEGER DEFAULT 0,
      total_fee REAL DEFAULT 0,
      total_paid REAL DEFAULT 0,
      total_expense REAL DEFAULT 0,
      total_salary REAL DEFAULT 0,
      total_debt REAL DEFAULT 0,
      collection_rate INTEGER DEFAULT 0,
      att_rate INTEGER DEFAULT 0,
      snapshot_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      parent_name TEXT DEFAULT '',
      stars INTEGER NOT NULL DEFAULT 5,
      category TEXT DEFAULT 'umumiy',
      comment TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      parent_name TEXT DEFAULT '',
      chat_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      from_admin INTEGER DEFAULT 0,
      read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bot_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      chat_id INTEGER NOT NULL,
      remind_type TEXT NOT NULL DEFAULT 'payment',
      remind_text TEXT DEFAULT '',
      remind_date TEXT NOT NULL,
      sent INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS day_journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
      journal_date TEXT NOT NULL,
      title TEXT NOT NULL,
      activities TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      created_by TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(group_id, journal_date)
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
      title TEXT DEFAULT '',
      image TEXT NOT NULL,
      created_by TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL DEFAULT 0,
      duration TEXT DEFAULT '',
      icon TEXT DEFAULT '🎨',
      sort INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS landing_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_name TEXT DEFAULT '',
      parent_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS parent_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      type TEXT DEFAULT 'xabar',
      title TEXT DEFAULT '',
      message TEXT DEFAULT '',
      read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const userCols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  if (!userCols.includes('parent_id')) {
    db.exec('ALTER TABLE users ADD COLUMN parent_id INTEGER REFERENCES parents(id) ON DELETE CASCADE');
  }
  if (!userCols.includes('teacher_id')) {
    db.exec('ALTER TABLE users ADD COLUMN teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE');
  }
  if (!userCols.includes('session_token')) {
    db.exec("ALTER TABLE users ADD COLUMN session_token TEXT DEFAULT NULL");
  }

  const payCols = db.prepare("PRAGMA table_info(payments)").all().map(c => c.name);
  if (!payCols.includes('status')) {
    db.exec("ALTER TABLE payments ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed'");
  }

  const reqCols = db.prepare("PRAGMA table_info(parent_requests)").all().map(c => c.name);
  if (!reqCols.includes('amount')) {
    db.exec('ALTER TABLE parent_requests ADD COLUMN amount REAL DEFAULT 0');
  }
  if (!reqCols.includes('month')) {
    db.exec("ALTER TABLE parent_requests ADD COLUMN month TEXT DEFAULT ''");
  }

  const chCols = db.prepare("PRAGMA table_info(children)").all().map(c => c.name);
  if (!chCols.includes('photo')) {
    db.exec("ALTER TABLE children ADD COLUMN photo TEXT DEFAULT ''");
  }

  const tCols = db.prepare("PRAGMA table_info(teachers)").all().map(c => c.name);
  if (!tCols.includes('birth_date')) {
    db.exec("ALTER TABLE teachers ADD COLUMN birth_date TEXT DEFAULT ''");
  }

  const expCols = db.prepare("PRAGMA table_info(expenses)").all().map(c => c.name);
  if (!expCols.includes('method')) {
    db.exec("ALTER TABLE expenses ADD COLUMN method TEXT DEFAULT 'naqd'");
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return today().slice(0, 7);
}

function hashPass(p) {
  return bcrypt.hashSync(p, 10);
}

function seed() {
  const now = new Date();
  const m0 = now.toISOString().slice(0, 7);
  const t0 = now.toISOString().slice(0, 10);
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const m1 = prev.toISOString().slice(0, 7);
  const d = (m, day) => m + '-' + String(day).padStart(2, '0');

  /* Yangi (toza) bazada default admin va operator yaratiladi. Ataylab o'chirilgan
     foydalanuvchilar qayta tiklanmaydi — faqat bazada hech kim bo'lmasa seed qilinadi. */
  if (db.prepare('SELECT COUNT(*) c FROM users').get().c === 0) {
    db.prepare('INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)')
      .run('mexriddin', hashPass('mexriddin123'), 'Tizim Administratori', 'admin');
    db.prepare('INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)')
      .run('operator', hashPass('operator123'), 'Operator Xodim', 'operator');
  }

  const insSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  insSetting.run('site_name', 'Denov Kindergarden');
  insSetting.run('currency', 'so\'m');
  insSetting.run('address', 'Toshkent sh. ...');
  insSetting.run('phone', '+998 90 000 00 00');
  insSetting.run('email', 'info@bogcham.uz');
  insSetting.run('tg_token', '8743380255:AAH8xI9GHudiHXvBtfrC5MdCukJ5XmT5w_w');
  insSetting.run('tg_group', '-1004300152393');
  insSetting.run('reminders_enabled', '1');
  insSetting.run('reminder_time', '9');

  if (process.env.SEED_DEMO === '1') {
  const childCount = db.prepare('SELECT COUNT(*) c FROM children').get().c;
  if (childCount === 0) {
    const groups = [
      ['Quyoshcha', 1, 3, 15, 250000, '#f59e0b'],
      ['Yulduzcha', 3, 4, 18, 250000, '#6366f1'],
      ['Gulshan', 4, 5, 18, 250000, '#10b981'],
      ['Bahor', 5, 6, 20, 250000, '#ec4899']
    ];
    const gid = {};
    for (const g of groups) {
      const r = db.prepare('INSERT INTO groups (name, age_min, age_max, capacity, fee_per_month, color) VALUES (?,?,?,?,?,?)').run(...g);
      gid[g[0]] = r.lastInsertRowid;
    }

    const teachers = [
      ['Nargiza Karimova', '+998901112233', 'Tarbiyachi', 2500000, gid['Quyoshcha'], '1988-06-15'],
      ['Dilnoza Yusupova', '+998902223344', 'Tarbiyachi', 2500000, gid['Yulduzcha'], '1990-03-22'],
      ['Malika Ergasheva', '+998903334455', 'Tarbiyachi', 2600000, gid['Gulshan'], '1992-11-08'],
      ['Shahnoza Toshpo\'latova', '+998904445566', 'Tarbiyachi', 2700000, gid['Bahor'], '1985-07-30'],
      ['Aziza Qodirova', '+998905556677', 'Metodist', 2800000, null, '1987-01-17']
    ];
    for (const t of teachers) db.prepare('INSERT INTO teachers (full_name, phone, position, salary, group_id, birth_date) VALUES (?,?,?,?,?,?)').run(...t);

    const parents = [
      ['Akmal Tursunov', '+998911112233', 'akmal@gmail.com', 'Chilonzor 20'],
      ['Zarina Ismoilova', '+998912223344', 'zarina@gmail.com', 'Yunusobod 12'],
      ['Bekzod Nazarov', '+998913334455', 'bekzod@gmail.com', 'Mirzo Ulug\'bek 34'],
      ['Gulnora Sattorova', '+998914445566', 'gulnora@gmail.com', 'Yakkasaroy 5'],
      ['Oybek Xolmatov', '+998915556677', 'oybek@gmail.com', 'Sergeli 3'],
      ['Nilufar Abdullayeva', '+998916667788', 'nilufar@gmail.com', 'Olmazor 7'],
      ['Jasur Aliyev', '+998917778899', 'jasur@gmail.com', 'Bektemir 9'],
      ['Feruza Rahimova', '+998918889900', 'feruza@gmail.com', 'Yashnobod 11'],
      ['Sanjar Komilov', '+998919990011', 'sanjar@gmail.com', 'Mirobod 15'],
      ['Mohira Salimova', '+998920001122', 'mohira@gmail.com', 'Uchtepa 21']
    ];
    const pid = {};
    for (const p of parents) {
      const r = db.prepare('INSERT INTO parents (full_name, phone, email, address) VALUES (?,?,?,?)').run(...p);
      pid[p[0]] = r.lastInsertRowid;
    }

    const children = [
      ['Muhammadali Tursunov', '2023-04-12', 'erkak', gid['Quyoshcha'], pid['Akmal Tursunov'], '2025-09-01'],
      ['Sarvinoz Ismoilova', '2022-11-03', 'ayol', gid['Quyoshcha'], pid['Zarina Ismoilova'], '2025-09-01'],
      ['Biloliddin Nazarov', '2022-06-25', 'erkak', gid['Quyoshcha'], pid['Bekzod Nazarov'], '2025-09-01'],
      ['Madinabonu Sattorova', '2022-02-14', 'ayol', gid['Yulduzcha'], pid['Gulnora Sattorova'], '2024-09-01'],
      ['Abdurahmon Xolmatov', '2021-10-08', 'erkak', gid['Yulduzcha'], pid['Oybek Xolmatov'], '2024-09-01'],
      ['Zilola Abdullayeva', '2021-08-19', 'ayol', gid['Yulduzcha'], pid['Nilufar Abdullayeva'], '2024-09-01'],
      ['Sardor Aliyev', '2020-12-30', 'erkak', gid['Gulshan'], pid['Jasur Aliyev'], '2024-09-01'],
      ['Kamoliddin Rahimov', '2020-05-22', 'erkak', gid['Gulshan'], pid['Feruza Rahimova'], '2023-09-01'],
      ['Shahrizoda Komilova', '2020-03-17', 'ayol', gid['Gulshan'], pid['Sanjar Komilov'], '2023-09-01'],
      ['Ulug\'bek Salimov', '2019-09-09', 'erkak', gid['Bahor'], pid['Mohira Salimova'], '2023-09-01'],
      ['Mehrojiddin Tursunov', '2019-07-28', 'erkak', gid['Bahor'], pid['Akmal Tursunov'], '2023-09-01'],
      ['Gulchehra Ismoilova', '2019-04-01', 'ayol', gid['Bahor'], pid['Zarina Ismoilova'], '2022-09-01']
    ];
    const cid = {};
    for (const c of children) {
      const r = db.prepare('INSERT INTO children (full_name, birth_date, gender, group_id, parent_id, enrolled_at) VALUES (?,?,?,?,?,?)').run(...c);
      cid[c[0]] = r.lastInsertRowid;
    }

    const attendance = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const ds = d.toISOString().slice(0, 10);
      for (const id of Object.values(cid)) {
        const status = (id * 7 + d.getDate()) % 11 === 0 ? 'absent' : ((id * 3 + d.getDate()) % 17 === 0 ? 'late' : 'present');
        attendance.push([id, ds, status]);
      }
    }
    const insAtt = db.prepare('INSERT OR IGNORE INTO attendance (child_id, date, status) VALUES (?,?,?)');
    for (const a of attendance) insAtt.run(...a);

    const payments = [
      [cid['Muhammadali Tursunov'], 250000, m0, t0, 'karta', 'KV-2026-001'],
      [cid['Muhammadali Tursunov'], 250000, m1, d(m1, 5), 'karta', 'KV-2026-002'],
      [cid['Sarvinoz Ismoilova'], 250000, m0, t0, 'naqd', 'KV-2026-003'],
      [cid['Sardor Aliyev'], 250000, m0, t0, 'naqd', 'KV-2026-004'],
      [cid['Ulug\'bek Salimov'], 250000, m0, t0, 'bank', 'KV-2026-005'],
      [cid['Madinabonu Sattorova'], 250000, m1, d(m1, 9), 'karta', 'KV-2026-006'],
      [cid['Kamoliddin Rahimov'], 250000, m0, t0, 'naqd', 'KV-2026-007'],
      [cid['Shahrizoda Komilova'], 250000, m1, d(m1, 11), 'karta', 'KV-2026-008']
    ];
    const insPay = db.prepare('INSERT INTO payments (child_id, amount, month, paid_date, method, receipt_no) VALUES (?,?,?,?,?,?)');
    for (const p of payments) insPay.run(...p);
  }

  const expCount = db.prepare('SELECT COUNT(*) c FROM expenses').get().c;
  if (expCount === 0) {
    const exp = [
      ['Elektr energiyasi', 'Kommunal', 350000, d(m1, 3), ''],
      ['Suv', 'Kommunal', 120000, d(m1, 4), ''],
      ['Oziq-ovqat mahsulotlari', 'Oziq-ovqat', 850000, d(m1, 10), 'Oyning birinchi yarmi'],
      ['Kanselyariya buyumlari', 'Ta\'minot', 180000, d(m1, 12), 'Chizma va rangli qog\'ozlar'],
      ['O\'yinchoqlar', 'Ta\'minot', 320000, d(m1, 16), 'Yangi o\'yinchoqlar'],
      ['Ta\'mirlash ishlari', 'Ta\'mirlash', 450000, d(m1, 20), 'Oyna va eshik ta\'miri'],
      ['Tarbiyachilar ish haqi', 'Ish haqi', 2500000, d(m1, 28), 'O\'tgan oy'],
      ['Internet', 'Kommunal', 180000, d(m0, 2), 'Oylik internet'],
      ['Oziq-ovqat mahsulotlari', 'Oziq-ovqat', 400000, t0, 'Joriy oy, 1-qism'],
      ['Kanselyariya buyumlari', 'Ta\'minot', 90000, t0, 'Qog\'oz va bo\'yoqlar'],
      ['Tarbiyachilar ish haqi', 'Ish haqi', 1250000, d(m0, 1), 'Joriy oy, 1-qism'],
      ['Gigiena vositalari', 'Ta\'minot', 260000, d(m0, 1), 'Sovun, salfetka va hk'],
      ['Sport jihozlari', 'Ta\'minot', 150000, d(m0, 2), 'To\'p va gimnastika asboblari'],
      ['Bayram tadbiri', 'Tadbir', 380000, d(m0, 2), 'Bog\'cha bayramini tayyorlash'],
      ['Gaz', 'Kommunal', 95000, d(m0, 1), 'Oshxonada gaz']
    ];
    const insExp = db.prepare('INSERT INTO expenses (name, category, amount, expense_date, notes) VALUES (?,?,?,?,?)');
    for (const e of exp) insExp.run(...e);
  }

  const mealCount = db.prepare('SELECT COUNT(*) c FROM meals').get().c;
  if (mealCount === 0) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    const menu = {
      nonushta: ['Sutli bo\'tqa', 'Non va sariyog\'', 'Ko\'k choy'],
      tushlik: ['Guruchli sho\'rva', 'Tovuq go\'shti', 'Kartoshka pyuresi', 'Sabzavotli salat', 'Kompot'],
      choy: ['Kasha / Pechenye', 'Sut', 'Meva']
    };
    const insMeal = db.prepare('INSERT INTO meals (meal_date, meal_type, title, items) VALUES (?,?,?,?)');
    const weekdayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().slice(0, 10);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) {
        insMeal.run(ds, 'nonushta', 'Dam olish kuni', 'Nonushta berilmaydi');
        insMeal.run(ds, 'tushlik', 'Dam olish kuni', 'Tushlik berilmaydi');
        insMeal.run(ds, 'choy', 'Dam olish kuni', 'Kechki ovqat berilmaydi');
        continue;
      }
      insMeal.run(ds, 'nonushta', `Nonushta — ${weekdayNames[dow]}`, menu.nonushta.join(', '));
      insMeal.run(ds, 'tushlik', `Tushlik — ${weekdayNames[dow]}`, menu.tushlik.join(', '));
      insMeal.run(ds, 'choy', `Choy — ${weekdayNames[dow]}`, menu.choy.join(', '));
    }
  }
  }
}

initSchema();
seed();

module.exports = db;
module.exports.helpers = { today, currentMonth };
