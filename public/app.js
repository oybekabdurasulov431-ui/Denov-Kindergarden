'use strict';

/* ================= HELPERS ================= */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

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

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const monthName = (m) => { const [y, mm] = m.split('-'); return `${MONTHS[Number(mm) - 1]} ${y}`; };

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
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (res.status === 401) { showLogin(); throw new Error('Sessiya tugagan'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
  return data;
}

function loading(html = '<div class="empty-state"><span class="emoji">⏳</span>Yuklanmoqda...</div>') {
  return `<div class="empty-state"><span class="emoji">⏳</span>Yuklanmoqda...</div>`;
}

/* ================= STATE ================= */

const state = {
  user: null,
  settings: {},
  page: 'dashboard'
};

const isAdmin = () => state.user && state.user.role === 'admin';
const isOperator = () => state.user && state.user.role === 'operator';

const NAV = [
  { id: 'dashboard', label: 'Bosh sahifa', icon: 'home' },
  { id: 'children', label: 'Bolalar', icon: 'kids' },
  { id: 'parents', label: 'Ota-onalar', icon: 'users' },
  { id: 'groups', label: 'Guruhlar', icon: 'group' },
  { id: 'attendance', label: 'Davomat', icon: 'check' },
  { id: 'payments', label: 'To\'lovlar', icon: 'cash' },
  { id: 'expenses', label: 'Xarajatlar', icon: 'coin' },
  { id: 'meals', label: 'Menyu', icon: 'meal' },
  { id: 'reports', label: 'Hisobot', icon: 'chart' },
  { id: 'birthdays', label: 'Tug\'ilgan kunlar', icon: 'cake' },
  { id: 'teachers', label: 'Tarbiyachilar', icon: 'teacher', admin: true },
  { id: 'notify', label: 'Xabarnoma', icon: 'bell', admin: true },
  { id: 'eklon', label: 'E\'lonlar', icon: 'bell', admin: true },
  { id: 'requests', label: 'Arizalar', icon: 'request', admin: true },
  { id: 'backup', label: 'Zaxira', icon: 'download', admin: true },
  { id: 'audit', label: 'Jurnal', icon: 'list', admin: true },
  { id: 'users', label: 'Foydalanuvchilar', icon: 'lock', admin: true },
  { id: 'settings', label: 'Sozlamalar', icon: 'gear', admin: true }
];

const TEACHER_NAV = [
  { id: 't_dashboard', label: 'Bosh sahifa', icon: 'home' },
  { id: 't_attendance', label: 'Davomat', icon: 'check' },
  { id: 't_children', label: 'Guruhim', icon: 'family' },
  { id: 'settings', label: 'Sozlamalar', icon: 'gear' }
];

const PARENT_NAV = [
  { id: 'p_dashboard', label: 'Bosh sahifa', icon: 'home' },
  { id: 'p_children', label: 'Bolalarim', icon: 'kids' },
  { id: 'p_attendance', label: 'Davomat', icon: 'check' },
  { id: 'p_payments', label: 'To\'lovlarim', icon: 'cash' },
  { id: 'p_ann', label: 'E\'lonlar', icon: 'bell' },
  { id: 'p_request', label: 'To\'lov so\'rash', icon: 'request' },
  { id: 'p_requests', label: 'Arizalarim', icon: 'list' },
  { id: 'settings', label: 'Sozlamalar', icon: 'gear' }
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
  cake: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 1 2.5 1 .5-1 2-1 2.5 1 2.5 1 .5-1 2-1 2.5 1 2.5 1 .5-1 2-1 2.5 1 2.5 1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>'
};

/* ================= LOGIN ================= */

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
    return true;
  } catch {
    return false;
  }
}

/* ================= NAV ================= */

function roleNav() {
  const role = state.user && state.user.role;
  if (role === 'teacher') return TEACHER_NAV;
  if (role === 'parent') return PARENT_NAV;
  return NAV;
}

function renderNav() {
  const nav = $('#nav');
  const base = roleNav();
  const items = base.filter(n => !n.admin || isAdmin());
  nav.innerHTML = items.map(n => `
    <button class="nav-item ${state.page === n.id ? 'active' : ''}" data-page="${n.id}">
      ${ICONS[n.icon]}
      <span>${n.label}</span>
    </button>
  `).join('');
  $$('.nav-item', nav).forEach(b => b.addEventListener('click', () => go(b.dataset.page)));
}

