const { TelegramBot } = require('node-telegram-bot-api');
const db = require('./db');
const { today, currentMonth } = db.helpers;

let bot = null;

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const s = {};
  for (const r of rows) s[r.key] = r.value;
  return s;
}

function normPhone(v) {
  return String(v || '').replace(/\D/g, '');
}

function findParentsByPhone(input) {
  const d = normPhone(input);
  if (!d) return [];
  const all = db.prepare('SELECT * FROM parents').all();
  const out = [];
  for (const p of all) {
    const pd = normPhone(p.phone);
    if (pd && pd === d) out.push(p);
  }
  if (out.length === 0 && d.length === 9) {
    const full = '998' + d;
    for (const p of all) {
      if (normPhone(p.phone) === full) out.push(p);
    }
  }
  return out;
}

function getLinkedParent(chatId) {
  const r = db.prepare('SELECT parent_id FROM tg_links WHERE chat_id = ?').get(chatId);
  if (!r) return null;
  return db.prepare('SELECT * FROM parents WHERE id = ?').get(r.parent_id) || null;
}

function linkParent(chatId, parent, msg) {
  const from = msg.from || {};
  db.prepare(`INSERT INTO tg_links (parent_id, chat_id, first_name, username)
    VALUES (?,?,?,?)
    ON CONFLICT(parent_id) DO UPDATE SET chat_id = excluded.chat_id, first_name = excluded.first_name, username = excluded.username`)
    .run(parent.id, chatId, from.first_name || '', from.username || '');
  sendGroup(`📱 Botga yangi ota-ona ulandi\n👤 ${parent.full_name}\n📞 ${parent.phone || '—'}`);
}

function childrenOf(parentId, activeOnly) {
  const where = activeOnly ? "parent_id = ? AND status = 'active'" : 'parent_id = ?';
  return db.prepare(`
    SELECT c.*, g.name AS group_name, g.color AS group_color, g.fee_per_month
    FROM children c LEFT JOIN groups g ON g.id = c.group_id
    WHERE ${where} ORDER BY c.full_name
  `).all(parentId);
}

function attSummary(childId, month) {
  const rows = db.prepare('SELECT status, COUNT(*) cnt FROM attendance WHERE child_id = ? AND substr(date,1,7) = ? GROUP BY status').all(childId, month);
  const s = { present: 0, absent: 0, late: 0 };
  for (const r of rows) if (s[r.status] != null) s[r.status] = r.cnt;
  return s;
}

function payHistory(childId) {
  return db.prepare(`
    SELECT pay.*, c.full_name AS child_name
    FROM payments pay JOIN children c ON c.id = pay.child_id
    WHERE pay.child_id = ? ORDER BY pay.paid_date DESC, pay.id DESC LIMIT 20
  `).all(childId);
}

/* ---------- Narx logikasi (server bilan bir xil) ---------- */
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

function effectiveFee(r) {
  const age = childAge(r.birth_date);
  if (age != null && age < 3) return 300000;
  if (r.parent_id) {
    const cnt = db.prepare("SELECT COUNT(*) c FROM children WHERE parent_id = ? AND status = 'active'").get(r.parent_id).c;
    if (cnt >= 2) return 200000;
  }
  return r.fee_per_month || 250000;
}

function childDue(childId, month) {
  const c = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
  if (!c) return 0;
  const fee = effectiveFee(c);
  const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND month = ? AND status = 'confirmed'").get(childId, month).s;
  return Math.max(0, fee - paid);
}

function setSetting(k, v) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(k, String(v));
}

function fmtMoney(v) {
  return new Intl.NumberFormat('uz-UZ').format(Number(v || 0));
}

const MONTHS = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
function monthName(m) {
  const mm = Number(String(m).slice(5, 7));
  return (MONTHS[mm] || m) + ' ' + String(m).slice(0, 4);
}

const flowState = {};

function menuKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '👶 Mening bolalarim', callback_data: 'children' }],
        [{ text: '💳 Qarz / To\'lov holati', callback_data: 'qarz' }, { text: '💰 To\'lov so\'rash', callback_data: 'pay_list' }],
        [{ text: '📜 To\'lovlarim', callback_data: 'payhist' }, { text: '📢 E\'lonlar', callback_data: 'eklon' }],
        [{ text: '🔑 Boshqa raqam bilan ulanish', callback_data: 'relink' }]
      ]
    }
  };
}

