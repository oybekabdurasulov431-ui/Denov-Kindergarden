'use strict';

/* ================= SO'ZLAR ================= */
const UZ = {
  dashboard: 'Bosh sahifa', children: 'Bolalar', parents: 'Ota-onalar', teachers: 'Tarbiyachilar',
  groups: 'Guruhlar', attendance: 'Davomat', payments: 'To\'lovlar', expenses: 'Xarajatlar',
  meals: 'Taomlar', reports: 'Hisobotlar', birthdays: 'Tug\'ilgan kunlar', schedules: 'Dars jadvali',
  salary: 'Ish haqi', monitoring: 'Monitoring', notify: 'Xabarnoma', sms: 'SMS',
  eklon: 'E\'lonlar', requests: 'Arizalar', backup: 'Zaxira', audit: 'Jurnal',
  xabarlar: 'Xabarlar',
  journal: 'Kun jurnali', gallery: 'Fotogalereya', landing: 'Taklif sahifasi',
  users: 'Foydalanuvchilar', settings: 'Sozlamalar', logout: 'Chiqish', install: 'O\'rnatish',
  search: 'Qidirish...', add: 'Qo\'shish', save: 'Saqlash', edit: 'Tahrirlash',
  delete: 'O\'chirish', cancel: 'Bekor qilish', confirm: 'Tasdiqlash', yes: 'Ha', no: 'Yo\'q',
  name: 'Ism', phone: 'Telefon', email: 'Email', address: 'Manzil', date: 'Sana',
  status: 'Holat', amount: 'Summa', notes: 'Izoh', actions: 'Amallar',
  present: 'Keldi', absent: 'Kelmadi', late: 'Kechikdi', active: 'Faol', inactive: 'Nofaol',
  total: 'Jami', paid: 'To\'langan', debt: 'Qarz', balance: 'Balans',
  teacher: 'Tarbiyachi', group: 'Guruh', child: 'Bola', parent: 'Ota-ona',
  print: 'Chop etish', export: 'Export', refresh: 'Yangilash', loading: 'Yuklanmoqda...',
  welcome: 'Xush kelibsiz', siteDesc: 'Maktabgacha ta\'lim boshqaruv tizimi',
  loginTitle: 'Kirish', loginHint: 'Kirish ma\'lumotlari bog\'cha administratori tomonidan beriladi',
  loginError: 'Login va parolni kiriting', loginBtn: 'Kirish', loginLoading: 'Kirish...',
  sessionExpired: 'Sessiya tugagan', noData: 'Ma\'lumot yo\'q',
  dashboardTitle: 'Bosh sahifa', childrenTitle: 'Bolalar ro\'yxati',
  parentsTitle: 'Ota-onalar ro\'yxati', teachersTitle: 'Tarbiyachilar ro\'yxati',
  groupsTitle: 'Guruhlar', attendanceTitle: 'Davomat',
  sendMessage: 'Xabar yuborish', sendSms: 'SMS yuborish', smsHistory: 'SMS tarixi',
  smsSettings: 'SMS sozlamalari', phone: 'Telefon raqami', message: 'Xabar matni',
  male: 'Erkak', female: 'Ayol', birthDate: 'Tug\'ilgan sana', enrolled: 'Qabul qilingan',
  fee: 'To\'lov miqdori', month: 'Oy', year: 'Yil', from: 'Dan', to: 'Gacha',
  unpaid: 'To\'lanmagan', paidFull: 'To\'liq to\'langan', partial: 'Qisman to\'langan',
  all: 'Hammasi', selected: 'Tanlangan', none: 'Hech qanday',
  chart: 'Grafik', table: 'Jadval', list: 'Ro\'yxat',
  expenseCategories: 'Xarajat turlari', cashbook: 'Kassa kitobi', trend: 'Trend',
  salaryReport: 'Ish haqi hisoboti', exportExcel: 'Excel export',
  tgNotify: 'Telegram xabarnoma', smsNotify: 'SMS xabarnoma', manualNotify: 'Qo\'lda xabar',
  paymentDebt: 'To\'lov qarzi', absentChildren: 'Davomatsiz bolalar',
  announcements: 'E\'lonlar', newAnnouncement: 'Yangi e\'lon',
  backupData: 'Ma\'lumotlarni zaxiralash', restoreData: 'Ma\'lumotlarni tiklash',
  auditLog: 'Amallar jurnali', allUsers: 'Barcha foydalanuvchilar',
  addUser: 'Foydalanuvchi qo\'shish', admin: 'Administrator', operatorRole: 'Operator',
  parentRole: 'Ota-ona', teacherRole: 'Tarbiyachi',
  insertPassword: 'Parolni kiriting', newPassword: 'Yangi parol',
  noChildren: 'Bolalar yo\'q', noParents: 'Ota-onalar yo\'q',
  noTeachers: 'Tarbiyachilar yo\'q', noGroups: 'Guruhlar yo\'q',
  confirmDelete: 'O\'chirilsinmi?', actionCannotUndo: 'Amal qaytarib bo\'lmaydi',
  business: 'Biznes', businessTitle: 'Biznes hisoboti',
  archives: 'Arxivlar', archivesTitle: 'Oylik arxivlar',
  archiveThisMonth: 'Joriy oy arxivini yaratish', archived: 'Arxivlandi',
  totalIncome: 'Jami daromad', totalExpense: 'Jami xarajat', netProfit: 'Sof foyda',
  collectionRate: 'Yig\'im darajasi', paidKids: 'To\'langan', unpaidKids: 'To\'lanmagan',
  mealsMenu: 'Haftalik ovqat menyu', addMeal: 'Taom qo\'shish', photo: 'Rasm', uploadPhoto: 'Rasm yuklash',
  smsReminder: 'SMS eslatma', sendReminder: 'Elatma yuborish', parentPortal: 'Ota-ona portali',
  reportPrint: 'Hisobotni chop etish', weeklyMenu: 'Haftalik menyu',
  sendReminders: 'Eslatmalarni yuborish', reminderSent: 'Eslatma yuborildi',
  childPhoto: 'Bola rasmi', changePhoto: 'Rasmni o\'zgartirish', noPhoto: 'Rasm yo\'q',
  mealsPlanned: 'Menyu rejalashtirilgan', mealsUnplanned: 'Menyu rejalanmagan',
  opDailyReport: 'Kunlik hisobot', opDebtors: 'Qarzdorlar', opReminders: 'Avtomatik ogohlantirish',
  todayAttendance: 'Bugungi davomat', todayIncome: 'Bugun tushgan', monthIncomeOylik: 'Oylik daromad',
  monthExpenseOylik: 'Oylik xarajat', totalKidsCount: 'Jami bolalar', totalParentsCount: 'Jami ota-onalar',
  totalTeachersCount: 'Jami tarbiyachilar', pendingRequestsCount: 'Kutilayotgan arizalar',
  attendanceToday: 'Bugun: kelgan', absentToday: 'Bugun: kelganlar', lateToday: 'Bugun: kechikkanlar',
  debtorName: 'Bola', debtorGroup: 'Guruh', debtorParent: 'Ota-ona', debtorFee: 'To\'lov',
  debtorPaid: 'To\'langan', debtorDue: 'Qarz', debtorMonths: 'Oylar', totalDebt: 'Jami qarz',
  noDebtors: 'Qarzdorlar yo\'q — barcha to\'lovlar bajarilgan!',
  reminderType: 'Turi', reminderText: 'Matn', reminderDate: 'Sana', reminderStatus: 'Holat',
  sent: 'Yuborilgan', pending: 'Kutilmoqda', noReminders: 'Eslatmalar yo\'q',
  autoDebtWarn: 'Avtomatik qarz ogohlantirishi', autoDebtDesc: '2+ oy qarz bo\'lsa Telegram orqali xabar beriladi',
  autoPayRemind: 'Oy oxiri to\'lov eslatmasi', autoPayDesc: 'Oy oxirida barcha ota-onalarga eslatma yuboriladi',
  remindAfterMonth: 'Oy oxiridan keyin eslatish', remindDays: 'Kunlar soni',
};
const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const WEEKDAYS = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];

function getLang() { return 'uz'; }
function t(key) { return UZ[key] || key; }
function tMonth(m) {
  const [y, mm] = m.split('-');
  return `${MONTHS[Number(mm) - 1]} ${y}`;
}

/* ================= HELPERS ================= */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const fmtMoney = (n) => {
  const cur = state.settings.currency || 'so\'m';
  const num = new Intl.NumberFormat('uz-UZ').format(Number(n) || 0);
  return `${num} ${cur}`;
};

const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = String(d).slice(0, 10).split('-');
  return `${day}.${m}.${y}`;
};

const monthName = (m) => { const [y, mm] = m.split('-'); return `${MONTHS[Number(mm) - 1]} ${y}`; };

function lastTwoMonthOpts(selected) {
  const opts = [];
  for (let i = 0; i < 2; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    opts.push(`<option value="${val}" ${String(selected) === val ? 'selected' : ''}>${monthName(val)}</option>`);
  }
  return opts.join('');
}

const METHOD_LABELS = { karta: '💳 Karta', click: '🟩 Click', payme: '🔵 Payme', paynet: '🟣 Paynet', naqd: '💵 Naqd', bank: '🏦 Bank' };
const methodLabel = (m) => METHOD_LABELS[m] || esc(m) || '—';

const todayStr = () => new Date().toISOString().slice(0, 10);
const monthStr = () => todayStr().slice(0, 7);

function age(birth) {
  if (!birth) return null;
  const b = new Date(birth + 'T00:00:00');
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

function fileToCompressedDataURL(file, maxSize = 900, quality = 0.82) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      const scale = Math.min(1, maxSize / Math.max(w, h));
      if (scale < 1) { w = Math.round(w * scale); h = Math.round(h * scale); }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      res(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => rej(new Error('Rasmni o\'qib bo\'lmadi'));
    img.src = URL.createObjectURL(file);
  });
}

const AVATAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'];
function avatarColor(name) {
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name) {
  const parts = String(name).trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

const wireSearch = (inputId, rowSel = 'tbody tr') => {
  const inp = $('#' + inputId);
  if (!inp) return;
  inp.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    $$('#content ' + rowSel).forEach(tr => tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none');
  });
};

function toast(msg, type = 'success') {
  const w = $('#toastWrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '⛔' : 'ℹ️'}</span><span>${esc(msg)}</span>`;
  w.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3200);
}

async function api(path, options = {}) {
  const isRaw = options.raw;
  const res = await fetch(path, {
    headers: isRaw ? (options.headers || {}) : { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? (isRaw ? options.body : JSON.stringify(options.body)) : undefined
  });
  if (res.status === 401 && path !== '/api/login') { showLogin(); throw new Error('Sessiya tugagan'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
  return data;
}

function loading() {
  return `<div class="empty-state"><span class="emoji">⏳</span>${t('loading')}</div>`;
}

/* ================= STATE ================= */

const state = {
  user: null,
  settings: {},
  page: 'dashboard'
};

/* Bosh sahifa yil va oy tanlash state (butun tizimga ulangan) */
const savedMonth = localStorage.getItem('bogcha-month') || '';
const dashState = {
  year: savedMonth ? parseInt(savedMonth.slice(0, 4), 10) : new Date().getFullYear(),
  month: savedMonth
};

const DASH_MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

const fmtTodayFull = () => {
  const d = new Date();
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}-${DASH_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
};

const fmtTodayShort = () => {
  const d = new Date();
  return `${d.getDate()}-${DASH_MONTHS[d.getMonth()]}`;
};

window.setDashMonth = (m) => {
  dashState.month = m;
  if (m) {
    dashState.year = parseInt(m.slice(0, 4), 10);
    localStorage.setItem('bogcha-month', m);
  } else {
    localStorage.removeItem('bogcha-month');
  }
  renderDashboard();
};

const DASH_MAX_YEAR = new Date().getFullYear() + 5;
const DASH_MIN_YEAR = new Date().getFullYear() - 10;

window.setDashYear = (y) => {
  const ny = parseInt(y, 10);
  if (!ny) return;
  if (ny > DASH_MAX_YEAR || ny < DASH_MIN_YEAR) return;
  const newMonth = dashState.month && dashState.month.startsWith(ny + '-')
    ? dashState.month
    : ny + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
  dashState.year = ny;
  dashState.month = newMonth;
  localStorage.setItem('bogcha-month', newMonth);
  renderDashboard();
};

const isAdmin = () => state.user && state.user.role === 'admin';
const isOperator = () => state.user && state.user.role === 'operator';

const NAV = [
  { id: 'dashboard', key: 'dashboard', icon: 'home' },
  { id: 'children', key: 'children', icon: 'kids' },
  { id: 'parents', key: 'parents', icon: 'users' },
  { id: 'groups', key: 'groups', icon: 'group' },
  { id: 'attendance', key: 'attendance', icon: 'check' },
  { id: 'payments', key: 'payments', icon: 'cash' },
  { id: 'expenses', key: 'expenses', icon: 'coin' },
  { id: 'meals', key: 'meals', icon: 'meal' },
  { id: 'reports', key: 'reports', icon: 'chart' },
  { id: 'birthdays', key: 'birthdays', icon: 'cake' },
  { id: 'teachers', key: 'teachers', icon: 'teacher', admin: true },
  { id: 'schedules', key: 'schedules', icon: 'calendar', admin: true },
  { id: 'salary', key: 'salary', icon: 'cash', admin: true },
  { id: 'monitoring', key: 'monitoring', icon: 'monitor', admin: true },
  { id: 'business', key: 'business', icon: 'chart', admin: true },
  { id: 'archives', key: 'archives', icon: 'calendar', admin: true },
  { id: 'notify', key: 'notify', icon: 'bell', operator: true },
  { id: 'sms', key: 'sms', icon: 'sms', operator: true },
  { id: 'eklon', key: 'eklon', icon: 'bell', admin: true },
  { id: 'requests', key: 'requests', icon: 'request', operator: true },
  { id: 'journal', key: 'journal', icon: 'journal', operator: true },
  { id: 'gallery', key: 'gallery', icon: 'camera', operator: true },
  { id: 'backup', key: 'backup', icon: 'download', admin: true },
  { id: 'audit', key: 'audit', icon: 'list', admin: true },
  { id: 'users', key: 'users', icon: 'lock', admin: true },
  { id: 'op_daily', key: 'opDailyReport', icon: 'chart', operator: true },
  { id: 'op_debtors', key: 'opDebtors', icon: 'coin', operator: true },
  { id: 'op_reminders', key: 'opReminders', icon: 'bell', operator: true },
  { id: 'settings', key: 'settings', icon: 'gear', admin: true, operator: true },
  { id: 'landing', key: 'landing', icon: 'camera', admin: true }
];

const TEACHER_NAV = [
  { id: 't_dashboard', key: 'dashboard', icon: 'home' },
  { id: 't_attendance', key: 'attendance', icon: 'check' }
];

const PARENT_NAV = [
  { id: 'p_dashboard', key: 'dashboard', icon: 'home' },
  { id: 'p_children', key: 'children', icon: 'kids' },
  { id: 'p_attendance', key: 'attendance', icon: 'check' },
  { id: 'p_payments', key: 'payments', icon: 'cash' },
  { id: 'p_journal', key: 'journal', icon: 'journal' },
  { id: 'p_notif', key: 'xabarlar', icon: 'bell' },
  { id: 'p_ann', key: 'eklon', icon: 'megaphone' },
  { id: 'p_gallery', key: 'gallery', icon: 'camera' },
  { id: 'p_requests', key: 'requests', icon: 'list' },
  { id: 'settings', key: 'settings', icon: 'gear' }
];

const REQ_TYPES = {
  uzr: 'Uzr',
  payment: 'To\'lov so\'rovi',
  info: 'Ma\'lumot'
};

const ICONS = {
  home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  kids: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  teacher: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  group: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  cash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>',
  coin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18v-12"/></svg>',
  chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  lock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  gear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  meal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2v20"/><path d="M17 2c-3 2-5 5-5 9s2 7 5 9"/><path d="M7 2c2 2 3 5 3 9s-1 7-3 9"/></svg>',
  bell: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  download: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  list: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  family: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  request: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  cake: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 1 2.5 1 .5-1 2-1 2.5 1 2.5 1 .5-1 2-1 2.5 1 2.5 1 .5-1 2-1 2.5 1 2.5 1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>',
  calendar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  monitor: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  sms: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  journal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  camera: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  megaphone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>'
};

/* ================= LOGIN ================= */

function applyLoginDesign(s) {
  if (!s) return;
  const lc = document.querySelector('.login-card');
  if (lc && s.login_bg) lc.style.background = s.login_bg;
  const wrap = document.querySelector('.login-wrap');
  if (wrap && s.login_bg_image) wrap.style.backgroundImage = `url(${s.login_bg_image})`;
  if (wrap && s.login_bg_image) wrap.style.backgroundSize = 'cover';
  const brand = document.querySelector('.login-brand h1');
  if (brand && s.site_name) brand.textContent = s.site_name;
  const greet = document.querySelector('.login-brand p');
  if (greet && s.login_greeting) greet.textContent = s.login_greeting;
  const topT = document.querySelector('.login-top-text');
  if (topT && s.login_top_text) topT.textContent = s.login_top_text;
  const botT = document.querySelector('.login-bottom-text');
  if (botT && s.login_bottom_text) botT.textContent = s.login_bottom_text;
}

function showLogin() {
  $('#loginScreen').classList.remove('hidden');
  $('#appShell').classList.add('hidden');
  state.user = null;
}

function showApp() {
  $('#loginScreen').classList.add('hidden');
  $('#appShell').classList.remove('hidden');
}

async function loadSession() {
  try {
    const { user } = await api('/api/me');
    state.user = user;
    state.settings = await api('/api/settings');
    applyLoginDesign(state.settings);
    return true;
  } catch {
    return false;
  }
}

/* ================= NAV ================= */

function roleNav() {
  const role = state.user && state.user.role;
  const base = role === 'teacher' ? TEACHER_NAV : role === 'parent' ? PARENT_NAV : NAV;
  return base.map(n => ({ ...n, label: t(n.key || n.id) }));
}

let navBadges = {};
async function fetchBadges() {
  try { navBadges = await api('/api/badges'); } catch { navBadges = {}; }
}
function getBadge(id) {
  const b = navBadges;
  if (id === 'requests') return 0;
  if (id === 'notify') return 0;
  if (id === 'payments') return 0;
  if (id === 'chat') return 0;
  if (id === 'sms') return 0;
  if (id === 'expenses') return 0;
  if (id === 'attendance') return 0;
  if (id === 'children') return 0;
  if (id === 'dashboard') return 0;
  if (id === 'p_notif') return b.parentNotifs || 0;
  return 0;
}
async function renderNav() {
  await fetchBadges();
  updateBellBadge();
  const nav = $('#nav');
  const base = roleNav();
  const items = base.filter(n => n.operator ? (isAdmin() || isOperator()) : !n.admin || isAdmin());
  nav.innerHTML = items.map(n => {
    const badge = getBadge(n.id);
    const badgeHtml = badge > 0 ? `<span class="nav-badge">${badge}</span>` : '';
    return `
    <button class="nav-item ${state.page === n.id ? 'active' : ''}" data-page="${n.id}">
      ${ICONS[n.icon]}
      <span>${n.label}</span>
      ${badgeHtml}
    </button>`;
  }).join('');
  $$('.nav-item', nav).forEach(b => b.addEventListener('click', () => go(b.dataset.page)));
}

function updateBellBadge() {
  const bell = $('#topbarBell');
  if (!bell) return;
  const b = navBadges || {};
  const total = (b.unreadNotify || 0) + (b.pendingRequests || 0) + (b.chatMessages || 0) + (b.smsPending || 0) + (b.expensesToday || 0);
  let dot = bell.querySelector('.bell-dot');
  if (!dot) { dot = document.createElement('span'); dot.className = 'bell-dot'; bell.appendChild(dot); }
  dot.hidden = total === 0;
  dot.textContent = total > 99 ? '99+' : total;
  if (total === 0) bell.title = 'Xabarnoma yo\'q';
  else bell.title = total + ' ta xabarnoma';
}

let _bellOpen = false;
async function toggleBellPanel() {
  _bellOpen = !_bellOpen;
  if (_bellOpen) {
    const bell = $('#topbarBell');
    if (bell) bell.classList.add('active');
    renderBellPanel();
    setTimeout(() => document.addEventListener('click', closeBellOnOutside), 0);
  } else {
    const bell = $('#topbarBell');
    if (bell) bell.classList.remove('active');
    const p = $('#bellPanel');
    if (p) p.remove();
    document.removeEventListener('click', closeBellOnOutside);
  }
}

const BELL_KIND_LABEL = {
  request: 'Ariza', chat: 'Xabar', sms: 'SMS', expense: 'Kassa',
  birthday: 'Tug\'ilgan kun', child: 'Yangi bola', parent: 'Yangi ota-ona',
  announcement: 'E\'lon', absent: 'Davomatsiz', notification: 'Xabarnoma'
};

async function renderBellPanel() {
  const old = $('#bellPanel');
  if (old) old.remove();
  const wrap = document.createElement('div');
  wrap.className = 'bell-panel';
  wrap.id = 'bellPanel';
  wrap.innerHTML = `
    <div class="bell-header">
      <div class="bell-header-top">
        <div class="bell-header-title"><b>🔔 Xabarnomalar</b></div>
        <button class="bell-x" onclick="closeBellPanel()" title="Yopish">✕</button>
      </div>
      <button class="bell-markall" onclick="markAllBell()">✓ Hammasini O'qildi</button>
    </div>
    <div id="bellBody" class="bell-body"><div style="text-align:center;padding:28px;color:var(--muted)">Yuklanmoqda...</div></div>`;
  document.querySelector('.main').appendChild(wrap);
  try {
    const d = await api('/api/bell');
    const items = d.items || [];
    const body = $('#bellBody');
    if (!body) return;
    if (!items.length) {
      body.innerHTML = '<div class="bell-empty"><div class="em">🔕</div><div class="et">Xabarlar yo\'q</div><div class="ed">Yangi xabar yoki yangilik kelganda shu yerda chiqadi</div></div>';
      return;
    }
    body.innerHTML = items.map(it => `
      <div class="bell-item ${it.priority === 'high' ? 'priority-high' : ''}" onclick="bellGo('${it.go}')">
        <div class="bell-ico" style="background:${it.color || '#6366f1'}">${it.icon}</div>
        <div class="bell-meta">
          <div class="bell-kind" style="color:${it.color || '#6366f1'}">${BELL_KIND_LABEL[it.kind] || 'Xabar'}</div>
          <div class="bell-name">${esc(it.text || '')}</div>
          <div class="bell-desc">${esc(it.name || '')}${it.desc ? ' · ' + esc(it.desc) : ''}</div>
          <div class="bell-time">🕐 ${fmtDateTime(it.time) || ''}</div>
        </div>
        <span class="bell-go">›</span>
      </div>`).join('');
  } catch (e) {
    const body = $('#bellBody');
    if (body) body.innerHTML = '<div class="bell-empty"><div class="ed">Xabar yuklashda xato yuz berdi</div></div>';
  }
}

window.closeBellPanel = () => { _bellOpen = false; const el = $('#topbarBell'); if (el) el.classList.remove('active'); const p = $('#bellPanel'); if (p) p.remove(); document.removeEventListener('click', closeBellOnOutside); };

window.bellGo = async (page) => {
  closeBellPanel();
  try { await api('/api/badges/mark-read', { method: 'POST', body: { all: true } }); } catch (e) {}
  navBadges = await api('/api/badges').catch(() => ({}));
  updateBellBadge();
  if (state.page === page) renderNav(); else go(page);
};

window.markAllBell = async () => {
  try { await api('/api/badges/mark-read', { method: 'POST', body: { all: true } }); } catch (e) {}
  navBadges = await api('/api/badges').catch(() => ({}));
  updateBellBadge();
  renderNav();
  const body = $('#bellBody');
  if (body) body.innerHTML = '<div class="bell-empty"><div class="em">✅</div><div class="et">Barchasi o\'qildi</div><div class="ed">Xabarlar tozalandi. Yangi xabar kelganda shu yerda chiqadi.</div></div>';
};

function closeBellOnOutside(e) {
  if (!e.target.closest) return;
  if (!e.target.closest('.bell-panel') && !e.target.closest('#topbarBell')) closeBellPanel();
}

function setPageTitle() {
  const base = roleNav();
  const item = base.find(n => n.id === state.page);
  $('#pageTitle').textContent = item ? item.label : 'Bosh sahifa';
}

let _navLock = false;
async function go(page) {
  if (_navLock) return;
  _navLock = true;
  setTimeout(() => { _navLock = false; }, 300);
  const base = roleNav();
  const item = base.find(n => n.id === page) || base[0];
  const allowed = new Set(base.map(n => n.id));
  if (!allowed.has(page) || (item.admin && !isAdmin() && !(item.operator && isOperator()))) page = base[0].id;
  if (state.page === 'attendance' && attState.date) attState = { date: attState.date };
  const selMo = dashState.month || monthStr();
  if (page === 'payments') payState.month = selMo;
  if (page === 'expenses') expState.month = selMo;
  if (page === 'reports') repState.month = selMo;
  if (page === 'attendance' && dashState.month) {
    const ld = dashState.month + '-' + String(Math.min(new Date().getDate(), 28)).padStart(2, '0');
    attState = { date: ld, map: {}, loaded: false };
  }
  state.page = page;
  localStorage.setItem('bogcha-page', page);
  renderNav();
  setPageTitle();
  closeSidebar();
  $('#content').innerHTML = loading();
  try {
    await RENDER[page]();
  } catch (e) {
    $('#content').innerHTML = `<div class="empty-state"><span class="emoji">�?�</span>${esc(e.message)}</div>`;
  }
  window.scrollTo({ top: 0 });
}

/* ================= MODAL ================= */

function openModal(title, bodyHtml) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHtml;
  $('#modalOverlay').classList.remove('hidden');
  const first = $('#modalBody input, #modalBody select');
  if (first) setTimeout(() => first.focus(), 60);
}

function closeModal() {
  $('#modalOverlay').classList.add('hidden');
  $('#modalBody').innerHTML = '';
}
function closeSidebar() {
  $('#sidebar').classList.remove('open');
  $('#sidebarOverlay').classList.remove('show');
}

function confirmDelete(msg, action) {
  openModal('Tasdiqlash', `
    <p style="margin-bottom:18px">${esc(msg)}</p>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
      <button class="btn btn-danger" id="confirmDelBtn">O'chirish</button>
    </div>
  `);
  $('#confirmDelBtn').addEventListener('click', async () => {
    try { await action(); toast('O\'chirildi'); closeModal(); } catch (e) { toast(e.message, 'error'); }
  });
}

window.resetConfirm = (what, label) => {
  openModal('Xavfli amal — tasdiqlash', `
    <div class="alert-danger" style="margin-bottom:14px">⚠️ <b>${esc(label)}</b> butunlay o'chiriladi va qaytarib bo'lmaydi!</div>
    <div class="field"><span>Administrator parolini kiriting</span><input id="resetPw" type="password" autocomplete="current-password"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
      <button class="btn btn-danger" id="resetDoBtn">${what === 'all' ? '🔥 Hammasini o\'chirish' : 'O\'chirish'}</button>
    </div>
  `);
  $('#resetDoBtn').addEventListener('click', async () => {
    const password = $('#resetPw').value;
    if (!password) { toast('Parolni kiriting', 'error'); return; }
    $('#resetDoBtn').disabled = true;
    $('#resetDoBtn').textContent = 'Ishlamoqda...';
    try {
      const r = await api('/api/reset', { method: 'POST', body: { what, password } });
      toast(`${label} tozalandi (${r.removed} ta yozuv)`);
      closeModal();
      setTimeout(() => go('dashboard'), 300);
    } catch (e) {
      toast(e.message, 'error');
      $('#resetDoBtn').disabled = false;
      $('#resetDoBtn').textContent = 'O\'chirish';
    }
  });
};

/* ================= DASHBOARD ================= */

async function renderDashboard() {
  const monthQ = dashState.month ? '?month=' + dashState.month : '';
  if (isAdmin()) {
    try { await api('/api/badges/mark-read', { method: 'POST', body: { all: true } }); navBadges = await api('/api/badges'); renderNav(); } catch (e) {}
  }
  const [d, bd, trend] = await Promise.all([api('/api/dashboard' + monthQ), api('/api/birthdays').catch(() => null), api('/api/reports/trend').catch(() => [])]);
  const st = state.settings;
  const today = fmtTodayFull();

  const monthsSet = new Set(d.availableMonths || []);
  const yearsSet = new Set((d.availableMonths || []).map(m => parseInt(m.slice(0, 4), 10)));
  yearsSet.add(new Date().getFullYear());
  yearsSet.add(Math.min(dashState.year, DASH_MAX_YEAR));
  yearsSet.add(Math.max(dashState.year, DASH_MIN_YEAR));
  const yearsList = Array.from(yearsSet).filter(y => y >= DASH_MIN_YEAR && y <= DASH_MAX_YEAR).sort((a, b) => a - b);
  const selYear = Math.min(Math.max(dashState.year, DASH_MIN_YEAR), DASH_MAX_YEAR);
  const monthChips = DASH_MONTHS.map((mn, i) => {
    const mm = String(i + 1).padStart(2, '0');
    const key = String(selYear) + '-' + mm;
    const active = d.month === key;
    const hasData = monthsSet.has(key);
    return `
      <button class="month-chip${active ? ' active' : ''}${hasData ? ' has-data' : ''}" data-month="${key}" title="${mn} ${selYear}" onclick="setDashMonth('${key}')">${mn}${hasData && !active ? '<i class="dot"></i>' : ''}</button>
    `;
  }).join('');

  const presence = d.todayPresent;

  const attData = (d.attDays && d.attDays.length) ? d.attDays : [];
  const maxDay = Math.max(1, ...attData.map(x => x.present));
  const bars = attData.map(x => {
    const lbl = x.date.slice(5).replace('-', '.');
    const h = Math.max(3, Math.round(x.present / maxDay * 100));
    return `<div class="bar-col"><div class="bar" style="height:${h}%"><span class="bar-val">${x.present}</span></div><span class="bar-lbl">${lbl}</span></div>`;
  }).join('');
  const barsEmpty = !attData.length ? '<div class="empty-state">Bu oyda davomat belgilanmagan</div>' : '';

  const colors = d.groups.map(g => g.color || '#6366f1').join(',');

  const legend = d.groups.map(g => `
    <div class="legend-item"><span class="legend-dot" style="background:${esc(g.color)}"></span>${esc(g.name)}<b>${g.cnt}</b></div>
  `).join('');

  const payRows = d.recentPayments.length ? d.recentPayments.map(p => `
    <tr>
      <td><span class="cell-name">${esc(p.child_name)}</span></td>
      <td>${monthName(p.month)}</td>
      <td class="money plus">${fmtMoney(p.amount)}</td>
      <td>${fmtDate(p.paid_date)}</td>
      <td><span class="badge gray">${methodLabel(p.method)}</span></td>
    </tr>`).join('') : `<tr><td colspan="5"><div class="empty-state">Bu oy uchun to'lovlar yo'q</div></td></tr>`;

  /* Dashboard widget boshqaruvi */
  const dw = state.settings || {};
  const W = k => { const v = dw['dash_' + k]; return v === undefined || v === null ? true : String(v) !== '0'; };
  const wStats = W('stats'), wAtt = W('att_chart'), wGroups = W('groups_chart'), wTrend = W('trend'), wBirthday = W('birthday'), wPayments = W('activity');

  const bdCard = bd ? (() => {
    const items = bd.today.concat(bd.upcoming.filter(x => x.in_days > 0));
    if (!items.length) return `
      <div class="card">
        <div class="card-head"><h3>🎂 Tug'ilgan kunlar</h3><span class="spacer"></span><button class="btn btn-soft btn-sm" onclick="go('birthdays')">Barchasi →</button></div>
        <div class="empty-state">Bu 7 kun ichida tug'ilgan kun yo'q</div>
      </div>`;
    const rows = items.map(x => {
      const todayB = x.in_days === 0;
      const when = todayB ? '<span class="badge green">Bugun 🎉</span>' : (x.in_days === 1 ? 'Ertaga' : `${x.in_days} kundan keyin`);
      return `
        <div class="birthday-item">
          <div class="avatar" style="background:${x.kind === 'teacher' ? '#8b5cf6' : avatarColor(x.full_name)}">${esc(initials(x.full_name))}</div>
          <div style="flex:1;min-width:0">
            <div class="cell-name">${esc(x.full_name)} ${todayB ? '<span>🎉</span>' : ''}</div>
            <div class="cell-sub">${x.kind === 'teacher' ? '👩‍🏫 ' + esc(x.group_name) : '🧒 ' + esc(x.group_name || '')} · ${x.age_turns} yosh bo'ladi</div>
          </div>
          <div style="text-align:right">
            <div class="cell-sub">${fmtDate(x.birth_date)}</div>
            <div style="font-size:12px;font-weight:600;color:${todayB ? 'var(--success)' : 'var(--muted)'}">${when}</div>
          </div>
        </div>`;
    }).join('');
    return `
      <div class="card">
        <div class="card-head"><h3>🎂 Tug'ilgan kunlar</h3><span class="spacer"></span><button class="btn btn-soft btn-sm" onclick="go('birthdays')">Barchasi →</button></div>
        <div class="birthday-list">${rows}</div>
      </div>`;
  })() : '';

$('#content').innerHTML = `
    <div class="month-panel">
      <div class="month-panel-top">
        <span class="month-panel-title">${d.month === monthStr() ? 'Joriy oy' : monthName(d.month)}</span>
        <div class="year-nav">
          <button class="btn btn-soft btn-sm" onclick="setDashYear(${selYear - 1})">&larr;</button>
          <select class="year-select" onchange="setDashYear(this.value)">
            ${yearsList.map(y => `<option value="${y}" ${y === selYear ? 'selected' : ''}>${y} yil</option>`).join('')}
          </select>
          <button class="btn btn-soft btn-sm" onclick="setDashYear(${selYear + 1})">&rarr;</button>
        </div>
        ${d.month !== monthStr() ? `<button class="btn btn-soft btn-sm" onclick="setDashMonth('')">&#8632; Joriy oyga qaytish</button>` : ''}
      </div>
      <div class="month-chips">${monthChips}</div>
    </div>

    <div class="kpi-banner">
      <div>
        <h2>Xush kelibsiz, ${esc(state.user.full_name)}! 👋</h2>
        <p>${esc(today)}</p>
      </div>
      <div class="kpi-right">
        <div class="kpi-item"><b>${fmtMoney(d.profitMonth)}</b><span>Sof foyda (${monthName(d.month)})</span></div>
        <div class="kpi-item"><b>${presence}/${d.totalChildren}</b><span>Bugun kelgan</span></div>
      </div>
    </div>

    ${wStats ? `<div class="grid stats">
      <div class="stat-card"><div class="stat-icon" style="background:var(--info-soft)">🧒</div><div class="stat-meta"><div class="stat-label">Jami bolalar</div><div class="stat-value">${d.totalChildren}</div><div class="stat-sub">${d.totalGroups} ta guruh</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--success-soft)">👩‍🏫</div><div class="stat-meta"><div class="stat-label">Tarbiyachilar</div><div class="stat-value">${d.totalTeachers}</div><div class="stat-sub">Kollektiv</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:${d.month === monthStr() ? 'var(--warning-soft)' : 'var(--info-soft)'}">💰</div><div class="stat-meta"><div class="stat-label">${monthName(d.month)} daromad</div><div class="stat-value">${fmtMoney(d.incomeMonth)}</div><div class="stat-sub">to'lovlar</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--warning-soft)">📤</div><div class="stat-meta"><div class="stat-label">${monthName(d.month)} xarajat</div><div class="stat-value">${fmtMoney(d.expenseMonth)}</div><div class="stat-sub">${fmtMoney(d.profitMonth)} foyda</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--primary-soft)">✅</div><div class="stat-meta"><div class="stat-label">${d.month === monthStr() ? 'Bugun davomat' : monthName(d.month) + ' davomat'}</div><div class="stat-value">${d.month === monthStr() ? d.todayPresent : (d.monthAtt.present || 0)}</div><div class="stat-sub">${d.month === monthStr() ? 'kelgan bolalar' : 'oyda keldi'}</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--danger-soft)">📋</div><div class="stat-meta"><div class="stat-label">${monthName(d.month)} qarzlari</div><div class="stat-value">${fmtMoney(d.dueTotal)}</div><div class="stat-sub">to'lanishi kerak</div></div></div>
    </div>` : ''}

    ${wAtt || wGroups ? `<div class="card-grid">
      ${wAtt ? `<div class="card">
        <div class="card-head"><h3>${d.month === monthStr() ? 'So\'nggi 8 kun davomati' : monthName(d.month) + ' — kunlar bo\'yicha davomat'}</h3><span class="spacer"></span><span class="badge green">${d.monthAtt.present || 0} keldi</span></div>
        <div class="bars">${bars}</div>${barsEmpty}
      </div>` : ''}
      ${wGroups ? `<div class="card">
        <div class="card-head"><h3>Guruhlar bo'yicha taqsimot</h3></div>
        <div class="donut-row">
          <div class="donut" style="background:conic-gradient(${colors})">
            <div class="donut-center"><b>${d.totalChildren}</b><span>bola</span></div>
          </div>
          <div class="legend">${legend}</div>
        </div>
      </div>` : ''}
    </div>` : ''}

    ${wTrend ? `<div class="card" style="margin-top:16px">
      <div class="card-head"><h3>📈 Oylik daromad/xarajat trendi (6 oy)</h3></div>
      <canvas id="trendChart" height="200"></canvas>
    </div>` : ''}

    ${wPayments ? `<div class="card">
      <div class="card-head">
        <h3>${monthName(d.month)} — to'lovlar</h3>
        <span class="spacer"></span>
        <button class="btn btn-soft btn-sm" onclick="go('payments')">Barchasi →</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Bola</th><th>Oy</th><th>Summa</th><th>Sana</th><th>Usul</th></tr></thead>
        <tbody>${payRows}</tbody>
      </table></div>
    </div>` : ''}

    ${wBirthday ? bdCard : ''}
  `;

  if (typeof Chart !== 'undefined' && trend && trend.length) {
    const ctx = document.getElementById('trendChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: trend.map(t => t.month),
          datasets: [
            { label: 'Daromad', data: trend.map(t => t.income), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.3 },
            { label: 'Xarajat', data: trend.map(t => t.expense), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.3 },
            { label: 'Sof foyda', data: trend.map(t => t.profit), borderColor: '#6366f1', borderDash: [5,5], tension: 0.3 }
          ]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
      });
    }
  }
}

/* ================= BIRTHDAYS ================= */

function bdRowHtml(x) {
  const todayB = x.in_days === 0;
  const when = todayB ? '<span class="badge green">Bugun 🎉</span>'
    : x.in_days === 1 ? '<span class="badge blue">Ertaga</span>'
    : `<span class="badge gray">${x.in_days} kun qoldi</span>`;
  return `
    <div class="birthday-item">
      <div class="avatar" style="background:${x.kind === 'teacher' ? '#8b5cf6' : avatarColor(x.full_name)}">${esc(initials(x.full_name))}</div>
      <div style="flex:1;min-width:0">
        <div class="cell-name">${esc(x.full_name)}</div>
        <div class="cell-sub">${x.kind === 'teacher' ? '👩‍🏫 ' + esc(x.group_name) : '🧒 ' + esc(x.group_name || '')}${x.parent_phone ? ' · ' + esc(x.parent_phone) : ''}</div>
      </div>
      <div style="text-align:right">
        <div class="cell-sub">${x.age_turns} yosh</div>
        ${when}
      </div>
    </div>`;
}

async function renderBirthdays() {
  const bd = await api('/api/birthdays');
  const m = bd.month;
  const mName = monthName(m + '-01');

  const todaySection = bd.today.length
    ? `<div class="card"><div class="card-head"><h3>🎉 Bugun tug'ilgan kun</h3><span class="badge green">${bd.today.length} kishi</span></div><div class="birthday-list">${bd.today.map(bdRowHtml).join('')}</div></div>`
    : '';

  const upc = bd.upcoming.filter(x => x.in_days > 0);
  const weekSection = upc.length
    ? `<div class="card"><div class="card-head"><h3>📅 Yaqin 7 kun</h3><span class="badge blue">${upc.length} kishi</span></div><div class="birthday-list">${upc.map(bdRowHtml).join('')}</div></div>`
    : `<div class="card"><div class="card-head"><h3>📅 Yaqin 7 kun</h3></div><div class="empty-state">Keyingi haftada tug'ilgan kun yo'q</div></div>`;

  const byDay = {};
  for (const x of bd.monthList) {
    const key = x.next.slice(8, 10);
    (byDay[key] = byDay[key] || []).push(x);
  }
  const monthSection = `<div class="card">
    <div class="card-head"><h3>🗓 ${esc(mName)}</h3><span class="spacer"></span><span class="badge gray">${bd.monthList.length} kishi</span></div>
    <div class="birthday-month">
      ${Object.entries(byDay).map(([d, items]) => `
        <div class="birthday-day">
          <div class="birthday-daynum">${d}</div>
          <div class="birthday-daylist">
            ${items.map(x => `
              <div class="birthday-item">
                <div class="avatar avatar-sm" style="background:${x.kind === 'teacher' ? '#8b5cf6' : avatarColor(x.full_name)}">${esc(initials(x.full_name))}</div>
                <div style="flex:1;min-width:0">
                  <div class="cell-name">${esc(x.full_name)}</div>
                  <div class="cell-sub">${x.kind === 'teacher' ? '👩‍🏫 ' + esc(x.group_name) : '🧒 ' + esc(x.group_name || '')} · ${x.age_turns} yosh</div>
                </div>
              </div>`).join('')}
          </div>
        </div>`).join('') || '<div class="empty-state">Bu oyda tug\'ilgan kun yo\'q</div>'}
    </div>
  </div>`;

  $('#content').innerHTML = `
    ${todaySection}
    ${weekSection}
    ${monthSection}
  `;
}

/* ================= CHILDREN ================= */

let childFilters = { q: '', group: '' };

async function renderChildren() {
  const [children, groups, parents] = await Promise.all([
    api('/api/children'),
    api('/api/groups'),
    api('/api/parents')
  ]);

  const list = children.filter(c =>
    (!childFilters.group || String(c.group_id) === childFilters.group) &&
    (!childFilters.q || (c.full_name + (c.parent_name || '') + (c.parent_phone || '')).toLowerCase().includes(childFilters.q.toLowerCase()))
  );

  const groupOpts = `<option value="">Barcha guruhlar</option>` + groups.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('');

  const rows = list.map(c => {
    const a = age(c.birth_date);
    const avatar = c.photo
      ? `<div class="avatar avatar-img" style="background:${avatarColor(c.full_name)}"><img src="${esc(c.photo)}" alt=""></div>`
      : `<div class="avatar" style="background:${avatarColor(c.full_name)}">${esc(initials(c.full_name))}</div>`;
    return `
      <tr>
        <td><div class="cell-user">${avatar}<div><div class="cell-name">${esc(c.full_name)}</div><div class="cell-sub">${c.gender === 'ayol' ? 'Qiz' : 'O\'g\'il'}, ${a != null ? a + ' yosh' : '—'}</div></div></div></td>
        <td>${c.group_name ? `<span class="group-chip" style="background:${esc(c.group_color)}">${esc(c.group_name)}</span>` : '<span class="badge gray">Yo\'q</span>'}</td>
        <td><div class="cell-name">${esc(c.parent_name || '—')}</div><div class="cell-sub">${esc(c.parent_phone || '')}</div></td>
        <td><div class="cell-name money">${fmtMoney(c.effective_fee || 0)}</div><div class="cell-sub" style="font-size:11px">${esc(c.fee_note || '')}</div></td>
        <td>${fmtDate(c.enrolled_at)}</td>
        <td>${c.status === 'active' ? '<span class="badge green">O\'qishda</span>' : '<span class="badge gray">Chiqib ketgan</span>'}</td>
        <td>
          <div class="row-actions">
            <button class="mini-btn" title="Profil" onclick="showChildProfile(${c.id})">📊</button>
            <button class="mini-btn" title="Tahrirlash" onclick="editChild(${c.id})">✏️</button>
            ${isAdmin() ? `<button class="mini-btn danger" title="O\'chirish" onclick="delChild(${c.id})">🗑️</button>` : ''}
          </div>
        </td>
      </tr>`;
  }).join('');

  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <div class="search-box"><span class="s-icon">🔍</span><input id="childSearch" placeholder="Qidirish: ism, ota-ona, telefon..." value="${esc(childFilters.q)}"></div>
        <select class="select-filter" id="childGroupFilter">${groupOpts}</select>
        <span class="spacer" style="flex:1"></span>
        <button class="btn btn-primary" onclick="newChild()">${ICONS.plus}Yangi bola</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Bola</th><th>Guruh</th><th>Ota-ona</th><th>Oylik</th><th>Qabul</th><th>Holat</th><th></th></tr></thead>
        <tbody>${rows || '<tr><td colspan="7"><div class="empty-state"><span class="emoji">🔍</span>Hech narsa topilmadi</div></td></tr>'}</tbody>
      </table></div>
    </div>`;

  $('#childSearch').addEventListener('input', e => { childFilters.q = e.target.value; debounce(renderChildren); });
  $('#childGroupFilter').addEventListener('change', e => { childFilters.group = e.target.value; renderChildren(); });
}

let debounceTimer;
function debounce(fn, ms = 300) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fn, ms);
}

async function childForm(id = null) {
  const [groups, parents, c] = await Promise.all([
    api('/api/groups'),
    api('/api/parents'),
    id ? api('/api/children/' + id) : Promise.resolve(null)
  ]);
  const c2 = c || {};
  const groupOpts = `<option value="">—</option>` + groups.map(g => `<option value="${g.id}" data-fee="${g.fee_per_month || 250000}" ${String(c2.group_id) === String(g.id) ? 'selected' : ''}>${esc(g.name)} · ${fmtMoney(g.fee_per_month || 250000)} so'm</option>`).join('');
  const parentOpts = `<option value="">—</option>` + parents.map(p => `<option value="${p.id}" ${String(c2.parent_id) === String(p.id) ? 'selected' : ''}>${esc(p.full_name)} (${esc(p.phone)})</option>`).join('');

  openModal(id ? 'Bolani tahrirlash' : 'Yangi bola', `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <div id="f_photo_preview" style="width:64px;height:64px;border-radius:50%;overflow:hidden;background:var(--bg2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">${c2.photo ? `<img src="${esc(c2.photo)}" style="width:100%;height:100%;object-fit:cover" alt="">` : '👤'}</div>
      <div style="flex:1;display:flex;flex-direction:column;gap:6px">
        <label class="btn btn-outline" style="width:100%;text-align:center">${c2.photo ? '📷 Rasmni almashtirish' : '📷 Rasm qo\'shish'}<input type="file" id="f_photo" accept="image/*" hidden></label>
        ${c2.photo && id ? `<button class="btn btn-outline" style="width:100%" onclick="delChildPhoto(${id})">🗑️ Rasmni o\'chirish</button>` : ''}
      </div>
    </div>
    <div class="form-row">
      <div class="field"><span>Ism familiya *</span><input id="f_name" value="${esc(c2.full_name || '')}" placeholder="Misol: Ali Valiyev"></div>
      <div class="field"><span>Tug'ilgan sana</span><input id="f_birth" type="date" value="${esc(c2.birth_date || '')}"></div>
      <div class="field"><span>Jinsi</span>
        <select id="f_gender"><option value="erkak" ${c2.gender !== 'ayol' ? 'selected' : ''}>O'g'il</option><option value="ayol" ${c2.gender === 'ayol' ? 'selected' : ''}>Qiz</option></select>
      </div>
      <div class="field"><span>Guruh</span><select id="f_group">${groupOpts}</select></div>
      <div class="field" style="grid-column:span 2"><span>Oylik to'lov (avtomatik)</span>
        <div id="f_fee_box" style="background:var(--chip-bg);border:1px dashed var(--border);border-radius:10px;padding:10px 14px;font-size:15px;font-weight:700;color:var(--accent)"></div>
        <div style="font-size:11px;color:var(--muted);margin-top:6px">3 yoshgacha — 300 000 so'm · Ota-onada 2+ bola — 200 000 so'm · aks holda 250 000 so'm</div>
      </div>
      <div class="field"><span>Ota-ona</span><select id="f_parent">${parentOpts}</select></div>
      <div class="field"><span>Qabul sanasi</span><input id="f_enrolled" type="date" value="${esc(c2.enrolled_at || todayStr())}"></div>
      <div class="field"><span>Holat</span>
        <select id="f_status"><option value="active" ${c2.status !== 'inactive' ? 'selected' : ''}>O'qishda</option><option value="inactive" ${c2.status === 'inactive' ? 'selected' : ''}>Chiqib ketgan</option></select>
      </div>
      <div class="field"><span>Izoh</span><input id="f_notes" value="${esc(c2.notes || '')}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="saveChildBtn">${id ? 'Saqlash' : 'Qo\'shish'}</button>
    </div>
  `);

  const photoFile = $('#f_photo');
  if (photoFile) photoFile.addEventListener('change', () => {
    const f = photoFile.files[0];
    if (!f) return;
    fileToCompressedDataURL(f).then(url => {
      $('#f_photo_preview').innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover" alt="">`;
    }).catch(e => toast(e.message, 'error'));
  });

  const updateFee = () => {
    const opt = $('#f_group').selectedOptions[0];
    const fee = opt && opt.dataset.fee ? Number(opt.dataset.fee) : 250000;
    $('#f_fee_box').innerHTML = `${fmtMoney(fee)} so'm / oy`;
  };
  $('#f_group').addEventListener('change', updateFee);
  updateFee();

  $('#saveChildBtn').addEventListener('click', async () => {
    const body = {
      full_name: $('#f_name').value.trim(),
      birth_date: $('#f_birth').value,
      gender: $('#f_gender').value,
      group_id: $('#f_group').value || null,
      parent_id: $('#f_parent').value || null,
      enrolled_at: $('#f_enrolled').value,
      status: $('#f_status').value,
      notes: $('#f_notes').value
    };
    if (!body.full_name) return toast('Ismni kiriting', 'error');
    try {
      let cid = id;
      if (id) await api('/api/children/' + id, { method: 'PUT', body });
      else cid = (await api('/api/children', { method: 'POST', body })).id;
      const f = $('#f_photo').files[0];
      if (f) {
        try {
          const dataUrl = await fileToCompressedDataURL(f);
          await api('/api/children/' + cid + '/photo', { method: 'POST', body: { photo: dataUrl } });
        } catch (pe) {
          toast('Bola saqlandi, lekin rasm yuklanmadi: ' + pe.message, 'error');
          closeModal(); renderChildren(); return;
        }
      }
      toast('Saqlangan'); closeModal(); renderChildren();
    } catch (e) { toast(e.message, 'error'); }
  });
}