function setPageTitle() {
  const base = roleNav();
  const item = base.find(n => n.id === state.page);
  $('#pageTitle').textContent = item ? item.label : 'Bosh sahifa';
}

async function go(page) {
  const base = roleNav();
  const item = base.find(n => n.id === page) || base[0];
  const allowed = new Set(base.map(n => n.id));
  if (!allowed.has(page) || (item.admin && !isAdmin())) page = base[0].id;
  if (state.page === 'attendance' && attState.date) attState = { date: attState.date };
  state.page = page;
  renderNav();
  setPageTitle();
  $('#sidebar').classList.remove('open');
  $('#sidebarOverlay').classList.remove('show');
  $('#content').innerHTML = loading();
  try {
    await RENDER[page]();
  } catch (e) {
    $('#content').innerHTML = `<div class="empty-state"><span class="emoji">😕</span>${esc(e.message)}</div>`;
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
  const [d, bd] = await Promise.all([api('/api/dashboard'), api('/api/birthdays').catch(() => null)]);
  const st = state.settings;
  const today = new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const presence = d.todayPresent;
  const attendancePct = d.totalChildren ? Math.round(presence / d.totalChildren * 100) : 0;

  const maxDay = Math.max(1, ...d.last8.map(x => x.present));
  const bars = d.last8.map(x => {
    const lbl = x.date.slice(5).replace('-', '.');
    const h = Math.max(3, Math.round(x.present / maxDay * 100));
    return `<div class="bar-col"><div class="bar" style="height:${h}%"><span class="bar-val">${x.present}</span></div><span class="bar-lbl">${lbl}</span></div>`;
  }).join('');

  const total = d.groups.reduce((s, g) => s + g.cnt, 0) || 1;
  let acc = 0;
  const segs = d.groups.map(g => {
    const from = acc / total * 100;
    acc += g.cnt;
    return `${from}% ${acc / total * 100}%`;
  }).join(',');
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
    </tr>`).join('') : `<tr><td colspan="5"><div class="empty-state">Hozircha to'lovlar yo'q</div></td></tr>`;

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
    <div class="kpi-banner">
      <div>
        <h2>Xush kelibsiz, ${esc(state.user.full_name)}! 👋</h2>
        <p>${esc(today)}</p>
      </div>
      <div class="kpi-right">
        <div class="kpi-item"><b>${presence}/${d.totalChildren}</b><span>Bugun kelgan</span></div>
        <div class="kpi-item"><b>${attendancePct}%</b><span>Davomat</span></div>
        <div class="kpi-item"><b>${fmtMoney(d.profitMonth)}</b><span>Sof foyda (oy)</span></div>
      </div>
    </div>

    <div class="grid stats">
      <div class="stat-card"><div class="stat-icon" style="background:var(--info-soft)">🧒</div><div class="stat-meta"><div class="stat-label">Jami bolalar</div><div class="stat-value">${d.totalChildren}</div><div class="stat-sub">${d.totalGroups} ta guruh</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--success-soft)">👩‍🏫</div><div class="stat-meta"><div class="stat-label">Tarbiyachilar</div><div class="stat-value">${d.totalTeachers}</div><div class="stat-sub">Kollektiv</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--warning-soft)">✅</div><div class="stat-meta"><div class="stat-label">Bugun davomat</div><div class="stat-value">${d.todayPresent}</div><div class="stat-sub">kelgan bolalar</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--primary-soft)">💰</div><div class="stat-meta"><div class="stat-label">Bu oy daromad</div><div class="stat-value">${fmtMoney(d.incomeMonth)}</div><div class="stat-sub">to'lovlar</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--warning-soft)">📤</div><div class="stat-meta"><div class="stat-label">Bu oy xarajat</div><div class="stat-value">${fmtMoney(d.expenseMonth)}</div><div class="stat-sub">${fmtMoney(d.profitMonth)} foyda</div></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:var(--danger-soft)">📋</div><div class="stat-meta"><div class="stat-label">Qarzlar</div><div class="stat-value">${fmtMoney(d.dueTotal)}</div><div class="stat-sub">to'lanishi kerak</div></div></div>
    </div>

    <div class="card-grid">
      <div class="card">
        <div class="card-head"><h3>So'nggi 8 kun davomati</h3><span class="spacer"></span><span class="badge green">${d.monthAtt.present || 0} keldi</span></div>
        <div class="bars">${bars}</div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Guruhlar bo'yicha taqsimot</h3></div>
        <div class="donut-row">
          <div class="donut" style="background:conic-gradient(${colors})">
            <div class="donut-center"><b>${d.totalChildren}</b><span>bola</span></div>
          </div>
          <div class="legend">${legend}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Oxirgi to'lovlar</h3>
        <span class="spacer"></span>
        <button class="btn btn-soft btn-sm" onclick="go('payments')">Barchasi →</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Bola</th><th>Oy</th><th>Summa</th><th>Sana</th><th>Usul</th></tr></thead>
        <tbody>${payRows}</tbody>
      </table></div>
    </div>

    ${bdCard}
  `;
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
      <td>${esc(p.email || '—')}</td>
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
        <thead><tr><th>Ota-ona</th><th>Telefon</th><th>Email</th><th>Manzil</th><th>Bolalar</th><th>Panel</th><th></th></tr></thead>
        <tbody>${rows || '<tr><td colspan="7"><div class="empty-state"><span class="emoji">👥</span>Ma\'lumot yo\'q</div></td></tr>'}</tbody>
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
    <div class="field"><span>Ism familiya *</span><input id="p_name" value="${esc(p2.full_name || '')}"></div>
    <div class="field"><span>Telefon</span><input id="p_phone" value="${esc(p2.phone || '')}" placeholder="+998 90 000 00 00"></div>
    <div class="field"><span>Email</span><input id="p_email" value="${esc(p2.email || '')}"></div>
    <div class="field"><span>Manzil</span><input id="p_address" value="${esc(p2.address || '')}"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="saveParentBtn">${p ? 'Saqlash' : 'Qo\'shish'}</button>
    </div>
  `);
  $('#saveParentBtn').addEventListener('click', async () => {
    const body = {
      full_name: $('#p_name').value.trim(),
      phone: $('#p_phone').value.trim(),
      email: $('#p_email').value.trim(),
      address: $('#p_address').value.trim()
    };
    if (!body.full_name) return toast('Ismni kiriting', 'error');
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
          <input type="month" id="payMonth" value="${month}">
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
          <input type="month" id="payMonth" value="${month}">
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
      <div class="field"><span>Oy</span><input id="pay_month" type="month" value="${month}"></div>
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
  const s = state.settings;
  const siteCard = isAdmin() ? `
    <div class="card">
      <div class="card-head"><h3>Bog'cha ma'lumotlari</h3></div>
      <div class="field"><span>Muassasa nomi</span><input id="s_name" value="${esc(s.site_name || '')}"></div>
      <div class="field"><span>Pul birligi</span><input id="s_currency" value="${esc(s.currency || 'so\'m')}"></div>
      <div class="field"><span>Manzil</span><input id="s_address" value="${esc(s.address || '')}"></div>
      <div class="form-row">
        <div class="field"><span>Telefon</span><input id="s_phone" value="${esc(s.phone || '')}"></div>
        <div class="field"><span>Email</span><input id="s_email" value="${esc(s.email || '')}"></div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="saveSettingsBtn">Saqlash</button>
      </div>
    </div>` : '';

  const tgCard = isAdmin() ? `
    <div class="card">
      <div class="card-head"><h3>🤖 Telegram bot (ota-onalar uchun)</h3><span class="spacer"></span>${s.tg_enabled === '0' ? '<span class="badge gray">O\'chiq</span>' : '<span class="badge green">Yoqilgan</span>'}</div>
      <p style="color:var(--muted);font-size:13px;margin-bottom:10px">Ota-onalar bot orqali bolalari davomatini va to\'lovlarini ko\'radi, to\'lov so\'rashi va chek olishi mumkin.</p>
      <div class="field"><span>Bot token</span><input id="tg_token" value="${esc(s.tg_token || '')}" placeholder="@BotFather → /newbot → token"></div>
      <div class="field"><span>Guruh ID</span><input id="tg_group" value="${esc(s.tg_group || '')}" placeholder="masalan: -1001234567890"></div>
      <div class="field"><span>Holat</span>
        <select id="tg_enabled"><option value="1" ${s.tg_enabled !== '0' ? 'selected' : ''}>Yoqilgan</option><option value="0" ${s.tg_enabled === '0' ? 'selected' : ''}>O\'chiq</option></select>
      </div>
      <div class="field"><span>Avtomatik qarz eslatmasi</span>
        <select id="reminders_enabled"><option value="1" ${s.reminders_enabled !== '0' ? 'selected' : ''}>Yoqilgan (kuniga bir marta)</option><option value="0" ${s.reminders_enabled === '0' ? 'selected' : ''}>O\'chiq</option></select>
      </div>
      <div class="field"><span>Eslatma vaqti</span>
        <select id="reminder_time"><option value="9" ${(s.reminder_time || '9') === '9' ? 'selected' : ''}>09:00</option><option value="10" ${(s.reminder_time || '9') === '10' ? 'selected' : ''}>10:00</option><option value="11" ${(s.reminder_time || '9') === '11' ? 'selected' : ''}>11:00</option><option value="15" ${(s.reminder_time || '9') === '15' ? 'selected' : ''}>15:00</option><option value="18" ${(s.reminder_time || '9') === '18' ? 'selected' : ''}>18:00</option></select>
      </div>
      <div class="modal-actions"><button class="btn btn-primary" id="saveTgBtn">Saqlash</button></div>
    </div>` : '';

  const dangerCard = isAdmin() ? `
    <div class="card" style="border-color:var(--danger)">
      <div class="card-head"><h3>⚠️ Xavfli hudud — ma'lumotlarni tozalash</h3><span class="spacer"></span><span class="badge red">Faqat administrator</span></div>
      <p style="color:var(--muted);font-size:13px;margin-bottom:14px">Bu amallar ma'lumotlarni butunlay o'chiradi va qaytarib bo'lmaydi. Har bir amal parol bilan tasdiqlanadi. Foydalanuvchilar va sozlamalar saqlanib qoladi.</p>
      <div class="reset-grid">
        <button class="btn btn-outline" onclick="resetConfirm('attendance','Davomat yozuvlari')">🗑 Davomatni tozalash</button>
        <button class="btn btn-outline" onclick="resetConfirm('payments','To\'lovlar')">🗑 To'lovlarni tozalash</button>
        <button class="btn btn-outline" onclick="resetConfirm('expenses','Xarajatlar')">🗑 Xarajatlarni tozalash</button>
        <button class="btn btn-outline" onclick="resetConfirm('children','Bolalar va ota-onalar')">🗑 Bolalarni tozalash</button>
        <button class="btn btn-outline" onclick="resetConfirm('groups','Guruhlar va tarbiyachilar')">🗑 Guruhlarni tozalash</button>
        <button class="btn btn-danger" onclick="resetConfirm('all','HAMMA ma\'lumotlar')">🔥 Hammasini tozalash</button>
      </div>
    </div>` : '';

  $('#content').innerHTML = `
    <div class="card-grid">
      ${siteCard}
      ${tgCard}
      <div class="card">
        <div class="card-head"><h3>Parolni o'zgartirish</h3></div>
        <div class="field"><span>Eski parol</span><input id="pw_old" type="password"></div>
        <div class="field"><span>Yangi parol</span><input id="pw_new" type="password"></div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="changePwBtn">Parolni yangilash</button>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Login (kirish kodi) o'zgartirish</h3></div>
        <p style="color:var(--muted);font-size:13px;margin-bottom:10px">Joriy login: <b>${esc(state.user.username)}</b></p>
        <div class="field"><span>Parol (tasdiqlash)</span><input id="lu_pass" type="password"></div>
        <div class="field"><span>Yangi login</span><input id="lu_new" type="text" placeholder="yangi_kod"></div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="changeLoginBtn">Loginni yangilash</button>
        </div>
      </div>
      ${dangerCard}
    </div>`;

  if (isAdmin()) {
    $('#saveSettingsBtn').addEventListener('click', async () => {
      const body = {
        site_name: $('#s_name').value.trim(),
        currency: $('#s_currency').value.trim(),
        address: $('#s_address').value.trim(),
        phone: $('#s_phone').value.trim(),
        email: $('#s_email').value.trim()
      };
      try {
        state.settings = await api('/api/settings', { method: 'PUT', body });
        $('#sidebarSiteName').textContent = state.settings.site_name || 'Denov Kindergarden';
        $('#loginSiteName').textContent = state.settings.site_name || 'Denov Kindergarden';
        document.title = `${state.settings.site_name || 'Denov Kindergarden'} — Maktabgacha ta'lim tizimi`;
        toast('Sozlamalar saqlangan');
      } catch (e) { toast(e.message, 'error'); }
    });

    $('#saveTgBtn').addEventListener('click', async () => {
      const body = {
        tg_token: $('#tg_token').value.trim(),
        tg_group: $('#tg_group').value.trim(),
        tg_enabled: $('#tg_enabled').value,
        reminders_enabled: $('#reminders_enabled').value,
        reminder_time: $('#reminder_time').value
      };
      try {
        state.settings = await api('/api/settings', { method: 'PUT', body });
        toast('Telegram sozlamalari saqlangan');
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  $('#changePwBtn').addEventListener('click', async () => {
    try {
      await api('/api/change-password', {
        method: 'POST',
        body: { old_password: $('#pw_old').value, new_password: $('#pw_new').value }
      });
      toast('Parol yangilandi'); $('#pw_old').value = ''; $('#pw_new').value = '';
    } catch (e) { toast(e.message, 'error'); }
  });

  $('#changeLoginBtn').addEventListener('click', async () => {
    try {
      const r = await api('/api/change-username', {
        method: 'POST',
        body: { password: $('#lu_pass').value, new_username: $('#lu_new').value }
      });
      state.user.username = r.username;
      toast('Login yangilandi'); $('#lu_pass').value = ''; $('#lu_new').value = '';
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
        <thead><tr><th>Xarajat</th><th>Kategoriya</th><th>Summa</th><th>Sana</th><th></th></tr></thead>
        <tbody id="expTbody">${rows || '<tr><td colspan="5"><div class="empty-state"><span class="emoji">🧾</span>Bu oy uchun xarajat yo\'q</div></td></tr>'}</tbody>
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
  const catOpts = EXP_CATEGORIES.map(c => `<option ${r && r.category === c ? 'selected' : ''}>${c}</option>`).join('');
  openModal(id ? 'Xarajatni tahrirlash' : 'Yangi xarajat', `
    <div class="field"><span>Nomi *</span><input id="x_name" value="${esc(r?.name || '')}" placeholder="Misol: Oziq-ovqat mahsulotlari"></div>
    <div class="form-row">
      <div class="field"><span>Kategoriya</span><select id="x_cat">${catOpts}</select></div>
      <div class="field"><span>Summa (so'm) *</span><input id="x_amount" type="number" min="0" value="${r?.amount || ''}"></div>
      <div class="field"><span>Sana</span><input id="x_date" type="date" value="${esc(r?.expense_date || todayStr())}"></div>
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
      notes: $('#x_notes').value.trim()
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
  const data = await api('/api/reports/monthly?month=' + repState.month);
  const m = repState.month;

  const methodRows = data.byMethod.map(x => `
    <div class="legend-item"><span class="legend-dot" style="background:${x.method === 'naqd' ? '#10b981' : x.method === 'karta' ? '#6366f1' : '#f59e0b'}"></span>${x.method === 'naqd' ? 'Naqd' : x.method === 'karta' ? 'Karta' : 'Bank'}<b>${fmtMoney(x.total)}</b></div>
  `).join('');

  const catColors = { 'Oziq-ovqat': '#f59e0b', 'Kommunal': '#3b82f6', 'Ish haqi': '#8b5cf6', 'Ta\'minot': '#10b981', 'Ta\'mirlash': '#ef4444', 'Transport': '#14b8a6', 'Boshqa': '#64748b' };
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
    <tr><td><div class="cell-name">${esc(d.child_name)}</div></td><td>${esc(d.group_name) || '—'}</td><td class="money">${fmtMoney(d.fee)}</td><td class="money">${fmtMoney(d.paid)}</td><td class="money minus">${fmtMoney(d.due)}</td><td>${d.unpaidMonths >= 2 ? `<span class="badge red">${d.unpaidMonths} oy ⚠️</span>` : `<span class="badge gray">${d.unpaidMonths} oy</span>`}</td></tr>
  `).join('');

  $('#content').innerHTML = `
    <div class="toolbar">
      <input type="month" id="repMonth" value="${m}">
      <span class="badge purple">${monthName(m)} hisoboti</span>
      <span class="spacer" style="flex:1"></span>
      <a href="/api/export/report.xlsx?month=${m}" class="btn btn-primary">📊 Excel (.xlsx)</a>
      <a href="/api/export/payments.csv?month=${m}" class="btn btn-outline">💳 To'lovlar</a>
      <a href="/api/export/expenses.csv?month=${m}" class="btn btn-outline">📤 Xarajatlar</a>
      <a href="/api/export/attendance.csv?month=${m}" class="btn btn-outline">✅ Davomat</a>
      <button class="btn btn-outline" onclick="window.print()">🖨️ PDF / Chop etish</button>
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

  $('#repMonth').addEventListener('change', e => { repState.month = e.target.value; renderReports(); });
}

/* ================= MENYU (OVQATLANISH) ================= */

let mealState = { date: todayStr() };

async function renderMeals() {
  const data = await api('/api/meals?date=' + mealState.date);
  const chips = data.week.map(d => `<button class="chip ${d === mealState.date ? 'active' : ''}" onclick="mealDay('${d}')">${d === todayStr() ? 'Bugun' : fmtDate(d)}</button>`).join('');
  const typeMeta = {
    nonushta: { label: '🍞 Nonushta', icon: '🌅' },
    tushlik: { label: '🍲 Tushlik', icon: '☀️' },
    choy: { label: '🍵 Choy / Kechki', icon: '🌆' }
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
  $('#content').innerHTML = `
    <div class="toolbar flex-wrap">${chips}</div>
    <div class="card-grid meals-grid">${cards}</div>`;
}

window.mealDay = (d) => { mealState.date = d; renderMeals(); };

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
    toast(`${r.count} ta xabar yuborildi (qo\'lda — SMS/Telegram orqali yuboring)`);
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
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Bekor</button>
      <button class="btn btn-primary" id="saveAnnBtn">Yuborish</button>
    </div>
  `);
  $('#saveAnnBtn').addEventListener('click', async () => {
    const title = $('#ann_title').value.trim();
    const text = $('#ann_text').value.trim();
    if (!title || !text) return toast('Sarlavha va matnni kiriting', 'error');
    try {
      await api('/api/announcements', { method: 'POST', body: { title, text, send_tg: $('#ann_tg').checked } });
      toast('E\'lon joylandi'); closeModal(); renderAnnouncements();
    } catch (e) { toast(e.message, 'error'); }
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

  const notifs = d.notifications.map(n => `
    <div class="notif-item"><div class="notif-head"><b>${n.type === 'payment' ? '💰 To\'lov' : '📋 Xabarnoma'}</b><span class="cell-sub">${fmtDate(n.created_at)}</span></div><div class="n-msg">${esc(n.message)}</div></div>`).join('');

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
        <div class="card-head"><h3>🔔 Xabarlar</h3></div>
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

async function renderParentPayRequest() {
  const { children } = await api('/api/parent/me');
  const active = children.filter(c => c.status === 'active');
  const opts = active.map(c => `<option value="${c.id}" data-fee="${c.effective_fee || 0}">${esc(c.full_name)} ${c.group_name ? '· ' + esc(c.group_name) : ''} (${fmtMoney(c.effective_fee || 0)})</option>`).join('');
  $('#content').innerHTML = `
    <div class="card" style="max-width:520px">
      <div class="card-head"><h3>💰 To\'lov so\'rashi</h3></div>
      <p style="color:var(--muted);font-size:13px;margin-bottom:12px">So\'rov yuborganingizdan so\'ng administrator tasdiqlaydi va sizga chek (kvitansiya) beriladi.</p>
      <div class="field"><span>Bola *</span><select id="pr_child">${opts || '<option value="">Faol bola yo\'q</option>'}</select></div>
      <div class="field"><span>Summa (so\'m) *</span><input id="pr_amount" type="number" min="1" placeholder="Masalan: 250000"></div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="prSendBtn">Yuborish</button>
      </div>
    </div>`;
  const fillAmount = () => {
    const sel = $('#pr_child');
    const opt = sel.selectedOptions && sel.selectedOptions[0];
    if (opt && opt.dataset.fee) $('#pr_amount').value = opt.dataset.fee;
  };
  $('#pr_child').addEventListener('change', fillAmount);
  fillAmount();
  $('#prSendBtn').addEventListener('click', async () => {
    const child_id = $('#pr_child').value;
    const amount = Number($('#pr_amount').value);
    if (!child_id) return toast('Bolani tanlang', 'error');
    if (!amount || amount <= 0) return toast('Summani kiriting', 'error');
    try {
      await api('/api/parent/payments/request', { method: 'POST', body: { child_id, amount } });
      toast('So\'rov yuborildi ✅'); go('p_requests');
    } catch (e) { toast(e.message, 'error'); }
  });
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
      <div class="card-head"><h3>📨 Arizalarim</h3><span class="spacer"></span><button class="btn btn-primary" onclick="go('p_request')">${ICONS.plus}Yangi so\'rov</button></div>
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
  notify: renderNotify,
  eklon: renderAnnouncements,
  requests: renderRequests,
  backup: renderBackup,
  audit: renderAudit,
  users: renderUsers,
  settings: renderSettings,
  t_dashboard: renderTeacherDashboard,
  t_attendance: renderAttendance,
  t_children: renderTeacherChildren,
  p_dashboard: renderParentDashboard,
  p_children: renderParentChildren,
  p_attendance: renderParentAttendance,
  p_payments: renderParentPayments,
  p_ann: renderParentAnnouncements,
  p_request: renderParentPayRequest,
  p_requests: renderParentRequests
};

window.go = go;

/* ================= INIT ================= */

function applyTheme() {
  const t = localStorage.getItem('bogcha-theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  $('#themeToggle').textContent = t === 'dark' ? '☀️' : '🌙';
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
    $('#loginBtn').disabled = true;
    $('#loginError').textContent = '';
    try {
      const { user } = await api('/api/login', {
        method: 'POST',
        body: { username: $('#loginUser').value.trim(), password: $('#loginPass').value }
      });
      state.user = user;
      $('#loginUser').value = ''; $('#loginPass').value = '';
      await startApp();
    } catch (err) {
      $('#loginError').textContent = err.message;
    } finally {
      $('#loginBtn').disabled = false;
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

  $('#logoutBtn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    showLogin();
  });

  $('#sidebarToggle').addEventListener('click', () => {
    $('#sidebar').classList.add('open');
    $('#sidebarOverlay').classList.add('show');
  });
  $('#sidebarClose').addEventListener('click', () => {
    $('#sidebar').classList.remove('open');
    $('#sidebarOverlay').classList.remove('show');
  });
  $('#sidebarOverlay').addEventListener('click', () => {
    $('#sidebar').classList.remove('open');
    $('#sidebarOverlay').classList.remove('show');
  });
  $('#modalOverlay').addEventListener('click', (e) => {
    if (e.target === $('#modalOverlay')) closeModal();
  });
  $('#modalClose').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  const ok = await loadSession();
  if (ok) await startApp();
  else showLogin();
}

async function startApp() {
  state.settings = await api('/api/settings');
  const fullName = state.user.full_name || state.user.username;
  $('#meAvatar').textContent = initials(fullName);
  $('#meAvatar').style.background = avatarColor(fullName);
  $('#meName').textContent = fullName;
  $('#meRole').textContent = state.user.role === 'admin' ? 'Administrator' : state.user.role === 'teacher' ? 'Tarbiyachi' : state.user.role === 'parent' ? 'Ota-ona' : 'Operator';
  $('#sidebarSiteName').textContent = state.settings.site_name || 'Denov Kindergarden';
  $('#loginSiteName').textContent = state.settings.site_name || 'Denov Kindergarden';
  document.title = `${state.settings.site_name || 'Denov Kindergarden'} — Maktabgacha ta'lim tizimi`;
  $('#todayChip').textContent = new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
  showApp();
  renderNav();
  go('dashboard');
}

init();