function mainMenu(chatId, name) {
  return bot.sendMessage(chatId,
    `Assalomu alaykum, ${name}! 👋\n\nMenyudan kerakli bo\'limni tanlang:`,
    menuKeyboard());
}

function sendGroup(text, opts) {
  if (!bot) return Promise.resolve();
  const s = getSettings();
  if (s.tg_enabled === '0') return Promise.resolve();
  const gid = s.tg_group;
  if (!gid) return Promise.resolve();
  return bot.sendMessage(gid, text, { disable_web_page_preview: true, ...(opts || {}) }).catch(() => {});
}

function sendToParent(parent, text) {
  if (!bot || !parent) return Promise.resolve();
  const r = db.prepare('SELECT chat_id FROM tg_links WHERE parent_id = ?').get(parent.id);
  if (!r) return Promise.resolve();
  return bot.sendMessage(r.chat_id, text).catch(() => {});
}

/* ---------- Bot ichki oqimlar ---------- */

async function handlePhone(chatId, msg, phoneInput) {
  const candidates = findParentsByPhone(phoneInput);
  delete flowState[chatId];
  if (candidates.length === 0) {
    return bot.sendMessage(chatId,
      '😕 Bu raqam ro\'yxatda topilmadi. Raqamni to\'g\'ri kiritganingizni tekshiring yoki bog\'cha administratoriga murojaat qiling.\n\nQayta urinish: /start');
  }
  if (candidates.length > 1) {
    const kb = { reply_markup: { inline_keyboard: candidates.map(p => [{ text: `${p.full_name} — ${p.phone || ''}`, callback_data: 'sel|' + p.id }]) } };
    return bot.sendMessage(chatId, 'Bir nechta moslik topildi. O\'zingizni tanlang:', kb);
  }
  const parent = candidates[0];
  linkParent(chatId, parent, msg);
  return mainMenu(chatId, parent.full_name);
}

async function showChildren(chatId, parent) {
  const kids = childrenOf(parent.id, true);
  if (!kids.length) {
    return bot.sendMessage(chatId, '😕 Sizning faol bolalaringiz yo\'q. Administrator bilan bog\'laning.');
  }
  const month = currentMonth();
  let text = `👶 <b>${parent.full_name}</b> — bolalaringiz:\n\n`;
  const kb = [];
  for (const k of kids) {
    const st = k.status === 'active' ? '✅ o\'qishda' : '❌ chiqib ketgan';
    const fee = effectiveFee(k);
    const due = childDue(k.id, month);
    text += `• <b>${k.full_name}</b> — ${k.group_name || 'Guruhsiz'} (${st})\n  💰 Oylik: <b>${fmtMoney(fee)}</b> so'm${due > 0 ? ` | Qarz: <b>${fmtMoney(due)}</b>` : ' | ✅ To\'langan'}\n`;
    kb.push([
      { text: `${k.full_name} · Davomat`, callback_data: `att|${k.id}` },
      { text: 'To\'lovlar', callback_data: `payhist|${k.id}` }
    ]);
  }
  kb.push([{ text: '💰 Qarzni ko\'rish', callback_data: 'qarz' }]);
  kb.push([{ text: '⬅️ Orqaga', callback_data: 'main' }]);
  return bot.sendMessage(chatId, text, { parse_mode: 'HTML', reply_markup: { inline_keyboard: kb } });
}

async function showDebt(chatId, parent) {
  const kids = childrenOf(parent.id, true);
  if (!kids.length) return bot.sendMessage(chatId, '😕 Sizning faol bolalaringiz yo\'q.');
  const month = currentMonth();
  let text = `💳 <b>To\'lov holati — ${monthName(month)}</b>\n\n`;
  let total = 0;
  for (const k of kids) {
    const fee = effectiveFee(k);
    const paid = fee - childDue(k.id, month);
    const due = childDue(k.id, month);
    total += due;
    text += `👶 <b>${k.full_name}</b>\n   Oylik: <b>${fmtMoney(fee)}</b> so'm\n   To\'langan: ${fmtMoney(paid)} so'm\n   ${due > 0 ? `⚠️ Qarz: <b>${fmtMoney(due)}</b> so'm` : '✅ To\'liq to\'langan'}\n\n`;
  }
  text += total > 0 ? `Jami qarz: <b>${fmtMoney(total)}</b> so'm` : '🎉 Barcha to\'lovlar bajarilgan!';
  const kb = { reply_markup: { inline_keyboard: [[{ text: '💰 To\'lov so\'rash', callback_data: 'pay_list' }, { text: '⬅️ Orqaga', callback_data: 'main' }]] } };
  return bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...kb });
}