window.delChildPhoto = async (cid) => {
  try {
    await api('/api/children/' + cid + '/photo', { method: 'DELETE' });
    toast('Rasm o\'chirildi'); closeModal(); renderChildren();
  } catch (e) { toast(e.message, 'error'); }
};

window.newChild = () => childForm();
window.editChild = (id) => childForm(id);
window.delChild = (id) => confirmDelete('Bu bolani ro\'yxatdan o\'chirasizmi?', async () => {
  await api('/api/children/' + id, { method: 'DELETE' });
  renderChildren();
});

async function showChildProfile(id) {
  try {
    const d = await api('/api/children/' + id + '/profile');
    const c = d.child;
    const att = d.att;
    const attDot = x => x === 'present' ? '✅' : x === 'late' ? '⏰' : '❌';
    const daysHtml = d.attDays.length
      ? d.attDays.map(a => `<span style="display:inline-block;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:4px 8px;font-size:12px;margin:3px">${attDot(a.status)} ${fmtDate(a.date)}</span>`).join('')
      : '<span style="color:var(--muted);font-size:13px">Bu oyda davomat yozuvi yo\'q</span>';
    const payHtml = d.pays.length
      ? d.pays.slice(0, 12).map(p => `<div style="padding:6px 0;border-bottom:1px dashed var(--border);font-size:13px">${fmtDate(p.paid_date)} — <b>${fmtMoney(p.amount)}</b> so\'m · ${esc(p.method)}${p.receipt_no ? ' · 🧾 ' + esc(p.receipt_no) : ''}${p.status !== 'confirmed' ? ' · ⏳ kutilmoqda' : ''}</div>`).join('')
      : '<span style="color:var(--muted);font-size:13px">To\'lovlar yo\'q</span>';
    openModal(`${c.full_name} — to\'liq profil`, `
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:10px">
        ${c.photo ? `<div class="avatar avatar-img" style="width:56px;height:56px"><img src="${esc(c.photo)}" alt=""></div>` : `<div class="avatar" style="width:56px;height:56px;font-size:20px;background:${avatarColor(c.full_name)}">${esc(initials(c.full_name))}</div>`}
        <div>
          <div class="cell-name" style="font-size:16px">${esc(c.full_name)}</div>
          <div class="cell-sub">${c.group_name ? `<span class="group-chip" style="background:${esc(c.group_color)}">${esc(c.group_name)}</span>` : '<span class="badge gray">Guruhsiz</span>'} · ${c.gender === 'ayol' ? 'Qiz' : 'O\'g\'il'}${c.birth_date ? ' · ' + age(c.birth_date) + ' yosh' : ''}</div>
          <div class="cell-sub">Ota-ona: ${esc(c.parent_name || '—')}${c.parent_phone ? ' · ' + esc(c.parent_phone) : ''}</div>
        </div>
      </div>
      <div class="grid stats" style="margin:10px 0 16px">
        <div class="stat-card"><div class="stat-label">✅ Keldi</div><div class="stat-value">${att.present}</div></div>
        <div class="stat-card"><div class="stat-label">⏰ Kechikdi</div><div class="stat-value">${att.late}</div></div>
        <div class="stat-card"><div class="stat-label">❌ Kelmadi</div><div class="stat-value">${att.absent}</div></div>
        <div class="stat-card"><div class="stat-label">💰 Jami to\'lov</div><div class="stat-value">${fmtMoney(d.totalPaid)}</div></div>
      </div>
      <div style="margin-bottom:14px">
        <div class="cell-name" style="margin-bottom:6px">📅 Davomat — ${esc(d.month)}</div>
        <div>${daysHtml}</div>
      </div>
      <div>
        <div class="cell-name" style="margin-bottom:4px">💰 To\'lovlar tarixi</div>
        <div>${payHtml}</div>
      </div>
      <div class="modal-actions"><button class="btn btn-primary" onclick="closeModal()">Yopish</button></div>
    `);
  } catch (e) { toast(e.message, 'error'); }
}

/* ================= PARENTS ================= */

async function renderParents() {
  const [parents, loginStatus] = await Promise.all([
    api('/api/parents'),
    (isAdmin() || isOperator()) ? api('/api/parents/login-status').catch(() => []) : Promise.resolve([])
  ]);
  const loginMap = {};
  loginStatus.forEach(x => { loginMap[x.parent_id] = x; });

  const rows = parents.map(p => {
    const lg = loginMap[p.id];
    const loginCell = lg
      ? `<span class="badge green">🔐 ${esc(lg.username)}</span>`
      : '<span class="badge gray">Login yo\'q</span>';
    return `
    <tr>
      <td><div class="cell-user"><div class="avatar" style="background:${avatarColor(p.full_name)}">${esc(initials(p.full_name))}</div><div class="cell-name">${esc(p.full_name)}</div></div></td>
      <td>${esc(p.phone || '—')}</td>
      <td>${esc(p.address || '—')}</td>
      <td><span class="badge purple">${p.child_count} bola</span></td>
      <td>${loginCell}</td>
      <td><div class="row-actions">
        <button class="mini-btn" title="Ota-ona logini" onclick="parentLoginForm(${p.id})">🔐</button>
        <button class="mini-btn" onclick="editParent(${p.id})">✏️</button>
        ${isAdmin() ? `<button class="mini-btn danger" onclick="delParent(${p.id})">🗑️</button>` : ''}
      </div></td>
    </tr>`;
  }).join('');

  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <div class="search-box"><span class="s-icon">🔍</span><input id="parentSearch" placeholder="Ism, telefon bo'yicha..."></div>
        <span class="spacer" style="flex:1"></span>
        ${isAdmin() ? `<a href="/api/export/children.csv" class="btn btn-outline">⬇️ Bolalar (Excel)</a>` : ''}
        <button class="btn btn-primary" onclick="parentForm()">${ICONS.plus}Yangi ota-ona</button>
      </div>
      <p style="color:var(--muted);font-size:12.5px;margin:0 0 10px">🔐 tugmasi orqali ota-onaga <b>sayt paneliga kirish login/paroli</b> berasiz. U saytga kirib o\'z bolalari, davomati va to\'lovlarini ko\'radi.</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Ota-ona</th><th>Telefon</th><th>Manzil</th><th>Bolalar</th><th>Panel</th><th></th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6"><div class="empty-state"><span class="emoji">👥</span>Ma\'lumot yo\'q</div></td></tr>'}</tbody>
      </table></div>
    </div>`;

  $('#parentSearch').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    $$('#content tbody tr').forEach(tr => tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none');
  });
}

async function parentLoginForm(id) {
  const [parents, loginStatus] = await Promise.all([
    api('/api/parents'),
    api('/api/parents/login-status')
  ]);
  const p = parents.find(x => x.id === id);
  if (!p) return toast('Ota-ona topilmadi', 'error');
  const lg = loginStatus.find(x => x.parent_id === id) || null;
  const autoUser = (p.phone || '').replace(/\D/g, '') || 'ota' + p.id;
  openModal(`🔐 Ota-ona paneli logini — ${esc(p.full_name)}`, `
    <p style="color:var(--muted);font-size:13px;margin-bottom:12px">Ushbu login va parol bilan ota-ona saytga kirib, o\'z bolalari, davomati va to\'lovlarini ko\'radi, to\'lov so\'ray oladi.</p>
    <div class="field"><span>Login (foydalanuvchi nomi)</span><input id="pl_user" value="${esc(lg ? lg.username : autoUser)}"></div>
    <div class="field"><span>Parol</span><input id="pl_pass" value="" placeholder="${lg ? 'Yangi parol (bo\'sh qolsa tasodifiy)' : 'Avtomatik yaratiladi (bo\'sh qoldirsangiz)'}"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="plSaveBtn">${lg ? 'Yangilash' : 'Login berish'}</button>
    </div>
  `);
  $('#plSaveBtn').addEventListener('click', async () => {
    try {
      const r = await api('/api/parents/' + p.id + '/login', { method: 'POST', body: { password: $('#pl_pass').value.trim() } });
      const creds = `
        <div style="text-align:center;padding:10px 0">
          <div class="cell-name" style="font-size:17px;margin-bottom:10px">✅ ${r.created ? 'Login berildi' : 'Login yangilandi'}</div>
          <div style="background:var(--bg);border:1px dashed var(--border);border-radius:12px;padding:14px;margin-bottom:12px">
            <div style="font-size:13px;color:var(--muted);margin-bottom:4px">Sayt manzili va login:</div>
            <div style="font-size:13px;color:var(--muted)">${esc(location.origin)}</div>
            <div style="font-size:15px;font-weight:700;margin-top:8px">Login: <span style="color:var(--primary)">${esc(r.username)}</span></div>
            <div style="font-size:15px;font-weight:700">Parol: <span style="color:var(--primary)">${esc(r.password)}</span></div>
          </div>
          <button class="btn btn-outline" onclick="copyText('${r.username} / ${r.password}')">📋 Nusxalash</button>
          <button class="btn btn-primary" onclick="closeModal(); renderParents()">Tayyor</button>
        </div>`;
      $('#modalBody').innerHTML = creds;
    } catch (e) { toast(e.message, 'error'); }
  });
}

window.copyText = (t) => {
  navigator.clipboard.writeText(t).then(() => toast('Nusxalandi 📋')).catch(() => toast('Nusxalab bo\'lmadi', 'error'));
};

function parentForm(p = null) {
  const p2 = p || {};
  openModal(p ? 'Ota-onani tahrirlash' : 'Yangi ota-ona', `
    <div class="field"><span>Ism familiya *</span><input id="p_name" value="${esc(p2.full_name || '')}" placeholder="To'liq ism"></div>
    <div class="field"><span>Telefon raqami *</span><input id="p_phone" value="${esc(p2.phone || '')}" placeholder="+998 90 000 00 00" type="tel" required></div>
    <div class="field"><span>Manzil *</span><input id="p_address" value="${esc(p2.address || '')}" placeholder="Tuman, ko'cha, uy"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="saveParentBtn">${p ? 'Saqlash' : 'Qo\'shish'}</button>
    </div>
  `);
  $('#saveParentBtn').addEventListener('click', async () => {
    const body = {
      full_name: $('#p_name').value.trim(),
      phone: $('#p_phone').value.trim(),
      address: $('#p_address').value.trim()
    };
    if (!body.full_name) return toast('Ismni kiriting', 'error');
    if (!body.phone) return toast('Telefon raqamini kiriting', 'error');
    if (!body.address) return toast('Manzilni kiriting', 'error');
    try {
      if (p) await api('/api/parents/' + p.id, { method: 'PUT', body });
      else await api('/api/parents', { method: 'POST', body });
      toast('Saqlangan'); closeModal(); renderParents();
    } catch (e) { toast(e.message, 'error'); }
  });
}

window.editParent = (id) => { const p = null; (async () => { const list = await api('/api/parents'); parentForm(list.find(x => x.id === id)); })(); };
window.delParent = (id) => confirmDelete('Bu ota-onani o\'chirasizmi?', async () => {
  await api('/api/parents/' + id, { method: 'DELETE' });
  renderParents();
});

/* ================= TEACHERS ================= */

async function renderTeachers() {
  const [teachers, groups, logins] = await Promise.all([api('/api/teachers'), api('/api/groups'), isAdmin() ? api('/api/teachers/login-status') : Promise.resolve([])]);
  const groupOpts = `<option value="">—</option>` + groups.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('');
  const lmap = {};
  for (const l of logins) lmap[l.teacher_id] = l;

  const rows = teachers.map(t => {
    const lg = lmap[t.id];
    const loginCell = isAdmin()
      ? (lg && lg.user_id ? `<div class="cell-sub" style="margin-bottom:4px"><span class="badge green">✅ ${esc(lg.username)}</span></div><button class="btn btn-soft btn-sm" onclick="teacherLogin(${t.id},'${esc(t.full_name)}','${esc(t.phone || '')}')">Parolni yangilash</button>`
        : `<span class="badge gray">❌ Login yo\'q</span><br><button class="btn btn-soft btn-sm" style="margin-top:6px" onclick="teacherLogin(${t.id},'${esc(t.full_name)}','${esc(t.phone || '')}')">Login yaratish</button>`)
      : '—';
    return `
    <tr>
      <td><div class="cell-user"><div class="avatar" style="background:${avatarColor(t.full_name)}">${esc(initials(t.full_name))}</div><div><div class="cell-name">${esc(t.full_name)}</div><div class="cell-sub">${esc(t.phone || '')}</div></div></div></td>
      <td><span class="badge blue">${esc(t.position)}</span></td>
      <td>${t.group_name ? `<span class="group-chip" style="background:${esc(groups.find(g => g.name === t.group_name)?.color || '#6366f1')}">${esc(t.group_name)}</span>` : '<span class="badge gray">Biriktirilmagan</span>'}</td>
      <td class="money">${fmtMoney(t.salary)}</td>
      <td>${fmtDate(t.hired_at)}</td>
      <td>${t.birth_date ? `<div class="cell-name">${fmtDate(t.birth_date)}</div><div class="cell-sub">${age(t.birth_date) != null ? age(t.birth_date) + ' yosh' : ''}</div>` : '<span class="badge gray">—</span>'}</td>
      ${isAdmin() ? `<td>${loginCell}</td>` : ''}
      <td><div class="row-actions">
        <button class="mini-btn" onclick="editTeacher(${t.id})">✏️</button>
        ${isAdmin() ? `<button class="mini-btn danger" onclick="delTeacher(${t.id})">🗑️</button>` : ''}
      </div></td>
    </tr>`;
  }).join('');

  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <div class="search-box"><span class="s-icon">🔍</span><input id="teacherSearch" placeholder="Ism, lavozim, guruh, telefon..."></div>
        <span class="badge blue">${teachers.length} nafar</span>
        <span class="spacer" style="flex:1"></span>
        ${isAdmin() ? `<button class="btn btn-primary" onclick="teacherForm()">${ICONS.plus}Yangi tarbiyachi</button>` : ''}
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Tarbiyachi</th><th>Lavozim</th><th>Guruh</th><th>Maosh</th><th>Ishga kirgan</th><th>Tug'ilgan sana</th>${isAdmin() ? '<th>Panel logini</th>' : ''}<th></th></tr></thead>
        <tbody>${rows || '<tr><td colspan="7"><div class="empty-state">Ma\'lumot yo\'q</div></td></tr>'}</tbody>
      </table></div>
    </div>`;
  wireSearch('teacherSearch');

  window._groupOpts = groupOpts;
}

window.teacherLogin = (id, name, phone) => {
  openModal('Tarbiyachi paneli loginini yaratish', `
    <p style="margin-bottom:12px;color:var(--muted);font-size:13px">${esc(name)} uchun panel login yaratiladi. Login — telefon raqami (agar kiritilgan bo'lsa), aks holda <b>tarbiyachi${id}</b>.</p>
    <div class="field"><span>Parol</span><input id="tl_pass" type="password" value="tarbiyachi123" placeholder="Kamida 4 belgi"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="tlSaveBtn">Yaratish</button>
    </div>
  `);
  $('#tlSaveBtn').addEventListener('click', async () => {
    const password = $('#tl_pass').value || 'tarbiyachi123';
    try {
      const r = await api('/api/teachers/' + id + '/login', { method: 'POST', body: { password } });
      toast(`Login: ${r.username}  Parol: ${r.password}`);
      closeModal(); renderTeachers();
    } catch (e) { toast(e.message, 'error'); }
  });
};

async function teacherForm(t = null) {
  const [groups] = await Promise.all([api('/api/groups')]);
  const t2 = t || {};
  const groupOpts = `<option value="">—</option>` + groups.map(g => `<option value="${g.id}" ${String(t2.group_id) === String(g.id) ? 'selected' : ''}>${esc(g.name)}</option>`).join('');
  openModal(t ? 'Tarbiyachini tahrirlash' : 'Yangi tarbiyachi', `
    <div class="form-row">
      <div class="field"><span>Ism familiya *</span><input id="t_name" value="${esc(t2.full_name || '')}"></div>
      <div class="field"><span>Telefon</span><input id="t_phone" value="${esc(t2.phone || '')}"></div>
      <div class="field"><span>Lavozim</span>
        <select id="t_position">
          ${['Tarbiyachi', 'Metodist', 'Katta tarbiyachi', 'Yordamchi', 'Rahbar'].map(p => `<option ${t2.position === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="field"><span>Guruh</span><select id="t_group">${groupOpts}</select></div>
      <div class="field"><span>Maosh (so'm)</span><input id="t_salary" type="number" min="0" value="${t2.salary || 0}"></div>
      <div class="field"><span>Ishga kirgan sana</span><input id="t_hired" type="date" value="${esc(t2.hired_at || todayStr())}"></div>
      <div class="field"><span>Tug'ilgan sana</span><input id="t_birth" type="date" value="${esc(t2.birth_date || '')}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="saveTeacherBtn">${t ? 'Saqlash' : 'Qo\'shish'}</button>
    </div>
  `);
  $('#saveTeacherBtn').addEventListener('click', async () => {
    const body = {
      full_name: $('#t_name').value.trim(),
      phone: $('#t_phone').value.trim(),
      position: $('#t_position').value,
      group_id: $('#t_group').value || null,
      salary: Number($('#t_salary').value) || 0,
      hired_at: $('#t_hired').value,
      birth_date: $('#t_birth').value
    };
    if (!body.full_name) return toast('Ismni kiriting', 'error');
    try {
      if (t) await api('/api/teachers/' + t.id, { method: 'PUT', body });
      else await api('/api/teachers', { method: 'POST', body });
      toast('Saqlangan'); closeModal(); renderTeachers();
    } catch (e) { toast(e.message, 'error'); }
  });
}

window.editTeacher = (id) => { (async () => { const list = await api('/api/teachers'); teacherForm(list.find(x => x.id === id)); })(); };
window.delTeacher = (id) => confirmDelete('Bu tarbiyachini o\'chirasizmi?', async () => {
  await api('/api/teachers/' + id, { method: 'DELETE' });
  renderTeachers();
});

/* ================= GROUPS ================= */

async function renderGroups() {
  const groups = await api('/api/groups');
  const cards = groups.map(g => {
    const pct = Math.min(100, Math.round(g.child_count / (g.capacity || 1) * 100));
    return `
      <div class="card">
        <div class="card-head">
          <span class="group-chip" style="background:${esc(g.color)}">${esc(g.name)}</span>
          <span class="spacer"></span>
          ${state.user.role === 'admin' ? `<div class="row-actions"><button class="mini-btn" onclick="editGroup(${g.id})">✏️</button><button class="mini-btn danger" onclick="delGroup(${g.id})">🗑️</button></div>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
          <div><div class="cell-sub">Yosh oralig'i</div><b>${g.age_min}–${g.age_max} yosh</b></div>
          <div><div class="cell-sub">Oylik to'lov</div><b class="money">${fmtMoney(g.fee_per_month)}</b></div>
          <div><div class="cell-sub">Bolalar</div><b>${g.child_count} / ${g.capacity}</b></div>
          <div><div class="cell-sub">Tarbiyachi</div><b style="font-size:13px">${esc(g.teacher_name || '—')}</b></div>
        </div>
        <div class="progress"><div style="width:${pct}%;background:${esc(g.color)}"></div></div>
      </div>`;
  }).join('');

  $('#content').innerHTML = `
    <div class="toolbar">
      <div class="search-box"><span class="s-icon">🔍</span><input id="groupSearch" placeholder="Guruh nomi, tarbiyachi bo'yicha..."></div>
      <span class="badge purple">${groups.length} ta</span>
      <span class="spacer"></span>
      ${state.user.role === 'admin' ? `<button class="btn btn-primary" onclick="groupForm()">${ICONS.plus}Yangi guruh</button>` : ''}
    </div>
    <div class="card-grid" id="groupGrid">${cards}</div>`;
  const gs = $('#groupSearch');
  if (gs) gs.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    $$('#groupGrid .card').forEach(c => c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none');
  });
}

async function groupForm(g = null) {
  const g2 = g || {};
  openModal(g ? 'Guruhni tahrirlash' : 'Yangi guruh', `
    <div class="form-row">
      <div class="field"><span>Nomi *</span><input id="g_name" value="${esc(g2.name || '')}"></div>
      <div class="field"><span>Rang</span><input id="g_color" type="color" value="${esc(g2.color || '#6366f1')}" style="height:42px;padding:4px"></div>
      <div class="field"><span>Yoshi (dan)</span><input id="g_amin" type="number" min="0" max="10" value="${g2.age_min ?? 1}"></div>
      <div class="field"><span>Yoshi (gacha)</span><input id="g_amax" type="number" min="0" max="10" value="${g2.age_max ?? 6}"></div>
      <div class="field"><span>Sig'imi</span><input id="g_cap" type="number" min="1" value="${g2.capacity || 20}"></div>
      <div class="field"><span>Oylik to'lov (so'm)</span><input id="g_fee" type="number" min="0" step="1000" value="${g2.fee_per_month || 250000}">
        <button type="button" class="btn btn-outline" style="margin-top:6px;width:100%;font-size:12px" onclick="$('#g_fee').value = 250000">250 000 so'm qilib qo'yish</button>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="saveGroupBtn">${g ? 'Saqlash' : 'Qo\'shish'}</button>
    </div>
  `);
  $('#saveGroupBtn').addEventListener('click', async () => {
    const body = {
      name: $('#g_name').value.trim(),
      color: $('#g_color').value,
      age_min: Number($('#g_amin').value) || 0,
      age_max: Number($('#g_amax').value) || 0,
      capacity: Number($('#g_cap').value) || 1,
      fee_per_month: Number($('#g_fee').value) || 0
    };
    if (!body.name) return toast('Nom kiriting', 'error');
    try {
      if (g) await api('/api/groups/' + g.id, { method: 'PUT', body });
      else await api('/api/groups', { method: 'POST', body });
      toast('Saqlangan'); closeModal(); renderGroups();
    } catch (e) { toast(e.message, 'error'); }
  });
}

window.editGroup = (id) => { (async () => { const list = await api('/api/groups'); groupForm(list.find(x => x.id === id)); })(); };
window.delGroup = (id) => confirmDelete('Bu guruhni o\'chirasizmi?', async () => {
  await api('/api/groups/' + id, { method: 'DELETE' });
  renderGroups();
});

/* ================= ATTENDANCE ================= */

let attState = { date: todayStr(), map: {}, loaded: false };

async function renderAttendance() {
  if (!attState.date) attState.date = todayStr();
  const [data, groups] = await Promise.all([api('/api/attendance?date=' + attState.date), api('/api/groups')]);

  const groupOpts = `<option value="">Barcha guruhlar</option>` + groups.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('');

  attState.map = {};
  for (const c of data.children) attState.map[c.id] = data.map[c.id] || 'present';

  const list = data.children.map(c => {
    const st = attState.map[c.id] || 'present';
    return `
      <div class="att-row" data-child="${c.id}" data-g="${c.group_id ?? ''}">
        <div class="cell-user"><div class="avatar" style="background:${avatarColor(c.full_name)};width:34px;height:34px;font-size:12px">${esc(initials(c.full_name))}</div>
          <div><div class="cell-name">${esc(c.full_name)}</div><div class="cell-sub">${c.group_name ? `<span class="group-chip" style="background:${esc(c.group_color)}">${esc(c.group_name)}</span>` : ''}</div></div>
        </div>
        <div class="att-switch">
          <button data-s="present" class="${st === 'present' ? 'active' : ''}" onclick="setAttStatus(${c.id},'present')">✅ Keldi</button>
          <button data-s="late" class="${st === 'late' ? 'active' : ''}" onclick="setAttStatus(${c.id},'late')">⏰ Kech</button>
          <button data-s="absent" class="${st === 'absent' ? 'active' : ''}" onclick="setAttStatus(${c.id},'absent')">❌ Keldi yo'q</button>
        </div>
      </div>`;
  }).join('');

  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <div class="field" style="margin:0"><span style="font-size:11px">Sana</span><input id="attDate" type="date" value="${attState.date}" style="padding:8px 10px"></div>
        <select class="select-filter" id="attGroup">${groupOpts}</select>
        <span class="badge green" id="attCount">${Object.values(attState.map).filter(s => s !== 'absent').length}/${data.children.length} keldi</span>
        <span class="badge gray" id="attSaveState">💾 Avtomatik saqlanadi</span>
      </div>
      <div class="att-list" id="attList">${list || '<div class="empty-state"><span class="emoji">🧒</span>Faol bolalar yo\'q</div>'}</div>
    </div>`;

  $('#attDate').addEventListener('change', e => {
    clearTimeout(attSaveTimer);
    saveAttNow();
    attState.date = e.target.value;
    attState.loaded = false;
    renderAttendance();
  });
  $('#attGroup').addEventListener('change', e => {
    const g = e.target.value;
    $$('#attList .att-row').forEach(r => r.style.display = (!g || r.dataset.g === g) ? '' : 'none');
  });
  updateAttCount();
}

function updateAttCount() {
  const el = $('#attCount');
  if (!el) return;
  const total = Object.keys(attState.map).length;
  const present = Object.values(attState.map).filter(s => s !== 'absent').length;
  el.textContent = `${present}/${total} keldi`;
}

let attPending = {};
let attSaveTimer = null;

window.setAttStatus = (id, status) => {
  attState.map[id] = status;
  attPending[id] = status;
  const row = document.querySelector(`#attList .att-row[data-child="${id}"]`);
  if (row) row.querySelectorAll('.att-switch button').forEach(b => b.classList.toggle('active', b.dataset.s === status));
  updateAttCount();
  showAttSaveState('saving');
  clearTimeout(attSaveTimer);
  attSaveTimer = setTimeout(saveAttNow, 500);
};

async function saveAttNow() {
  const records = Object.entries(attPending).map(([child_id, status]) => ({ child_id: Number(child_id), status }));
  if (!records.length) return;
  attPending = {};
  const date = attState.date;
  try {
    await api('/api/attendance', { method: 'POST', body: { date, records } });
    showAttSaveState('saved');
  } catch (e) {
    showAttSaveState('error');
    toast(e.message, 'error');
  }
}

function showAttSaveState(s) {
  const el = $('#attSaveState');
  if (!el) return;
  if (s === 'saving') {
    el.className = 'badge amber';
    el.textContent = '💾 Saqlanmoqda...';
  } else if (s === 'saved') {
    el.className = 'badge green';
    el.textContent = '✅ Saqlandi ' + new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  } else {
    el.className = 'badge red';
    el.textContent = '❌ Saqlanmadi';
  }
}

/* ================= PAYMENTS ================= */

let payState = { month: monthStr(), tab: 'status' };

async function renderPayments() {
  const [groups] = await Promise.all([api('/api/groups')]);
  const month = payState.month;

  if (payState.tab === 'status') {
    const data = await api('/api/payments/status?month=' + month);
    const rows = data.children.map(c => {
      const paidFull = c.paid_full;
      return `
        <tr>
          <td><div class="cell-user"><div class="avatar" style="background:${avatarColor(c.full_name)};width:32px;height:32px;font-size:12px">${esc(initials(c.full_name))}</div><div><div class="cell-name">${esc(c.full_name)}</div><div class="cell-sub">${esc(c.group_name || '')}</div></div></div></td>
          <td class="money">${fmtMoney(c.fee)}</td>
          <td class="money plus">${fmtMoney(c.paid)}</td>
          <td class="money ${c.due > 0 ? 'minus' : ''}">${fmtMoney(c.due)}</td>
          <td>${paidFull ? '<span class="badge green">To\'lagan</span>' : (c.paid > 0 ? '<span class="badge amber">Qisman</span>' : '<span class="badge red">To\'lamagan</span>')}</td>
          <td><button class="btn btn-soft btn-sm" onclick="payForm(${c.id},'${month}','${esc(c.full_name)}','${c.fee}')">+ To'lov</button></td>
        </tr>`;
    }).join('');

    $('#content').innerHTML = `
      <div class="card">
        <div class="toolbar">
          <select id="payMonth" class="select-filter" onchange="setPayMonth(this.value)">${lastTwoMonthOpts(month)}</select>
          <div class="tabs">
            <button class="tab active" data-tab="status">Status</button>
            <button class="tab" data-tab="history">To'lovlar tarixi</button>
          </div>
          <div class="search-box"><span class="s-icon">🔍</span><input id="paySearch" placeholder="Bola, guruh..."></div>
          <span class="spacer" style="flex:1"></span>
          <button class="btn btn-primary" onclick="payForm(null)">${ICONS.plus}To'lov qo'shish</button>
        </div>
        <div class="grid stats" style="margin-bottom:16px">
          <div class="stat-card"><div class="stat-icon" style="background:var(--success-soft)">✅</div><div class="stat-meta"><div class="stat-label">To'laganlar</div><div class="stat-value">${data.paidCount}/${data.total}</div></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:var(--primary-soft)">💰</div><div class="stat-meta"><div class="stat-label">Yig'ilgan</div><div class="stat-value">${fmtMoney(data.totalPaid)}</div></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:var(--danger-soft)">📋</div><div class="stat-meta"><div class="stat-label">Qarz</div><div class="stat-value">${fmtMoney(data.totalDue)}</div></div></div>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Bola</th><th>Oylik</th><th>To'lagan</th><th>Qarz</th><th>Holat</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="6"><div class="empty-state">Faol bolalar yo\'q</div></td></tr>'}</tbody>
        </table></div>
      </div>`;
  } else {
    const data = await api('/api/payments?month=' + month);
    const rows = data.rows.map(p => {
      const statusCell = p.status === 'pending'
        ? `<span class="badge amber">⏳ Tasdiqlash kutilmoqda</span>`
        : `<span class="badge green">Tasdiqlangan ✅</span>`;
      const adminCell = state.user.role === 'admin'
        ? `<button class="mini-btn danger" onclick="delPayment(${p.id})">🗑️</button>`
        : '';
      return `
      <tr>
        <td><div class="cell-user"><div class="avatar" style="width:32px;height:32px;font-size:12px;background:${avatarColor(p.child_name)}">${esc(initials(p.child_name))}</div><div class="cell-name">${esc(p.child_name)}</div></div></td>
        <td>${monthName(p.month)}</td>
        <td class="money plus">${fmtMoney(p.amount)}</td>
        <td>${fmtDate(p.paid_date)}</td>
        <td><span class="badge gray">${methodLabel(p.method)}</span></td>
        <td><span class="cell-sub">${esc(p.receipt_no || '')}</span></td>
        <td>${statusCell}</td>
        <td>${adminCell}</td>
      </tr>`;
    }).join('');

    $('#content').innerHTML = `
      <div class="card">
        <div class="toolbar">
          <select id="payMonth" class="select-filter" onchange="setPayMonth(this.value)">${lastTwoMonthOpts(month)}</select>
          <div class="tabs">
            <button class="tab" data-tab="status">Status</button>
            <button class="tab active" data-tab="history">To'lovlar tarixi</button>
          </div>
          <div class="search-box"><span class="s-icon">🔍</span><input id="paySearch" placeholder="Bola, usul, kvitansiya..."></div>
          <span class="badge blue">Jami: ${fmtMoney(data.total)}</span>
          <span class="spacer" style="flex:1"></span>
          <button class="btn btn-primary" onclick="payForm(null)">${ICONS.plus}To'lov qo'shish</button>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Bola</th><th>Oy</th><th>Summa</th><th>Sana</th><th>Usul</th><th>Kvitansiya</th><th>Holat</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="8"><div class="empty-state"><span class="emoji">🧾</span>Bu oy uchun to\'lov yo\'q</div></td></tr>'}</tbody>
        </table></div>
      </div>`;
  }

  $('#payMonth').addEventListener('change', e => { payState.month = e.target.value; renderPayments(); });
  $$('#content .tab').forEach(t => t.addEventListener('click', () => { payState.tab = t.dataset.tab; renderPayments(); }));
  wireSearch('paySearch');

  window._groupList = groups;
}

window.setPayMonth = (v) => { payState.month = v; renderPayments(); };
window.setParentPayMonth = (v) => { state.ppayMonth = v; renderParentPayments(); };

async function payForm(child_id = null, month = payState.month, childName = null, fee = 0) {
  let children = [];
  if (!child_id) {
    const list = await api('/api/children?status=active');
    children = list;
  }
  const childOptions = children.map(c => {
    const grp = c.group_name ? ' (' + esc(c.group_name) + ')' : '';
    const feeTxt = c.fee_per_month ? ` — ${fmtMoney(c.fee_per_month)}` : '';
    return `<option value="${c.id}">${esc(c.full_name)}${grp}${feeTxt}</option>`;
  }).join('');

  openModal('To\'lov qo\'shish', `
    ${child_id
      ? `<p style="margin-bottom:14px;color:var(--muted)">Bola: <b style="color:var(--text)">${esc(childName)}</b></p>`
      : `<div class="field"><span>Bolani tanlang *</span><select id="pay_child">${childOptions || '<option value="">Bola yo\'q</option>'}</select></div>`}
    <div class="form-row">
      <div class="field"><span>Summa *</span><input id="pay_amount" type="number" min="0" value="${fee}"></div>
      <div class="field"><span>Oy *</span><select id="pay_month">${lastTwoMonthOpts(month)}</select></div>
      <div class="field"><span>To'langan sana</span><input id="pay_date" type="date" value="${todayStr()}"></div>
      <div class="field"><span>Usul</span>
        <select id="pay_method"><option value="naqd">Naqd</option><option value="karta">Karta</option><option value="bank">Bank</option></select>
      </div>
      <div class="field"><span>Kvitansiya raqami</span><input id="pay_receipt" placeholder="KV-2026-..."></div>
      <div class="field"><span>Izoh</span><input id="pay_notes"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="savePayBtn">Saqlash</button>
    </div>
  `);
  if (!child_id) {
    const sel = $('#pay_child');
    if (sel && children.length) {
      const def = children[0];
      sel.value = def.id;
      const setFee = () => {
        const c = children.find(x => String(x.id) === String(sel.value));
        if (c && c.fee_per_month) $('#pay_amount').value = c.fee_per_month;
      };
      setFee();
      sel.addEventListener('change', setFee);
    }
  }
  $('#savePayBtn').addEventListener('click', async () => {
    const cid = child_id || Number($('#pay_child').value);
    const body = {
      child_id: cid,
      amount: Number($('#pay_amount').value),
      month: $('#pay_month').value,
      paid_date: $('#pay_date').value,
      method: $('#pay_method').value,
      receipt_no: $('#pay_receipt').value.trim(),
      notes: $('#pay_notes').value.trim()
    };
    if (!cid || !body.amount || !body.month) return toast('Bolani, summa va oyni kiriting', 'error');
    try {
      await api('/api/payments', { method: 'POST', body });
      toast('To\'lov saqlangan'); closeModal(); renderPayments();
    } catch (e) { toast(e.message, 'error'); }
  });
}

window.payForm = payForm;
window.delPayment = (id) => confirmDelete('Bu to\'lovni o\'chirasizmi?', async () => {
  await api('/api/payments/' + id, { method: 'DELETE' });
  renderPayments();
});

/* ================= USERS ================= */

async function renderUsers() {
  const users = await api('/api/users');
  const rows = users.map(u => `
    <tr>
      <td><div class="cell-user"><div class="avatar" style="background:${avatarColor(u.full_name)}">${esc(initials(u.full_name))}</div><div><div class="cell-name">${esc(u.full_name)}</div><div class="cell-sub">@${esc(u.username)}</div></div></div></td>
      <td>${u.role === 'admin' ? '<span class="badge purple">Administrator</span>' : u.role === 'teacher' ? '<span class="badge green">Tarbiyachi</span>' : u.role === 'parent' ? '<span class="badge blue">Ota-ona</span>' : '<span class="badge blue">Xodim</span>'}</td>
      <td>${fmtDate(u.created_at)}</td>
      <td>${u.id !== state.user.id ? `<button class="mini-btn danger" onclick="delUser(${u.id})">🗑️</button>` : '<span class="badge gray">Siz</span>'}</td>
    </tr>`).join('');

  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <span class="badge purple">${users.length} foydalanuvchi</span>
        <span class="spacer" style="flex:1"></span>
        <button class="btn btn-primary" onclick="userForm()">${ICONS.plus}Yangi foydalanuvchi</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Foydalanuvchi</th><th>Rol</th><th>Yaratilgan</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>`;
}

function userForm() {
  openModal('Yangi foydalanuvchi', `
    <div class="field"><span>To'liq ism *</span><input id="u_name"></div>
    <div class="field"><span>Login *</span><input id="u_user"></div>
      <div class="form-row">
        <div class="field"><span>Parol *</span><input id="u_pass" type="text"></div>
        <div class="field"><span>Rol</span><select id="u_role"><option value="operator">Operator</option><option value="admin">Administrator</option></select></div>
      </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="saveUserBtn">Qo'shish</button>
    </div>
  `);
  $('#saveUserBtn').addEventListener('click', async () => {
    const body = {
      full_name: $('#u_name').value.trim(),
      username: $('#u_user').value.trim(),
      password: $('#u_pass').value,
      role: $('#u_role').value
    };
    if (!body.full_name || !body.username || !body.password) return toast('Barcha maydonlarni to\'ldiring', 'error');
    try {
      await api('/api/users', { method: 'POST', body });
      toast('Qo\'shildi'); closeModal(); renderUsers();
    } catch (e) { toast(e.message, 'error'); }
  });
}

window.userForm = userForm;
window.delUser = (id) => confirmDelete('Bu foydalanuvchini o\'chirasizmi?', async () => {
  await api('/api/users/' + id, { method: 'DELETE' });
  renderUsers();
});

/* ================= SETTINGS ================= */

async function renderSettings() {
  try { state.settings = await api('/api/settings'); } catch (e) {}
  const s = state.settings;
  const sw = (id, key) => `<label class="toggle"><input type="checkbox" id="${id}" ${s[key] === '0' ? '' : 'checked'}><span class="slider"></span></label>`;
  const swOff = (id, key) => `<label class="toggle"><input type="checkbox" id="${id}" ${s[key] === '1' ? 'checked' : ''}><span class="slider"></span></label>`;
  const sel = (id, val, opts) => `<select id="${id}">${opts.map(([v, l]) => `<option value="${v}" ${val === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const txt = (id, key, ph) => `<input type="text" id="${id}" value="${esc(s[key] || '')}" placeholder="${ph}">`;
  const num = (id, key, ph, mn, mx) => `<input type="number" id="${id}" value="${esc(s[key] || '')}" placeholder="${ph}"${mn !== undefined ? ` min="${mn}"` : ''}${mx !== undefined ? ` max="${mx}"` : ''}>`;
  const pw = (id, key, ph) => `<input type="password" id="${id}" value="${esc(s[key] || '')}" placeholder="${ph}">`;
  const clr = (id, key) => `<input type="color" id="${id}" value="${esc(s[key] || '#8b5cf6')}">`;
  const ta = (id, key, ph, rows) => `<textarea id="${id}" rows="${rows || 2}" placeholder="${ph}">${esc(s[key] || '')}</textarea>`;
  const row = (label, desc, ctrl) => `<div class="settings-row"><div><div class="row-label">${label}</div>${desc ? `<div class="row-desc">${desc}</div>` : ''}</div><div class="row-right">${ctrl}</div></div>`;

  const tabs = [
    { id: 'site', icon: '🏫', label: "Bog'cha ma'lumotlari", desc: "Muassasa nomi, manzil, aloqa", group: 'Asosiy' },
    { id: 'biz', icon: '💼', label: 'Biznes', desc: "Narxlar va tashqi ko'rinish", group: 'Asosiy' },
    { id: 'reception', icon: '🏢', label: 'Qabul', desc: "Kirish sahifasi matni", group: 'Asosiy' },
    { id: 'login', icon: '🎨', label: "Login dizayni", desc: "Kirish sahifasining ko'rinishi", group: 'Asosiy' },
    { id: 'tg', icon: '🤖', label: 'Telegram bot', desc: 'Bot token va eslatmalar', group: 'Aloqa' },
    { id: 'sms', icon: '📱', label: 'SMS (Eskiz.uz)', desc: 'SMS eslatma yuborish', group: 'Aloqa' },
    { id: 'notif', icon: '🔔', label: 'Bildirishnomalar', desc: 'Xabar kanallari', group: 'Aloqa' },
    { id: 'auto', icon: '📊', label: 'Avtomatik hisobot', desc: 'Kunlik/haftalik hisobotlar', group: 'Tizim' },
    { id: 'curriculum', icon: '📚', label: "O'quv dasturi", desc: 'Dars va tushlik vaqti', group: 'Tizim' },
    { id: 'parents', icon: '👨‍👩‍👧', label: 'Ota-ona', desc: 'Ota-ona ruxsatlari', group: 'Tizim' },
    { id: 'finance', icon: '💰', label: 'Moliya', desc: 'Chegirma va jarima qoidalari', group: 'Tizim' },
    { id: 'dashboard', icon: '📈', label: 'Dashboard', desc: 'Asosiy sahifa bloklari', group: 'Tizim' },
    { id: 'roles', icon: '🔐', label: 'Rollar', desc: 'Ruxsatlar', group: 'Xavfsizlik' },
    { id: 'accounts', icon: '👤', label: 'Hisob', desc: 'Login va parolni o\u2018zgartirish', group: 'Xavfsizlik' },
    { id: 'backup', icon: '💾', label: 'Backup / Restore', desc: 'Zaxira olish va tiklash', group: "Ma'lumotlar" },
    { id: 'danger', icon: '⚠️', label: 'Xavfli hudud', desc: "Ma'lumotlarni tozalash", group: "Ma'lumotlar" }
  ];

  const sections = {
    site: `
      <div class="sc-desc">Muassasa haqidagi ma'lumotlar cheklar, hisobotlar va saytda ko'rinadi</div>
      <div class="form-grid">
        <div class="form-group"><label>Muassasa nomi</label>${txt('s_name', 'site_name', 'Denov Kindergarden')}</div>
        <div class="form-group"><label>Pul birligi</label>${txt('s_currency', 'currency', 'so\u2018m')}</div>
        <div class="form-group"><label>Manzil</label>${txt('s_address', 'address', 'Denov shahri')}</div>
        <div class="form-group"><label>Telefon</label>${txt('s_phone', 'phone', '+998 90 123 45 67')}</div>
        <div class="form-group"><label>Email</label>${txt('s_email', 'email', 'info@denovkg.uz')}</div>
        <div class="form-group"><label>Sayt URL</label>${txt('s_site_url', 'site_url', 'https://example.com')}</div>
      </div>
      <div class="settings-save"><button class="btn btn-primary" id="saveSettingsBtn">💾 Saqlash</button></div>
    `,
    biz: `
      <div class="sc-desc">Oylik to'lovlar va umumiy biznes parametrlari</div>
      <div class="form-grid">
        <div class="form-group"><label>Oylik to'lov (standart)</label>${num('s_fee_default', 'fee_default', '250000')}</div>
        <div class="form-group"><label>3 yoshgacha to'lov</label>${num('s_fee_under3', 'fee_under3', '300000')}</div>
        <div class="form-group"><label>2+ bola chegirmasi</label>${num('s_fee_sibling', 'fee_sibling', '200000')}</div>
        <div class="form-group"><label>Ish vaqti</label>${txt('s_work_hours', 'work_hours', '08:00 - 18:00')}</div>
      </div>
      <div class="settings-divider"></div>
      <div class="form-grid">
        <div class="form-group"><label>Logo URL</label>${txt('s_logo_url', 'logo_url', 'https://example.com/logo.png')}</div>
        <div class="form-group"><label>Asosiy rang</label>${clr('s_primary_color', 'primary_color')}</div>
      </div>
      <div class="settings-save"><button class="btn btn-primary" id="saveBizBtn">💾 Saqlash</button></div>
    `,
    reception: `
      <div class="sc-desc">Bog'chaga kirish sahifasida ko'rsatiladigan ma'lumotlar</div>
      <div class="form-grid single">
        <div class="form-group"><label>Vizitka matni</label>${ta('s_reception_text', 'reception_text', "Bog'chamizga xush kelibsiz!", 3)}</div>
      </div>
      <div class="form-grid">
        <div class="form-group"><label>Qabul kunlari</label>${txt('s_reception_days', 'reception_days', 'Dushanba - Juma')}</div>
        <div class="form-group"><label>Qabul vaqti</label>${txt('s_reception_hours', 'reception_hours', '09:00 - 17:00')}</div>
        <div class="form-group"><label>Telefon (qabul)</label>${txt('s_reception_phone', 'reception_phone', '+998 90 123 45 67')}</div>
        <div class="form-group"><label>Karta rasm URL</label>${txt('s_reception_image', 'reception_image', 'https://example.com/image.jpg')}</div>
      </div>
      <div class="settings-save"><button class="btn btn-primary" id="saveReceptionBtn">💾 Saqlash</button></div>
    `,
    login: `
      <div class="sc-desc">Tizimga kirish sahifasining ko'rinishi va ranglari</div>
      <div class="form-grid">
        <div class="form-group"><label>Salomlashuv matni</label>${txt('s_login_greeting', 'login_greeting', "Maktabgacha ta'lim tizimiga xush kelibsiz!")}</div>
        <div class="form-group"><label>Tepa matni</label>${txt('s_login_top_text', 'login_top_text', 'Davlat bog\u2018chasi')}</div>
        <div class="form-group"><label>Fon rangi</label>${clr('s_login_bg', 'login_bg')}</div>
        <div class="form-group"><label>Asosiy rang</label>${clr('s_login_primary', 'login_primary')}</div>
        <div class="form-group"><label>Logo URL</label>${txt('s_login_logo', 'login_logo', 'https://example.com/logo.png')}</div>
        <div class="form-group"><label>Fon rasmi URL</label>${txt('s_login_bg_image', 'login_bg_image', 'https://example.com/bg.jpg')}</div>
        <div class="form-group"><label>Pastki matn</label>${txt('s_login_bottom_text', 'login_bottom_text', '© 2026 Barcha huquqlar himoyalangan')}</div>
      </div>
      <div class="settings-save"><button class="btn btn-primary" id="saveLoginDesignBtn">💾 Saqlash</button></div>
    `,
    tg: `
      <div class="sc-desc">Ota-onalar bot orqali bolalari davomatini va to'lovlarini ko'radi</div>
      ${row('Telegram bot', 'Bot yoqilgan yoki o\u2018chiq', sw('tg_enabled', 'tg_enabled'))}
      ${row('Avtomatik qarz eslatmasi', 'Kuniga bir marta qarzdorlarga eslatma beradi', sw('reminders_enabled', 'reminders_enabled'))}
      <div class="form-grid" style="margin-top:14px">
        <div class="form-group"><label>Bot token</label>${pw('tg_token', 'tg_token', '@BotFather → /newbot → token')}</div>
        <div class="form-group"><label>Guruh ID</label>${txt('tg_group', 'tg_group', '-1001234567890')}</div>
        <div class="form-group"><label>Eslatma vaqti</label>${sel('reminder_time', s.reminder_time || '9', [['9', '09:00'], ['10', '10:00'], ['11', '11:00'], ['15', '15:00'], ['18', '18:00']])}</div>
      </div>
      <div class="settings-save"><button class="btn btn-primary" id="saveTgBtn">💾 Saqlash</button></div>
    `,
sms: `
      <div class="sc-desc">smsapi.uz orqali ota-onalarga SMS eslatma yuborish (1 SMS = 500 so'm)</div>
      ${row('SMS tizimi', "Umumiy SMS yoqish/o'chirish", sw('sms_enabled', 'sms_enabled'))}
      ${row("To'lov eslatmasi", 'Qarzdorlarga kun oldin SMS yuborish', sw('sms_pay_remind', 'sms_pay_remind'))}
      ${row('Davomat eslatmasi', 'Kunlik davomat SMS', sw('sms_att_remind', 'sms_att_remind'))}
      <div class="form-grid" style="margin-top:14px">
<div class="form-group"><label>smsapi.uz API kalit</label>${pw('s_sms_api_key', 'sms_api_key', 'API kalit (smsapi.uz kabinetdan qilingan)')}</div>
        <div class="form-group"><label>Yuboruvchi nomi</label>${txt('s_sms_sender', 'sms_sender', 'DenovKg')}</div>
      </div>
      <div class="form-grid single" style="margin-top:14px">
        <div class="form-group"><label>To'lov eslatma shabloni</label>${ta('sms_pay_tpl', 'sms_payment_template', "Hurmatli {name}! Bolangiz {child} uchun {month} oy to'lovi qarzi: {sum} so'm.", 3)}</div>
        <div class="form-group"><label>Davomat eslatma shabloni</label>${ta('sms_att_tpl', 'sms_attendance_template', 'Hurmatli {name}! Bolangiz {child} {date} kuni davomatda yo\u2018q.', 3)}</div>
      </div>
      <div class="settings-save"><button class="btn btn-primary" id="saveSmsBtn">💾 Saqlash</button></div>
    `,
    notif: `
      <div class="sc-desc">Qaysi kanallar orqali xabarlar yuborilishi</div>
      ${row('Telegram', 'Guruhga xabar yuborish', sw('notif_tg', 'notif_tg'))}
      ${row('SMS', 'Eskiz.uz orqali SMS yuborish', swOff('notif_sms', 'notif_sms'))}
      ${row('Browser push', 'Brauzer orqali eslatma', swOff('notif_push', 'notif_push'))}
      ${row('Email', 'Email orqali xabar yuborish', swOff('notif_email', 'notif_email'))}
      <div class="settings-divider"></div>
      <div class="sc-desc">📧 SMTP sozlamalari</div>
      <div class="form-grid">
        <div class="form-group"><label>SMTP server</label>${txt('s_smtp_host', 'smtp_host', 'smtp.gmail.com')}</div>
        <div class="form-group"><label>SMTP port</label>${txt('s_smtp_port', 'smtp_port', '587')}</div>
        <div class="form-group"><label>SMTP login</label>${txt('s_smtp_user', 'smtp_user', 'email@gmail.com')}</div>
        <div class="form-group"><label>SMTP parol</label>${pw('s_smtp_pass', 'smtp_pass', '***')}</div>
      </div>
      <div class="form-grid single" style="margin-top:14px">
        <div class="form-group"><label>Kimlarga yuboriladi</label>${sel('s_notif_target', s.notif_target || 'all', [['all', 'Barcha ota-onalar'], ['debtors', 'Faqat qarzdorlar'], ['parents', 'Faqat ota-onalar']])}</div>
      </div>
      <div class="settings-save"><button class="btn btn-primary" id="saveNotifBtn">💾 Saqlash</button></div>
    `,
    auto: `
      <div class="sc-desc">Admin va guruhga avtomatik hisobot yuborish</div>
      ${row('Kunlik hisobot', 'Har kuni kechqurun hisobot yuborish', sw('auto_daily', 'auto_daily'))}
      <div class="form-grid" style="margin-top:10px">
        <div class="form-group"><label>Kunlik vaqt</label>${sel('s_auto_daily_time', s.auto_daily_time || '17', [['17', '17:00'], ['18', '18:00'], ['19', '19:00']])}</div>
      </div>
      <div class="settings-divider"></div>
      ${row('Haftalik hisobot', 'Haftada bir marta yuborish', sw('auto_weekly', 'auto_weekly'))}
      <div class="form-grid" style="margin-top:10px">
        <div class="form-group"><label>Haftalik kun</label>${sel('s_auto_weekly_day', s.auto_weekly_day || '5', [['5', 'Juma'], ['6', 'Shanba'], ['0', 'Yakshanba']])}</div>
      </div>
      <div class="settings-divider"></div>
      ${row('Oylik arxiv', 'Oy oxirida avtomatik arxivlash', sw('auto_archive', 'auto_archive'))}
      <div class="settings-save"><button class="btn btn-primary" id="saveAutoReportBtn">💾 Saqlash</button></div>
    `,
    curriculum: `
      <div class="sc-desc">Guruhlar uchun umumiy o'quv dasturi parametrlari</div>
      <div class="form-grid">
        <div class="form-group"><label>Dars boshlanish vaqti</label>${txt('s_class_start', 'class_start', '08:30')}</div>
        <div class="form-group"><label>Dars tugash vaqti</label>${txt('s_class_end', 'class_end', '17:00')}</div>
        <div class="form-group"><label>Tushlik vaqti</label>${txt('s_lunch_time', 'lunch_time', '12:00 - 13:00')}</div>
        <div class="form-group"><label>Haftalik uy vazifa</label>${sel('s_homework', s.homework || '0', [['0', "Yo'q"], ['1', 'Bor']])}</div>
        <div class="form-group"><label>Qo'shimcha faoliyatlar</label>${txt('s_activities', 'activities', 'Rasm, Musiqa, Sport')}</div>
      </div>
      <div class="settings-save"><button class="btn btn-primary" id="saveCurriculumBtn">💾 Saqlash</button></div>
    `,
    parents: `
      <div class="sc-desc">Ota-onalar uchun umumiy parametrlar va ruxsatlar</div>
      ${row("Profil tahrirlash", "Ota-ona o'z profilini tahrirlay oladimi", sw('parent_edit', 'parent_edit'))}
      ${row("To'lov so'rash", 'Bot orqali to\u2018lov so\u2018rash', sw('parent_pay_request', 'parent_pay_request'))}
      ${row('Admin bilan chat', 'O\u2018zaro xabar almashish', sw('parent_chat', 'parent_chat'))}
      ${row("Eslatma qo'shish", 'Botga eslatma qo\u2018shish', sw('parent_reminder', 'parent_reminder'))}
      ${row('Baho qo\u2018yish', 'O\u2018quvchilarni baholash', sw('parent_rating', 'parent_rating'))}
      <div class="form-grid single" style="margin-top:14px">
        <div class="form-group"><label>Maxsus xabar (botga kirganda)</label>${ta('s_parent_welcome', 'parent_welcome', 'Xush kelibsiz!', 2)}</div>
      </div>
      <div class="settings-save"><button class="btn btn-primary" id="saveParentBtn">💾 Saqlash</button></div>
    `,
    finance: `
      <div class="sc-desc">Avtomatik narx hisob-kitobi va moliyaviy qoidalar</div>
      <div class="form-grid">
        <div class="form-group"><label>Chegirma (%)</label>${num('s_discount_pct', 'discount_pct', '0', 0, 100)}</div>
        <div class="form-group"><label>Kechikish jarimasi (%)</label>${num('s_late_fee_pct', 'late_fee_pct', '0', 0, 50)}</div>
        <div class="form-group"><label>Qaytarish muddati (kun)</label>${num('s_refund_days', 'refund_days', '7')}</div>
<div class="form-group"><label>To'lov usullari</label>${txt('s_pay_methods', 'pay_methods', 'naqd,karta,otkazma')}</div>
        <div class="form-group"><label>Valyuta</label>${sel('s_currency_type', s.currency_type || 'so\u2018m', [["so'm", "So'm"], ['USD', 'USD'], ['EUR', 'EUR']])}</div>
        <div class="form-group"><label>Kassa boshlang'ich (naqd, so'm)</label>${num('s_cash_naqd', 'cash_naqd', '0')}</div>
        <div class="form-group"><label>Bank boshlang'ich (so'm)</label>${num('s_cash_bank', 'cash_bank', '0')}</div>
      </div>
      <div class="settings-divider"></div>
      ${row("Avto-to'lov", 'Oy boshida avtomatik to\u2018lov', sw('s_auto_payment', 'auto_payment'))}
      <div class="settings-save"><button class="btn btn-primary" id="saveFinanceBtn">💾 Saqlash</button></div>
    `,
    dashboard: `
      <div class="sc-desc">Asosiy sahifada ko'rinadigan bloklarni boshqarish</div>
      ${row('Statistika kartochkalari', 'Bola, to\u2018lov, xarajat', sw('dash_stats', 'dash_stats'))}
      ${row('Davomat grafigi', 'Bar chart', sw('dash_att_chart', 'dash_att_chart'))}
      ${row('Guruhlar charti', 'Donut grafigi', sw('dash_groups_chart', 'dash_groups_chart'))}
      ${row('6 oylik trend', 'Trend grafigi', sw('dash_trend', 'dash_trend'))}
      ${row("Tug'ilgan kunlar", 'Yaqin kunlardagi tug\u2018ilgan kunlar', sw('dash_birthday', 'dash_birthday'))}
      ${row("So'nggi faoliyat", 'Timeline', sw('dash_activity', 'dash_activity'))}
      ${row('Tezkor amallar', 'Quick actions', sw('dash_quick', 'dash_quick'))}
      <div class="settings-save"><button class="btn btn-primary" id="saveDashBtn">💾 Saqlash</button></div>
    `,
    roles: `
      <div class="sc-desc">Har bir rol uchun qo'shimcha ruxsatlar</div>
      <div class="sc-group-title">👨‍💼 Operator</div>
      ${row("Davomat qo'yish", 'Operator davomat qo\u2018ya oladimi', sw('perm_op_att', 'perm_op_att'))}
      ${row("To'lovlarni tasdiqlash", 'To\u2018lovni tasdiqlash/rad etish', sw('perm_op_pay', 'perm_op_pay'))}
      ${row("Xarajat qo'shish", 'Xarajat yozishi mumkinmi', sw('perm_op_exp', 'perm_op_exp'))}
      ${row("Hisobotlarni ko'rish", 'Hisobot sahifasi', sw('perm_op_rep', 'perm_op_rep'))}
      <div class="settings-divider"></div>
      <div class="sc-group-title">👩‍🏫 Tarbiyachi</div>
      ${row("Davomat qo'yish", 'Tarbiyachi davomat qo\u2018ya oladimi', sw('perm_tch_att', 'perm_tch_att'))}
      ${row('Rasm yuklash', 'Foto rasm yuklash', sw('perm_tch_photo', 'perm_tch_photo'))}
      ${row("Menyu qo'shish", 'Kunlik menyu qo\u2018shish', sw('perm_tch_menu', 'perm_tch_menu'))}
      <div class="settings-save"><button class="btn btn-primary" id="saveRolesBtn">💾 Saqlash</button></div>
    `,
    accounts: `
      <div class="sc-desc">Login va parolni o'zgartirish</div>
      <div class="form-grid">
        <div class="form-group"><label>Joriy login</label><input type="text" value="${esc(state.user.username)}" disabled style="opacity:.6"></div>
      </div>
      <div class="settings-divider" style="margin:14px 0"></div>
      <div class="form-grid">
        <div class="form-group"><label>Eski parol</label><input type="password" id="pw_old" placeholder="••••••••"></div>
        <div class="form-group"><label>Yangi parol</label><input type="password" id="pw_new" placeholder="••••••••"></div>
      </div>
      <div class="settings-save"><button class="btn btn-primary" id="changePwBtn">🔑 Parolni yangilash</button></div>
      <div class="settings-divider" style="margin:20px 0"></div>
      <div class="form-grid">
        <div class="form-group"><label>Parol (tasdiqlash)</label><input type="password" id="lu_pass" placeholder="••••••••"></div>
        <div class="form-group"><label>Yangi login</label><input type="text" id="lu_new" placeholder="yangi_kod"></div>
      </div>
      <div class="settings-save"><button class="btn btn-primary" id="changeLoginBtn">🔑 Loginni yangilash</button></div>
    `,
    backup: `
      <div class="sc-desc">Ma'lumotlarni zaxiralab olish va qayta tiklash</div>
      <div class="backup-grid">
        <div class="backup-item" id="backupDbBtn" style="cursor:pointer">
          <span class="bi-icon">📦</span>
          <span class="bi-title">DB backup</span>
          <span class="bi-desc">SQLite faylini yuklab oling</span>
          <button class="btn btn-primary btn-sm">📥 .db yuklab olish</button>
        </div>
        <div class="backup-item" id="backupJsonBtn" style="cursor:pointer">
          <span class="bi-icon">📋</span>
          <span class="bi-title">JSON backup</span>
          <span class="bi-desc">Barcha jadvallar JSON formatda</span>
          <button class="btn btn-outline btn-sm">📥 JSON yuklab olish</button>
        </div>
      </div>
      <div class="settings-divider"></div>
      <div class="sc-group-title">📄 CSV eksport</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <a href="/api/export/children.csv" class="btn btn-outline btn-sm" download>👶 Bolalar</a>
        <a href="/api/export/payments.csv" class="btn btn-outline btn-sm" download>💰 To'lovlar</a>
        <a href="/api/export/expenses.csv" class="btn btn-outline btn-sm" download>💸 Xarajatlar</a>
        <a href="/api/export/attendance.csv" class="btn btn-outline btn-sm" download>✅ Davomat</a>
      </div>
      <div class="settings-divider"></div>
      <div class="sc-group-title">🔄 Qayta tiklash</div>
      <div class="form-grid single">
        <div class="form-group"><label>JSON faylni tanlang</label><input type="file" id="restoreFile" accept=".json,application/json" style="font-size:13px"></div>
      </div>
      <div class="settings-save"><button class="btn btn-danger" id="restoreDbBtn">⚠️ Tiklash (JSON dan)</button></div>
    `,
danger: `
      <div class="settings-danger">
        <div class="sc-desc" style="color:var(--danger)">Bu amallar ma'lumotlarni butunlay o'chiradi va qaytarib bo'lmaydi. Foydalanuvchilar va sozlamalar saqlanib qoladi.</div>
        <div class="reset-grid">
          <button class="btn btn-outline reset-action" data-what="attendance">🗑 Davomatni tozalash</button>
          <button class="btn btn-outline reset-action" data-what="payments">🗑 To'lovlarni tozalash</button>
          <button class="btn btn-outline reset-action" data-what="expenses">🗑 Xarajatlarni tozalash</button>
          <button class="btn btn-outline reset-action" data-what="children">🗑 Bolalarni tozalash</button>
          <button class="btn btn-outline reset-action" data-what="groups">🗑 Guruhlarni tozalash</button>
          <button class="btn btn-danger reset-action" data-what="all">🔥 Hammasini tozalash</button>
        </div>
      </div>
    `
  };

  // ---------- HTML ----------
  const groups = ['Asosiy', 'Aloqa', 'Tizim', 'Xavfsizlik', "Ma'lumotlar"];
  const cardsHtml = groups.map(g => {
    const items = tabs.filter(t => t.group === g);
    return `
      <div class="set-group">
        <div class="set-group-title">${g}</div>
        ${items.map(t => `
          <div class="settings-card${t.id === 'danger' ? ' danger-card' : ''}" data-card="${t.id}">
            <div class="sc-head" data-toggle="${t.id}">
              <span class="sc-icon">${t.icon}</span>
              <div class="sc-tit">
                <span class="sc-label">${t.label}</span>
                <span class="sc-desc">${t.desc}</span>
              </div>
              <span class="sc-arrow">▾</span>
            </div>
            <div class="sc-body">${sections[t.id]}</div>
          </div>`).join('')}
      </div>`;
  }).join('');

  $('#content').innerHTML = `
    <div class="page-head">
      <div>
        <h2>⚙️ Sozlamalar</h2>
        <p class="page-sub">Tizimni o'zingizga moslashtiring</p>
      </div>
    </div>
    <div class="settings-cards">${cardsHtml}</div>
  `;

  // ---------- Accordion ----------
  const allCards = $$('.settings-card');
  allCards.forEach(c => {
    const head = c.querySelector('.sc-head');
    head.addEventListener('click', () => {
      const isOpen = c.classList.contains('open');
      allCards.forEach(x => x.classList.remove('open'));
      if (!isOpen) c.classList.add('open');
    });
  });
  const first = $$('.settings-card')[0];
  if (first) first.classList.add('open');

  // ---------- Save handlers ----------
  const safe = (id) => { const el = $(id); return el ? el.value.trim() : ''; };
  const sv = (id) => { const el = $(id.startsWith('#') ? id : '#' + id); return el && el.checked ? '1' : '0'; };
  const save = (btnId, build, msg) => {
    $(btnId)?.addEventListener('click', async () => {
try {
        const body = build();
        state.settings = await api('/api/settings', { method: 'PUT', body });
        toast(msg || 'Sozlamalar saqlandi');
      } catch (e) { toast(e.message, 'error'); }
    });
  };

  if (isAdmin()) {
    save('#saveSettingsBtn', () => ({
      site_name: safe('#s_name'), currency: safe('#s_currency'), address: safe('#s_address'),
      phone: safe('#s_phone'), email: safe('#s_email'), site_url: safe('#s_site_url')
    }), 'Bog\u2018cha sozlamalari saqlandi');
    save('#saveBizBtn', () => ({
      fee_default: safe('#s_fee_default'), fee_under3: safe('#s_fee_under3'),
      fee_sibling: safe('#s_fee_sibling'), work_hours: safe('#s_work_hours'),
      logo_url: safe('#s_logo_url'), primary_color: safe('#s_primary_color')
    }), 'Biznes sozlamalari saqlandi');
    save('#saveReceptionBtn', () => ({
      reception_text: safe('#s_reception_text'), reception_days: safe('#s_reception_days'),
      reception_hours: safe('#s_reception_hours'), reception_image: safe('#s_reception_image'),
      reception_phone: safe('#s_reception_phone')
    }), 'Qabul sozlamalari saqlandi');
    save('#saveTgBtn', () => ({
      tg_token: safe('#tg_token'), tg_group: safe('#tg_group'),
      tg_enabled: sv('tg_enabled'), reminders_enabled: sv('reminders_enabled'),
      reminder_time: safe('#reminder_time')
    }), 'Telegram sozlamalari saqlandi');
save('#saveSmsBtn', () => ({
      sms_enabled: sv('sms_enabled'),
      sms_api_key: safe('#s_sms_api_key'), sms_sender: safe('#s_sms_sender'),
      sms_pay_remind: sv('sms_pay_remind'), sms_att_remind: sv('sms_att_remind'),
      sms_payment_template: safe('#sms_pay_tpl'), sms_attendance_template: safe('#sms_att_tpl')
    }), 'SMS sozlamalari saqlandi');
    save('#saveCurriculumBtn', () => ({
      class_start: safe('#s_class_start'), class_end: safe('#s_class_end'),
      lunch_time: safe('#s_lunch_time'), homework: safe('#s_homework'),
      activities: safe('#s_activities')
    }), "O'quv dasturi saqlandi");
    save('#saveLoginDesignBtn', () => ({
      login_greeting: safe('#s_login_greeting'), login_bg: safe('#s_login_bg'),
      login_primary: safe('#s_login_primary'), login_logo: safe('#s_login_logo'),
      login_bg_image: safe('#s_login_bg_image'), login_top_text: safe('#s_login_top_text'),
      login_bottom_text: safe('#s_login_bottom_text')
    }), "Login dizayni saqlandi");
    save('#saveAutoReportBtn', () => ({
      auto_daily: sv('auto_daily'), auto_daily_time: safe('#s_auto_daily_time'),
      auto_weekly: sv('auto_weekly'), auto_weekly_day: safe('#s_auto_weekly_day'),
      auto_archive: sv('auto_archive')
    }), 'Avtomatik hisobot saqlandi');
    save('#saveParentBtn', () => ({
      parent_edit: sv('parent_edit'), parent_pay_request: sv('parent_pay_request'),
      parent_chat: sv('parent_chat'), parent_reminder: sv('parent_reminder'),
      parent_rating: sv('parent_rating'), parent_welcome: safe('#s_parent_welcome')
    }), "Ota-ona sozlamalari saqlandi");
save('#saveFinanceBtn', () => ({
      discount_pct: safe('#s_discount_pct'), late_fee_pct: safe('#s_late_fee_pct'),
      refund_days: safe('#s_refund_days'), pay_methods: safe('#s_pay_methods'),
      currency_type: safe('#s_currency_type'), auto_payment: sv('s_auto_payment'),
      cash_naqd: safe('#s_cash_naqd'), cash_bank: safe('#s_cash_bank')
    }), 'Moliyaviy qoidalar saqlandi');
    save('#saveDashBtn', () => ({
      dash_stats: sv('dash_stats'), dash_att_chart: sv('dash_att_chart'),
      dash_groups_chart: sv('dash_groups_chart'), dash_trend: sv('dash_trend'),
      dash_birthday: sv('dash_birthday'), dash_activity: sv('dash_activity'),
      dash_quick: sv('dash_quick')
    }), 'Dashboard sozlamalari saqlandi');
    save('#saveNotifBtn', () => ({
      notif_tg: sv('notif_tg'), notif_sms: sv('notif_sms'), notif_push: sv('notif_push'),
      notif_email: sv('notif_email'), smtp_host: safe('#s_smtp_host'), smtp_port: safe('#s_smtp_port'),
      smtp_user: safe('#s_smtp_user'), smtp_pass: safe('#s_smtp_pass'),
      notif_target: safe('#s_notif_target')
    }), 'Bildirishnomalar saqlandi');
    save('#saveRolesBtn', () => ({
      perm_op_att: sv('perm_op_att'), perm_op_pay: sv('perm_op_pay'),
      perm_op_exp: sv('perm_op_exp'), perm_op_rep: sv('perm_op_rep'),
      perm_tch_att: sv('perm_tch_att'), perm_tch_photo: sv('perm_tch_photo'),
      perm_tch_menu: sv('perm_tch_menu')
}), "Rollar va ruxsatlar saqlandi");

    // ---------- Xavfli hudud (reset) handlers ----------
    const RESET_LABELS = {
      attendance: 'Davomat yozuvlari', payments: 'To\u2018lovlar', expenses: 'Xarajatlar',
      children: 'Bolalar va ota-onalar', groups: 'Guruhlar va tarbiyachilar', all: 'HAMMA ma\u2018lumotlar'
    };
    $$('.reset-action', $('#content')).forEach(btn => btn.addEventListener('click', () => {
      const what = btn.dataset.what;
      const label = RESET_LABELS[what] || what;
      window.resetConfirm(what, label);
    }));

    // ---------- Backup handlers ----------
    $('#backupDbBtn')?.addEventListener('click', async () => {
      try {
        const blob = await fetch('/api/export/backup.db').then(r => r.blob());
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'bogcha_backup_' + new Date().toISOString().slice(0, 10) + '.db';
        a.click();
        toast('DB backup yuklab olindi!');
      } catch (e) { toast(e.message, 'error'); }
    });
    $('#backupJsonBtn')?.addEventListener('click', async () => {
      try {
        const tables = ['users','groups','teachers','parents','children','attendance','payments','expenses','meals','notifications','parent_requests','announcements','ratings','chat_messages','settings','tg_links','schedules','audit_log','sms_log','bot_reminders','month_archives'];
        const data = {};
        for (const t of tables) { try { data[t] = await api('/api/table/' + t); } catch (e) { data[t] = []; } }
        downloadFile('bogcha_backup_' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(data, null, 2), 'application/json');
        toast('JSON backup yuklab olindi!');
      } catch (e) { toast(e.message, 'error'); }
    });
    $('#restoreDbBtn')?.addEventListener('click', async () => {
      const file = $('#restoreFile')?.files[0];
      if (!file) return toast('JSON faylni tanlang', 'error');
      try {
        const data = JSON.parse(await file.text());
        const tables = Object.keys(data);
        let restored = 0;
        for (const t of tables) {
          if (Array.isArray(data[t]) && data[t].length) {
            try { await api('/api/table/' + t, { method: 'POST', body: { rows: data[t] } }); restored++; } catch (e) { }
          }
        }
        toast(restored + ' ta jadval tiklandi!');
      } catch (e) { toast('Fayl xato: ' + e.message, 'error'); }
    });
  }

  $('#changePwBtn')?.addEventListener('click', async () => {
    try {
      await api('/api/change-password', { method: 'POST', body: { old_password: $('#pw_old').value, new_password: $('#pw_new').value } });
      toast('Parol yangilandi');
      $('#pw_old').value = '';
      $('#pw_new').value = '';
    } catch (e) { toast(e.message, 'error'); }
  });
  $('#changeLoginBtn')?.addEventListener('click', async () => {
    try {
      await api('/api/change-login', { method: 'POST', body: { password: $('#lu_pass').value, new_login: $('#lu_new').value } });
      toast('Login yangilandi. Qayta kiring.');
      setTimeout(() => logout(), 1500);
    } catch (e) { toast(e.message, 'error'); }
  });
}

/* ================= EXPENSES ================= */

const EXP_CATEGORIES = ['Oziq-ovqat', 'Kommunal', 'Ish haqi', 'Ta\'minot', 'Ta\'mirlash', 'Transport', 'Boshqa'];
let expState = { month: monthStr(), q: '' };

async function renderExpenses() {
  const data = await api('/api/expenses?month=' + expState.month);

  const byCat = {};
  for (const r of data.rows) byCat[r.category] = (byCat[r.category] || 0) + r.amount;

  let acc = 0;
  const catColors = { 'Oziq-ovqat': '#f59e0b', 'Kommunal': '#3b82f6', 'Ish haqi': '#8b5cf6', 'Ta\'minot': '#10b981', 'Ta\'mirlash': '#ef4444', 'Transport': '#14b8a6', 'Boshqa': '#64748b' };
  const totalCat = Object.values(byCat).reduce((s, v) => s + v, 0) || 1;
  const segs = Object.keys(byCat).map(cat => {
    const from = acc / totalCat * 100;
    acc += byCat[cat];
    return `${from}% ${acc / totalCat * 100}%`;
  }).join(',');
  const catColorList = Object.keys(byCat).map(cat => catColors[cat] || '#64748b').join(',');
  const legend = Object.keys(byCat).map(cat => `
    <div class="legend-item"><span class="legend-dot" style="background:${catColors[cat] || '#64748b'}"></span>${esc(cat)}<b>${fmtMoney(byCat[cat])}</b></div>
  `).join('');

  const rows = data.rows.map(r => `
    <tr>
      <td><div class="cell-name">${esc(r.name)}</div><div class="cell-sub">${esc(r.notes || '')}</div></td>
      <td><span class="badge blue">${esc(r.category)}</span></td>
      <td class="money minus">${fmtMoney(r.amount)}</td>
      <td><span class="badge gray">${r.method === 'naqd' ? '💵 Naqd' : r.method === 'karta' ? '💳 Karta' : r.method === 'click' ? '🟩 Click' : r.method === 'payme' ? '🔵 Payme' : r.method === 'bank' ? '🏦 Bank' : '🟣 Paynet'}</span></td>
      <td>${fmtDate(r.expense_date)}</td>
      <td><div class="row-actions">
        <button class="mini-btn" onclick="expForm(${r.id})">✏️</button>
        ${isAdmin() ? `<button class="mini-btn danger" onclick="delExpense(${r.id})">🗑️</button>` : ''}
      </div></td>
    </tr>`).join('');

  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <input type="month" id="expMonth" value="${expState.month}">
        <div class="search-box"><span class="s-icon">🔍</span><input id="expSearch" placeholder="Xarajat bo'yicha qidirish..."></div>
        <span class="spacer" style="flex:1"></span>
        <button class="btn btn-primary" onclick="expForm()">${ICONS.plus}Yangi xarajat</button>
      </div>
      <div class="grid stats" style="margin-bottom:16px">
        <div class="stat-card"><div class="stat-icon" style="background:var(--danger-soft)">📤</div><div class="stat-meta"><div class="stat-label">Bu oy xarajat</div><div class="stat-value">${fmtMoney(data.total)}</div><div class="stat-sub">${data.rows.length} ta yozuv</div></div></div>
      </div>
      <div class="card-grid" style="margin-bottom:16px">
        <div class="card">
          <div class="card-head"><h3>Kategoriyalar bo'yicha</h3></div>
          <div class="donut-row">
            <div class="donut" style="background:conic-gradient(${catColorList})">
              <div class="donut-center"><b>${fmtMoney(totalCat).split(' ')[0]}</b><span>jami</span></div>
            </div>
            <div class="legend">${legend || '<div class="empty-state">Xarajat yo\'q</div>'}</div>
          </div>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Xarajat</th><th>Kategoriya</th><th>Summa</th><th>Usul</th><th>Sana</th><th></th></tr></thead>
        <tbody id="expTbody">${rows || '<tr><td colspan="6"><div class="empty-state"><span class="emoji">🧾</span>Bu oy uchun xarajat yo\'q</div></td></tr>'}</tbody>
      </table></div>
    </div>`;

  $('#expMonth').addEventListener('change', e => { expState.month = e.target.value; renderExpenses(); });
  $('#expSearch').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    $$('#expTbody tr').forEach(tr => tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none');
  });
}

async function expForm(id = null) {
  const rows = id ? (await api('/api/expenses?month=' + expState.month)).rows : [];
  const r = id ? rows.find(x => x.id === id) : null;
  const defDate = (expState.month && expState.month !== monthStr()) ? expState.month + '-01' : todayStr();
  const catOpts = EXP_CATEGORIES.map(c => `<option ${r && r.category === c ? 'selected' : ''}>${c}</option>`).join('');
  openModal(id ? 'Xarajatni tahrirlash' : 'Yangi xarajat', `
    <div class="field"><span>Nomi *</span><input id="x_name" value="${esc(r?.name || '')}" placeholder="Misol: Oziq-ovqat mahsulotlari"></div>
    <div class="form-row">
      <div class="field"><span>Kategoriya</span><select id="x_cat">${catOpts}</select></div>
      <div class="field"><span>Summa (so'm) *</span><input id="x_amount" type="number" min="0" value="${r?.amount || ''}"></div>
      <div class="field"><span>Sana</span><input id="x_date" type="date" value="${esc(r?.expense_date || defDate)}"></div>
      <div class="field"><span>To'lov usuli</span><select id="x_method">
        ${['naqd', 'karta', 'click', 'payme', 'bank', 'paynet'].map(mm => `<option value="${mm}" ${(r?.method || 'naqd') === mm ? 'selected' : ''}>${mm === 'naqd' ? '💵 Naqd' : mm === 'karta' ? '💳 Karta' : mm === 'click' ? '🟩 Click' : mm === 'payme' ? '🔵 Payme' : mm === 'bank' ? '🏦 Bank' : '🟣 Paynet'}</option>`).join('')}</select></div>
      <div class="field"><span>Izoh</span><input id="x_notes" value="${esc(r?.notes || '')}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="saveExpBtn">${id ? 'Saqlash' : 'Qo\'shish'}</button>
    </div>
  `);
  $('#saveExpBtn').addEventListener('click', async () => {
    const body = {
      name: $('#x_name').value.trim(),
      category: $('#x_cat').value,
      amount: Number($('#x_amount').value),
      expense_date: $('#x_date').value,
      notes: $('#x_notes').value.trim(),
      method: ($('#x_method') && $('#x_method').value) || 'naqd'
    };
    if (!body.name || !body.amount) return toast('Nom va summani kiriting', 'error');
    try {
      if (id) await api('/api/expenses/' + id, { method: 'PUT', body });
      else await api('/api/expenses', { method: 'POST', body });
      toast('Saqlangan'); closeModal(); renderExpenses();
    } catch (e) { toast(e.message, 'error'); }
  });
}

window.editExpense = (id) => expForm(id);
window.delExpense = (id) => confirmDelete('Bu xarajatni o\'chirasizmi?', async () => {
  await api('/api/expenses/' + id, { method: 'DELETE' });
  renderExpenses();
});

/* ================= REPORTS ================= */

let repState = { month: monthStr() };

async function renderReports() {
  const m = repState.month;
  const [data, catData, cashData] = await Promise.all([
    api('/api/reports/monthly?month=' + m),
    api('/api/reports/expense-categories?month=' + m).catch(() => ({ data: [], grandTotal: 0 })),
    api('/api/reports/cashbook?month=' + m).catch(() => ({ entries: [], totalIncome: 0, totalExpense: 0, closingBalance: 0 }))
  ]);

  const methodRows = data.byMethod.map(x => `
    <div class="legend-item"><span class="legend-dot" style="background:${x.method === 'naqd' ? '#10b981' : x.method === 'karta' ? '#6366f1' : '#f59e0b'}"></span>${x.method === 'naqd' ? 'Naqd' : x.method === 'karta' ? 'Karta' : 'Bank'}<b>${fmtMoney(x.total)}</b></div>
  `).join('');

  const catColors = { 'Oziq-ovqat': '#f59e0b', 'Kommunal': '#3b82f6', 'Ish haqi': '#8b5cf6', 'Ta\'minot': '#10b981', 'Ta\'mirlash': '#ef4444', 'Transport': '#14b8a6', 'Boshqa': '#64748b', 'Uy-joy': '#ec4899', 'Avtobus': '#06b6d4', 'Ofis': '#84cc16' };
  const catRows = data.byCategory.map(x => `
    <div class="legend-item"><span class="legend-dot" style="background:${catColors[x.category] || '#64748b'}"></span>${esc(x.category)}<b>${fmtMoney(x.total)}</b></div>
  `).join('');

  const payRows = data.payments.map(p => `
    <tr><td><div class="cell-user"><div class="avatar" style="width:30px;height:30px;font-size:11px;background:${avatarColor(p.child_name)}">${esc(initials(p.child_name))}</div><div class="cell-name">${esc(p.child_name)}</div></div></td><td>${fmtDate(p.paid_date)}</td><td class="money plus">${fmtMoney(p.amount)}</td><td><span class="badge gray">${methodLabel(p.method)}</span></td></tr>
  `).join('');

  const expRows = data.expenses.map(e => `
    <tr><td><div class="cell-name">${esc(e.name)}</div></td><td>${esc(e.category)}</td><td>${fmtDate(e.expense_date)}</td><td class="money minus">${fmtMoney(e.amount)}</td></tr>
  `).join('');

  const attTotal = data.attTotals.present + data.attTotals.absent + data.attTotals.late;
  const attPct = attTotal ? Math.round(data.attTotals.present / attTotal * 100) : 0;

  const debtRows = data.debts.filter(d => d.due > 0 || d.unpaidMonths >= 2).map(d => `
    <tr><td><div class="cell-name">${esc(d.child_name)}</div></td><td>${esc(d.group_name) || '—'}</td><td class="money">${fmtMoney(d.fee)}</td><td class="money">${fmtMoney(d.paid)}</td><td class="money minus">${fmtMoney(d.due)}</td><td>${d.unpaidMonths >= 2 ? `<span class="badge red">${d.unpaidMonths} oy</span>` : `<span class="badge gray">${d.unpaidMonths} oy</span>`}</td></tr>
  `).join('');

  const cashRows = cashData.entries.map((e, i) => `
    <tr style="${e.type === 'income' ? 'border-left:3px solid var(--success)' : 'border-left:3px solid var(--danger)'}">
      <td>${i + 1}</td>
      <td>${fmtDate(e.date)}</td>
      <td>${esc(e.desc)}</td>
      <td><span class="badge ${e.type === 'income' ? 'green' : 'red'}">${e.type === 'income' ? 'Kirim' : 'Chiqim'}</span></td>
      <td class="money ${e.type === 'income' ? 'plus' : ''}" style="${e.type === 'expense' ? 'color:var(--danger)' : ''}">${e.type === 'income' ? fmtMoney(e.amount) : '—'}</td>
      <td class="money ${e.type === 'expense' ? 'minus' : ''}" style="${e.type === 'expense' ? 'color:var(--danger)' : ''}">${e.type === 'expense' ? fmtMoney(e.amount) : '—'}</td>
      <td class="money" style="font-weight:700">${fmtMoney(e.balance)}</td>
    </tr>
  `).join('');

  $('#content').innerHTML = `
    <div class="toolbar">
      <input type="month" id="repMonth" value="${m}">
      <span class="badge purple">${monthName(m)} hisoboti</span>
      <span class="spacer" style="flex:1"></span>
      <a href="/api/export/report.xlsx?month=${m}" class="btn btn-primary">📊 Excel (.xlsx)</a>
      <a href="/api/export/report.pdf?month=${m}" class="btn btn-outline" target="_blank">📄 PDF</a>
      <a href="/api/export/payments.csv?month=${m}" class="btn btn-outline">💳 To'lovlar</a>
      <a href="/api/export/expenses.csv?month=${m}" class="btn btn-outline">📤 Xarajatlar</a>
      <a href="/api/export/attendance.csv?month=${m}" class="btn btn-outline">✅ Davomat</a>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Chop etish</button>
    </div>

    <div class="grid stats">
      <div class="stat-card"><div class="stat-icon" style="background:var(--success-soft)">💰</div><div class="stat-meta"><div class="stat-label">Daromad</div><div class="stat-value">${fmtMoney(data.income)}</div><div class="stat-sub">${data.payments.length} ta to'lov</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--danger-soft)">📤</div><div class="stat-meta"><div class="stat-label">Xarajat</div><div class="stat-value">${fmtMoney(data.expense)}</div><div class="stat-sub">${data.expenses.length} ta xarajat</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:${data.profit >= 0 ? 'var(--primary-soft)' : 'var(--danger-soft)'}">📈</div><div class="stat-meta"><div class="stat-label">Sof foyda</div><div class="stat-value ${data.profit >= 0 ? '' : 'money minus'}">${fmtMoney(data.profit)}</div><div class="stat-sub">${data.profit >= 0 ? 'foyda' : 'zarar'}</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--info-soft)">💳</div><div class="stat-meta"><div class="stat-label">Jami qarz</div><div class="stat-value">${fmtMoney(data.totalDue)}</div><div class="stat-sub">${data.over2.length} ta 2+ oy to'lovsiz</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--info-soft)">✅</div><div class="stat-meta"><div class="stat-label">Davomat</div><div class="stat-value">${attPct}%</div><div class="stat-sub">${data.attTotals.present} keldi, ${data.attTotals.late} kech, ${data.attTotals.absent} kelmadi</div></div></div>
    </div>

    <div class="card-grid">
      <div class="card">
        <div class="card-head"><h3>To'lov usullari</h3></div>
        <div class="legend">${methodRows || '<div class="empty-state">Ma\'lumot yo\'q</div>'}</div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Xarajat kategoriyalari</h3></div>
        <div class="legend">${catRows || '<div class="empty-state">Ma\'lumot yo\'q</div>'}</div>
      </div>
    </div>

    <div class="card-grid">
      <div class="card">
        <div class="card-head"><h3>📊 Xarajat taqsimoti (Pie Chart)</h3><span class="badge purple">Jami: ${fmtMoney(catData.grandTotal)}</span></div>
        <div style="padding:16px;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
          <canvas id="expensePieChart" width="280" height="280" style="max-width:280px"></canvas>
          <div id="pieLegend" style="flex:1;min-width:200px"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>💰 Kassa kitobi — ${monthName(m)}</h3><span class="badge ${cashData.closingBalance >= 0 ? 'green' : 'red'}">Qoldiq: ${fmtMoney(cashData.closingBalance)}</span></div>
        <div style="padding:12px;display:flex;gap:16px;flex-wrap:wrap">
          <div style="flex:1;min-width:120px;padding:12px;background:var(--success-soft);border-radius:10px;text-align:center">
            <div style="font-size:12px;color:var(--muted)">Jami kirim</div>
            <div style="font-size:18px;font-weight:800;color:var(--success)">${fmtMoney(cashData.totalIncome)}</div>
          </div>
          <div style="flex:1;min-width:120px;padding:12px;background:var(--danger-soft);border-radius:10px;text-align:center">
            <div style="font-size:12px;color:var(--muted)">Jami chiqim</div>
            <div style="font-size:18px;font-weight:800;color:var(--danger)">${fmtMoney(cashData.totalExpense)}</div>
          </div>
          <div style="flex:1;min-width:120px;padding:12px;background:var(--primary-soft);border-radius:10px;text-align:center">
            <div style="font-size:12px;color:var(--muted)">Kassa qoldig'i</div>
            <div style="font-size:18px;font-weight:800;color:var(--primary)">${fmtMoney(cashData.closingBalance)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>📒 Kassa kitobi — batafsil</h3><span class="spacer"></span><span class="badge gray">${cashData.entries.length} yozuv</span></div>
      <div class="table-wrap"><table>
        <thead><tr><th>#</th><th>Sana</th><th>Tavsif</th><th>Tur</th><th>Kirim</th><th>Chiqim</th><th>Qoldiq</th></tr></thead>
        <tbody>${cashRows || '<tr><td colspan="7"><div class="empty-state">Yozuvlar yo\'q</div></td></tr>'}</tbody>
      </table></div>
    </div>

    <div class="card-grid">
      <div class="card">
        <div class="card-head"><h3>To'lovlar ro'yxati</h3></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Bola</th><th>Sana</th><th>Summa</th><th>Usul</th></tr></thead>
          <tbody>${payRows || '<tr><td colspan="4"><div class="empty-state">To\'lov yo\'q</div></td></tr>'}</tbody>
        </table></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Xarajatlar ro'yxati</h3></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Xarajat</th><th>Kategoriya</th><th>Sana</th><th>Summa</th></tr></thead>
          <tbody>${expRows || '<tr><td colspan="4"><div class="empty-state">Xarajat yo\'q</div></td></tr>'}</tbody>
        </table></div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>⚠️ Qarzdor bolalar</h3><span class="spacer"></span><span class="badge red">Jami: ${fmtMoney(data.totalDue)} so'm</span></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Bola</th><th>Guruh</th><th>Oylik narx</th><th>To'langan</th><th>Qarz</th><th>To'lovsiz</th></tr></thead>
        <tbody>${debtRows || '<tr><td colspan="6"><div class="empty-state">Qarzdor yo\'q ✅</div></td></tr>'}</tbody>
      </table></div>
    </div>
  `;

  // Pie chart (Chart.js)
  if (typeof Chart !== 'undefined' && catData.data && catData.data.length) {
    const pieColors = catData.data.map(x => catColors[x.category] || '#64748b');
    const ctx = document.getElementById('expensePieChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: catData.data.map(x => x.category),
          datasets: [{ data: catData.data.map(x => x.total), backgroundColor: pieColors, borderWidth: 2, borderColor: '#fff' }]
        },
        options: { responsive: false, plugins: { legend: { display: false } }, cutout: '55%' }
      });
    }
    const legendHtml = catData.data.map((x, i) => `
      <div style="display:flex;align-items:center;gap:8px;margin:6px 0">
        <span style="width:14px;height:14px;border-radius:4px;background:${pieColors[i]};flex-shrink:0"></span>
        <span style="flex:1;font-size:13px">${esc(x.category)}</span>
        <span style="font-size:12px;color:var(--muted)">${x.count} ta</span>
        <span style="font-size:12px;color:var(--muted)">${x.pct}%</span>
        <span style="font-weight:700;font-size:13px">${fmtMoney(x.total)}</span>
      </div>
    `).join('');
    const leg = document.getElementById('pieLegend');
    if (leg) leg.innerHTML = legendHtml || '<div class="empty-state">Ma\'lumot yo\'q</div>';
  }

  $('#repMonth').addEventListener('change', e => { repState.month = e.target.value; renderReports(); });
}