async function showAnnouncements(chatId) {
  const rows = db.prepare('SELECT * FROM announcements ORDER BY id DESC LIMIT 5').all();
  if (!rows.length) return bot.sendMessage(chatId, '📭 Hozircha e\'lonlar yo\'q.');
  let text = '📢 <b>Bog\'cha e\'lonlari</b>\n\n';
  for (const a of rows) {
    text += `📌 <b>${a.title}</b>\n${a.text}\n<i>${(a.created_at || '').slice(0, 10)}</i>\n\n`;
  }
  return bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
}

async function showAttendance(chatId, childId) {
  const c = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
  if (!c) return bot.sendMessage(chatId, 'Bola topilmadi.');
  const m = currentMonth();
  const a = attSummary(childId, m);
  const total = a.present + a.late + a.absent;
  let text = `📅 Davomat — <b>${c.full_name}</b>\n${monthName(m)}\n\n`;
  text += `✅ Kelgan: <b>${a.present}</b> kun\n⏰ Kechikkan: <b>${a.late}</b> kun\n❌ Kelmagan: <b>${a.absent}</b> kun\n\n`;
  text += `Jami qayd: ${total} kun`;
  const kb = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'children' }]] } };
  return bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...kb });
}

async function showPayHistory(chatId, childId) {
  const c = childId
    ? db.prepare('SELECT * FROM children WHERE id = ?').get(childId)
    : null;
  if (c) {
    const pays = payHistory(childId);
    let text = `📜 To\'lovlar — <b>${c.full_name}</b>\n\n`;
    if (!pays.length) text += 'Hali to\'lovlar yo\'q.';
    for (const p of pays) {
      text += `• ${monthName(p.month)}: <b>${fmtMoney(p.amount)}</b> so\'m (${p.method})\n  ${p.status === 'confirmed' ? '✅ To\'langan' : '⏳ Kutilmoqda'}`;
      if (p.receipt_no) text += ` · 🧾 ${p.receipt_no}`;
      text += '\n';
    }
    const kb = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'children' }]] } };
    return bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...kb });
  }

  const parent = getLinkedParent(chatId);
  if (!parent) return bot.sendMessage(chatId, 'Avval telefon raqamingiz bilan ulaning: /start');
  const kids = childrenOf(parent.id, false);
  if (!kids.length) return bot.sendMessage(chatId, 'Bolalar topilmadi.');
  let text = '📜 <b>To\'lovlar tarixi</b>\n\nQaysi bolaning to\'lovlarini ko\'rasiz?';
  const kb = { reply_markup: { inline_keyboard: kids.map(k => [{ text: k.full_name, callback_data: 'payhist|' + k.id }]).concat([[{ text: '⬅️ Orqaga', callback_data: 'main' }]]) } };
  return bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...kb });
}

async function showPayList(chatId, parent) {
  const kids = childrenOf(parent.id, true);
  if (!kids.length) return bot.sendMessage(chatId, '😕 Sizning faol bolalaringiz yo\'q.');
  let text = '💰 <b>To\'lov so\'rashi</b>\n\nBolasini tanlang:';
  const kb = { reply_markup: { inline_keyboard: kids.map(k => [{ text: k.full_name, callback_data: 'pay|' + k.id }]).concat([[{ text: '⬅️ Orqaga', callback_data: 'main' }]]) } };
  return bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...kb });
}

async function startPayAmount(chatId, childId) {
  const c = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
  if (!c) return bot.sendMessage(chatId, 'Bola topilmadi.');
  flowState[chatId] = { step: 'pay_amount', childId, childName: c.full_name };
  const kb = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Bekor qilish', callback_data: 'main' }]] } };
  return bot.sendMessage(chatId,
    `💰 To\'lov so\'rashi — <b>${c.full_name}</b>\n\nSummani so\'mda yozib yuboring.\nMisol: <code>500000</code>`,
    { parse_mode: 'HTML', ...kb });
}