/* ================= MENYU (OVQATLANISH) ================= */

let mealState = { date: todayStr() };

async function renderMeals() {
  const data = await api('/api/meals?date=' + mealState.date);
  const weeklyData = await api('/api/meals/weekly?start=' + data.week[0]);

  const chips = data.week.map(d => `<button class="chip ${d === mealState.date ? 'active' : ''}" onclick="mealDay('${d}')">${d === todayStr() ? 'Bugun' : fmtDate(d)}</button>`).join('');
  const typeMeta = {
    nonushta: { label: 'Nonushta', icon: '🌅' },
    tushlik: { label: 'Tushlik', icon: '�?�️' },
    choy: { label: 'Choy / Kechki', icon: '🌆' }
  };
  const cards = ['nonushta', 'tushlik', 'choy'].map(tp => {
    const m = data.rows.find(r => r.meal_type === tp);
    return `
      <div class="card meal-card">
        <div class="card-head"><h3>${typeMeta[tp].icon} ${typeMeta[tp].label}</h3>${isAdmin() ? `<span class="spacer"></span><button class="btn btn-soft btn-sm" onclick="mealForm(${m ? m.id : 'null'},'${data.date}','${tp}')">${m ? '✏️' : '+ Qo\'shish'}</button>` : ''}</div>
        <div class="meal-body">
          <div class="meal-title">${esc(m ? m.title : 'Reja yo\'q')}</div>
          <div class="meal-items">${esc(m ? m.items : '—')}</div>
        </div>
      </div>`;
  }).join('');

  const dayNames = ['Yak','Dush','Sesh','Chor','Pay','Jum','Shan'];
  let weeklyHtml = '';
  if (weeklyData.week) {
    weeklyHtml = '<div class="card" style="margin-top:16px"><div class="card-head"><h3>📅 Haftalik menyu rejasii</h3></div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px">' +
      weeklyData.week.map(day => {
        const d = new Date(day.date);
        const isToday = day.date === todayStr();
        const mealsHtml = day.meals.length ? day.meals.map(m => `<div style="font-size:12px;padding:4px 0;border-bottom:1px solid var(--border)"><b>${m.title}</b>${m.items ? '<br><small style="color:var(--muted)">' + esc(m.items) + '</small>' : ''}</div>`).join('') : '<div style="font-size:12px;color:var(--muted);padding:4px 0">Yo\'q</div>';
        return `<div style="background:${isToday ? 'var(--primary-soft)' : 'var(--card2)'};border:1.5px solid ${isToday ? 'var(--primary)' : 'var(--border)'};border-radius:10px;padding:10px;text-align:center"><div style="font-weight:700;font-size:13px;margin-bottom:6px;${isToday ? 'color:var(--primary)' : ''}">${dayNames[d.getDay()]}<br><small>${day.date.slice(5)}</small></div>${mealsHtml}</div>`;
      }).join('') + '</div></div>';
  }

  $('#content').innerHTML = `
    <div class="toolbar flex-wrap">${chips}</div>
    <div class="card-grid meals-grid">${cards}</div>${weeklyHtml}`;
}