async function confirmPay(chatId, childId, amount) {
  const parent = getLinkedParent(chatId);
  if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
  const c = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
  if (!c) return bot.sendMessage(chatId, 'Bola topilmadi.');
  const kb = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Tasdiqlash', callback_data: `pay_ok|${childId}|${amount}` }],
        [{ text: '❌ Bekor qilish', callback_data: 'pay_cancel' }]
      ]
    }
  };
  return bot.sendMessage(chatId,
    `Tasdiqlaysizmi?\n\n👶 Bola: <b>${c.full_name}</b>\n💰 Summa: <b>${fmtMoney(amount)}</b> so\'m`,
    { parse_mode: 'HTML', ...kb });
}

/* ---------- Xabarlar ---------- */

function onMessage(msg) {
  if (!bot) return;
  if (msg.chat.type !== 'private') return;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  if (text === '/start' || text === '/menu' || text === 'menu') {
    delete flowState[chatId];
    const parent = getLinkedParent(chatId);
    if (parent) return mainMenu(chatId, parent.full_name);
    flowState[chatId] = { step: 'phone' };
    const kb = {
      reply_markup: {
        keyboard: [[{ text: '📲 Telefon raqamni yuborish', request_contact: true }]],
        resize_keyboard: true, one_time_keyboard: true
      }
    };
    return bot.sendMessage(chatId,
      '👋 Xush kelibsiz!\n\nBotdan foydalanish uchun ota-onaning telefon raqami kerak. \n\n👇 Pastdagi tugmani bosing yoki raqamni yozing:\n<code>+998 91 123 45 67</code>',
      { parse_mode: 'HTML', ...kb });
  }

  if (text === '/bolalarim') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'phone' }; return bot.sendMessage(chatId, 'Avval telefon raqamingiz bilan ulaning: /start'); }
    return showChildren(chatId, parent);
  }
  if (text === '/davomat') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'phone' }; return bot.sendMessage(chatId, 'Avval telefon raqamingiz bilan ulaning: /start'); }
    const kids = childrenOf(parent.id, true);
    if (!kids.length) return bot.sendMessage(chatId, 'Bolalar topilmadi.');
    const kb = { reply_markup: { inline_keyboard: kids.map(k => [{ text: k.full_name, callback_data: 'att|' + k.id }]) } };
    return bot.sendMessage(chatId, '📅 Qaysi bolaning davomatini ko\'rasiz?', kb);
  }
  if (text === '/tollar') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'phone' }; return bot.sendMessage(chatId, 'Avval telefon raqamingiz bilan ulaning: /start'); }
    return showPayHistory(chatId, null);
  }
  if (text === '/tolsorash') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'phone' }; return bot.sendMessage(chatId, 'Avval telefon raqamingiz bilan ulaning: /start'); }
    return showPayList(chatId, parent);
  }
  if (text === '/qarz') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'phone' }; return bot.sendMessage(chatId, 'Avval telefon raqamingiz bilan ulaning: /start'); }
    return showDebt(chatId, parent);
  }
  if (text === '/eklon') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'phone' }; return bot.sendMessage(chatId, 'Avval telefon raqamingiz bilan ulaning: /start'); }
    return showAnnouncements(chatId);
  }

  if (msg.contact && msg.contact.phone_number) {
    const parent = getLinkedParent(chatId);
    if (parent) return mainMenu(chatId, parent.full_name);
    return handlePhone(chatId, msg, msg.contact.phone_number);
  }

  const st = flowState[chatId];
  if (st && st.step === 'pay_amount') {
    const amount = Number(text.replace(/\s/g, ''));
    delete flowState[chatId];
    if (!Number.isFinite(amount) || amount <= 0) {
      return bot.sendMessage(chatId, 'Summa noto\'g\'ri. Faqat raqam kiriting, masalan: 500000');
    }
    return confirmPay(chatId, st.childId, amount);
  }
  if (st && st.step === 'phone') {
    return handlePhone(chatId, msg, text);
  }

  const parent = getLinkedParent(chatId);
  if (!parent) {
    flowState[chatId] = { step: 'phone' };
    return bot.sendMessage(chatId, 'Ulanish uchun telefon raqamingizni yuboring (masalan +998 91 123 45 67)');
  }
  return mainMenu(chatId, parent.full_name);
}

function onCallback(cb) {
  if (!bot) return;
  const chatId = cb.message && cb.message.chat.id;
  if (!chatId) return;
  const data = cb.data || '';
  bot.answerCallbackQuery(cb.id).catch(() => {});
  const parts = data.split('|');
  const cmd = parts[0];

  try {
    if (cmd === 'main') {
      const parent = getLinkedParent(chatId);
      if (parent) return mainMenu(chatId, parent.full_name);
      flowState[chatId] = { step: 'phone' };
      return bot.sendMessage(chatId, 'Ulanish uchun telefon raqamingizni yuboring.');
    }
    if (cmd === 'relink') {
      flowState[chatId] = { step: 'phone' };
      return bot.sendMessage(chatId, 'Yangi telefon raqamini yozib yuboring:');
    }
    if (cmd === 'children') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showChildren(chatId, parent);
    }
    if (cmd === 'qarz') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showDebt(chatId, parent);
    }
    if (cmd === 'eklon') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showAnnouncements(chatId);
    }
    if (cmd === 'att') return showAttendance(chatId, Number(parts[1]));
    if (cmd === 'payhist') return showPayHistory(chatId, Number(parts[1]) || null);
    if (cmd === 'pay_list') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showPayList(chatId, parent);
    }
    if (cmd === 'pay') return startPayAmount(chatId, Number(parts[1]));
    if (cmd === 'pay_cancel') {
      delete flowState[chatId];
      return bot.sendMessage(chatId, '❌ Bekor qilindi.');
    }
    if (cmd === 'pay_ok') {
      delete flowState[chatId];
      return createPayRequest(chatId, Number(parts[1]), Number(parts[2]));
    }
    if (cmd === 'sel') {
      const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(Number(parts[1]));
      if (!parent) return bot.sendMessage(chatId, 'Topilmadi.');
      linkParent(chatId, parent, cb.message.from || {});
      return mainMenu(chatId, parent.full_name);
    }
  } catch (e) {
    bot.sendMessage(chatId, '⚠️ Xatolik yuz berdi: ' + e.message).catch(() => {});
  }
}

function createPayRequest(chatId, childId, amount) {
  const parent = getLinkedParent(chatId);
  if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
  const c = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
  if (!c) return bot.sendMessage(chatId, 'Bola topilmadi.');
  const r = db.prepare(`
    INSERT INTO parent_requests (parent_id, child_id, child_name, type, text, amount, status)
    VALUES (?,?,?,?,?,?,?)
  `).run(parent.id, childId, c.full_name, 'payment', `${fmtMoney(amount)} so'm`, amount, 'yangi');
  sendGroup(`🆕 <b>To\'lov so\'rovi</b>\n👤 Ota-ona: ${parent.full_name}\n👶 Bola: ${c.full_name}\n💰 Summa: <b>${fmtMoney(amount)}</b> so\'m\n\nArizalar bo\'limida ko\'rib chiqing 📋`,
    { parse_mode: 'HTML' });
  return bot.sendMessage(chatId,
    `✅ So\'rovingiz yuborildi! (№${r.lastInsertRowid})\n\n👶 ${c.full_name}\n💰 ${fmtMoney(amount)} so\'m\n\nAdministrator tasdiqlagach, chek shu yerga yuboriladi.`);
}

/* ---------- Ochiq API (server.js dan) ---------- */

function notifyNewParent(parent) {
  sendGroup(`🆕 <b>Yangi ota-ona ro\'yxatga olindi</b>\n👤 ${parent.full_name}\n📞 ${parent.phone || '—'}`, { parse_mode: 'HTML' });
}

function notifyParentLinked(parent) {
  sendGroup(`📱 Ota-ona botga ulandi: ${parent.full_name} (${parent.phone || '—'})`);
}

function notifyPayRequestCreated(req) {
  sendGroup(`🆕 <b>To\'lov so\'rovi</b>\n👤 Ota-ona: ${req.parent_name || ''}\n👶 Bola: ${req.child_name}\n💰 Summa: <b>${fmtMoney(req.amount)}</b> so\'m`, { parse_mode: 'HTML' });
}

function notifyPayApproved(req, payment) {
  const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(req.parent_id);
  const receipt = `🧾 <b>Kvitansiya (chek)</b>\n\n` +
    `🏫 ${getSettings().site_name || 'Bog\'cha'}\n` +
    `👶 Bola: ${req.child_name}\n` +
    `💰 Summa: <b>${fmtMoney(req.amount)}</b> so\'m\n` +
    `📅 Oy: ${monthName(payment.month)}\n` +
    `🗓 Sana: ${payment.paid_date}\n` +
    `💳 Usul: Telegram\n` +
    `🧾 Raqam: ${payment.receipt_no}\n\nRahmat! 💐`;
  sendToParent(parent, receipt);
  sendGroup(`✅ <b>To\'lov tasdiqlandi</b>\n👶 Bola: ${req.child_name}\n💰 Summa: <b>${fmtMoney(req.amount)}</b> so\'m\n🧾 ${payment.receipt_no}`, { parse_mode: 'HTML' });
}