window.mealDay = (d) => { mealState.date = d; renderMeals(); };

/* ================= KUN JURNALI ================= */

const journalState = { date: jTodayStr(), group_id: '' };

function jTodayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

window.setJournalDate = (v) => { journalState.date = v; renderJournal(); };
window.setJournalGroup = (v) => { journalState.group_id = v; renderJournal(); };

async function renderJournal() {
  const [groups, entries] = await Promise.all([
    api('/api/groups').catch(() => []),
    api('/api/journal?date=' + journalState.date + (journalState.group_id ? '&group_id=' + journalState.group_id : ''))
  ]);
  const canEdit = isAdmin() || isOperator();
  const rows = entries.map(e => `
    <div class="journal-item" data-id="${e.id}">
      <div class="journal-title">
        <div class="cell-name">${esc(e.title)}</div>
        <div class="cell-sub">${fmtDate(e.journal_date)}${e.group_name ? ' • ' + esc(e.group_name) : ''} • ${esc(e.created_by || '')}</div>
      </div>
      ${e.activities ? `<div class="journal-act"><b>Faoliyatlar:</b> ${esc(e.activities)}</div>` : ''}
      ${e.summary ? `<div class="journal-sum"><b>Xulosa:</b> ${esc(e.summary)}</div>` : ''}
      ${canEdit ? `<div class="journal-actions"><button class="btn btn-outline btn-sm" onclick="editJournal(${e.id})">✏️</button><button class="btn btn-outline btn-sm" onclick="delJournal(${e.id})">🗑️</button></div>` : ''}
    </div>`).join('');

  $('#content').innerHTML = `
    <div class="toolbar flex-wrap">
      <input type="date" value="${journalState.date}" onchange="setJournalDate(this.value)">
      <select onchange="setJournalGroup(this.value)">
        <option value="">Barcha guruhlar</option>
        ${groups.map(g => `<option value="${g.id}" ${String(journalState.group_id) === String(g.id) ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}
      </select>
      ${canEdit ? `<button class="btn btn-primary" onclick="journalForm()">➕ Yangi yozuv</button>` : ''}
    </div>
    ${rows || '<div class="empty-state">Bu sana uchun yozuv yo\'q</div>'}
  `;
}

window.journalForm = (id) => {
  (async () => {
    let cur = {};
    if (id) {
      const list = await api('/api/journal');
      cur = list.find(x => x.id === id) || {};
    }
    const groups = await api('/api/groups').catch(() => []);
    openModal(id ? 'Jurnalni tahrirlash' : 'Kunlik jurnal yozuvi', `
      <div class="field"><span>Guruh</span><select id="j_group">
        <option value="">Guruhsiz</option>
        ${groups.map(g => `<option value="${g.id}" ${String(cur.group_id) === String(g.id) ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}
      </select></div>
      <div class="field"><span>Sana</span><input type="date" id="j_date" value="${cur.journal_date || journalState.date}"></div>
      <div class="field"><span>Sarlavha</span><input id="j_title" value="${esc(cur.title || '')}" placeholder="Masalan: O'zbek tili darsi"></div>
      <div class="field"><span>Faoliyatlar</span><textarea id="j_act" rows="3" placeholder="Qanday mashg'ulotlar o'tdi?">${esc(cur.activities || '')}</textarea></div>
      <div class="field"><span>Xulosa</span><textarea id="j_sum" rows="2" placeholder="Kun davomida nimalar qilindi?">${esc(cur.summary || '')}</textarea></div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
        <button class="btn btn-primary" id="saveJournalBtn">Saqlash</button>
      </div>
    `);
    $('#saveJournalBtn').addEventListener('click', async () => {
      const body = {
        group_id: $('#j_group').value ? Number($('#j_group').value) : null,
        journal_date: $('#j_date').value,
        title: $('#j_title').value.trim(),
        activities: $('#j_act').value.trim(),
        summary: $('#j_sum').value.trim()
      };
      if (!body.journal_date || !body.title) return toast('Sana va sarlavha kiritilani shart', 'error');
      try {
        await api('/api/journal', { method: 'POST', body });
        toast('Saqlangan'); closeModal(); renderJournal();
      } catch (e) { toast(e.message, 'error'); }
    });
  })();
};

window.editJournal = (id) => journalForm(id);

window.delJournal = async (id) => {
  if (!confirm('Jurnal yozuvi o\'chirilsinmi?')) return;
  try {
    await api('/api/journal/' + id, { method: 'DELETE' });
    toast('O\'chirildi'); renderJournal();
  } catch (e) { toast(e.message, 'error'); }
};

/* ================= FOTOGALEREYA ================= */

const galleryState = { group_id: '' };

function galleryImg(pic) {
  if (!pic) return '';
  if (/^(https?:|data:|blob:)/.test(pic)) return esc(pic);
  return '/uploads/' + esc(pic);
}

window.setGalleryGroup = (v) => { galleryState.group_id = v; renderGallery(); };
window.delGallery = async (id) => {
  if (!confirm('Rasm o\'chirilsinmi?')) return;
  try {
    await api('/api/gallery/' + id, { method: 'DELETE' });
    toast('O\'chirildi'); renderGallery();
  } catch (e) { toast(e.message, 'error'); }
};

async function renderGallery() {
  const [groups, photos] = await Promise.all([
    api('/api/groups').catch(() => []),
    api('/api/gallery' + (galleryState.group_id ? '?group_id=' + galleryState.group_id : ''))
  ]);
  const canEdit = isAdmin() || isOperator();
  const cards = photos.map(p => `
    <div class="g-item">
      <div class="g-img"><img src="${galleryImg(p.image)}" alt="${esc(p.title)}" onclick="lightbox('${galleryImg(p.image)}')"></div>
      <div class="g-info">
        <div class="cell-name">${esc(p.title || '')}</div>
        ${p.group_name ? `<div class="cell-sub">${esc(p.group_name)}</div>` : ''}
        <div class="cell-sub">${fmtDate(p.created_at)}</div>
        ${canEdit ? `<button class="btn btn-outline btn-sm" onclick="delGallery(${p.id})">🗑️</button>` : ''}
      </div>
    </div>`).join('');

  $('#content').innerHTML = `
    <div class="toolbar flex-wrap">
      <select onchange="setGalleryGroup(this.value)">
        <option value="">Barcha rasmlar</option>
        ${groups.map(g => `<option value="${g.id}" ${String(galleryState.group_id) === String(g.id) ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}
      </select>
      ${canEdit ? '<label class="btn btn-primary" style="cursor:pointer">📷 Rasm qo\'shish<input type="file" id="g_file" accept="image/*" hidden></label>' : ''}
    </div>
    ${cards ? `<div class="g-grid">${cards}</div>` : '<div class="empty-state">Rasmlar yo\'q</div>'}
  `;

  if (canEdit) {
    const inp = $('#g_file');
    if (inp) inp.addEventListener('change', async () => {
      const f = inp.files[0];
      if (!f) return;
      const fd = new FormData();
      fd.append('file', f);
      try {
        const up = await api('/api/upload', { method: 'POST', body: fd, raw: true });
        openModal('📷 Rasm qo\'shish', `
          <div class="field"><span>Guruh</span><select id="g_group">
            <option value="">Guruhsiz</option>
            ${groups.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('')}
          </select></div>
          <div class="field"><span>Sarlavha</span><input id="g_title" placeholder="Masalan: Yangi yil bayrami"></div>
          <div class="modal-actions">
            <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
            <button class="btn btn-primary" id="saveGalleryBtn">Saqlash</button>
          </div>
        `);
        const fileName = up.filename;
        $('#saveGalleryBtn').addEventListener('click', async () => {
          const body = {
            group_id: $('#g_group').value ? Number($('#g_group').value) : null,
            title: $('#g_title').value.trim(),
            image: fileName
          };
          try {
            await api('/api/gallery', { method: 'POST', body });
            toast('Saqlangan'); closeModal(); renderGallery();
          } catch (e) { toast(e.message, 'error'); }
        });
      } catch (e) { toast(e.message, 'error'); }
    });
  }
}

function lightbox(src) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<img src="${src}"><button class="lb-close" onclick="this.parentElement.remove()">✕</button>`;
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.remove(); });
  document.body.appendChild(lb);
}

/* ================= LANDING ================= */

async function renderLanding() {
  const [courses, leads, site] = await Promise.all([
    api('/api/courses').catch(() => []),
    api('/api/landing/leads').catch(() => []),
    api('/api/settings').catch(() => ({}))
  ]);
  const courseRows = courses.map(c => `
    <tr>
      <td><span style="font-size:20px">${c.icon || '🎨'}</span> <b>${esc(c.name)}</b></td>
      <td class="cell-sub">${esc(c.description || '—')}</td>
      <td class="money">${fmtMoney(c.price)}</td>
      <td>${esc(c.duration || '')}</td>
      <td class="actions-cell">
        <button class="btn btn-outline btn-sm" onclick="delCourse(${c.id})">🗑️</button>
      </td>
    </tr>`).join('');
  const leadRows = leads.map(l => `
    <tr>
      <td><div class="cell-name">${esc(l.parent_name)}</div><div class="cell-sub">${esc(l.child_name || '')}</div></td>
      <td class="cell-name">${esc(l.phone)}</td>
      <td class="cell-sub">${esc(l.message || '')}</td>
      <td>${fmtDate(l.created_at)}</td>
    </tr>`).join('');

  $('#content').innerHTML = `
    <div class="toolbar">
      <a href="/landing" target="_blank" class="btn btn-primary">🌐 Taklif sahifasini ko'rish</a>
      <button class="btn btn-outline" onclick="courseForm()">➕ Kurs qo'shish</button>
      <span class="spacer" style="flex:1"></span>
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-head"><h3>🎨 To'garaklar / Kurslar</h3></div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Nomi</th><th>Tavsif</th><th>Narx</th><th>Davomiyligi</th><th></th></tr></thead>
        <tbody>${courseRows || '<tr><td colspan="5"><div class="empty-state">Kurslar yo\'q</div></td></tr>'}</tbody>
      </table></div>
    </div>
    <div class="card">
      <div class="card-head"><h3>📥 Taklif sahifasidan arizalar</h3><span class="badge purple">${leads.length} ta</span></div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Ota-ona</th><th>Telefon</th><th>Xabar</th><th>Sana</th></tr></thead>
        <tbody>${leadRows || '<tr><td colspan="4"><div class="empty-state">Arizalar yo\'q</div></td></tr>'}</tbody>
      </table></div>
    </div>
  `;
}

window.courseForm = () => {
  openModal('Kurs qo\'shish', `
    <div class="field"><span>Nomi</span><input id="c_name" placeholder="Masalan: Rassomlik to'garagi"></div>
    <div class="field"><span>Belgisi (imoji)</span><input id="c_icon" maxlength="4" placeholder="🎨"></div>
    <div class="field"><span>Tavsif</span><textarea id="c_desc" rows="2"></textarea></div>
    <div class="field"><span>Narx (so'm)</span><input id="c_price" type="number" placeholder="150000"></div>
    <div class="field"><span>Davomiyligi</span><input id="c_dur" placeholder="2 oy"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="saveCourseBtn">Saqlash</button>
    </div>
  `);
  $('#saveCourseBtn').addEventListener('click', async () => {
    const body = {
      name: $('#c_name').value.trim(),
      icon: $('#c_icon').value.trim() || '🎨',
      description: $('#c_desc').value.trim(),
      price: Number($('#c_price').value) || 0,
      duration: $('#c_dur').value.trim()
    };
    if (!body.name) return toast('Nomi kiriting', 'error');
    try {
      await api('/api/courses', { method: 'POST', body });
      toast('Qo\'shildi'); closeModal(); renderLanding();
    } catch (e) { toast(e.message, 'error'); }
  });
};

window.delCourse = async (id) => {
  if (!confirm('Kurs o\'chirilsinmi?')) return;
  try {
    await api('/api/courses/' + id, { method: 'DELETE' });
    toast('O\'chirildi'); renderLanding();
  } catch (e) { toast(e.message, 'error'); }
};

function mealForm(id, date, type) {
  openModal(id ? 'Menyuni tahrirlash' : 'Menyu qo\'shish', `
    <div class="field"><span>Sana</span><input id="m_date" type="date" value="${date}"></div>
    <div class="field"><span>Ovqat turi</span>
      <select id="m_type">
        <option value="nonushta" ${type === 'nonushta' ? 'selected' : ''}>Nonushta</option>
        <option value="tushlik" ${type === 'tushlik' ? 'selected' : ''}>Tushlik</option>
        <option value="choy" ${type === 'choy' ? 'selected' : ''}>Choy / Kechki</option>
      </select>
    </div>
    <div class="field"><span>Nomi</span><input id="m_title" placeholder="Masalan: Guruchli sho'rva"></div>
    <div class="field"><span>Masalliqlar / taomlar (vergul bilan)</span><textarea id="m_items" rows="3" placeholder="Guruch, sabzi, go'sht..."></textarea></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="saveMealBtn">Saqlash</button>
    </div>
  `);
  $('#saveMealBtn').addEventListener('click', async () => {
    const body = {
      meal_date: $('#m_date').value,
      meal_type: $('#m_type').value,
      title: $('#m_title').value.trim(),
      items: $('#m_items').value.trim()
    };
    if (!body.meal_date || !body.title) return toast('Sana va nom kiriting', 'error');
    try {
      if (id) await api('/api/meals/' + id, { method: 'PUT', body });
      else await api('/api/meals', { method: 'POST', body });
      toast('Saqlangan'); closeModal(); renderMeals();
    } catch (e) { toast(e.message, 'error'); }
  });
}

/* ================= XABARNOMALAR ================= */

async function renderNotify() {
  const [data, log] = await Promise.all([
    api('/api/notifications/prepare?month=' + monthStr()),
    api('/api/notifications/log')
  ]);
  notifySel = new Set();

  const listBlock = (title, icon, items, type, color) => `
    <div class="card">
      <div class="card-head"><h3>${icon} ${title}</h3><span class="badge ${color}">${items.length} ta</span></div>
      ${items.length ? items.map((it, i) => `
        <div class="notify-row" data-ni="${i}" data-type="${type}">
          <label class="n-check"><input type="checkbox" onchange="notifyToggle(${i},'${type}',this.checked)"></label>
          <div class="n-info"><div class="cell-name">${esc(it.parent_name)}</div><div class="cell-sub">${esc(it.child_name)} • ${esc(it.phone || 'telefon yo\'q')}</div>
            <div class="n-msg">${esc(it.message)}</div></div>
        </div>`).join('') : '<div class="empty-state">Xabar talab qiladigan holat yo\'q</div>'}
      ${items.length ? `<div class="modal-actions" style="padding:14px 18px 16px"><button class="btn btn-primary" onclick="sendNotify('${type}')">✈️ Tanlanganni yuborish (${type === 'payment' ? 'qarz' : 'davomat'})</button></div>` : ''}
    </div>`;

  const logRows = log.map(l => `
    <tr><td>${fmtDate(l.created_at)}</td><td><div class="cell-name">${esc(l.parent_name)}</div></td><td>${esc(l.child_name)}</td><td><span class="badge ${l.type === 'payment' ? 'amber' : 'blue'}">${l.type === 'payment' ? 'Qarz' : 'Davomat'}</span></td><td class="n-msg">${esc(l.message)}</td></tr>`).join('');

  $('#content').innerHTML = `
    <div class="card" style="margin-bottom:16px;background:var(--grad);color:#fff">
      <div class="card-head"><h3>📨 SMS avtomatik eslatma</h3></div>
      <p style="margin-bottom:12px;opacity:.9">Barcha qarzdor ota-onalarga SMS eslatma yuboriladi. Avtomatik ravishda qarz miqdori hisoblanadi.</p>
      <button class="btn btn-primary" style="background:#fff;color:var(--primary)" onclick="sendSmsReminder()">📨 Barcha qarzdorlarga SMS yuborish</button>
    </div>
    <div class="card-grid">
      ${listBlock('To\'lov qarzi', '💳', data.payment, 'payment', 'amber')}
      ${listBlock('Davomatsiz bolalar', '❌', data.attendance, 'attendance', 'blue')}
    </div>
    <div class="card">
      <div class="card-head"><h3>Yuborilgan xabarnomalar jurnali</h3></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Sana</th><th>Ota-ona</th><th>Bola</th><th>Turi</th><th>Matn</th></tr></thead>
        <tbody>${logRows || '<tr><td colspan="5"><div class="empty-state">Hali yuborilmagan</div></td></tr>'}</tbody>
      </table></div>
    </div>`;
}

let notifySel = new Set();

window.notifyToggle = (i, type, on) => { on ? notifySel.add(type + ':' + i) : notifySel.delete(type + ':' + i); };

window.sendNotify = async (type) => {
  const data = await api('/api/notifications/prepare?month=' + monthStr());
  const items = type === 'payment' ? data.payment : data.attendance;
  const recipients = [...notifySel].filter(k => k.startsWith(type + ':')).map(k => items[Number(k.split(':')[1])]).filter(Boolean);
  if (!recipients.length) return toast('Avval qabul qiluvchilarni belgilang', 'error');
  try {
    const r = await api('/api/notifications/send', { method: 'POST', body: { type, channel: 'manual', recipients, month: monthStr() } });
    toast(`${r.count} ta xabar yuborildi${r.smsCount ? ' (' + r.smsCount + ' SMS)' : ''}`);
    renderNotify();
  } catch (e) { toast(e.message, 'error'); }
};

window.sendSmsReminder = async () => {
  if (!confirm('Barcha qarzdor ota-onalarga SMS eslatma yuborilsinmi?')) return;
  try {
    const r = await api('/api/sms-reminder/send', { method: 'POST' });
    toast(`${r.count || 0} ta SMS yuborildi (jami: ${r.total || 0} ta qarzdor)`, r.count > 0 ? 'success' : 'error');
    renderNotify();
  } catch (e) { toast(e.message, 'error'); }
};

/* ================= E'LONLAR ================= */

async function renderAnnouncements() {
  const rows = await api('/api/announcements');
  const list = rows.map(a => `
    <div class="card">
      <div class="card-head">
        <b style="font-size:15px">📢 ${esc(a.title)}</b>
        <span class="spacer"></span>
        <span style="font-size:12px;color:var(--muted)">${esc(a.created_by || '')} · ${fmtDate(a.created_at)}</span>
        <button class="mini-btn danger" onclick="delAnnouncement(${a.id})">🗑️</button>
      </div>
      <p style="white-space:pre-wrap;margin-top:8px">${esc(a.text)}</p>
    </div>`).join('');

  $('#content').innerHTML = `
    <div class="toolbar">
      <span class="badge purple">${rows.length} ta</span>
      <span class="spacer"></span>
      <button class="btn btn-primary" onclick="announcementForm()">${ICONS.plus}Yangi e'lon</button>
    </div>
    ${list || '<div class="empty-state"><span class="emoji">📭</span>E\'lonlar yo\'q</div>'}`;
}

function announcementForm() {
  openModal('Yangi e\'lon', `
    <div class="field"><span>Sarlavha *</span><input id="ann_title" placeholder="Misol: Ertaga ochiq dars kuni"></div>
    <div class="field"><span>Matn *</span><textarea id="ann_text" rows="5" placeholder="E'lon matnini yozing..."></textarea></div>
    <div class="field" style="margin-bottom:10px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="ann_tg" checked> 📢 Telegram'ga ham yuborish</label></div>
    <div class="field" style="margin-bottom:10px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="ann_sms"> 📨 SMS orqali ham yuborish (barcha ota-onalarga)</label></div>
    <div class="field" style="margin-bottom:10px;font-size:12px;color:var(--muted)" id="smsHint" hidden>🔔 SMS yuborish uchun Sms sahifasida (Sozlamalar → SMS) Eskiz.uz email va parolni kiriting.</div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="saveAnnBtn">Yuborish</button>
    </div>
  `);
  $('#ann_sms').addEventListener('change', () => {
    $('#smsHint').hidden = !$('#ann_sms').checked;
  });
  $('#saveAnnBtn').addEventListener('click', async () => {
    const title = $('#ann_title').value.trim();
    const text = $('#ann_text').value.trim();
    if (!title || !text) return toast('Sarlavha va matnni kiriting', 'error');
    const btn = $('#saveAnnBtn');
    btn.disabled = true; btn.textContent = 'Yuborilmoqda...';
    try {
      const r = await api('/api/announcements', { method: 'POST', body: { title, text, send_tg: $('#ann_tg').checked, send_sms: $('#ann_sms').checked } });
      closeModal();
      const extra = r.smsSent != null ? ` (+${r.smsSent} SMS)` : '';
      toast(`E'lon joylandi${extra}`); renderAnnouncements();
    } catch (e) {
      if (e.message.includes('SMS')) { $('#ann_sms').checked = false; $('#smsHint').hidden = true; toast(e.message, 'error'); closeModal(); }
      else toast(e.message, 'error');
      btn.disabled = false; btn.textContent = 'Yuborish';
    }
  });
}

window.delAnnouncement = (id) => confirmDelete('Bu e\'lonni o\'chirasizmi?', async () => {
  await api('/api/announcements/' + id, { method: 'DELETE' });
  renderAnnouncements();
});

/* ================= ZAXIRA (BACKUP) ================= */

async function renderBackup() {
  $('#content').innerHTML = `
    <div class="card-grid">
      <div class="card">
        <div class="card-head"><h3>⬇️ Zaxira (Backup)</h3></div>
        <p style="color:var(--muted);font-size:13px;margin-bottom:14px">Barcha ma'lumotlar JSON fayl ko'rinishida yuklab olinadi. Faylni xavfsiz joyda saqlang.</p>
        <a href="/api/backup" class="btn btn-primary">⬇️ Backup yuklab olish</a>
      </div>
      <div class="card">
        <div class="card-head"><h3>⬆️ Tiklash (Restore)</h3></div>
        <p style="color:var(--muted);font-size:13px;margin-bottom:14px">Avval yuklab olingan backup faylini tanlang. Tiklash <b>joriy ma'lumotlarni o'chiradi</b> va backup bilan almashtiradi.</p>
        <input type="file" id="restoreFile" accept=".json,application/json" style="margin-bottom:12px">
        <button class="btn btn-danger" id="restoreBtn" onclick="restoreBackup()">⬆️ Tiklash</button>
      </div>
    </div>`;
}

window.restoreBackup = async () => {
  const input = $('#restoreFile');
  if (!input.files || !input.files[0]) return toast('Backup faylini tanlang', 'error');
  const file = input.files[0];
  let json;
  try {
    json = JSON.parse(await file.text());
  } catch (e) {
    return toast('Fayl yaroqli JSON emas', 'error');
  }
  if (!json.data) return toast('Bu backup fayli emas', 'error');
  if (!confirm('Tiklash joriy ma\'lumotlarni o\'chiradi. Davom etasizmi?')) return;
  try {
    const r = await api('/api/backup/restore', { method: 'POST', body: { data: json.data } });
    toast('Backup tiklandi');
    setTimeout(() => go('dashboard'), 600);
  } catch (e) { toast(e.message, 'error'); }
};

/* ================= AUDIT JURNALI ================= */

async function renderAudit() {
  const rows = await api('/api/audit?limit=300');
  const entities = [...new Set(rows.map(r => r.entity))];
  const entityOpts = `<option value="">Barchasi</option>` + entities.map(e => `<option value="${esc(e)}">${esc(e)}</option>`).join('');
  const tbody = rows.map(r => `
    <tr>
      <td>${fmtDate(r.created_at)} ${String(r.created_at).slice(11, 16)}</td>
      <td><div class="cell-name">${esc(r.username)}</div><div class="cell-sub">${esc(r.role)}</div></td>
      <td><span class="badge gray">${esc(r.action)}</span></td>
      <td>${esc(r.entity)}</td>
      <td class="n-msg">${esc(r.detail)}</td>
    </tr>`).join('');

  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <select class="select-filter" id="auditEntity">${entityOpts}</select>
        <span class="badge purple">${rows.length} ta yozuv</span>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Vaqt</th><th>Foydalanuvchi</th><th>Harakat</th><th>Ob\'ekt</th><th>Izoh</th></tr></thead>
        <tbody>${tbody || '<tr><td colspan="5"><div class="empty-state">Yozuv yo\'q</div></td></tr>'}</tbody>
      </table></div>
    </div>`;
  $('#auditEntity').addEventListener('change', async e => {
    const v = e.target.value;
    const d = await api('/api/audit?limit=300' + (v ? '&entity=' + encodeURIComponent(v) : ''));
    const tb = d.map(r => `<tr><td>${fmtDate(r.created_at)} ${String(r.created_at).slice(11, 16)}</td><td>${esc(r.username)}</td><td><span class="badge gray">${esc(r.action)}</span></td><td>${esc(r.entity)}</td><td class="n-msg">${esc(r.detail)}</td></tr>`).join('');
    document.querySelector('#auditEntity').nextElementSibling.querySelector('tbody').innerHTML = tb;
  });
}


/* ================= TARBIYACHILAR PANELI ================= */

async function renderTeacherDashboard() {
  const d = await api('/api/teacher/group');
  if (!d.group) {
    $('#content').innerHTML = `<div class="card"><div class="empty-state"><span class="emoji">🧑‍🏫</span>Sizga guruh biriktirilmagan. Administrator bilan bog\'laning.</div></div>`;
    return;
  }
  const attPct = d.today.total ? Math.round(d.today.present / d.today.total * 100) : 0;
  const monthAtt = d.monthAtt;
  $('#content').innerHTML = `
    <div class="kpi-banner">
      <div>
        <h2>Assalomu alaykum, ${esc(state.user.full_name)}! 👋</h2>
        <p>Guruh: <b>${esc(d.group.name)}</b> • ${d.children.length} bola</p>
      </div>
      <div class="kpi-right">
        <div class="kpi-item"><b>${d.today.present}/${d.today.total}</b><span>Bugun keldi</span></div>
        <div class="kpi-item"><b>${attPct}%</b><span>Davomat</span></div>
      </div>
    </div>
    <div class="grid stats">
      <div class="stat-card"><div class="stat-icon" style="background:var(--primary-soft)">🧒</div><div class="stat-meta"><div class="stat-label">Guruhimdagi bolalar</div><div class="stat-value">${d.children.length}</div><div class="stat-sub">${esc(d.group.name)}</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--success-soft)">✅</div><div class="stat-meta"><div class="stat-label">Bu oy keldi</div><div class="stat-value">${monthAtt.present}</div><div class="stat-sub">davomat yozuvlari</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--warning-soft)">⏰</div><div class="stat-meta"><div class="stat-label">Bu oy kechikdi</div><div class="stat-value">${monthAtt.late}</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--danger-soft)">❌</div><div class="stat-meta"><div class="stat-label">Bu oy keldi yo\'q</div><div class="stat-value">${monthAtt.absent}</div></div></div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Bugungi vazifangiz</h3><span class="spacer"></span><button class="btn btn-primary" onclick="go('t_attendance')">✅ Davomatni belgilash</button></div>
      <p style="color:var(--muted);font-size:14px">Guruh bolalari ro\'yxatini ko\'ring va kunlik davomatni belgilang.</p>
    </div>`;
}

async function renderTeacherChildren() {
  const d = await api('/api/teacher/group');
  if (!d.group) {
    $('#content').innerHTML = `<div class="card"><div class="empty-state">Sizga guruh biriktirilmagan</div></div>`;
    return;
  }
  const rows = d.children.map(c => `
    <tr>
      <td><div class="cell-user"><div class="avatar" style="background:${avatarColor(c.full_name)}">${esc(initials(c.full_name))}</div><div class="cell-name">${esc(c.full_name)}</div></div></td>
      <td>${c.birth_date ? fmtDate(c.birth_date) + ` (${age(c.birth_date)} yosh)` : '—'}</td>
      <td>${c.gender === 'ayol' ? 'Qiz' : 'O\'g\'il'}</td>
      <td>${fmtDate(c.enrolled_at)}</td>
    </tr>`).join('');
  $('#content').innerHTML = `
    <div class="card">
      <div class="card-head"><h3>Guruhim: ${esc(d.group.name)}</h3><span class="spacer"></span><span class="badge purple">${d.children.length} bola</span></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Bola</th><th>Tug\'ilgan sana</th><th>Jinsi</th><th>Qabul sanasi</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4"><div class="empty-state">Guruhda faol bolalar yo\'q</div></td></tr>'}</tbody>
      </table></div>
    </div>`;
}

/* ================= ADMIN: ARIZALAR ================= */

function reqStatusBadge(s, type) {
  if (type === 'payment') {
    if (s === 'yangi') return '<span class="badge amber">Yangi</span>';
    if (s === 'tasdiqlandi') return '<span class="badge green">✅ Tasdiqlandi</span>';
    if (s === 'bekor qilindi') return '<span class="badge red">❌ Rad etildi</span>';
    return `<span class="badge gray">${esc(s)}</span>`;
  }
  if (s === 'yangi') return '<span class="badge amber">Yangi</span>';
  if (s === 'qabul') return '<span class="badge green">Qabul</span>';
  return '<span class="badge gray">Bajarildi</span>';
}

async function renderRequests() {
  const rows = await api('/api/requests');
  const tbody = rows.map(r => {
    const isPay = r.type === 'payment';
    const actions = r.status === 'yangi'
      ? (isPay
        ? `<div class="row-actions"><button class="mini-btn" title="Tasdiqlash" onclick="setReqStatus(${r.id},'tasdiqlandi')">✅</button><button class="mini-btn danger" title="Rad etish" onclick="setReqStatus(${r.id},'bekor qilindi')">❌</button></div>`
        : `<div class="row-actions"><button class="mini-btn" title="Qabul" onclick="setReqStatus(${r.id},'qabul')">✅</button><button class="mini-btn danger" title="Bajarildi" onclick="setReqStatus(${r.id},'bajarildi')">🏁</button></div>`)
      : (r.status === 'qabul' ? `<button class="mini-btn" title="Bajarildi" onclick="setReqStatus(${r.id},'bajarildi')">🏁</button>` : '');
    return `
    <tr>
      <td>${fmtDate(r.created_at)}</td>
      <td><div class="cell-name">${esc(r.parent_name || '—')}</div><div class="cell-sub">${esc(r.phone || '')}</div></td>
      <td><div class="cell-name">${esc(r.child_name)}</div>${isPay && r.amount ? `<div class="cell-sub">💰 ${fmtMoney(r.amount)} so'm</div>` : ''}</td>
      <td><span class="badge blue">${esc(REQ_TYPES[r.type] || r.type)}</span></td>
      <td class="n-msg">${esc(r.text)}</td>
      <td>${reqStatusBadge(r.status, r.type)}</td>
      <td>${actions}</td>
    </tr>`;
  }).join('');
  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <div class="search-box"><span class="s-icon">🔍</span><input id="reqSearch" placeholder="Ota-ona, bola, matn bo'yicha..."></div>
        <span class="badge purple">${rows.length} ta ariza</span><span class="spacer"></span><span class="badge amber">${rows.filter(r => r.status === 'yangi').length} yangi</span>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Sana</th><th>Ota-ona</th><th>Bola</th><th>Turi</th><th>Matn</th><th>Holat</th><th></th></tr></thead>
        <tbody>${tbody || '<tr><td colspan="7"><div class="empty-state">Arizalar yo\'q</div></td></tr>'}</tbody>
      </table></div>
    </div>`;
  wireSearch('reqSearch');
}

/* ================= OTA-ONA PANELI ================= */

const pMonthLabels = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const pMonthName = m => (pMonthLabels[Number(String(m).slice(5, 7))] || m) + ' ' + String(m).slice(0, 4);
const pAttDot = s => s === 'present' ? '✅' : s === 'late' ? '⏰' : '❌';

function reqStatusBadge2(s) {
  if (s === 'yangi') return '<span class="badge amber">Yangi</span>';
  if (s === 'tasdiqlandi') return '<span class="badge green">✅ Tasdiqlandi</span>';
  if (s === 'bekor qilindi') return '<span class="badge red">❌ Rad etildi</span>';
  if (s === 'qabul') return '<span class="badge green">Qabul</span>';
  return '<span class="badge gray">Bajarildi</span>';
}

async function renderParentDashboard() {
  const d = await api('/api/parent/overview');
  const kids = d.children;
  const pct = (c) => c.fee > 0 ? Math.min(100, Math.round(c.paid / c.fee * 100)) : 0;
  const childCards = kids.map(c => `
    <div class="card">
      <div class="card-head">
        <div class="cell-user"><div class="avatar" style="background:${avatarColor(c.full_name)}">${esc(initials(c.full_name))}</div><div><div class="cell-name">${esc(c.full_name)}</div><div class="cell-sub">${c.group_name ? `<span class="group-chip" style="background:${esc(c.group_color)}">${esc(c.group_name)}</span>` : ''} · ${c.birth_date ? age(c.birth_date) + ' yosh' : ''}</div></div></div>
      </div>
      <div class="pay-status">
        <div class="pay-status-row"><span>To\'langan</span><b class="money">${fmtMoney(c.paid)}</b></div>
        <div class="pay-status-row"><span>Oylik to\'lov</span><b>${fmtMoney(c.fee)}</b></div>
        <div class="pay-status-row ${c.due > 0 ? 'due' : 'ok'}">${c.due > 0 ? `<span>Qarz</span><b>${fmtMoney(c.due)}</b>` : `<span>Holat</span><b>✅ To\'liq</b>`}</div>
        <div class="progress"><div class="progress-fill" style="width:${pct(c)}%;${c.due > 0 ? 'background:var(--warning)' : 'background:var(--success)'}"></div></div>
      </div>
    </div>`).join('');

  const recent = d.recentPayments.map(p => `
    <tr><td><div class="cell-name">${esc(p.child_name)}</div></td><td class="money">${fmtMoney(p.amount)}</td><td>${pMonthName(p.month)}</td><td>${esc(p.method)}</td><td>${fmtDate(p.paid_date)}</td><td>${p.receipt_no ? '🧾 ' + esc(p.receipt_no) : ''}</td></tr>`).join('');

  const unreadNotifs = d.pnotifs.filter(n => !n.read);
  const notifs = unreadNotifs.length === 0
    ? '<div class="cell-sub" style="padding:12px;text-align:center">Yangi xabar yo\'q ✅</div>'
    : unreadNotifs.map(n => `
    <div class="notif-item notif-new" id="dpntf-${n.id}" style="cursor:pointer" onclick="parentNotifRead(${n.id})">
      <div class="notif-head"><b>${n.type === 'to\'lov' ? '💰 To\'lov' : n.type === 'e\'lon' ? '📢 E\'lon' : '🔔 Xabar'}</b><span class="cell-sub">${fmtDateTime(n.created_at)}</span></div>
      <div class="n-msg">${esc(n.message)}</div>
    </div>`).join('');

  const anns = d.announcements || [];
  const annCard = anns.map(a => `
    <div class="notif-item"><div class="notif-head"><b>📢 ${esc(a.title)}</b><span class="cell-sub">${fmtDate(a.created_at)}</span></div><div class="n-msg" style="white-space:pre-wrap">${esc(a.text)}</div></div>`).join('');

  $('#content').innerHTML = `
    <div class="kpi-banner">
      <div>
        <h2>Assalomu alaykum, ${esc(d.parent.full_name)}! 👋</h2>
        <p>${d.children.length} ta bola · ${pMonthName(d.month)}</p>
        <p class="cell-sub" style="margin-top:6px">${d.parent.phone ? '📞 ' + esc(d.parent.phone) : ''}${d.parent.address ? ' · 📍 ' + esc(d.parent.address) : ''}</p>
      </div>
      <div class="kpi-right">
        <div class="kpi-item"><b>${d.children.length}</b><span>Bolalarim</span></div>
        <div class="kpi-item"><b>${d.att.present + d.att.late}</b><span>Bu oy keldi</span></div>
      </div>
    </div>
    <div class="grid stats">
      <div class="stat-card"><div class="stat-icon" style="background:var(--success-soft)">✅</div><div class="stat-meta"><div class="stat-label">Bu oy davomat</div><div class="stat-value">${d.att.present + d.att.late}</div><div class="stat-sub">${d.att.absent} kun kelmadi</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--primary-soft)">💰</div><div class="stat-meta"><div class="stat-label">Jami to\'langan</div><div class="stat-value">${fmtMoney(d.totalPaid)}</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--warning-soft)">📌</div><div class="stat-meta"><div class="stat-label">Qarz</div><div class="stat-value" style="color:var(--warning)">${fmtMoney(d.totalDue)}</div><div class="stat-sub">${d.children.filter(c => c.due > 0).length} ta bola</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--danger-soft)">📨</div><div class="stat-meta"><div class="stat-label">Arizalarim</div><div class="stat-value">${d.requests.filter(r => r.status === 'yangi').length}</div><div class="stat-sub">yangi</div></div></div>
    </div>
    <div class="card-grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      ${childCards || '<div class="card"><div class="empty-state"><span class="emoji">👶</span>Bolalar ro\'yxatga olinmagan</div></div>'}
    </div>
    <div class="card-grid" style="grid-template-columns:1.4fr 1fr;align-items:start">
      <div class="card">
        <div class="card-head"><h3>💳 So\'nggi to\'lovlar</h3><span class="spacer"></span><button class="btn btn-outline" onclick="go('p_payments')">Barchasi</button></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Bola</th><th>Summa</th><th>Oy</th><th>Usul</th><th>Sana</th><th>Kvitansiya</th></tr></thead>
          <tbody>${recent || '<tr><td colspan="6"><div class="empty-state">To\'lovlar yo\'q</div></td></tr>'}</tbody>
        </table></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>🔔 Xabarlar</h3>${d.unreadPnotifs > 0 ? `<span class="badge red">${d.unreadPnotifs} yangi</span>` : ''}<span class="spacer"></span><button class="btn btn-outline" onclick="go('p_notif')">Barchasi</button></div>
        ${notifs || '<div class="empty-state">Xabarlar yo\'q</div>'}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h3>📢 E\'lonlar</h3><span class="spacer"></span><button class="btn btn-outline" onclick="go('p_ann')">Barchasi</button></div>
      ${annCard || '<div class="empty-state">E\'lonlar yo\'q</div>'}
    </div>`;
}

async function renderParentAnnouncements() {
  const { announcements } = await api('/api/parent/me');
  const list = (announcements || []).map(a => `
    <div class="card">
      <div class="card-head"><b style="font-size:15px">📢 ${esc(a.title)}</b><span class="spacer"></span><span style="font-size:12px;color:var(--muted)">${fmtDate(a.created_at)}</span></div>
      <p style="white-space:pre-wrap;margin-top:8px">${esc(a.text)}</p>
    </div>`).join('');
  $('#content').innerHTML = `
    <div class="toolbar"><span class="badge purple">${(announcements || []).length} ta</span><span class="spacer"></span></div>
    ${list || '<div class="empty-state"><span class="emoji">📭</span>E\'lonlar yo\'q</div>'}`;
}

async function renderParentNotifications() {
  const notifs = await api('/api/parent/notifs');
  const unread = notifs.filter(n => !n.read).length;
  const iconFor = (t) => t === 'to\'lov' ? '💰' : t === 'e\'lon' ? '📢' : t === 'davomat' ? '📅' : '🔔';
  const list = (notifs || []).map(n => `
    <div class="card notif-card ${n.read ? 'is-read' : 'is-unread'}" id="pntf-${n.id}" onclick="parentNotifRead(${n.id})">
      <div class="card-head" style="cursor:pointer">
        <span class="notif-ico">${iconFor(n.type)}</span>
        <b style="font-size:15px">${esc(n.title || 'Xabar')}</b>
        <span class="spacer"></span>
        ${n.read ? '<span class="badge gray">O\'qilgan</span>' : '<span class="badge red">Yangi</span>'}
        <span style="font-size:12px;color:var(--muted)">${fmtDateTime(n.created_at)}</span>
      </div>
      <p style="white-space:pre-wrap;margin-top:8px;margin-bottom:0;font-size:14px">${esc(n.message)}</p>
    </div>`).join('');
  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <h3 style="margin:0">🔔 Xabarlarim</h3>
        <span class="spacer" style="flex:1"></span>
        <span class="badge purple">${notifs.length} ta</span>
        ${unread > 0 ? `<button class="btn btn-outline" onclick="markAllParentNotifs()">Hammasini o'qildi</button>` : ''}
      </div>
      ${list || '<div class="empty-state"><span class="emoji">📭</span>Xabarlar yo\'q</div>'}
    </div>`;
}

window.parentNotifRead = async (id) => {
  const el = document.getElementById('pntf-' + id) || document.getElementById('dpntf-' + id);
  try { await api('/api/parent/notifs/read', { method: 'POST', body: { id } }); } catch (e) {}
  if (el) {
    el.classList.add('notif-dismiss');
    setTimeout(() => { el.remove(); refreshParentNotifBadge(); }, 450);
    if (el.id.startsWith('dpntf')) {
      const container = el.parentElement;
      setTimeout(() => {
        if (container && container.querySelectorAll('.notif-item').length <= 1) {
          container.innerHTML = '<div class="cell-sub" style="padding:12px;text-align:center">Yangi xabar yo\'q ✅</div>';
        }
      }, 500);
    }
  }
  refreshParentNotifBadge();
};

async function renderParentGallery() {
  const d = await api('/api/parent/gallery');
  const cards = (d || []).map(p => `
    <div class="g-item">
      <div class="g-img"><img src="${galleryImg(p.image)}" alt="${esc(p.title)}" onclick="lightbox('${galleryImg(p.image)}')"></div>
      <div class="g-info">
        <div class="cell-name">${esc(p.title || '')}</div>
        ${p.group_name ? `<div class="cell-sub">${esc(p.group_name)}</div>` : ''}
        <div class="cell-sub">${fmtDate(p.created_at)}</div>
      </div>
    </div>`).join('');
  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <h3 style="margin:0">📷 Farzandim galereyasi</h3>
        <span class="spacer" style="flex:1"></span>
        <span class="badge purple">${(d || []).length} ta rasm</span>
      </div>
      ${cards ? `<div class="g-grid">${cards}</div>` : '<div class="empty-state"><span class="emoji">📷</span>Hozircha rasmlar yo\'q</div>'}
    </div>`;
}

async function renderParentJournal() {
  const d = await api('/api/parent/journal');
  const rows = (d && d.rows) || [];
  const groups = (d && d.groups) || [];
  const list = rows.map(j => `
    <div class="card" style="margin-bottom:12px">
      <div class="card-head">
        <b>📅${fmtDate(j.journal_date)}</b>
        <span class="spacer"></span>
        ${j.group_name ? `<span class="badge purple">${esc(j.group_name)}</span>` : ''}
      </div>
      ${j.title ? `<div style="margin-top:8px"><b>${esc(j.title)}</b></div>` : ''}
      ${j.activities ? `<div style="white-space:pre-wrap;margin-top:4px;font-size:14px">${esc(j.activities)}</div>` : ''}
      ${j.summary ? `<div style="white-space:pre-wrap;margin-top:6px;font-size:13px;color:var(--muted)">${esc(j.summary)}</div>` : ''}
    </div>`).join('');
  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <h3 style="margin:0">📔 Farzandimning kunlik hisoboti</h3>
        <span class="spacer" style="flex:1"></span>
        ${groups.map(g => `<span class="badge purple" style="margin-left:4px">${esc(g.full_name)}</span>`).join('')}
      </div>
      <div style="margin-top:6px;font-size:13px;color:var(--muted)">Tarbiyachi har kuni farzandingizning mashg'ulot va yutuqlarini shu yerga yozib boradi.</div>
      ${list || '<div class="empty-state"><span class="emoji">📔</span>Hozircha kunlik hisobot yo\'q</div>'}
    </div>`;
}

window.markAllParentNotifs = async () => {
  try { await api('/api/parent/notifs/read', { method: 'POST', body: { all: true } }); } catch (e) {}
  document.querySelectorAll('.notif-card.is-unread').forEach(el => {
    el.classList.add('notif-dismiss');
    setTimeout(() => { el.remove(); }, 450);
  });
  setTimeout(() => renderParentNotifications(), 460);
};

async function refreshParentNotifBadge() {
  try {
    const b = await api('/api/badges');
    navBadges = { ...navBadges, ...b };
    renderNav();
  } catch (e) {}
}

function fmtDateTime(s) {
  if (!s) return '';
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + (s.length === 10 ? '' : 'Z'));
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return dd + '.' + mo + ' ' + hh + ':' + mi;
}

async function renderParentChildren() {
  const { children } = await api('/api/parent/me');
  const rows = children.map(c => `
    <tr>
      <td><div class="cell-user">${c.photo ? `<div class="avatar avatar-img"><img src="${esc(c.photo)}" alt=""></div>` : `<div class="avatar" style="background:${avatarColor(c.full_name)}">${esc(initials(c.full_name))}</div>`}<div><div class="cell-name">${esc(c.full_name)}</div><div class="cell-sub">${c.gender === 'ayol' ? 'Qiz' : 'O\'g\'il'}${c.birth_date ? ', ' + age(c.birth_date) + ' yosh' : ''}</div></div></div></td>
      <td>${c.group_name ? `<span class="group-chip" style="background:${esc(c.group_color)}">${esc(c.group_name)}</span>` : '<span class="badge gray">Yo\'q</span>'}</td>
      <td>${c.status === 'active' ? '<span class="badge green">O\'qishda</span>' : '<span class="badge gray">Chiqib ketgan</span>'}</td>
      <td class="money">${fmtMoney(c.effective_fee || c.fee_per_month || 0)}${c.fee_note ? `<div class="cell-sub">${esc(c.fee_note)}</div>` : ''}</td>
      <td>${fmtDate(c.enrolled_at)}</td>
      <td><div class="row-actions"><button class="mini-btn" title="Profil" onclick="showChildProfile(${c.id})">📊</button></div></td>
    </tr>`).join('');
  $('#content').innerHTML = `
    <div class="card">
      <div class="card-head"><h3>👶 Mening bolalarim</h3><span class="spacer"></span><span class="badge purple">${children.length} ta</span></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Bola</th><th>Guruh</th><th>Holat</th><th>Oylik to\'lov</th><th>Qabul</th><th></th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6"><div class="empty-state">Bolalar yo\'q</div></td></tr>'}</tbody>
      </table></div>
    </div>`;
}

async function renderParentAttendance() {
  let month = state.pattMonth || monthStr();
  const d = await api('/api/parent/attendance?month=' + month);
  const attCards = d.result.map(r => {
    const days = r.days.map(x => `<span class="att-chip" title="${x.date}">${pAttDot(x.status)} ${fmtDate(x.date)}</span>`).join('') || '<span style="color:var(--muted);font-size:13px">Yozuv yo\'q</span>';
    return `
    <div class="card">
      <div class="card-head"><div class="cell-user"><div class="avatar" style="background:${avatarColor(r.child.full_name)}">${esc(initials(r.child.full_name))}</div><div class="cell-name">${esc(r.child.full_name)}</div></div><span class="spacer"></span></div>
      <div class="grid stats" style="grid-template-columns:repeat(3,1fr);margin:6px 0 12px">
        <div class="stat-card"><div class="stat-label">✅ Keldi</div><div class="stat-value">${r.att.present}</div></div>
        <div class="stat-card"><div class="stat-label">⏰ Kechikdi</div><div class="stat-value">${r.att.late}</div></div>
        <div class="stat-card"><div class="stat-label">❌ Kelmadi</div><div class="stat-value">${r.att.absent}</div></div>
      </div>
      <div>${days}</div>
    </div>`;
  }).join('');
  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <input type="month" id="pAttMonth" value="${esc(month)}">
        <span class="spacer" style="flex:1"></span>
        <span class="badge purple">${pMonthName(month)}</span>
      </div>
      <div class="card-grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
        ${attCards || '<div class="card"><div class="empty-state">Ma\'lumot yo\'q</div></div>'}
      </div>
    </div>`;
  $('#pAttMonth').addEventListener('change', e => { state.pattMonth = e.target.value; renderParentAttendance(); });
}