function notifyPayRejected(req) {
  const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(req.parent_id);
  sendToParent(parent,
    `❌ <b>To\'lov so\'rovi rad etildi</b>\n\n👶 Bola: ${req.child_name}\n💰 Summa: ${fmtMoney(req.amount)} so\'m\n\nBog\'cha administratori bilan bog\'lanishingiz mumkin.`);
}

function notifyPaymentConfirmed(payment, childName) {
  sendGroup(`✅ <b>To\'lov qabul qilindi</b>\n👶 Bola: ${childName}\n💰 Summa: <b>${fmtMoney(payment.amount)}</b> so\'m\n📅 ${monthName(payment.month)}${payment.receipt_no ? '\n🧾 ' + payment.receipt_no : ''}`, { parse_mode: 'HTML' });
}

function notifyAnnouncement(title, text) {
  sendGroup(`📢 <b>E\'lon: ${title}</b>\n\n${text}`, { parse_mode: 'HTML' });
  const links = db.prepare('SELECT chat_id FROM tg_links').all();
  for (const l of links) {
    bot.sendMessage(l.chat_id, `📢 <b>E\'lon: ${title}</b>\n\n${text}`, { parse_mode: 'HTML' }).catch(() => {});
  }
}

/* ---------- Avtomatik qarzdorlik eslatmalari ---------- */

let reminderTimer = null;