async function renderParentPayments() {
  let month = state.ppayMonth || '';
  const d = await api('/api/parent/payments?month=' + encodeURIComponent(month));
  const rows = d.rows.map(p => `
    <tr>
      <td><div class="cell-name">${esc(p.child_name)}</div></td>
      <td>${pMonthName(p.month)}</td>
      <td class="money">${fmtMoney(p.amount)}</td>
      <td>${esc(p.method)}</td>
      <td>${fmtDate(p.paid_date)}</td>
      <td>${p.receipt_no ? '🧾 ' + esc(p.receipt_no) : '—'}</td>
      <td>${p.status === 'confirmed' ? '<span class="badge green">To\'langan</span>' : '<span class="badge amber">Kutilmoqda</span>'}</td>
    </tr>`).join('');
  $('#content').innerHTML = `
    <div class="card">
      <div class="toolbar">
        <input type="month" id="pPayMonth" value="${esc(month)}" placeholder="Barcha oylar">
        <span class="spacer" style="flex:1"></span>
        <span class="badge purple">Jami: ${fmtMoney(d.total)}</span>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Bola</th><th>Oy</th><th>Summa</th><th>Usul</th><th>Sana</th><th>Kvitansiya</th><th>Holat</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="7"><div class="empty-state">To\'lovlar yo\'q</div></td></tr>'}</tbody>
      </table></div>
    </div>`;
  $('#pPayMonth').addEventListener('change', e => { state.ppayMonth = e.target.value; renderParentPayments(); });
}

async function renderParentRequests() {
  const rows = await api('/api/parent/requests');
  const list = rows.map(r => `
    <div class="card">
      <div class="card-head">
        <div>
          <div class="cell-name">${esc(r.child_name || '')} · ${r.type === 'payment' ? '<span class="badge blue">To\'lov so\'rovi</span>' : '<span class="badge gray">' + esc(r.type) + '</span>'}</div>
          <div class="cell-sub">${fmtDate(r.created_at)} · №${r.id}</div>
        </div>
        <span class="spacer"></span>
        ${reqStatusBadge2(r.status)}
      </div>
      <div class="n-msg">${esc(r.text)}</div>
    </div>`).join('');
  $('#content').innerHTML = `
    <div class="card">
      <div class="card-head"><h3>📨 Arizalarim</h3><span class="spacer"></span></div>
      <div class="card-grid" style="grid-template-columns:1fr">
        ${list || '<div class="empty-state">Arizalar yo\'q</div>'}
      </div>
    </div>`;
}

window.setReqStatus = async (id, status) => {
  try {
    await api('/api/requests/' + id, { method: 'PATCH', body: { status } });
    toast('Holat yangilandi'); renderRequests();
  } catch (e) { toast(e.message, 'error'); }
};

/* ================= SCHEDULES ================= */

async function renderSchedules() {
  const [schedules, teachers] = await Promise.all([api('/api/schedules'), api('/api/teachers')]);
  const DAYS = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];
  let rows = '';
  for (const s of schedules) {
    rows += `<tr>
      <td>${esc(s.teacher_name || '—')}</td>
      <td>${DAYS[s.day_of_week] || s.day_of_week}</td>
      <td>${esc(s.start_time)} — ${esc(s.end_time)}</td>
      <td>${esc(s.subject || '—')}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editSchedule(${s.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSchedule(${s.id})">🗑</button>
      </td>
    </tr>`;
  }
  const teacherOpts = teachers.map(t => `<option value="${t.id}">${esc(t.full_name)}</option>`).join('');
  window.addSchedule = () => {
    openModal('Yangi jadval', `
      <label class="field"><span>Tarbiyachi</span><select id="schTeacher">${teacherOpts}</select></label>
      <label class="field"><span>Kun</span><select id="schDay">${DAYS.map((d,i) => `<option value="${i}">${d}</option>`).join('')}</select></label>
      <label class="field"><span>Boshlanish</span><input type="time" id="schStart" value="08:00"></label>
      <label class="field"><span>Tugash</span><input type="time" id="schEnd" value="17:00"></label>
      <label class="field"><span>Mavzu</span><input type="text" id="schSubject" placeholder="Majburiy emas"></label>
      <button class="btn btn-primary btn-block" onclick="saveSchedule()">Saqlash</button>
    `);
  };
  window.saveSchedule = async () => {
    try {
      await api('/api/schedules', { method: 'POST', body: {
        teacher_id: $('#schTeacher').value, day_of_week: $('#schDay').value,
        start_time: $('#schStart').value, end_time: $('#schEnd').value, subject: $('#schSubject').value
      }});
      closeModal(); toast('Jadval qo\'shildi'); renderSchedules();
    } catch (e) { toast(e.message, 'error'); }
  };
  window.editSchedule = async (id) => {
    const s = schedules.find(x => x.id === id);
    if (!s) return;
    openModal('Jadvalni tahrirlash', `
      <label class="field"><span>Tarbiyachi</span><select id="schTeacher">${teacherOpts.map(o => o.replace('value="'+s.teacher_id+'"', 'value="'+s.teacher_id+'" selected'))}</select></label>
      <label class="field"><span>Kun</span><select id="schDay">${DAYS.map((d,i) => `<option value="${i}" ${i===s.day_of_week?'selected':''}>${d}</option>`).join('')}</select></label>
      <label class="field"><span>Boshlanish</span><input type="time" id="schStart" value="${s.start_time}"></label>
      <label class="field"><span>Tugash</span><input type="time" id="schEnd" value="${s.end_time}"></label>
      <label class="field"><span>Mavzu</span><input type="text" id="schSubject" value="${esc(s.subject || '')}"></label>
      <button class="btn btn-primary btn-block" onclick="updateSchedule(${id})">Yangilash</button>
    `);
  };
  window.updateSchedule = async (id) => {
    try {
      await api('/api/schedules/' + id, { method: 'PUT', body: {
        teacher_id: $('#schTeacher').value, day_of_week: $('#schDay').value,
        start_time: $('#schStart').value, end_time: $('#schEnd').value, subject: $('#schSubject').value
      }});
      closeModal(); toast('Jadval yangilandi'); renderSchedules();
    } catch (e) { toast(e.message, 'error'); }
  };
  window.deleteSchedule = async (id) => {
    if (!confirm('O\'chirmoqchimisiz?')) return;
    try { await api('/api/schedules/' + id, { method: 'DELETE' }); toast('O\'chirildi'); renderSchedules(); } catch (e) { toast(e.message, 'error'); }
  };
  $('#content').innerHTML = `
    <div class="card">
      <div class="card-head"><h3>📅 Ish jadvali</h3><span class="spacer"></span><button class="btn btn-primary" onclick="addSchedule()">${ICONS.plus}Qo'shish</button></div>
      <table class="table"><thead><tr><th>Tarbiyachi</th><th>Kun</th><th>Vaqt</th><th>Mavzu</th><th>Amallar</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5" class="empty-state">Jadval yo\'q</td></tr>'}</tbody></table>
    </div>`;
}

/* ================= SALARY ================= */

async function renderSalary() {
  const sm = state.salaryMonth || monthStr();
  const d = await api('/api/reports/salary?month=' + sm);
  let rows = '';
  for (const t of d.teachers) {
    rows += `<tr>
      <td><b>${esc(t.full_name)}</b></td>
      <td>${esc(t.position)}</td>
      <td>${fmtMoney(t.base_salary)}</td>
      <td>${t.present_days}/${t.total_days}</td>
      <td>${fmtMoney(t.bonus)}</td>
      <td style="color:var(--danger)">${t.deduction ? '-' + fmtMoney(t.deduction) : '—'}</td>
      <td><b style="color:var(--primary)">${fmtMoney(t.net_salary)}</b></td>
    </tr>`;
  }
  $('#content').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
      <h2 style="margin:0">💰 Oylik ish haqi</h2>
      <input type="month" id="salaryMonth" class="field" style="width:auto;margin:0" value="${sm}">
    </div>
    <div class="card">
      <div class="card-head"><h3>💰 ${esc(d.month)}</h3></div>
      <table class="table"><thead><tr><th>FIO</th><th>Lavozim</th><th>Oylik</th><th>Keldi/Jami</th><th>Bonus</th><th>Usishi</th><th>Yakuniy</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div style="padding:16px;text-align:right;font-size:18px"><b>Jami: ${fmtMoney(d.totalNet)}</b></div>
    </div>`;
  $('#salaryMonth').addEventListener('change', (e) => { state.salaryMonth = e.target.value; renderSalary(); });
}

/* ================= MONITORING ================= */

let monitorTimer = null;
async function renderMonitoring() {
  if (monitorTimer) clearInterval(monitorTimer);
  const render = async () => {
    try {
    const d = await api('/api/monitoring');
    const attPct = d.totalChildren > 0 ? Math.round(d.todayPresent / d.totalChildren * 100) : 0;
    const payRows = d.latestPayments.map(p => `<tr><td>${esc(p.child_name)}</td><td>${fmtMoney(p.amount)}</td><td>${esc(p.paid_date)}</td></tr>`).join('');
    const auditRows = d.latestAudit.map(a => `<tr><td>${esc(a.username)}</td><td>${esc(a.action)}</td><td>${esc(a.entity)}</td><td>${esc(a.detail?.slice(0,50) || '')}</td></tr>`).join('');
    $('#content').innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon" style="background:var(--primary-light)">👶</div><div class="stat-info"><div class="stat-val">${d.totalChildren}</div><div class="stat-label">Jami bolalar</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#dcfce7">✅</div><div class="stat-info"><div class="stat-val">${d.todayPresent}</div><div class="stat-label">Bugun keldi</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#fef3c7">⏰</div><div class="stat-info"><div class="stat-val">${d.todayLate}</div><div class="stat-label">Kech keldi</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#fecaca">❌</div><div class="stat-info"><div class="stat-val">${d.todayAbsent}</div><div class="stat-label">Kelmadi</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#e0e7ff">👨‍🏫</div><div class="stat-info"><div class="stat-val">${d.totalTeachers}</div><div class="stat-label">Tarbiyachilar</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#fce7f3">🌐</div><div class="stat-info"><div class="stat-val">${d.onlineUsers}</div><div class="stat-label">Online</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#dcfce7">💰</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.monthIncome)}</div><div class="stat-label">Oylik daromad</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#fecaca">💸</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.monthExpense)}</div><div class="stat-label">Oylik xarajat</div></div></div>
      </div>
      <div class="card-grid" style="grid-template-columns:1fr 1fr;margin-top:16px">
        <div class="card">
          <div class="card-head"><h3>💳 So'nggi to'lovlar</h3></div>
          <table class="table"><thead><tr><th>Bola</th><th>Summa</th><th>Sana</th></tr></thead><tbody>${payRows || '<tr><td colspan="3" class="empty-state">Yo\'q</td></tr>'}</tbody></table>
        </div>
        <div class="card">
          <div class="card-head"><h3>📋 So'nggi amallar</h3></div>
          <table class="table"><thead><tr><th>Foydalanuvchi</th><th>Amal</th><th>Ob'ekt</th><th>Tafsilot</th></tr></thead><tbody>${auditRows || '<tr><td colspan="4" class="empty-state">Yo\'q</td></tr>'}</tbody></table>
        </div>
      </div>
      <div style="text-align:center;margin-top:10px;color:var(--muted);font-size:12px">⏱ Yangilanish: ${new Date(d.serverTime).toLocaleTimeString('uz-UZ')} | Davomat: <b>${attPct}%</b></div>`;
    } catch (e) { console.error('Monitor error:', e); }
  };
  await render();
  monitorTimer = setInterval(render, 30000);
}

/* ================= SMS ================= */

async function renderSms() {
  const [parents, log] = await Promise.all([api('/api/parents'), api('/api/sms/log')]);
  const parentData = parents.map(p => ({ id: p.id, name: p.full_name, phone: p.phone || '' }));
  const parentOpts = parentData.map(p => `<option value="${p.id}">${esc(p.name)} (${esc(p.phone)})</option>`).join('');
  const logRows = log.map(l => `<tr><td>${esc(l.phone)}</td><td>${esc(l.message?.slice(0,60) || '')}</td><td><span class="badge badge-${l.status === 'xato' ? 'danger' : 'success'}">${esc(l.status)}</span></td><td>${esc(l.created_at)}</td></tr>`).join('');

  window.smsSelectParent = () => {
    const sel = $('#smsParent');
    if (!sel) return;
    const id = sel.value;
    if (!id) { $('#smsPhone').value = ''; return; }
    const p = parentData.find(x => String(x.id) === String(id));
    if (p) $('#smsPhone').value = p.phone;
  };

  window.saveParentPhone = async () => {
    const sel = $('#smsParent');
    const id = sel ? sel.value : '';
    const phone = $('#smsPhone').value.trim();
    if (!id) return toast('Avval ota-onani tanlang', 'error');
    if (!phone) return toast('Telefon raqamini kiriting', 'error');
    const p = parentData.find(x => String(x.id) === String(id));
    if (!p) return toast('Ota-ona topilmadi', 'error');
    try {
      await api('/api/parents/' + id, { method: 'PUT', body: { full_name: p.name, phone, email: '', address: '' } });
      p.phone = phone;
      const opt = sel.querySelector(`option[value="${id}"]`);
      if (opt) opt.textContent = p.name + ' (' + phone + ')';
      toast("Raqam saqlandi ✅");
    } catch (e) { toast(e.message, 'error'); }
  };

  window.sendSms = async () => {
    const phone = $('#smsPhone').value.trim();
    const msg = $('#smsMsg').value.trim();
    if (!phone || !msg) return toast('Telefon va xabar kiriting', 'error');
    try {
      await api('/api/sms/send', { method: 'POST', body: { phone, message: msg } });
      toast('SMS yuborildi ✅'); renderSms();
    } catch (e) { toast(e.message, 'error'); }
  };

  $('#content').innerHTML = `
    <div class="card-grid" style="grid-template-columns:1.3fr 1fr">
      <div class="card">
        <div class="card-head"><h3>📤 SMS Yuborish</h3></div>
        <label class="field"><span>Ota-ona</span>
          <select id="smsParent" onchange="smsSelectParent()"><option value="">— Tanlang —</option>${parentOpts}</select>
        </label>
        <label class="field"><span>Telefon raqami</span>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="tel" id="smsPhone" placeholder="+998901234567" style="flex:1">
            <button class="btn btn-outline" onclick="saveParentPhone()" style="white-space:nowrap;font-size:12px">💾 Saqlash</button>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">Raqamni o'zgartirsangiz, "Saqlash" tugmasini bosing — ota-onaga yangilanadi</div>
        </label>
        <label class="field"><span>Xabar matni</span><textarea id="smsMsg" rows="5" placeholder="SMS xabar matnini kiriting..."></textarea></label>
        <button class="btn btn-primary btn-block" onclick="sendSms()">📨 SMS Yuborish</button>
      </div>
      <div class="card">
        <div class="card-head"><h3>📜 SMS Tarixi</h3></div>
        <table class="table"><thead><tr><th>Telefon</th><th>Xabar</th><th>Holat</th><th>Sana</th></tr></thead>
        <tbody>${logRows || '<tr><td colspan="4" class="empty-state">SMS yo\'q</td></tr>'}</tbody></table>
      </div>
    </div>`;
}

/* ================= BIZNES ================= */

async function renderBusiness() {
  const cm = monthStr();
  let selectedMonth = cm;

  async function loadReport(m) {
    selectedMonth = m;
    const d = await api('/api/business?month=' + m);
    const C = '#6366f1', G = '#10b981', R = '#ef4444', Y = '#f59e0b', B = '#3b82f6', P = '#ec4899';

    /* Oy tanlash */
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const dd = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(dd.toISOString().slice(0, 7));
    }

    const monthOpts = months.map(m => `<option value="${m}" ${m === selectedMonth ? 'selected' : ''}>${monthName(m)}</option>`).join('');

    /* METHOD */
    const methodLabels = { karta: '💳 Karta', click: '🟩 Click', payme: '🔵 Payme', paynet: '🟣 Paynet', naqd: '💵 Naqd', bank: '🏦 Bank', telegram: '📱 Telegram' };
    const methodHtml = d.methodStats.map(m => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span>${methodLabels[m.method] || m.method}</span><b>${fmtMoney(m.total)} <small style="color:var(--muted)">(${m.cnt})</small></b></div>`).join('');

    /* CATEGORY */
    const catColors = ['#6366f1','#10b981','#f59e0b','#ec4899','#3b82f6','#ef4444','#8b5cf6','#14b8a6'];
    const catHtml = d.expenseByCategory.map((c, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="width:12px;height:12px;border-radius:3px;background:${catColors[i % catColors.length]};flex-shrink:0"></div>
        <div style="flex:1"><div style="font-weight:600">${esc(c.category)}</div><small style="color:var(--muted)">${c.count} ta</small></div>
        <div style="text-align:right"><b>${fmtMoney(c.total)}</b></div>
      </div>
    `).join('');

    /* GROUPS */
    const groupHtml = d.groupStats.map(g => `
      <div style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><b>${esc(g.name)}</b><span>${g.count} bola</span></div>
        <div style="display:flex;gap:16px;font-size:13px;color:var(--muted)">
          <span>To'lov: ${fmtMoney(g.fee)}</span>
          <span>To'langan: <b style="color:var(--success)">${fmtMoney(g.paid)}</b></span>
          <span>Qarz: <b style="color:var(--danger)">${fmtMoney(g.due)}</b></span>
        </div>
        <div style="background:var(--border);border-radius:6px;height:6px;margin-top:6px;overflow:hidden">
          <div style="background:var(--success);height:100%;width:${g.rate}%;border-radius:6px"></div>
        </div>
      </div>
    `).join('');

    /* DEBTORS */
    const debtHtml = d.debtors.length ? d.debtors.slice(0, 50).map(c => `
      <tr>
        <td><input type="checkbox" class="debt-chk" value="${c.id}" data-name="${esc(c.name)}" data-parent="${esc(c.parent_name || '')}" data-phone="${esc(c.parent_phone || '')}" data-due="${c.due}"></td>
        <td><b>${esc(c.name)}</b></td><td>${esc(c.group)}</td>
        <td>${esc(c.parent_name || '—')} ${c.parent_phone ? `<small style="color:var(--muted)">${esc(c.parent_phone)}</small>` : ''}</td>
        <td>${fmtMoney(c.fee)}</td><td style="color:var(--success)">${fmtMoney(c.paid)}</td>
        <td><b style="color:var(--danger)">${fmtMoney(c.due)}</b></td>
      </tr>
    `).join('') : `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--success)">✅ Qarzdorlar yo'q!</td></tr>`;

    /* CASHBOOK */
    const cashHtml = d.cashbook.map(e => `
      <tr>
        <td>${esc(e.date)}</td>
        <td>${esc(e.desc)}</td>
        <td style="color:${e.type === 'kirim' ? 'var(--success)' : 'var(--danger)'}">${e.type === 'kirim' ? '+' : '-'}${fmtMoney(e.amount)}</td>
        <td><b>${fmtMoney(e.balance)}</b></td>
      </tr>
    `).join('') || `<tr><td colspan="4" class="empty-state">Ma'lumot yo'q</td></tr>`;

    /* TEACHERS */
    const teacherHtml = d.teachers.map(te => `
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
        <div><b>${esc(te.name)}</b><br><small style="color:var(--muted)">${esc(te.position)} • ${esc(te.group)}</small></div>
        <b>${fmtMoney(te.salary)}</b>
      </div>
    `).join('');

    $('#content').innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap">
        <h2 style="margin:0">📊 ${t('businessTitle')} — ${monthName(selectedMonth)}</h2>
        <select id="bizMonth" class="field" style="width:auto;margin:0;padding:8px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);color:var(--text)">${monthOpts}</select>
        <button class="btn btn-primary btn-sm" onclick="window._bizExport()">📥 Excel</button>
        <button class="btn btn-primary btn-sm" style="background:#0ea5e9;border-color:#0ea5e9" onclick="renderYearlyReport()">📅 Yillik hisobot</button>
        <button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ ${t('print')}</button>
      </div>

      <!-- KARTOCHKALAR -->
      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">
        <div class="stat-card" style="border-left:4px solid ${G}"><div class="stat-icon" style="background:#dcfce7">👶</div><div class="stat-info"><div class="stat-val">${d.totalChildren}</div><div class="stat-label">Jami bolalar</div></div></div>
        <div class="stat-card" style="border-left:4px solid ${C}"><div class="stat-icon" style="background:#eef2ff">💰</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.totalFee)}</div><div class="stat-label">Kutilgan daromad</div></div></div>
        <div class="stat-card" style="border-left:4px solid ${G}"><div class="stat-icon" style="background:#dcfce7">✅</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.totalPaid)}</div><div class="stat-label">${t('totalIncome')}</div></div></div>
        <div class="stat-card" style="border-left:4px solid ${R}"><div class="stat-icon" style="background:#fecaca">🚫</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.totalDue)}</div><div class="stat-label">Qarz</div></div></div>
        <div class="stat-card" style="border-left:4px solid ${Y}"><div class="stat-icon" style="background:#fef3c7">📊</div><div class="stat-info"><div class="stat-val">${d.collectionRate}%</div><div class="stat-label">${t('collectionRate')}</div></div></div>
        <div class="stat-card" style="border-left:4px solid ${R}"><div class="stat-icon" style="background:#fecaca">💸</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.totalExpense)}</div><div class="stat-label">${t('totalExpense')}</div></div></div>
        <div class="stat-card" style="border-left:4px solid ${G}"><div class="stat-icon" style="background:#dcfce7">📈</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.netProfit)}</div><div class="stat-label">${t('netProfit')}</div></div></div>
        <div class="stat-card" style="border-left:4px solid ${P}"><div class="stat-icon" style="background:#fce7f3">🏢</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.netAfterSalary)}</div><div class="stat-label">Ish haqidan keyin</div></div></div>
      </div>

      <!-- KASSA (NAQD / BANK) BALANSI -->
      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin-top:16px">
        <div class="stat-card" style="border-left:4px solid var(--success);background:#f0fdf4"><div class="stat-icon" style="background:#dcfce7">💵</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.kassa ? d.kassa.naqd : 0)}</div><div class="stat-label">💰 Naqd kassa</div></div></div>
        <div class="stat-card" style="border-left:4px solid var(--info);background:#eff6ff"><div class="stat-icon" style="background:#dbeafe">🏦</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.kassa ? d.kassa.bank : 0)}</div><div class="stat-label">🏦 Bank hisobi</div></div></div>
        <div class="stat-card" style="border-left:4px solid var(--success)"><div class="stat-icon" style="background:#dcfce7">⬇️</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.kassa ? d.kassa.monthIn : 0)}</div><div class="stat-label">Bu oy kirim</div></div></div>
        <div class="stat-card" style="border-left:4px solid var(--danger)"><div class="stat-icon" style="background:#fee2e2">⬆️</div><div class="stat-info"><div class="stat-val">${fmtMoney(d.kassa ? d.kassa.monthOut : 0)}</div><div class="stat-label">Bu oy chiqim</div></div></div>
      </div>

      <!-- TO'LOV STATUSI -->
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-top:16px">
        <div class="stat-card" style="text-align:center"><div style="font-size:28px;font-weight:800;color:var(--success)">${d.paidChildren}</div><div style="font-size:13px;color:var(--muted)">✅ To'liq to'langan</div></div>
        <div class="stat-card" style="text-align:center"><div style="font-size:28px;font-weight:800;color:var(--warning)">${d.partialChildren}</div><div style="font-size:13px;color:var(--muted)">⚠️ Qisman to'langan</div></div>
        <div class="stat-card" style="text-align:center"><div style="font-size:28px;font-weight:800;color:var(--danger)">${d.unpaidChildren}</div><div style="font-size:13px;color:var(--muted)">❌ To'lanmagan</div></div>
      </div>

      <!-- DAVOMAT -->
      <div class="card" style="margin-top:16px">
        <div class="card-head"><h3>📋 Davomat — ${d.attRate}%</h3></div>
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);padding:0 18px 18px">
          <div style="text-align:center"><div style="font-size:24px;font-weight:800;color:var(--success)">${d.attStats.present}</div><div style="font-size:13px">✅ Keldi</div></div>
          <div style="text-align:center"><div style="font-size:24px;font-weight:800;color:var(--warning)">${d.attStats.late}</div><div style="font-size:13px">⏰ Kechikdi</div></div>
          <div style="text-align:center"><div style="font-size:24px;font-weight:800;color:var(--danger)">${d.attStats.absent}</div><div style="font-size:13px">❌ Kelmadi</div></div>
        </div>
      </div>

      <!-- 2 USTUNLI: GURUHLAR + TO'LOV USULLARI -->
      <div class="card-grid" style="grid-template-columns:1fr 1fr;margin-top:16px">
        <div class="card">
          <div class="card-head"><h3>🏫 Guruhlar bo'yicha</h3></div>
          ${groupHtml}
        </div>
        <div class="card">
          <div class="card-head"><h3>💳 To'lov usullari</h3></div>
          ${methodHtml || '<div style="padding:18px;text-align:center;color:var(--muted)">Ma\'lumot yo\'q</div>'}
        </div>
      </div>

      <!-- 2 USTUNLI: XARAJAT + O'QITUVCHILAR -->
      <div class="card-grid" style="grid-template-columns:1fr 1fr;margin-top:16px">
        <div class="card">
          <div class="card-head"><h3>💸 ${t('expenseCategories')} — ${fmtMoney(d.totalExpense)}</h3></div>
          ${catHtml || '<div style="padding:18px;text-align:center;color:var(--muted)">Xarajat yo\'q</div>'}
        </div>
        <div class="card">
          <div class="card-head"><h3>👨‍🏫 O'qituvchilar — ${fmtMoney(d.totalSalary)}</h3></div>
          ${teacherHtml || '<div style="padding:18px;text-align:center;color:var(--muted)">Yo\'q</div>'}
        </div>
      </div>

      <!-- QARZDORLAR -->
      <div class="card" style="margin-top:16px">
        <div class="card-head"><h3>📋 Qarzdorlar (${d.debtors.length} ta)</h3>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <button class="btn btn-outline btn-sm" onclick="debtSelectAll(this)">Barchasini tanlash</button>
            <select id="debtChannel" class="field" style="width:auto;margin:0;padding:7px 12px;border-radius:8px;border:1.5px solid var(--border);background:var(--card);color:var(--text)">
              <option value="telegram">📱 Telegram</option>
              <option value="sms">📨 SMS</option>
              <option value="both">🔔 Ikkalasi</option>
            </select>
            <button class="btn btn-primary btn-sm" onclick="debtSendRemind('${selectedMonth}')">✉️ Eslatma yuborish</button>
          </div>
        </div>
        <table class="table"><thead><tr><th style="width:32px"><input type="checkbox" onclick="debtToggleAll(this)"></th><th>Bola</th><th>Guruh</th><th>Ota-ona</th><th>To'lov</th><th>To'langan</th><th>Qarz</th></tr></thead>
        <tbody>${debtHtml}</tbody></table>
      </div>

      <!-- KASSA KITOBI -->
      <div class="card" style="margin-top:16px">
        <div class="card-head"><h3>📒 ${t('cashbook')} — ${monthName(selectedMonth)}</h3>
          <div style="display:flex;gap:16px;font-size:13px">
            <span>Kirim: <b style="color:var(--success)">${fmtMoney(d.totalPaid)}</b></span>
            <span>Chiqim: <b style="color:var(--danger)">${fmtMoney(d.totalExpense)}</b></span>
            <span>Balance: <b>${fmtMoney(d.cashbook.length ? d.cashbook[d.cashbook.length - 1].balance : 0)}</b></span>
          </div>
        </div>
        <table class="table"><thead><tr><th>Sana</th><th>Tavsif</th><th>Summa</th><th>Balance</th></tr></thead>
        <tbody>${cashHtml}</tbody></table>
      </div>

      <!-- TREND -->
      <div class="card" style="margin-top:16px">
        <div class="card-head"><h3>📈 12 oylik daromad/xarajat/foyda trendi</h3></div>
        <canvas id="bizTrendChart" height="250"></canvas>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-head"><h3>💳 To'lov usullari — taqsimot</h3></div>
        <canvas id="bizMethodPie" height="200"></canvas>
      </div>
    `;

    /* TREND CHART (12 oy) */
    if (d.trend && d.trend.length && typeof Chart !== 'undefined') {
      const ctx = document.getElementById('bizTrendChart');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: d.trend.map(t => monthName(t.month)),
            datasets: [
              { label: 'Daromad', data: d.trend.map(t => t.income), borderColor: G, backgroundColor: G + '22', fill: true, tension: 0.4 },
              { label: 'Xarajat', data: d.trend.map(t => t.expense), borderColor: R, backgroundColor: R + '22', fill: true, tension: 0.4 },
              { label: 'Foyda', data: d.trend.map(t => t.profit), borderColor: C, backgroundColor: C + '22', fill: true, tension: 0.4 }
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } }
          }
        });
      }
    }

    /* METHOD PIE */
    if (d.methodStats && d.methodStats.length && typeof Chart !== 'undefined') {
      const mp = document.getElementById('bizMethodPie');
      if (mp) {
        const pal = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444', '#14b8a6'];
        new Chart(mp, {
          type: 'doughnut',
          data: {
            labels: d.methodStats.map(m => methodLabels[m.method] || m.method),
            datasets: [{ data: d.methodStats.map(m => m.total), backgroundColor: d.methodStats.map((_, i) => pal[i % pal.length]) }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
              tooltip: { callbacks: { label: ctx2 => ctx2.label + ': ' + fmtMoney(ctx2.parsed) } }
            }
          }
        });
      }
    }
  }

  /* Month select listener */
  $('#content').innerHTML = loading();
  await loadReport(cm);

  setTimeout(() => {
    const sel = document.getElementById('bizMonth');
    if (sel) sel.addEventListener('change', (e) => { loadReport(e.target.value); });
  }, 100);
}

/* ================= ARXIVLAR ================= */

async function renderArchives() {
  const cm = monthStr();
  const archives = await api('/api/archives');

  async function viewArchive(month) {
    const d = await api('/api/archives/' + month);
    const snap = d.snapshot || {};
    const debtors = snap.debtors || [];
    const exps = snap.expenses || [];

    const debtHtml = debtors.length ? debtors.map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.group)}</td><td>${fmtMoney(c.fee)}</td><td style="color:var(--success)">${fmtMoney(c.paid)}</td><td><b style="color:var(--danger)">${fmtMoney(c.due)}</b></td></tr>`).join('') : `<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--success)">✅ Qarzdor yo'q</td></tr>`;

    const expHtml = exps.length ? exps.map(e => `<tr><td>${esc(e.date)}</td><td><b>${esc(e.name)}</b></td><td>${esc(e.category)}</td><td style="color:var(--danger)">${fmtMoney(e.amount)}</td></tr>`).join('') : `<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--muted)">Xarajat yo'q</td></tr>`;

    return `
      <div class="card" style="margin-top:16px;border:2px solid var(--primary)">
        <div class="card-head"><h3>📊 ${monthName(month)} — To'liq arxiv</h3>
          <button class="btn btn-outline btn-sm" onclick="renderArchives()">⬅️ Orqaga</button>
        </div>
        <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
          <div class="stat-card" style="border-left:4px solid var(--primary)"><div class="stat-val">${d.total_children}</div><div class="stat-label">Bolalar</div></div>
          <div class="stat-card" style="border-left:4px solid var(--success)"><div class="stat-val">${fmtMoney(d.total_paid)}</div><div class="stat-label">Daromad</div></div>
          <div class="stat-card" style="border-left:4px solid var(--danger)"><div class="stat-val">${fmtMoney(d.total_expense)}</div><div class="stat-label">Xarajat</div></div>
          <div class="stat-card" style="border-left:4px solid #6366f1"><div class="stat-val">${fmtMoney(d.total_paid - d.total_expense)}</div><div class="stat-label">Foyda</div></div>
          <div class="stat-card" style="border-left:4px solid var(--warning)"><div class="stat-val">${fmtMoney(d.total_debt)}</div><div class="stat-label">Qarz</div></div>
          <div class="stat-card" style="border-left:4px solid var(--info)"><div class="stat-val">${d.collection_rate}%</div><div class="stat-label">Yig'im</div></div>
          <div class="stat-card" style="border-left:4px solid #8b5cf6"><div class="stat-val">${d.att_rate}%</div><div class="stat-label">Davomat</div></div>
          <div class="stat-card" style="border-left:4px solid #14b8a6"><div class="stat-val">${fmtMoney(d.total_salary)}</div><div class="stat-label">Ish haqi</div></div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-head"><h3>📋 Qarzdorlar (${debtors.length} ta)</h3></div>
        <table class="table"><thead><tr><th>Bola</th><th>Guruh</th><th>To'lov</th><th>To'langan</th><th>Qarz</th></tr></thead>
        <tbody>${debtHtml}</tbody></table>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-head"><h3>💸 Xarajatlar (${exps.length} ta) — ${fmtMoney(d.total_expense)}</h3></div>
        <table class="table"><thead><tr><th>Sana</th><th>Nomi</th><th>Kategoriya</th><th>Summa</th></tr></thead>
        <tbody>${expHtml}</tbody></table>
      </div>
    `;
  }

  if (archives.length === 0) {
    $('#content').innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap">
        <h2 style="margin:0">📦 ${t('archivesTitle')}</h2>
        <button class="btn btn-primary btn-sm" onclick="archiveCurrentMonth()">📦 ${t('archiveThisMonth')}</button>
      </div>
      <div class="card" style="text-align:center;padding:48px;color:var(--muted)">
        <div style="font-size:48px;margin-bottom:12px">📦</div>
        <p>Hali arxiv yo'q. Joriy oy arxivini yarating yoki avtomatik arxivni kuting (har oy 1-kuni).</p>
      </div>`;
    return;
  }

  const rows = archives.map(a => {
    const profit = a.total_paid - a.total_expense;
    return `
      <tr style="cursor:pointer" onclick="viewArchivedMonth('${a.month}')">
        <td><b style="font-size:15px">📅 ${monthName(a.month)}</b></td>
        <td>${a.total_children} bola</td>
        <td style="color:var(--success)">${fmtMoney(a.total_paid)}</td>
        <td style="color:var(--danger)">${fmtMoney(a.total_expense)}</td>
        <td><b style="color:${profit >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmtMoney(profit)}</b></td>
        <td style="color:var(--warning)">${fmtMoney(a.total_debt)}</td>
        <td>${a.collection_rate}%</td>
        <td><small style="color:var(--muted)">${a.created_at || ''}</small></td>
      </tr>`;
  }).join('');

  $('#content').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap">
      <h2 style="margin:0">📦 ${t('archivesTitle')}</h2>
      <button class="btn btn-primary btn-sm" onclick="archiveCurrentMonth()">📦 ${t('archiveThisMonth')}</button>
    </div>
    <div class="card">
      <table class="table">
        <thead><tr><th>Oy</th><th>Bolalar</th><th>Daromad</th><th>Xarajat</th><th>Foyda</th><th>Qarz</th><th>Yig'im</th><th>Arxivlangan</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  window.viewArchivedMonth = async (m) => {
    const detail = await viewArchive(m);
    $('#content').innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap">
        <h2 style="margin:0">📦 ${t('archivesTitle')}</h2>
        <button class="btn btn-outline btn-sm" onclick="renderArchives()">⬅️ Orqaga</button>
      </div>${detail}`;
  };
}