function checkReminder() {
  try {
    const s = getSettings();
    if ((s.reminders_enabled ?? '1') === '0') return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const hour = String(s.reminder_time || '9').padStart(2, '0');
    const today = now.toISOString().slice(0, 10);
    if (hh !== hour || s.reminder_last === today) return;

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
    setSetting('reminder_last', today);
    checkTwoMonthDebts();
    if (!debtors.length) return;

    let text = `📢 <b>To\'lov eslatmasi</b> — ${monthName(month)}\n\nQarzdor bolalar:\n`;
    for (const d of debtors.slice(0, 15)) {
      text += `• ${d.full_name} (${d.group_name || '—'}): qarzi <b>${fmtMoney(d.due)}</b> so\'m\n`;
    }
    if (debtors.length > 15) text += `\nva yana ${debtors.length - 15} ta bola...`;
    text += `\n\nIltimos to\'lovlarni amalga oshiring. Rahmat! 💐`;
    sendGroup(text, { parse_mode: 'HTML' });

    const byParent = {};
    for (const d of debtors) (byParent[d.parent_id] = byParent[d.parent_id] || []).push(d);
    for (const [pid, ds] of Object.entries(byParent)) {
      const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(pid);
      if (!parent) continue;
      const link = db.prepare('SELECT chat_id FROM tg_links WHERE parent_id = ?').get(pid);
      if (!link) continue;
      let t = `⚠️ <b>Hurmatli ${parent.full_name}!</b>\n\nTo\'lov eslatmasi (${monthName(month)}):\n`;
      for (const d of ds) t += `• ${d.full_name}: qarzi <b>${fmtMoney(d.due)}</b> so\'m\n`;
      t += `\nIltimos bog\'chaga murojaat qiling yoki bot orqali to\'lov so\'rang. Rahmat!`;
      bot.sendMessage(link.chat_id, t, { parse_mode: 'HTML' }).catch(() => {});
    }
  } catch (e) {
    console.error('[bot] eslatma xatosi:', e.message);
  }
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

function checkTwoMonthDebts() {
  const s = getSettings();
  const kids = db.prepare(`
    SELECT c.id, c.full_name, c.parent_id, c.birth_date, c.enrolled_at,
           g.fee_per_month, g.name AS group_name
    FROM children c LEFT JOIN groups g ON g.id = c.group_id
    WHERE c.status = 'active'
  `).all();
  const byParent = {};
  for (const k of kids) {
    const fee = effectiveFee(k);
    const n = unpaidMonthsCount(k, fee);
    if (n < 2) {
      setSetting('debt2_' + k.id, '0');
      continue;
    }
    const prev = Number(getSetting('debt2_' + k.id) || 0);
    if (prev >= n) continue;
    setSetting('debt2_' + k.id, String(n));
    (byParent[k.parent_id] = byParent[k.parent_id] || []).push({ child: k, n });
  }
  if (!Object.keys(byParent).length) return;

  const sname = s.site_name || 'Denov Kindergarden';
  for (const [pid, list] of Object.entries(byParent)) {
    const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(pid);
    if (!parent) continue;
    let t = `⚠️ <b>Hurmatli ${parent.full_name}!</b>\n\n${sname} bog\'chasida bolangiz uchun <b>${list[0].n} oy</b> to\'lov qilinmadi:\n`;
    for (const it of list) t += `• ${it.child.full_name}: <b>${it.n} oy</b> to\'lovsiz\n`;
    t += `\nIltimos, qarzingizni so\'ndiring. Rahmat! 💐`;
    sendGroup(`⚠️ <b>${list.length > 1 ? list.length + ' ta bola' : list[0].child.full_name}</b> uchun ${list[0].n} oy to\'lov qilinmagan (${parent.full_name})`, { parse_mode: 'HTML' });
    const link = db.prepare('SELECT chat_id FROM tg_links WHERE parent_id = ?').get(pid);
    if (link) bot.sendMessage(link.chat_id, t, { parse_mode: 'HTML' }).catch(() => {});
    for (const it of list) {
      db.prepare(`INSERT INTO notifications (parent_id, parent_name, phone, child_name, type, channel, message, status)
        VALUES (?, ?, ?, ?, 'debt2', 'telegram', ?, 'yuborildi')`)
        .run(pid, parent.full_name || '', parent.phone || '', it.child.full_name,
          `2+ oy to\'lovsiz: ${it.n} oy (${it.child.full_name})`);
    }
  }
}

function getSetting(k) {
  const r = db.prepare('SELECT value FROM settings WHERE key = ?').get(k);
  return r ? r.value : null;
}

function startReminders() {
  if (reminderTimer) clearInterval(reminderTimer);
  reminderTimer = setInterval(checkReminder, 30 * 60 * 1000);
}

/* ---------- Ishga tushirish ---------- */

function startBot() {
  const s = getSettings();
  const token = (s.tg_token || '').trim();
  if (!token) return false;
  if (bot) return true;
  try {
    bot = new TelegramBot(token, { polling: true, filepath: false });
    bot.on('message', msg => { try { onMessage(msg); } catch (e) { console.error('[bot] message xatosi:', e.message); } });
    bot.on('callback_query', cb => { try { onCallback(cb); } catch (e) { console.error('[bot] callback xatosi:', e.message); } });
    bot.on('polling_error', e => console.error('[bot] polling:', e && e.message));
    bot.getMe().then(me => {
      console.log(`Telegram bot ishga tushdi: @${me.username}`);
      bot.setMyCommands([
        { command: 'start', description: 'Boshlash / ulanish' },
        { command: 'menu', description: 'Asosiy menyu' },
        { command: 'bolalarim', description: 'Mening bolalarim' },
        { command: 'davomat', description: 'Davomatni ko\'rish' },
        { command: 'tollar', description: 'To\'lovlarim' },
        { command: 'tolsorash', description: 'To\'lov so\'rash' },
        { command: 'qarz', description: 'Qarz / to\'lov holati' },
        { command: 'eklon', description: 'Bog\'cha e\'lonlari' }
      ]).catch(() => {});
    }).catch(() => console.log('Telegram bot: getMe xatosi'));
    return true;
  } catch (e) {
    console.error('Telegram bot ishga tushmadi:', e.message);
    bot = null;
    return false;
  }
}

function stopBot() {
  if (bot) {
    try { bot.stopPolling(); } catch (e) {}
    bot = null;
  }
}

function init() {
  if (getSettings().tg_enabled === '0') return;
  startBot();
  startReminders();
}

function restart() {
  stopBot();
  if (getSettings().tg_enabled !== '0') startBot();
}

module.exports = {
  init,
  stop: stopBot,
  restart,
  notifyNewParent,
  notifyParentLinked,
  notifyPayRequestCreated,
  notifyPayApproved,
  notifyPayRejected,
  notifyPaymentConfirmed,
  notifyAnnouncement,
  getSettings,
  startBot,
  checkTwoMonthDebts,
  unpaidMonthsCount
};