window._bizExport = async () => {
  try {
    const m = ($('#bizMonth') && $('#bizMonth').value) || monthStr();
    const d = await api('/api/business?month=' + m);
    let csv = 'Hisobot,Month\nJami bolalar,' + d.totalChildren + '\nKutilgan,' + d.totalFee + '\nTo\'langan,' + d.totalPaid + '\nQarz,' + d.totalDue + '\nXarajat,' + d.totalExpense + '\nFoyda,' + d.netProfit + '\n\nBola,Fee,Paid,Due\n';
    if (d.byChild) d.byChild.forEach(c => { csv += `"${c.name}",${c.fee},${c.paid},${c.due}\n`; });
    downloadFile('biznes_' + m + '.csv', csv, 'text/csv');
    toast('Export tayyor!', 'success');
  } catch (e) { toast(e.message, 'error'); }
};

window.debtToggleAll = (el) => {
  $$('.debt-chk').forEach(c => c.checked = el.checked);
};
window.debtSelectAll = (btn) => {
  const all = $$('.debt-chk');
  all.forEach(c => c.checked = true);
  btn.textContent = all.every(c => c.checked) ? 'Barchasi tanlandi ✓' : 'Barchasini tanlash';
};
window.debtSendRemind = async (month) => {
  const ids = $$('.debt-chk').filter(c => c.checked).map(c => Number(c.value));
  if (!ids.length) return toast('Bironta qarzdorni tanlang', 'error');
  const channel = $('#debtChannel') ? $('#debtChannel').value : 'telegram';
  if (!confirm(`Tanlangan ${ids.length} ta ota-onaga ${channel === 'telegram' ? 'Telegram' : channel === 'sms' ? 'SMS' : 'Telegram+SMS'} orqali eslatma yuboriladi. Davom etasizmi?`)) return;
  try {
    const r = await api('/api/reminders/send', { method: 'POST', body: { month, recipient_ids: ids, channel } });
    toast(`${r.sent} ta eslatma yuborildi (TG:${r.tgSent}, SMS:${r.smsSent})`, 'success');
  } catch (e) { toast(e.message, 'error'); }
};

window.renderYearlyReport = async () => {
  $('#content').innerHTML = loading();
  const thisYear = new Date().getFullYear();
  let year = thisYear;
  async function load() {
    const d = await api('/api/business/yearly?year=' + year);
    const G = '#10b981', R = '#ef4444', C = '#6366f1';
    const rowsHtml = d.months.map(m => `
      <tr>
        <td><b>${monthName(m.month)}</b></td>
        <td class="money plus">${fmtMoney(m.income)}</td>
        <td class="money minus">${fmtMoney(m.expense)}</td>
        <td><b style="color:${m.profit >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmtMoney(m.profit)}</b></td>
        <td style="color:var(--muted)">${fmtMoney(m.salary)}</td>
        <td>${m.children}</td>
      </tr>`).join('');

    $('#content').innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap">
        <h2 style="margin:0">📅 Yillik hisobot — ${year} yil</h2>
        <select id="yrYear" class="field" style="width:auto;margin:0;padding:8px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);color:var(--text)">
          ${[thisYear, thisYear - 1, thisYear - 2].map(y => `<option value="${y}" ${y === year ? 'selected' : ''}>${y} yil</option>`).join('')}
        </select>
        <button class="btn btn-outline btn-sm" onclick="renderBusiness()">⬅️ Oylik hisobot</button>
        <button class="btn btn-primary btn-sm" onclick="window._yearExport(${year})">📥 Excel</button>
      </div>

      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">
        <div class="stat-card accent"><div class="stat-val">${fmtMoney(d.totals.totalIncome)}</div><div class="stat-label">💰 Yillik daromad</div></div>
        <div class="stat-card accent"><div class="stat-val">${fmtMoney(d.totals.totalExpense)}</div><div class="stat-label">💸 Yillik xarajat</div></div>
        <div class="stat-card accent"><div class="stat-val" style="color:${d.totals.totalProfit >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmtMoney(d.totals.totalProfit)}</div><div class="stat-label">📈 Yillik foyda</div></div>
        <div class="stat-card accent"><div class="stat-val">${fmtMoney(d.totals.avgMonthly)}</div><div class="stat-label">📊 O'rtacha oylik kirim</div></div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-head"><h3>🗓 ${year} yil — oylar bo'yicha</h3></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Oy</th><th>Daromad</th><th>Xarajat</th><th>Foyda</th><th>Ish haqi</th><th>Bolalar</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table></div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-head"><h3>📈 ${year} yil — grafik</h3></div>
        <canvas id="yearChart" height="250"></canvas>
      </div>
    `;

    $('#yrYear').addEventListener('change', e => { year = Number(e.target.value); load(); });
    if (typeof Chart !== 'undefined') {
      const ctx = document.getElementById('yearChart');
      if (ctx) new Chart(ctx, {
        type: 'bar',
        data: {
          labels: d.months.map(m => monthName(m.month)),
          datasets: [
            { label: 'Daromad', data: d.months.map(m => m.income), backgroundColor: G + 'cc' },
            { label: 'Xarajat', data: d.months.map(m => m.expense), backgroundColor: R + 'cc' },
            { label: 'Foyda', data: d.months.map(m => m.profit), backgroundColor: C + 'cc' }
          ]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
      });
    }
  }
  await load();
};

window._yearExport = async (year) => {
  try {
    const d = await api('/api/business/yearly?year=' + year);
    let csv = `Yillik hisobot ${year}\nDaromad,${d.totals.totalIncome}\nXarajat,${d.totals.totalExpense}\nFoyda,${d.totals.totalProfit}\n\nOy,Daromad,Xarajat,Foyda\n`;
    d.months.forEach(m => { csv += `${monthName(m.month)},${m.income},${m.expense},${m.profit}\n`; });
    downloadFile('yillik_' + year + '.csv', csv, 'text/csv');
    toast('Excel fayl tayyor!', 'success');
  } catch (e) { toast(e.message, 'error'); }
};

window.archiveCurrentMonth = async () => {
  const cm = monthStr();
  try {
    await api('/api/archives', { method: 'POST', body: { month: cm } });
    toast(monthName(cm) + ' arxivlandi!', 'success');
    renderArchives();
  } catch (e) { toast(e.message, 'error'); }
};

/* ================= OPERATOR: KUNLIK HISOBOT ================= */
async function renderOpDaily() {
  const $c = $('#content');
  $c.innerHTML = loading();
  try {
    const d = await api('/api/operator/daily-report');
    const attRate = d.totalKids > 0 ? Math.round(d.presentToday / d.totalKids * 100) : 0;
    $c.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px">
        <h2 style="margin:0">📊 ${t('opDailyReport')} — ${d.today}</h2>
        <button class="btn btn-outline btn-sm" onclick="exportOpDaily()">📥 Export</button>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${d.presentToday}/${d.totalKids}</div><div class="stat-label">👶 Davomat</div></div>
        <div class="stat-card"><div class="stat-value">${attRate}%</div><div class="stat-label">📈 Davomat %</div></div>
        <div class="stat-card"><div class="stat-value">${d.absentToday}</div><div class="stat-label">❌ Kelmagan</div></div>
        <div class="stat-card"><div class="stat-value">${d.lateToday}</div><div class="stat-label">⏰ Kechikkan</div></div>
      </div>
      <div class="stats-grid" style="margin-top:8px">
        <div class="stat-card accent"><div class="stat-value">${fmtMoney(d.tushgan)}</div><div class="stat-label">💰 Bugun tushgan</div></div>
        <div class="stat-card accent"><div class="stat-value">${fmtMoney(d.monthIncome)}</div><div class="stat-label">📅 Oylik daromad (${tMonth(d.month)})</div></div>
        <div class="stat-card accent"><div class="stat-value">${fmtMoney(d.monthExpense)}</div><div class="stat-label">💸 Oylik xarajat</div></div>
      </div>
      <div class="stats-grid" style="margin-top:8px">
        <div class="stat-card"><div class="stat-value">${d.childCount}</div><div class="stat-label">👶 Bolalar</div></div>
        <div class="stat-card"><div class="stat-value">${d.parentCount}</div><div class="stat-label">👨‍👩‍👧 Ota-onalar</div></div>
        <div class="stat-card"><div class="stat-value">${d.teacherCount}</div><div class="stat-label">👩‍🏫 Tarbiyachilar</div></div>
        <div class="stat-card"><div class="stat-value">${d.pendingRequests}</div><div class="stat-label">📋 Kutilayotgan arizalar</div></div>
      </div>
    `;
  } catch (e) { $c.innerHTML = `<div class="empty-state">⚠️ ${e.message}</div>`; }
}
window.exportOpDaily = async () => {
  try {
    const rows = await api('/api/operator/daily-export');
    if (!rows.length) return toast("Ma'lumot yo'q", "error");
    const csv = "ID,Name,Group,Attendance,Paid\n" + rows.map(r => `${r.id},"${r.name}","${r.group}","${r.attendance}",${r.paid}`).join("\n");
    downloadFile("hisobot_" + new Date().toISOString().slice(0,10) + ".csv", csv, "text/csv");
    toast("Export tayyor!");
  } catch (e) { toast(e.message, "error"); }
};

/* ================= OPERATOR: QARZDORLAR ================= */
async function renderOpDebtors() {
  const $c = $('#content');
  $c.innerHTML = loading();
  try {
    const d = await api('/api/operator/debtors');
    let html = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px">
        <h2 style="margin:0">💳 ${t('opDebtors')} — ${tMonth(d.month)}</h2>
        <button class="btn btn-outline btn-sm" onclick="exportDebtors()">📥 Export</button>
      </div>
    `;
    if (!d.debtors.length) {
      html += `<div class="empty-state"><span class="emoji">🎉</span><br>${t('noDebtors')}</div>`;
    } else {
      html += `
        <div class="stats-grid" style="margin-bottom:16px">
          <div class="stat-card accent"><div class="stat-value">${d.debtors.length}</div><div class="stat-label">👤 Qarzdorlar</div></div>
          <div class="stat-card accent"><div class="stat-value">${fmtMoney(d.totalDebt)}</div><div class="stat-label">💰 Jami qarz</div></div>
        </div>
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>#</th><th>Bola</th><th>Guruh</th><th>Ota-ona</th><th>To'lov</th><th>To'langan</th><th>Qarz</th><th>Oylar</th></tr></thead>
          <tbody>${d.debtors.map((r, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><b>${esc(r.full_name)}</b></td>
              <td>${esc(r.group_name)}</td>
              <td>${esc(r.parent_name)}</td>
              <td>${fmtMoney(r.fee)}</td>
              <td style="color:var(--success,#16a34a)">${fmtMoney(r.paid)}</td>
              <td style="color:var(--danger,#dc2626);font-weight:700">${fmtMoney(r.due)}</td>
              <td>${r.unpaidN >= 2 ? '<span class="badge badge-red">' + r.unpaidN + ' oy ⚠️</span>' : r.unpaidN + ' oy'}</td>
            </tr>
          `).join('')}</tbody>
        </table></div>
      `;
    }
    $c.innerHTML = html;
  } catch (e) { $c.innerHTML = `<div class="empty-state">⚠️ ${e.message}</div>`; }
}
window.exportDebtors = async () => {
  try {
    const d = await api('/api/operator/debtors');
    if (!d.debtors.length) return toast("Qarzdorlar yo'q", "error");
    const csv = "ID,Name,Group,Parent,Fee,Paid,Due,Months\n" + d.debtors.map(r => `${r.id},"${r.full_name}","${r.group_name}","${r.parent_name}",${r.fee},${r.paid},${r.due},${r.unpaidN}`).join("\n");
    downloadFile("qarzdorlar_" + d.month + ".csv", csv, "text/csv");
    toast("Export tayyor!");
  } catch (e) { toast(e.message, "error"); }
};

/* ================= OPERATOR: AVTOMATIK OGOHLANTIRISH ================= */
async function renderOpReminders() {
  const $c = $('#content');
  $c.innerHTML = loading();
  try {
    const reminders = await api('/api/operator/reminders');
    let html = `
      <h2 style="margin:0 0 16px 0">🔔 ${t('opReminders')}</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
        <div class="card" style="padding:16px">
          <div style="font-weight:600;margin-bottom:6px">🚨 ${t('autoDebtWarn')}</div>
          <div style="font-size:13px;color:var(--text-secondary,#888);margin-bottom:12px">${t('autoDebtDesc')}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge badge-green" style="font-size:12px">✅ Faol</span>
            <span style="font-size:12px;color:var(--text-secondary,#888)">Har oy avtomatik</span>
          </div>
        </div>
        <div class="card" style="padding:16px">
          <div style="font-weight:600;margin-bottom:6px">📅 ${t('autoPayRemind')}</div>
          <div style="font-size:13px;color:var(--text-secondary,#888);margin-bottom:12px">${t('autoPayDesc')}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge badge-green" style="font-size:12px">✅ Faol</span>
            <span style="font-size:12px;color:var(--text-secondary,#888)">Har oy 25-da</span>
          </div>
        </div>
      </div>
    `;
    if (reminders.length) {
      html += `<h3 style="margin-bottom:12px">📨 Yuborilgan eslatmalar</h3>`;
      html += `<div class="table-wrap"><table class="data-table">
        <thead><tr><th>#</th><th>Ota-ona</th><th>Turi</th><th>Matn</th><th>Sana</th><th>Holat</th></tr></thead>
        <tbody>${reminders.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${esc(r.parent_name)}</td>
            <td><span class="badge ${r.remind_type === 'payment' ? 'badge-blue' : r.remind_type === 'birthday' ? 'badge-green' : 'badge-gray'}">${r.remind_type === 'payment' ? "To'lov" : r.remind_type === 'birthday' ? "Tug'ilgan kun" : 'Boshqa'}</span></td>
            <td>${esc(r.remind_text || '—')}</td>
            <td>${r.remind_date || '—'}</td>
            <td>${r.sent ? '<span class="badge badge-green">✅ Yuborilgan</span>' : '<span class="badge badge-yellow">⏳ Kutilmoqda</span>'}</td>
          </tr>
        `).join('')}</tbody>
      </table></div>`;
    } else {
      html += `<div class="empty-state"><span class="emoji">📭</span><br>Hozircha eslatmalar yo'q</div>`;
    }
    $c.innerHTML = html;
  } catch (e) { $c.innerHTML = `<div class="empty-state">⚠️ ${e.message}</div>`; }
}

/* ================= ROUTER ================= */

const RENDER = {
  dashboard: renderDashboard,
  children: renderChildren,
  parents: renderParents,
  teachers: renderTeachers,
  groups: renderGroups,
  attendance: renderAttendance,
  payments: renderPayments,
  expenses: renderExpenses,
  meals: renderMeals,
  reports: renderReports,
  birthdays: renderBirthdays,
  schedules: renderSchedules,
  salary: renderSalary,
  monitoring: renderMonitoring,
  business: renderBusiness,
  archives: renderArchives,
  notify: renderNotify,
  sms: renderSms,
  eklon: renderAnnouncements,
  requests: renderRequests,
  journal: renderJournal,
  gallery: renderGallery,
  backup: renderBackup,
  audit: renderAudit,
  users: renderUsers,
  settings: renderSettings,
  landing: renderLanding,
  t_dashboard: renderTeacherDashboard,
  t_attendance: renderAttendance,
  t_children: renderTeacherChildren,
  t_journal: renderJournal,
  t_gallery: renderGallery,
  p_dashboard: renderParentDashboard,
  p_children: renderParentChildren,
  p_attendance: renderParentAttendance,
  p_payments: renderParentPayments,
  p_notif: renderParentNotifications,
  p_ann: renderParentAnnouncements,
  p_requests: renderParentRequests,
  p_gallery: renderParentGallery,
  p_journal: renderParentJournal,
  op_daily: renderOpDaily,
  op_debtors: renderOpDebtors,
  op_reminders: renderOpReminders
};

window.go = go;

/* ================= INIT ================= */

function applyTheme() {
  const t = localStorage.getItem('bogcha-theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  $('#themeToggle').textContent = t === 'dark' ? '�?�️' : '🌙';
}

async function init() {
  applyTheme();

  let deferredPrompt = window.__bipEvent || null;
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isInApp = /Telegram|WhatsApp|FBAN|FBAV|Instagram|Twitter|Line|Viber/i.test(navigator.userAgent);

  window.addEventListener('app-install-ready', () => {
    deferredPrompt = window.__bipEvent || null;
    if (deferredPrompt) {
      $('#installBtn').hidden = false;
      $('#installBtnLogin').hidden = false;
      toast('📲 Ilovani o\'rnatish mumkin — tugmani bosing');
    }
  });
  window.addEventListener('app-installed', () => {
    deferredPrompt = null;
    $('#installBtn').hidden = true;
    $('#installBtnLogin').hidden = true;
    toast('Ilova o\'rnatildi ✅');
  });

  async function handleInstallClick() {
    deferredPrompt = window.__bipEvent || deferredPrompt || null;
    if (isStandalone) {
      openModal('📲 Ilova', '<p>Ilova allaqachon o\'rnatilgan ✅</p>');
      return;
    }
    if (isIOS) {
      openModal('📲 Ilovani o\'rnatish (iPhone)', `
        <p style="margin-bottom:14px">iPhone/iPad\'da ilova Safari orqali o\'rnatiladi:</p>
        <ol style="padding-left:20px;display:grid;gap:8px;margin:0">
          <li>Safari\'da pastda o\'rtadagi <b>Ulashish</b> (kvadrat+strelka) tugmasini bosing</li>
          <li>Menyuda <b>"Bosh ekranga qo\'shish"</b> (Add to Home Screen) ni tanlang</li>
          <li>Yuqorida <b>Qo\'shish</b> tugmasini bosing</li>
        </ol>
        <p style="margin-top:14px;color:var(--muted);font-size:12.5px">Telefon ekranida "Denov Kindergarden" ikonkasi paydo bo\'ladi.</p>
      `);
      return;
    }
    if (isInApp) {
      openModal('📲 O\'rnatish uchun brauzerni oching', `
        <p style="margin-bottom:12px">Siz <b>Telegram/ilova ichida</b> ochyapsiz. Bu yerda ilova o\'rnatilmaydi.</p>
        <ol style="padding-left:20px;display:grid;gap:8px;margin:0">
          <li>Yuqori o\'ng burchakdagi <b>⋮</b> tugmasini bosing</li>
          <li><b>"Brauzerda ochish" / "Chrome\'da ochish"</b> ni tanlang</li>
          <li>Ochilgan sahifada <b>📲 O\'rnatish</b> tugmasini bosing</li>
        </ol>
      `);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      window.__bipEvent = null;
      $('#installBtn').hidden = true;
      $('#installBtnLogin').hidden = true;
      return;
    }
    openModal('📲 Ilovani o\'rnatish', `
      <p style="margin-bottom:12px"><b>Android (Chrome):</b> manzil qatoridagi <b>⤓ / ⋮</b> tugmasini bosib <b>"Ilovani o\'rnatish"</b> ni tanlang.</p>
      <p><b>Kompyuter (Chrome):</b> manzil qatoridagi <b>⤓</b> belgini bosing → <b>"O\'rnatish"</b>.</p>
      <p style="margin-top:12px;color:var(--muted);font-size:12.5px">Agar tugma hali chiqmasa, sahifani qayta oching va biroz vaqt saytda turing — ilova o\'rnatish tugmasi avtomatik paydo bo\'ladi.</p>
    `);
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.__bipEvent = e;
    $('#installBtn').hidden = false;
    $('#installBtnLogin').hidden = false;
  });
  $('#installBtn').addEventListener('click', handleInstallClick);
  $('#installBtnLogin').addEventListener('click', handleInstallClick);
  if (!isStandalone) {
    $('#installBtn').hidden = !(window.__bipEvent || deferredPrompt);
    $('#installBtnLogin').hidden = !(window.__bipEvent || deferredPrompt);
  } else {
    $('#installBtn').hidden = true;
    $('#installBtnLogin').hidden = true;
  }

  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = $('#loginUser').value.trim();
    const password = $('#loginPass').value;
    if (!username || !password) {
      $('#loginError').textContent = 'Login va parolni kiriting';
      return;
    }
    $('#loginBtn').disabled = true;
    $('#loginBtn').textContent = '⏳ Kirish...';
    $('#loginError').textContent = '';
    try {
      const { user } = await api('/api/login', {
        method: 'POST',
        body: { username, password }
      });
      state.user = user;
      $('#loginUser').value = ''; $('#loginPass').value = '';
      await startApp();
    } catch (err) {
      $('#loginError').textContent = err.message;
      $('#loginError').style.animation = 'pop .3s ease';
    } finally {
      $('#loginBtn').disabled = false;
      $('#loginBtn').textContent = 'Kirish';
    }
  });

  $$('.eye-btn').forEach(b => b.addEventListener('click', () => {
    const inp = $('#' + b.dataset.eye);
    inp.type = inp.type === 'password' ? 'text' : 'password';
    b.textContent = inp.type === 'password' ? '👁' : '🙈';
  }));

  $('#themeToggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('bogcha-theme', next);
    applyTheme();
  });

  $('#topbarBell').addEventListener('click', async () => {
    if (!isAdmin() && !isOperator()) return;
    await toggleBellPanel();
  });

  $('#logoutBtn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    state.page = null;
    localStorage.removeItem('bogcha-page');
    showLogin();
  });

  $('#sidebarToggle').addEventListener('click', () => {
    $('#sidebar').classList.add('open');
    $('#sidebarOverlay').classList.add('show');
  });
  $('#sidebarClose').addEventListener('click', closeSidebar);
  $('#sidebarOverlay').addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (_bellOpen) { closeBellPanel(); return; }
      if (!$('#modalOverlay').classList.contains('hidden')) closeModal();
      else if ($('#sidebar').classList.contains('open')) closeSidebar();
    }
  });
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx > 80 && touchStartX < 40 && !$('#sidebar').classList.contains('open')) {
      $('#sidebar').classList.add('open');
      $('#sidebarOverlay').classList.add('show');
    }
  }, { passive: true });
  $('#modalOverlay').addEventListener('click', (e) => {
    if (e.target === $('#modalOverlay')) closeModal();
  });
  $('#modalClose').addEventListener('click', closeModal);

  const ok = await loadSession();
  if (ok) await startApp();
  else {
    try { state.settings = await api('/api/settings'); applyLoginDesign(state.settings); } catch(e) {}
    showLogin();
  }
}

async function startApp() {
  state.settings = await api('/api/settings');
  const fullName = state.user.full_name || state.user.username;
  $('#meAvatar').textContent = initials(fullName);
  $('#meAvatar').style.background = avatarColor(fullName);
  $('#meName').textContent = fullName;
  $('#meRole').textContent = t(state.user.role === 'admin' ? 'admin' : state.user.role === 'teacher' ? 'teacherRole' : state.user.role === 'parent' ? 'parentRole' : 'operatorRole');
  $('#sidebarSiteName').textContent = state.settings.site_name || 'Denov Kindergarden';
  $('#loginSiteName').textContent = state.settings.site_name || 'Denov Kindergarden';
  document.title = `${state.settings.site_name || 'Denov Kindergarden'}`;
  $('#todayChip').textContent = fmtTodayShort() + ', ' + new Date().getFullYear();
  $('#logoutBtn').textContent = t('logout');
  $('#installBtn').textContent = '📲 ' + t('install');
  showApp();
  renderNav();
  go(localStorage.getItem('bogcha-page') || 'dashboard');
  setInterval(async () => { await fetchBadges(); renderNav(); if (_bellOpen) renderBellPanel(); }, 30000);
}

init();

window.onerror = function(msg, src, line, col, err) {
  console.error('Global xato:', msg, src, line);
};
window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise:', e.reason);
});
