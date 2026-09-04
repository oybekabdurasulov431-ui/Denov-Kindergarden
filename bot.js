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

/* ---------- Yangi funksiyalar ---------- */

function notifyAdmin(text) {
  if (!bot) return Promise.resolve();
  const s = getSettings();
  const adminChat = s.admin_chat_id;
  if (!adminChat) return Promise.resolve();
  return bot.sendMessage(adminChat, text, { parse_mode: 'HTML' }).catch(() => {});
}

async function showProfile(chatId, parent, msgId) {
  const kids = childrenOf(parent.id, true);
  const month = currentMonth();
  let text = `👤 <b>Ota-ona profili</b>\n\n`;
  text += `📝 Ism: <b>${parent.full_name}</b>\n`;
  text += `📞 Telefon: ${parent.phone || '—'}\n`;
  text += `📧 Email: ${parent.email || '—'}\n`;
  text += `📍 Manzil: ${parent.address || '—'}\n`;
  text += `👶 Bolalar soni: <b>${kids.length}</b>\n\n`;
  if (kids.length) {
    text += `<b>Bolalaringiz:</b>\n`;
    for (const k of kids) {
      const fee = effectiveFee(k);
      const due = childDue(k.id, month);
      text += `• <b>${k.full_name}</b> — ${k.group_name || 'Guruhsiz'}\n  Oylik: ${fmtMoney(fee)} | Qarz: ${due > 0 ? fmtMoney(due) : 'Yo\'q'}\n`;
    }
  }
  const kb = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'main' }]] } };
  return editOrSend(chatId, msgId, text, kb);
}

async function showKindergartenInfo(chatId, msgId) {
  const s = getSettings();
  const text = `🏫 <b>${s.site_name || 'Denov Kindergarden'}</b>\n\n` +
    `📍 Manzil: ${s.address || 'Denov tumani'}\n` +
    `📞 Telefon: ${s.phone || '—'}\n` +
    `📧 Email: ${s.email || '—'}\n` +
    `🕐 Ish vaqti: ${s.work_hours || '08:00 - 18:00'}\n` +
    `📅 Ish kunlari: Dushanba - Juma\n\n` +
    `💰 Oylik to\'lov: 250 000 so\'m\n` +
    `👶 3 yoshgacha: 300 000 so\'m\n` +
    `👨‍👩‍👧 2+ bola: 200 000 so\'m (har biriga)\n\n` +
    `🌐 Sayt: ${s.site_url || '—'}\n`;
  const kb = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'main' }]] } };
  return editOrSend(chatId, msgId, text, kb);
}

async function showChildPhotos(chatId, parent, msgId) {
  const kids = childrenOf(parent.id, true);
  if (!kids.length) return editOrSend(chatId, msgId, 'Bolalar topilmadi.');
  const kidsWithPhoto = kids.filter(k => k.photo);
  if (!kidsWithPhoto.length) return editOrSend(chatId, msgId, '📷 Hozircha bolalaringizning rasmlari yo\'q.');
  let text = '📷 <b>Bolalarning rasmlari</b>\n\nQaysi bolaning rasmini ko\'rasiz?\n';
  const kb = kidsWithPhoto.map(k => [{ text: `📷 ${k.full_name}`, callback_data: 'photo|' + k.id }]);
  kb.push([{ text: '⬅️ Orqaga', callback_data: 'main' }]);
  return editOrSend(chatId, msgId, text, { reply_markup: { inline_keyboard: kb } });
}

async function showChildPhoto(chatId, childId) {
  const c = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
  if (!c) return bot.sendMessage(chatId, 'Bola topilmadi.');
  if (!c.photo) return bot.sendMessage(chatId, `${c.full_name} ning rasmi yo'q.`);
  const caption = `📷 <b>${c.full_name}</b>\nGuruhi: ${c.group_name || '—'}`;
  const kb = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'photos' }]] }, parse_mode: 'HTML' };
  if (c.photo.startsWith('data:') || c.photo.startsWith('/')) {
    return bot.sendPhoto(chatId, c.photo.startsWith('data:') ? Buffer.from(c.photo.split(',')[1], 'base64') : c.photo, { caption, ...kb }).catch(() => {
      bot.sendMessage(chatId, caption, kb);
    });
  }
  return bot.sendMessage(chatId, caption, kb);
}

async function showRating(chatId, msgId) {
  const rows = db.prepare('SELECT AVG(stars) as avg_stars, COUNT(*) as cnt FROM ratings').get();
  const myRatings = db.prepare('SELECT * FROM ratings WHERE parent_id = (SELECT parent_id FROM tg_links WHERE chat_id = ?) ORDER BY id DESC LIMIT 3').all(chatId);
  let text = `⭐ <b>Bog\'cha bahosi</b>\n\n`;
  text += `📊 O\'rtacha baho: <b>${rows.avg_stars ? Number(rows.avg_stars).toFixed(1) : '—'}</b> / 5\n`;
  text += `📝 Jami baholar: ${rows.cnt}\n\n`;
  if (myRatings.length) {
    text += `<b>Sizning baholaringiz:</b>\n`;
    for (const r of myRatings) {
      text += `• ${'⭐'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)} — ${r.comment || 'Izohsiz'} <i>(${(r.created_at || '').slice(0, 10)})</i>\n`;
    }
  }
  const kb = { reply_markup: { inline_keyboard: [
    [{ text: '⭐ 1', callback_data: 'rate|1' }, { text: '⭐⭐ 2', callback_data: 'rate|2' }, { text: '⭐⭐⭐ 3', callback_data: 'rate|3' }, { text: '⭐⭐⭐⭐ 4', callback_data: 'rate|4' }, { text: '⭐⭐⭐⭐⭐ 5', callback_data: 'rate|5' }],
    [{ text: '⬅️ Orqaga', callback_data: 'main' }]
  ] } };
  return editOrSend(chatId, msgId, text, kb);
}

async function submitRating(chatId, parent, stars, comment) {
  db.prepare('INSERT INTO ratings (parent_id, parent_name, stars, comment) VALUES (?, ?, ?, ?)').run(parent.id, parent.full_name, stars, comment || '');
  return bot.sendMessage(chatId, `⭐ Rahmat! Siz bog\'chaga <b>${stars}</b> baho berdingiz.\n\n${comment ? 'Izoh: ' + comment : ''}`, { parse_mode: 'HTML' });
}

async function showReminder(chatId, parent, msgId) {
  const reminders = db.prepare('SELECT * FROM bot_reminders WHERE parent_id = ? AND sent = 0 ORDER BY remind_date').all(parent.id);
  let text = `🔔 <b>Eslatmalar</b>\n\n`;
  if (reminders.length) {
    for (const r of reminders) {
      text += `• ${r.remind_type === 'payment' ? '💳 To\'lov' : '📅 Sana'}: ${r.remind_text || r.remind_date} (${r.remind_date})\n`;
    }
    text += '\n';
  } else {
    text += 'Hozircha eslatmalar yo\'q.\n\n';
  }
  const kb = { reply_markup: { inline_keyboard: [
    [{ text: '💳 To\'lov eslatma', callback_data: 'remind_add|payment' }],
    [{ text: '🎂 Tug\'ilgan kun', callback_data: 'remind_add|birthday' }],
    [{ text: '📝 Boshqa eslatma', callback_data: 'remind_add|other' }],
    [{ text: '⬅️ Orqaga', callback_data: 'main' }]
  ] } };
  return editOrSend(chatId, msgId, text, kb);
}

async function showMyAttendance(chatId, parent, msgId) {
  const kids = childrenOf(parent.id, true);
  if (!kids.length) return editOrSend(chatId, msgId, 'Bolalar topilmadi.');
  const kb = [];
  for (const k of kids) {
    kb.push([{ text: `📊 ${k.full_name}`, callback_data: `att|${k.id}` }]);
  }
  kb.push([{ text: '⬅️ Orqaga', callback_data: 'main' }]);
  return editOrSend(chatId, msgId, '📊 Qaysi bola davomatini ko\'rasiz?', { reply_markup: { inline_keyboard: kb } });
}

async function showChildProfile(chatId, parent, msgId) {
  const kids = childrenOf(parent.id, true);
  if (!kids.length) return editOrSend(chatId, msgId, 'Bolalar topilmadi.');
  const kb = [];
  for (const k of kids) {
    kb.push([{ text: `👶 ${k.full_name}`, callback_data: `cprof|${k.id}` }]);
  }
  kb.push([{ text: '⬅️ Orqaga', callback_data: 'main' }]);
  return editOrSend(chatId, msgId, '👶 Qaysi bola profilini ko\'rasiz?', { reply_markup: { inline_keyboard: kb } });
}

function showChildProfileDetail(chatId, childId, msgId) {
  const c = db.prepare(`
    SELECT c.*, g.name AS group_name, g.fee_per_month
    FROM children c LEFT JOIN groups g ON g.id = c.group_id
    WHERE c.id = ?
  `).get(childId);
  if (!c) return editOrSend(chatId, msgId, 'Bola topilmadi.');
  const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(c.parent_id);
  const month = currentMonth();
  const fee = effectiveFee(c);
  const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id=? AND month=? AND status='confirmed'").get(c.id, month).s;
  const due = Math.max(0, fee - paid);
  const totalPaid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id=? AND status='confirmed'").get(c.id).s;
  const attToday = db.prepare("SELECT status FROM attendance WHERE child_id=? AND date=?").get(c.id, new Date().toISOString().slice(0, 10));
  const attMonth = db.prepare("SELECT status, COUNT(*) cnt FROM attendance WHERE child_id=? AND substr(date,1,7)=? GROUP BY status").all(c.id, month);
  const attMap = { present: 0, absent: 0, late: 0 };
  for (const a of attMonth) if (attMap[a.status] != null) attMap[a.status] = a.cnt;

  let text = `👶 <b>${c.full_name}</b> — batafsil profil\n━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `🏫 Guruh: ${c.group_name || '—'}\n`;
  text += `📅 Tug'ilgan sana: ${c.birth_date || '—'}\n`;
  text += `📅 Qabul qilingan: ${c.enrolled_at || '—'}\n`;
  text += `📞 Telefon: ${c.phone || parent?.phone || '—'}\n`;
  text += `📍 Manzil: ${c.address || parent?.address || '—'}\n\n`;
  text += `📊 <b>Davomat (${monthName(month)}):</b>\n`;
  text += `  ✅ Kelgan: ${attMap.present} | ❌ Kelmagan: ${attMap.absent} | ⏰ Kechikkan: ${attMap.late}\n`;
  if (attToday) {
    const stMap = { present: '✅ Kelgan', absent: '❌ Kelmagan', late: '⏰ Kechikkan' };
    text += `  📅 Bugun: ${stMap[attToday.status] || attToday.status}\n`;
  }
  text += `\n💰 <b>To'lov (${monthName(month)}):</b>\n`;
  text += `  Oylik: ${fmtMoney(fee)} so'm\n`;
  text += `  To'langan: ${fmtMoney(paid)} so'm\n`;
  text += `  Qarz: ${due > 0 ? fmtMoney(due) + ' so\'m' : '✅ Yo\'q'}\n`;
  text += `\n💰 Jami to'langan: ${fmtMoney(totalPaid)} so'm\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━`;
  const kb = { reply_markup: { inline_keyboard: [
    [{ text: '📊 Davomat', callback_data: `att|${c.id}` }, { text: '💳 To\'lov tarixi', callback_data: `payhist|${c.id}` }],
    [{ text: '⬅️ Orqaga', callback_data: 'main' }]
  ] } };
  return editOrSend(chatId, msgId, text, kb);
}

async function showContact(chatId, msgId) {
  const s = getSettings();
  const site = s.site_name || 'Denov Kindergarden';
  let text = `📞 <b>Kontakt ma\'lumotlari</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `🏫 ${site}\n`;
  text += `📍 Manzil: ${s.site_address || 'Denov shahri'}\n`;
  text += `📞 Telefon: ${s.site_phone || '—'}\n`;
  text += `📧 Email: ${s.site_email || '—'}\n`;
  text += `🌐 Sayt: ${s.site_url || '—'}\n\n`;
  text += `⏰ Ish vaqti: ${s.work_time || '08:00 - 18:00'}\n`;
  text += `📅 Dush-Juma: 08:00-18:00\n`;
  text += `📅 Shanba: 09:00-13:00\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Savollaringiz bo\'lsa admin bilan chat orqali bog\'laning 💬`;
  const kb = { reply_markup: { inline_keyboard: [
    [{ text: '💬 Admin bilan chat', callback_data: 'chat_start' }],
    [{ text: '⬅️ Orqaga', callback_data: 'main' }]
  ] } };
  return editOrSend(chatId, msgId, text, kb);
}

async function showFaq(chatId, msgId) {
  let text = `❓ <b>Ko\'p beriladigan savollar (FAQ)</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `💳 <b>Qarzni qanday to\'lash mumkin?</b>\n`;
  text += `→ "To\'lov so\'rash" tugmasini bosing yoki /tolsorash\n\n`;
  text += `📊 <b>Davomatni qanday ko\'rish mumkin?</b>\n`;
  text += `→ "Bolalarim" → bola tanlang → "Davomat"\n\n`;
  text += `👶 <b>Bola profilini qanday ko\'rish?</b>\n`;
  text += `→ "Bola profili" tugmasini bosing\n\n`;
  text += `📝 <b>To\'lovlarim tarixini qanday ko\'rish?</b>\n`;
  text += `→ "To\'lovlarim" tugmasini bosing yoki /tollar\n\n`;
  text += `📢 <b>E\'lonlarni qanday o\'qish?</b>\n`;
  text += `→ "E\'lonlar" tugmasini bosing yoki /eklon\n\n`;
  text += `🔔 <b>Eslatma qo\'shish mumkinmi?</b>\n`;
  text += `→ "Eslatma" tugmasini bosing — to\'lov, tug\'ilgan kun yoki boshqa\n\n`;
  text += `💬 <b>Admin bilan qanday bog\'lanish?</b>\n`;
  text += `→ "Admin chat" tugmasini bosing yoki /chat\n\n`;
  text += `📥 <b>Hisobot olish mumkinmi?</b>\n`;
  text += `→ /export buyrug\'ini ishlating\n\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Yana savol bo\'lsa, admin chat orqali yozing! 💬`;
  const kb = { reply_markup: { inline_keyboard: [
    [{ text: '💬 Admin chat', callback_data: 'chat_start' }],
    [{ text: '⬅️ Orqaga', callback_data: 'main' }]
  ] } };
  return editOrSend(chatId, msgId, text, kb);
}

async function handleAdminChat(chatId, parent, text) {
  db.prepare('INSERT INTO chat_messages (parent_id, parent_name, chat_id, message) VALUES (?, ?, ?, ?)').run(parent.id, parent.full_name, chatId, text);
  notifyAdmin(`💬 Ota-ona xabari\n👤 ${parent.full_name}\n🆔 ${parent.phone || '—'}\n\n${text}`);
  return bot.sendMessage(chatId, '✅ Xabaringiz admin yuborildi. Javobni shu yerda olasiz.');
}

function isAdmin(chatId) {
  const s = getSettings();
  if (s.admin_chat_id && Number(s.admin_chat_id) === chatId) return true;
  return false;
}

async function showDebtors(chatId, msgId) {
  const month = currentMonth();
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
    const due = childDue(k.id, month);
    if (due > 0) {
      const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(k.parent_id);
      const unpaidN = unpaidMonthsCount(k, fee);
      debtors.push({ ...k, due, parentName: parent ? parent.full_name : '—', unpaidN });
      totalDebt += due;
    }
  }
  debtors.sort((a, b) => b.due - a.due);
  let text = `📋 QARZDORLAR — ${monthName(month)}\n━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  if (!debtors.length) {
    text += '🎉 Barcha to\'lovlar bajarilgan!\n';
  } else {
    for (const d of debtors) {
      text += `👶 ${d.full_name}\n   👤 ${d.parentName} | 🏫 ${d.group_name || '—'}\n   💰 Qarz: ${fmtMoney(d.due)} so'm`;
      if (d.unpaidN >= 2) text += ` ⚠️ (${d.unpaidN} oy!)`;
      text += '\n\n';
    }
    text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Jami qarzdorlar: ${debtors.length} ta\n`;
    text += `Jami qarz: ${fmtMoney(totalDebt)} so'm`;
  }
  const kb = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'main' }]] } };
  return editOrSend(chatId, msgId, text, kb);
}

function menuKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '👶 Mening bolalarim', callback_data: 'children' }],
        [{ text: '💳 Qarz / To\'lov', callback_data: 'qarz' }],
        [{ text: '📊 Davomatim', callback_data: 'my_att' }, { text: '👶 Bola profili', callback_data: 'child_prof' }],
        [{ text: '📜 To\'lovlarim', callback_data: 'payhist' }, { text: '📆 To\'lov tarixi', callback_data: 'tolovtarixi' }],
        [{ text: '📢 E\'lonlar', callback_data: 'eklon' }, { text: '🍽 Menyu', callback_data: 'weekly_menu' }],
        [{ text: '🔔 Eslatma', callback_data: 'remind' }, { text: '📷 Rasmlar', callback_data: 'photos' }],
        [{ text: '👤 Profilim', callback_data: 'profile' }, { text: '🏫 Bog\'cha', callback_data: 'kindergarten' }],
        [{ text: '⭐ Baho', callback_data: 'rating' }, { text: '💬 Admin chat', callback_data: 'chat_start' }],
        [{ text: '📞 Kontakt', callback_data: 'contact' }, { text: '❓ Yordam', callback_data: 'faq' }],
        [{ text: '📥 Export', callback_data: 'export' }, { text: '📋 Ota-onalar', callback_data: 'otaonalar' }],
        [{ text: '🚪 Chiqish', callback_data: 'logout' }, { text: '🔑 Boshqa raqam', callback_data: 'relink' }]
      ]
    }
  };
}

function mainMenu(chatId, name, msgId) {
  const text = `Assalomu alaykum, ${name}! 👋\n\nMenyudan kerakli bo\'limni tanlang:`;
  return editOrSend(chatId, msgId, text, menuKeyboard());
}

function sendGroup(text, opts) {
  if (!bot) return Promise.resolve();
  const s = getSettings();
  if (s.tg_enabled === '0') return Promise.resolve();
  const gid = s.tg_group;
  if (!gid) return Promise.resolve();
  return bot.sendMessage(gid, text, { disable_web_page_preview: true, ...(opts || {}) }).catch(() => {});
}

function editText(chatId, msgId, text, opts) {
  if (!bot || !msgId) return Promise.resolve();
  const base = { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', ...(opts || {}) };
  return bot.editMessageText(text, base).catch(() => bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...(opts || {}) }).catch(() => {}));
}

function editOrSend(chatId, msgId, text, opts) {
  if (msgId) return editText(chatId, msgId, text, opts);
  return bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...(opts || {}) }).catch(() => {});
}

function removeInline(chatId, msgId) {
  if (!bot || !msgId) return Promise.resolve();
  return bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: msgId }).catch(() => {});
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
      'Bu raqam ro\'yxatda topilmadi. Raqamni to\'g\'ri kiritganingizni tekshiring yoki bog\'cha administratoriga murojaat qiling.\n\nQayta urinish: /start');
  }
  if (candidates.length > 1) {
    const kb = { reply_markup: { inline_keyboard: candidates.map(p => [{ text: `${p.full_name} — ${p.phone || ''}`, callback_data: 'sel|' + p.id }]) } };
    return bot.sendMessage(chatId, 'Bir nechta moslik topildi. O\'zingizni tanlang:', kb);
  }
  const parent = candidates[0];
  linkParent(chatId, parent, msg);
  return mainMenu(chatId, parent.full_name);
}

async function handleLogin(chatId, msg, username, password) {
  const bcrypt = require('bcryptjs');
  delete flowState[chatId];
  console.log(`[bot] handleLogin: chatId=${chatId}, username=${username}`);
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) { console.log(`[bot] handleLogin: user not found: ${username}`); }
  else { console.log(`[bot] handleLogin: user found role=${user.role}`); }
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return bot.sendMessage(chatId, 'Login yoki parol noto\'g\'ri. Qayta urinib ko\'ring: /start');
  }
  if (user.role !== 'parent') {
    return bot.sendMessage(chatId, 'Bu tizim faqat ota-onalar uchun. Admin panelidan foydalaning.');
  }
  const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(user.parent_id);
  if (!parent) return bot.sendMessage(chatId, 'Ota-ona topilmadi.');
  linkParent(chatId, parent, msg);
  return mainMenu(chatId, parent.full_name);
}

async function showWeeklyMenu(chatId) {
  const today0 = new Date().toISOString().slice(0, 10);
  const start = today0;
  const endD = new Date(Date.now() + 6 * 86400000);
  const end = endD.toISOString().slice(0, 10);
  const rows = db.prepare('SELECT * FROM meals WHERE meal_date >= ? AND meal_date <= ? ORDER BY meal_date, CASE meal_type WHEN \'nonushta\' THEN 1 WHEN \'tushlik\' THEN 2 ELSE 3 END').all(start, end);
  if (!rows.length) return bot.sendMessage(chatId, '🍽 Hozircha haftalik menyu rejalashtirilmagan.');
  const days = {};
  const dayNames = ['Yak','Dush','Sesh','Chor','Pay','Jum','Shan'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() + i * 86400000);
    const ds = d.toISOString().slice(0, 10);
    days[ds] = { label: dayNames[d.getDay()], meals: [] };
  }
  for (const r of rows) {
    if (days[r.meal_date]) days[r.meal_date].meals.push(r);
  }
  let text = '🍽 <b>Haftalik ovqat menyu</b>\n\n';
  for (const [date, info] of Object.entries(days)) {
    text += `📅 <b>${info.label} (${date.slice(5)})</b>\n`;
    if (info.meals.length === 0) { text += '  — Menyu yo\'q\n'; }
    for (const m of info.meals) {
      text += `  🍴 ${m.title}${m.items ? ': ' + m.items : ''}\n`;
    }
    text += '\n';
  }
  return bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
}

async function showChildren(chatId, parent, msgId) {
  const kids = childrenOf(parent.id, true);
  if (!kids.length) {
    return editOrSend(chatId, msgId, '😕 Sizning faol bolalaringiz yo\'q. Administrator bilan bog\'laning.');
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
  return editOrSend(chatId, msgId, text, { reply_markup: { inline_keyboard: kb } });
}

async function showDebt(chatId, parent, msgId) {
  const kids = childrenOf(parent.id, true);
  if (!kids.length) return editOrSend(chatId, msgId, '😕 Sizning faol bolalaringiz yo\'q.');
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
  const kb = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'main' }]] } };
  return editOrSend(chatId, msgId, text, kb);
}

async function showAnnouncements(chatId, msgId) {
  const rows = db.prepare('SELECT * FROM announcements ORDER BY id DESC LIMIT 5').all();
  if (!rows.length) return editOrSend(chatId, msgId, '📭 Hozircha e\'lonlar yo\'q.');
  let text = '📢 <b>Bog\'cha e\'lonlari</b>\n\n';
  for (const a of rows) {
    text += `📌 <b>${a.title}</b>\n${a.text}\n<i>${(a.created_at || '').slice(0, 10)}</i>\n\n`;
  }
  const kb = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'main' }]] } };
  return editOrSend(chatId, msgId, text, kb);
}

async function showAttendance(chatId, childId, msgId) {
  const c = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
  if (!c) return editOrSend(chatId, msgId, 'Bola topilmadi.');
  const m = currentMonth();
  const a = attSummary(childId, m);
  const total = a.present + a.late + a.absent;
  let text = `📅 Davomat — <b>${c.full_name}</b>\n${monthName(m)}\n\n`;
  text += `✅ Kelgan: <b>${a.present}</b> kun\n⏰ Kechikkan: <b>${a.late}</b> kun\n❌ Kelmagan: <b>${a.absent}</b> kun\n\n`;
  text += `Jami qayd: ${total} kun`;
  const kb = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'children' }]] } };
  return editOrSend(chatId, msgId, text, kb);
}

async function showPayHistory(chatId, childId, msgId) {
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
    return editOrSend(chatId, msgId, text, kb);
  }

  const parent = getLinkedParent(chatId);
  if (!parent) return bot.sendMessage(chatId, 'Avval telefon raqamingiz bilan ulaning: /start');
  const kids = childrenOf(parent.id, false);
  if (!kids.length) return editOrSend(chatId, msgId, 'Bolalar topilmadi.');
  let text = '📜 <b>To\'lovlar tarixi</b>\n\nQaysi bolaning to\'lovlarini ko\'rasiz?';
  const kb = { reply_markup: { inline_keyboard: kids.map(k => [{ text: k.full_name, callback_data: 'payhist|' + k.id }]).concat([[{ text: '⬅️ Orqaga', callback_data: 'main' }]]) } };
  return editOrSend(chatId, msgId, text, kb);
}

async function showPayList(chatId, parent, msgId) {
  const kids = childrenOf(parent.id, true);
  if (!kids.length) return editOrSend(chatId, msgId, '😕 Sizning faol bolalaringiz yo\'q.');
  let text = '💰 <b>To\'lov so\'rashi</b>\n\nBolasini tanlang:';
  const kb = { reply_markup: { inline_keyboard: kids.map(k => [{ text: k.full_name, callback_data: 'pay|' + k.id }]).concat([[{ text: '⬅️ Orqaga', callback_data: 'main' }]]) } };
  return editOrSend(chatId, msgId, text, kb);
}

async function startPayAmount(chatId, childId, month) {
  const c = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
  if (!c) return bot.sendMessage(chatId, 'Bola topilmadi.');
  flowState[chatId] = { step: 'pay_amount', childId, childName: c.full_name, payMonth: month || currentMonth() };
  const kb = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Bekor qilish', callback_data: 'main' }]] } };
  return editOrSend(chatId, null,
    `💰 To'lov so'rashi — <b>${c.full_name}</b>\n📅 Oy: <b>${monthName(flowState[chatId].payMonth)}</b>\n\nSummani so'mda yozib yuboring.\nMisol: <code>500000</code>`,
    { parse_mode: 'HTML', ...kb });
}

function selectPayMonth(chatId, childId) {
  const now = new Date();
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.toISOString().slice(0, 7);
    months.push(m);
  }
  const kb = months.map(m => [{ text: monthName(m), callback_data: `pay_month|${childId}|${m}` }]);
  kb.push([{ text: '⬅️ Orqaga', callback_data: 'pay_list' }]);
  return editOrSend(chatId, null, '📅 Qaysi oyga to\'lovo\'tirasiz?', { reply_markup: { inline_keyboard: kb } });
}

async function confirmPay(chatId, childId, amount, month) {
  const parent = getLinkedParent(chatId);
  if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
  const c = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
  if (!c) return bot.sendMessage(chatId, 'Bola topilmadi.');
  const kb = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Tasdiqlash', callback_data: `pay_ok|${childId}|${amount}|${month}` }],
        [{ text: '❌ Bekor qilish', callback_data: 'main' }]
      ]
    }
  };
  return bot.sendMessage(chatId,
    `Tasdiqlaysizmi?\n\n👶 Bola: <b>${c.full_name}</b>\n📅 Oy: <b>${monthName(month)}</b>\n💰 Summa: <b>${fmtMoney(amount)}</b> so'm`,
    { parse_mode: 'HTML', ...kb });
}

/* ---------- Xabarlar ---------- */

async function onMessage(msg) {
  if (!bot) return;
  if (msg.chat.type !== 'private') return;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  try {
  if (text === '/start' || text === '/menu' || text === 'menu') {
    delete flowState[chatId];
    const parent = getLinkedParent(chatId);
    if (parent) return mainMenu(chatId, parent.full_name);
    flowState[chatId] = { step: 'login' };
    const kb = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔑 Login va parol bilan kirish', callback_data: 'login_method' }],
          [{ text: '📲 Telefon raqam bilan kirish', callback_data: 'phone_method' }]
        ]
      }
    };
    return bot.sendMessage(chatId,
      '👋 Xush kelibsiz!\n\nBog\'cha boshqaruv tizimiga kirish uchun usulni tanlang:',
      { parse_mode: 'HTML', ...kb });
  }

  if (text === '/help') {
    return bot.sendMessage(chatId,
      '📖 <b>Buyruqlar ro\'yxati</b>\n\n' +
      '/start — Bosh menyu\n' +
      '/bolalarim — Bolalar ro\'yxati\n' +
      '/davomat — Davomat ko\'rish\n' +
      '/qarz — Qarz holati\n' +
      '/tollar — To\'lovlar tarixi\n' +
      '/tolsorash — To\'lov so\'rash\n' +
      '/profil — Shaxsiy profil\n' +
      '/bogcha — Bog\'cha haqida\n' +
      '/rasm — Bolalar rasmlari\n' +
      '/reyting — Bog\'chani baholash\n' +
      '/chat — Admin bilan chat\n' +
      '/eslatma — Eslatma sozlash\n' +
      '/menyu — Haftalik menyu\n' +
      '/eklon — E\'lonlar\n' +
      '/tolovtarixi — To\'lov tarixi (oylik)\n' +
      '/otaonalar — Ota-onalar ro\'yxati\n' +
      '/xabar — Ommaviy xabar (admin)\n' +
      '/help — Yordam',
      { parse_mode: 'HTML' });
  }

  if (text === '/menyu') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'login' }; return bot.sendMessage(chatId, 'Avval tizimga kirin: /start'); }
    return showWeeklyMenu(chatId);
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

  if (text === '/profil') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'login' }; return bot.sendMessage(chatId, 'Avval tizimga kirin: /start'); }
    return showProfile(chatId, parent);
  }
  if (text === '/bogcha') {
    return showKindergartenInfo(chatId);
  }
  if (text === '/rasm') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'login' }; return bot.sendMessage(chatId, 'Avval tizimga kirin: /start'); }
    return showChildPhotos(chatId, parent);
  }
  if (text === '/reyting') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'login' }; return bot.sendMessage(chatId, 'Avval tizimga kirin: /start'); }
    return showRating(chatId);
  }
  if (text === '/eslatma') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'login' }; return bot.sendMessage(chatId, 'Avval tizimga kirin: /start'); }
    return showReminder(chatId, parent);
  }
  if (text === '/chat') {
    const parent = getLinkedParent(chatId);
    if (!parent) { flowState[chatId] = { step: 'login' }; return bot.sendMessage(chatId, 'Avval tizimga kirin: /start'); }
    flowState[chatId] = { step: 'admin_chat' };
    return bot.sendMessage(chatId, '💬 Admin bilan chat. Xabaringizni yozing.');
  }
  if (text === '/qarzdorlar') {
    return showDebtors(chatId);
  }
  if (text === '/export') {
    return showExport(chatId);
  }
  if (text === '/chiqish') {
    db.prepare('DELETE FROM tg_links WHERE chat_id = ?').run(chatId);
    delete flowState[chatId];
    return bot.sendMessage(chatId, '👋 Tizimdan chiqildi. Qayta kirish uchun /start ni bosing.');
  }
  if (text === '/davomat') {
    const parent = getLinkedParent(chatId);
    if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
    return showMyAttendance(chatId, parent);
  }
  if (text === '/menyu') {
    return showWeeklyMenu(chatId);
  }
  if (text === '/kontakt') {
    return showContact(chatId);
  }
  if (text === '/faq') {
    return showFaq(chatId);
  }

  if (text === '/xabar') {
    if (!isAdminUser(chatId)) return bot.sendMessage(chatId, '⚠️ Bu buyruq faqat admin/operator uchun.');
    flowState[chatId] = { step: 'broadcast' };
    return bot.sendMessage(chatId, '📢 Ommaviy xabar matnini yozing:\n\nBarcha ulangan ota-onalarga yuboriladi.');
  }
  if (text === '/otaonalar') {
    return showParentsList(chatId);
  }
  if (text === '/tolovtarixi') {
    return showPayHistoryByMonth(chatId);
  }

  if (msg.contact && msg.contact.phone_number) {
    const parent = getLinkedParent(chatId);
    if (parent) return mainMenu(chatId, parent.full_name);
    return handlePhone(chatId, msg, msg.contact.phone_number);
  }

  if (msg.photo && msg.photo.length) {
    return handlePhotoUpload(chatId, msg);
  }

  const st = flowState[chatId];
  if (st && st.step === 'login_username') {
    flowState[chatId] = { step: 'login_password', username: text };
    return bot.sendMessage(chatId, '🔑 Parolni kiriting:', { reply_markup: { inline_keyboard: [[{ text: '❌ Bekor qilish', callback_data: 'cancel_login' }]] } });
  }
  if (st && st.step === 'login_password') {
    return handleLogin(chatId, msg, st.username, text);
  }
  if (st && st.step === 'pay_amount') {
    const amount = Number(text.replace(/\s/g, ''));
    const payMonth = st.payMonth || currentMonth();
    delete flowState[chatId];
    if (!Number.isFinite(amount) || amount <= 0) {
      return bot.sendMessage(chatId, 'Summa noto\'g\'ri. Faqat raqam kiriting, masalan: 500000');
    }
    return confirmPay(chatId, st.childId, amount, payMonth);
  }
  if (st && st.step === 'phone') {
    return handlePhone(chatId, msg, text);
  }
  if (st && st.step === 'admin_chat') {
    const parent = getLinkedParent(chatId);
    if (parent) {
      delete flowState[chatId];
      return handleAdminChat(chatId, parent, text);
    }
  }
  if (st && st.step === 'rating_comment') {
    const parent = getLinkedParent(chatId);
    if (parent) {
      const stars = st.stars;
      delete flowState[chatId];
      return submitRating(chatId, parent, stars, text);
    }
  }
  if (st && st.step === 'remind_date') {
    const parent = getLinkedParent(chatId);
    if (parent) {
      const type = st.remind_type;
      const dateMatch = text.match(/^(\d{4}-\d{2}-\d{2})$/);
      if (!dateMatch) {
        return bot.sendMessage(chatId, '⚠️ Sana noto\'g\'ri. Format: YYYY-MM-DD (masalan: 2026-09-01)');
      }
      const chatIdVal = chatId;
      db.prepare('INSERT INTO bot_reminders (parent_id, chat_id, remind_type, remind_text, remind_date) VALUES (?, ?, ?, ?, ?)').run(parent.id, chatIdVal, type, '', dateMatch[1]);
      delete flowState[chatId];
      return bot.sendMessage(chatId, `✅ Eslatma o'rnatildi: ${dateMatch[1]}`);
    }
  }
  if (st && st.step === 'broadcast') {
    delete flowState[chatId];
    if (text === '/bekor') return bot.sendMessage(chatId, '❌ Bekor qilindi.');
    return handleBroadcast(chatId, text);
  }

  const parent = getLinkedParent(chatId);
  if (!parent) {
    flowState[chatId] = { step: 'phone' };
    return bot.sendMessage(chatId, 'Ulanish uchun telefon raqamingizni yuboring (masalan +998 91 123 45 67)');
  }
  return mainMenu(chatId, parent.full_name);
  } catch(e) { console.error('[bot] onMessage xatosi:', e.message); }
}

async function onCallback(cb) {
  if (!bot) return;
  const chatId = cb.message && cb.message.chat.id;
  if (!chatId) return;
  const msgId = cb.message && cb.message.message_id;
  const data = cb.data || '';
  bot.answerCallbackQuery(cb.id).catch(() => {});
  const parts = data.split('|');
  const cmd = parts[0];

  try {
    if (cmd === 'login_method') {
      flowState[chatId] = { step: 'login_username' };
      return editOrSend(chatId, msgId, '🔑 Login kiriting:', { reply_markup: { inline_keyboard: [[{ text: '❌ Bekor qilish', callback_data: 'cancel_login' }]] } });
    }
    if (cmd === 'phone_method') {
      flowState[chatId] = { step: 'phone' };
      const kb = {
        reply_markup: {
          keyboard: [[{ text: '📲 Telefon raqamni yuborish', request_contact: true }]],
          resize_keyboard: true, one_time_keyboard: true
        }
      };
      return bot.sendMessage(chatId, 'Telefon raqamingizni yoki kontaktini yuboring:', kb);
    }
    if (cmd === 'cancel_login') {
      delete flowState[chatId];
      return editOrSend(chatId, msgId, 'Kirish bekor qilindi. Qayta boshlash: /start');
    }
    if (cmd === 'main') {
      const parent = getLinkedParent(chatId);
      if (parent) return mainMenu(chatId, parent.full_name, msgId);
      flowState[chatId] = { step: 'login' };
      return editOrSend(chatId, msgId, 'Tizimga kirish uchun /start bosing.');
    }
    if (cmd === 'logout') {
      db.prepare('DELETE FROM tg_links WHERE chat_id = ?').run(chatId);
      delete flowState[chatId];
      return editOrSend(chatId, msgId, '👋 Tizimdan chiqildi.\n\nQayta kirish uchun /start ni bosing.');
    }
    if (cmd === 'relink') {
      flowState[chatId] = { step: 'phone' };
      return editOrSend(chatId, msgId, 'Yangi telefon raqamini yozib yuboring:');
    }
    if (cmd === 'children') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showChildren(chatId, parent, msgId);
    }
    if (cmd === 'qarz') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showDebt(chatId, parent, msgId);
    }
    if (cmd === 'eklon') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showAnnouncements(chatId, msgId);
    }
    if (cmd === 'att') return showAttendance(chatId, Number(parts[1]), msgId);
    if (cmd === 'payhist') return showPayHistory(chatId, Number(parts[1]) || null, msgId);
    if (cmd === 'pay_list') {
      return editOrSend(chatId, msgId, '❌ To\'lov so\'rashi o\'chirilgan. To\'lov uchun bog\'chaga murojaat qiling.');
    }
    if (cmd === 'pay') return selectPayMonth(chatId, Number(parts[1]));
    if (cmd === 'pay_month') return startPayAmount(chatId, Number(parts[1]), parts[2]);
    if (cmd === 'pay_cancel') {
      delete flowState[chatId];
      return editOrSend(chatId, msgId, '❌ Bekor qilindi.');
    }
    if (cmd === 'pay_ok') {
      delete flowState[chatId];
      return createPayRequest(chatId, Number(parts[1]), Number(parts[2]), parts[3]);
    }
    if (cmd === 'sel') {
      const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(Number(parts[1]));
      if (!parent) return bot.sendMessage(chatId, 'Topilmadi.');
      linkParent(chatId, parent, cb.message.from || {});
      return mainMenu(chatId, parent.full_name, msgId);
    }
    if (cmd === 'profile') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showProfile(chatId, parent, msgId);
    }
    if (cmd === 'kindergarten') return showKindergartenInfo(chatId, msgId);
    if (cmd === 'photos') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showChildPhotos(chatId, parent, msgId);
    }
    if (cmd === 'photo') return showChildPhoto(chatId, Number(parts[1]));
    if (cmd === 'rating') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showRating(chatId, msgId);
    }
    if (cmd === 'rate') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      const stars = Number(parts[1]) || 5;
      const kb = { reply_markup: { inline_keyboard: [
        [{ text: 'Yozish', callback_data: 'rate_comment|' + stars }],
        [{ text: 'Izohsiz', callback_data: 'rate_skip|' + stars }]
      ] } };
      return editOrSend(chatId, msgId, `⭐ ${stars} baho tanlandi. Izoh yozasizmi?`, kb);
    }
    if (cmd === 'rate_comment') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      flowState[chatId] = { step: 'rating_comment', stars: Number(parts[1]) || 5 };
      return editOrSend(chatId, msgId, '📝 Izohingizni yozing:');
    }
    if (cmd === 'rate_skip') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return submitRating(chatId, parent, Number(parts[1]) || 5, '');
    }
    if (cmd === 'remind') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showReminder(chatId, parent, msgId);
    }
    if (cmd === 'remind_add') {
      const type = parts[1] || 'payment';
      flowState[chatId] = { step: 'remind_date', remind_type: type };
      const typeNames = { payment: '💳 To\'lov eslatma', birthday: '🎂 Tug\'ilgan kun', other: '📝 Boshqa eslatma' };
      return editOrSend(chatId, msgId, `${typeNames[type] || 'Eslatma'}\n\n📅 Eslatma sanasini kiriting (YYYY-MM-DD):\nMasalan: 2026-09-01`);
    }
    if (cmd === 'chat_start') {
      const parent = getLinkedParent(chatId);
      if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      flowState[chatId] = { step: 'admin_chat' };
      return editOrSend(chatId, msgId, '💬 Admin bilan chat. Xabaringizni yozing:');
    }
    if (cmd === 'qarzdorlar') return showDebtors(chatId, msgId);
    if (cmd === 'weekly_menu') return showWeeklyMenu(chatId);
    if (cmd === 'my_att') {
      const p = getLinkedParent(chatId);
      if (!p) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showMyAttendance(chatId, p, msgId);
    }
    if (cmd === 'child_prof') {
      const p = getLinkedParent(chatId);
      if (!p) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      return showChildProfile(chatId, p, msgId);
    }
    if (cmd === 'cprof') return showChildProfileDetail(chatId, Number(parts[1]), msgId);
    if (cmd === 'contact') return showContact(chatId, msgId);
    if (cmd === 'faq') return showFaq(chatId, msgId);
    if (cmd === 'export') return showExport(chatId);
    if (cmd === 'otaonalar') return showParentsList(chatId);
    if (cmd === 'tolovtarixi') return showPayHistoryByMonth(chatId);
    if (cmd === 'upload_photo') {
      const p = getLinkedParent(chatId);
      if (!p) return bot.sendMessage(chatId, 'Avval ulaning: /start');
      flowState[chatId] = { step: 'upload_photo', childId: Number(parts[1]) };
      const c = db.prepare('SELECT full_name FROM children WHERE id = ?').get(Number(parts[1]));
      return editOrSend(chatId, msgId, `📷 <b>${c ? c.full_name : 'Bola'}</b> uchun rasm yuboring.\n\n/form yoki /bekor — bekor qilish`);
    }
  } catch (e) {
    bot.sendMessage(chatId, '⚠️ Xatolik yuz berdi: ' + e.message).catch(() => {});
  }
}

function createPayRequest(chatId, childId, amount, month) {
  const parent = getLinkedParent(chatId);
  if (!parent) return bot.sendMessage(chatId, 'Avval ulaning: /start');
  const c = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
  if (!c) return bot.sendMessage(chatId, 'Bola topilmadi.');
  const payMonth = month || currentMonth();
  const r = db.prepare(`
    INSERT INTO parent_requests (parent_id, child_id, child_name, type, text, amount, month, status)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(parent.id, childId, c.full_name, 'payment', `${fmtMoney(amount)} so'm (${monthName(payMonth)})`, amount, payMonth, 'yangi');
  sendGroup(`🆕 To'lov so'rovi\n👤 ${parent.full_name}\n👶 ${c.full_name}\n📅 Oy: ${monthName(payMonth)}\n💰 ${fmtMoney(amount)} so'm\n\nArizalar bo'limida ko'rib chiqing`);
  const reply =
    `✅ So'rovingiz yuborildi! (№${r.lastInsertRowid})\n\n` +
    `👶  ${c.full_name}\n` +
    `📅  ${monthName(payMonth)}\n` +
    `💰  ${fmtMoney(amount)} so'm\n\n` +
    `Administrator tasdiqlagach, chek shu yerga yuboriladi.`;
  return bot.sendMessage(chatId, reply);
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
  const site = getSettings().site_name || 'Denov Kindergarden';
  const receipt =
    `╔══════════════════════╗\n` +
    `║  🧾 KVITANSIYA (CHEK) ║\n` +
    `╚══════════════════════╝\n\n` +
    `🏫  ${site}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👶  Bola:     ${req.child_name}\n` +
    `💰  Summa:    ${fmtMoney(req.amount)} so'm\n` +
    `📅  Oy:       ${monthName(payment.month)}\n` +
    `🗓  Sana:     ${payment.paid_date}\n` +
    `💳  Usul:     Telegram\n` +
    `🧾  Raqam:    ${payment.receipt_no}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Rahmat! 💐\n@${site.replace(/\s/g, '_')}`;
  sendToParent(parent, receipt);
  sendGroup(`✅ To'lov tasdiqlandi\n👶 ${req.child_name}\n💰 ${fmtMoney(req.amount)} so'm\n🧾 ${payment.receipt_no}`);
}

function notifyPayRejected(req) {
  const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(req.parent_id);
  sendToParent(parent,
    `❌ To'lov so'rovi rad etildi\n\n👶 ${req.child_name}\n💰 ${fmtMoney(req.amount)} so'm\n\nBog'cha administratori bilan bog'lanishingiz mumkin.`);
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

function checkBirthdays() {
  try {
    const s = getSettings();
    const today = new Date().toISOString().slice(0, 10);
    const todayMD = today.slice(5);
    const key = 'birthday_sent_' + today;
    if (getSetting(key)) return;
    const kids = db.prepare(`
      SELECT c.id, c.full_name, c.parent_id, c.birth_date,
             g.name AS group_name
      FROM children c LEFT JOIN groups g ON g.id = c.group_id
      WHERE c.status = 'active' AND c.birth_date IS NOT NULL AND c.birth_date != ''
    `).all();
    const birthdayKids = kids.filter(k => k.birth_date && k.birth_date.slice(5) === todayMD);
    if (!birthdayKids.length) return;
    for (const k of birthdayKids) {
      const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(k.parent_id);
      const link = parent ? db.prepare('SELECT chat_id FROM tg_links WHERE parent_id = ?').get(parent.id) : null;
      const sname = s.site_name || 'Denov Kindergarden';
      const age = k.birth_date ? Math.floor((Date.now() - new Date(k.birth_date).getTime()) / 365.25 / 86400000) : '?';
      const msg = `🎂 TUG'ILGAN KUN MUBORAK!\n\n` +
        `🎈 Hurmatli ${parent ? parent.full_name : 'Ota-ona'}, bolangiz\n` +
        `👶 <b>${k.full_name}</b> bugun ${age} yoshga kirdi!\n` +
        `🏫 Guruh: ${k.group_name || '—'}\n\n` +
        `Bog'chamiz jamoasi bilan tabriklaymiz! 🎉\n` +
        `${sname} 💐`;
      if (link) {
        bot.sendMessage(link.chat_id, msg, { parse_mode: 'HTML' }).catch(() => {});
      }
      sendGroup(`🎂 Bugun tug'ilgan kun: <b>${k.full_name}</b> (${k.group_name || '—'}), ${age} yosh! Tabriklaymiz! 🎉`, { parse_mode: 'HTML' });
    }
    setSetting(key, '1');
  } catch (e) {
    console.error('[bot] birthday xatosi:', e.message);
  }
}

function checkMonthEndReminder() {
  try {
    const s = getSettings();
    const now = new Date();
    const day = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remaining = daysInMonth - day;
    const key = 'month_end_reminder_' + now.toISOString().slice(0, 7);
    if (getSetting(key)) return;
    if (remaining > 3) return;
    const month = currentMonth();
    const kids = db.prepare(`
      SELECT c.id, c.full_name, c.parent_id,
             g.fee_per_month, g.name AS group_name
      FROM children c LEFT JOIN groups g ON g.id = c.group_id
      WHERE c.status = 'active'
    `).all();
    const debtors = [];
    for (const k of kids) {
      const fee = effectiveFee(k);
      const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id=? AND month=? AND status='confirmed'").get(k.id, month).s;
      if (paid < fee) debtors.push({ ...k, due: fee - paid });
    }
    if (!debtors.length) return;
    const sname = s.site_name || 'Denov Kindergarden';
    const msg = `🔔 OY OXIRI ESLATMASI — ${monthName(month)}\n\n` +
      `📅 Oy tugashiga <b>${remaining} kun</b> qoldi.\n` +
      `⚠️ Hali to'lov qilmagan ota-onalar soni: <b>${debtors.length}</b>\n\n` +
      `Barcha ota-onalarga to'lov eslatmasi yuborildi.`;
    sendGroup(msg, { parse_mode: 'HTML' });
    const byParent = {};
    for (const d of debtors) (byParent[d.parent_id] = byParent[d.parent_id] || []).push(d);
    for (const [pid, ds] of Object.entries(byParent)) {
      const parent = db.prepare('SELECT * FROM parents WHERE id = ?').get(pid);
      if (!parent) continue;
      const link = db.prepare('SELECT chat_id FROM tg_links WHERE parent_id = ?').get(pid);
      if (!link) continue;
      let t = `🔔 Hurmatli ${parent.full_name}!\n\n`;
      t += `${sname} — oy oxiri eslatmasi\n`;
      t += `📅 Oy tugashiga ${remaining} kun qoldi\n\n`;
      t += `To'lovi qarzdor bolalar:\n`;
      for (const d of ds) t += `• ${d.full_name}: ${fmtMoney(d.due)} so'm\n`;
      t += `\nIltimos, to'lovlarni amalga oshiring. Rahmat! 💐`;
      bot.sendMessage(link.chat_id, t, { parse_mode: 'HTML' }).catch(() => {});
    }
    setSetting(key, '1');
  } catch (e) {
    console.error('[bot] month-end reminder xatosi:', e.message);
  }
}

function showExport(chatId) {
  const month = currentMonth();
  const today = new Date().toISOString().slice(0, 10);
  const totalKids = db.prepare("SELECT COUNT(*) c FROM children WHERE status='active'").get().c;
  const fee = db.prepare(`
    SELECT IFNULL(SUM(CASE WHEN g.fee_per_month IS NOT NULL THEN g.fee_per_month ELSE 250000 END), 0) s
    FROM children c LEFT JOIN groups g ON g.id = c.group_id WHERE c.status='active'
  `).get().s;
  const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE month=? AND status='confirmed'").get(month).s;
  const expenses = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM expenses WHERE substr(expense_date,1,7)=?").get(month).s;
  const debtors = db.prepare(`
    SELECT COUNT(*) c FROM children c
    LEFT JOIN (SELECT child_id, SUM(amount) t FROM payments WHERE month=? AND status='confirmed' GROUP BY child_id) p ON p.child_id=c.id
    WHERE c.status='active' AND IFNULL(p.t, 0) < 250000
  `).get(month).c;
  const present = db.prepare("SELECT COUNT(*) c FROM attendance WHERE date=? AND status='present'").get(today).c;
  const absent = db.prepare("SELECT COUNT(*) c FROM attendance WHERE date=? AND status='absent'").get(today).c;
  const announcements = db.prepare('SELECT COUNT(*) c FROM announcements').get().c;
  let text = `📥 EKSPORT HISOBOTI\n━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📅 Sana: ${today}\n📆 Oy: ${monthName(month)}\n\n`;
  text += `👶 Jami bolalar: ${totalKids}\n`;
  text += `✅ Bugun kelgan: ${present}\n`;
  text += `❌ Bugun kelmagan: ${absent}\n\n`;
  text += `💰 To'lov (jami kerak): ${fmtMoney(fee)} so'm\n`;
  text += `✅ To'langan: ${fmtMoney(paid)} so'm\n`;
  text += `❌ Qarz: ${fmtMoney(fee - paid)} so'm\n`;
  text += `👥 Qarzdorlar: ${debtors} ta\n\n`;
  text += `💸 Xarajatlar: ${fmtMoney(expenses)} so'm\n`;
  text += `📈 Foyda: ${fmtMoney(paid - expenses)} so'm\n`;
  text += `📢 E'lonlar: ${announcements} ta\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━`;
  bot.sendMessage(chatId, text).catch(() => {});
}

async function checkReminder() {
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
    checkBirthdays();
    checkMonthEndReminder();
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

    // SMS yuborish — agar sms_enabled bo'lsa
    if ((s.sms_enabled ?? '0') === '1' && (s.sms_pay_remind ?? '0') === '1') {
      const apiKey = (s.sms_api_key || '').trim();
      if (apiKey) {
        const https = require('https');
        const insSms = db.prepare('INSERT INTO sms_log (phone, message, status) VALUES (?,?,?)');
        for (const d of debtors) {
          if (!d.parent_id) continue;
          const pr = db.prepare('SELECT full_name, phone FROM parents WHERE id = ?').get(d.parent_id);
          if (!pr || !pr.phone) continue;
          const fee = effectiveFee(d);
          const paid = db.prepare("SELECT IFNULL(SUM(amount),0) s FROM payments WHERE child_id = ? AND month = ? AND status = 'confirmed'").get(d.id, month).s;
          const due = fee - paid;
          if (due <= 0) continue;
          const sname = s.site_name || 'Denov Kindergarden';
          const msg = `Hurmatli ${pr.full_name}! ${sname} bog'chasida bolangiz ${d.full_name} uchun ${month} oy to'lov qarzi: ${fmtMoney(due)} so'm. Iltimos to'lovni amalga oshiring.`;
          try {
            const p = String(pr.phone).replace(/[^0-9]/g, '');
            const phone = p.length === 9 ? '998' + p : p;
            const postData = `api_key=${encodeURIComponent(apiKey)}&phone=${encodeURIComponent(phone)}&message=${encodeURIComponent(msg)}&priority=normal`;
            const result = await new Promise((resolve, reject) => {
              const r = https.request('https://smsapi.uz/v1/send.php', {
                method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) }
              }, resp => { let body = ''; resp.on('data', c => body += c); resp.on('end', () => resolve(body)); });
              r.on('error', reject);
              r.write(postData);
              r.end();
            });
            let ok = false;
            try { const j = JSON.parse(result); ok = !!j.success; } catch (e) {}
            insSms.run(pr.phone, msg, ok ? 'yuborildi' : 'xato');
          } catch (e) {
            insSms.run(pr.phone, msg, 'xato');
          }
        }
      }
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
  reminderTimer = setInterval(() => {
    checkReminder();
    checkBirthdays();
    checkMonthEndReminder();
  }, 30 * 60 * 1000);
}

/* ---------- Ommaviy xabar (broadcast) ---------- */

function isAdminUser(chatId) {
  const s = getSettings();
  if (s.admin_chat_id && Number(s.admin_chat_id) === chatId) return true;
  const link = db.prepare('SELECT parent_id FROM tg_links WHERE chat_id = ?').get(chatId);
  if (!link) return false;
  const user = db.prepare("SELECT role FROM users WHERE parent_id = ?").get(link.parent_id);
  return user && (user.role === 'admin' || user.role === 'operator');
}

async function handleBroadcast(chatId, text) {
  const links = db.prepare('SELECT chat_id, parent_id FROM tg_links').all();
  if (!links.length) return bot.sendMessage(chatId, '⚠️ Hech qandai ulangan ota-ona topilmadi.');
  let sent = 0, failed = 0;
  for (const l of links) {
    try {
      await bot.sendMessage(l.chat_id, `📢 <b>Bog\'cha xabari</b>\n\n${text}`, { parse_mode: 'HTML' });
      sent++;
    } catch (e) { failed++; }
  }
  return bot.sendMessage(chatId, `✅ Xabar yuborildi!\n📤 Yuborilgan: ${sent}\n❌ Yetib bermagan: ${failed}`);
}

function showParentsList(chatId) {
  const links = db.prepare(`
    SELECT t.chat_id, t.parent_id, t.first_name, t.username, p.full_name, p.phone
    FROM tg_links t
    JOIN parents p ON p.id = t.parent_id
    ORDER BY p.full_name
  `).all();
  if (!links.length) return editOrSend(chatId, null, '📋 Hozircha hech qandai ota-ona botga ulanmagan.');
  let text = `📋 <b>Ulangan ota-onalar</b> (${links.length} ta)\n━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  for (let i = 0; i < links.length; i++) {
    const l = links[i];
    text += `${i+1}. 👤 <b>${l.full_name}</b>\n   📞 ${l.phone || '—'}`;
    if (l.first_name) text += ` | 🆔 @${l.first_name}`;
    text += '\n';
  }
  text += `\n━━━━━━━━━━━━━━━━━━━━━━━\nJami: ${links.length} ta ota-ona ulangan`;
  return editOrSend(chatId, null, text, { reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'main' }]] } });
}

function showPayHistoryByMonth(chatId) {
  const month = currentMonth();
  const rows = db.prepare(`
    SELECT pay.month, pay.amount, pay.method, pay.status, pay.receipt_no, c.full_name AS child_name
    FROM payments pay
    JOIN children c ON c.id = pay.child_id
    ORDER BY pay.month DESC, pay.id DESC
    LIMIT 30
  `).all();
  if (!rows.length) return editOrSend(chatId, null, '📜 Hozircha to\'lovlar yo\'q.');
  const grouped = {};
  for (const r of rows) {
    if (!grouped[r.month]) grouped[r.month] = [];
    grouped[r.month].push(r);
  }
  let text = `📜 <b>To\'lov tarixi (oylik)</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  for (const [m, pays] of Object.entries(grouped).slice(0, 6)) {
    const total = pays.reduce((s, p) => s + p.amount, 0);
    text += `📆 <b>${monthName(m)}</b> — Jami: ${fmtMoney(total)} so'm\n`;
    for (const p of pays.slice(0, 10)) {
      text += `  • ${p.child_name}: ${fmtMoney(p.amount)} so'm ${p.status === 'confirmed' ? '✅' : '⏳'}`;
      if (p.receipt_no) text += ` · ${p.receipt_no}`;
      text += '\n';
    }
    if (pays.length > 10) text += `  ... va yana ${pays.length - 10} ta\n`;
    text += '\n';
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━`;
  return editOrSend(chatId, null, text, { reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'main' }]] } });
}

/* ---------- Botga rasm yuklash ---------- */

function handlePhotoUpload(chatId, msg) {
  const st = flowState[chatId];
  if (!st || st.step !== 'upload_photo') return;
  const photo = msg.photo;
  if (!photo || !photo.length) return bot.sendMessage(chatId, '📷 Rasm yuboring yoki /bekor qiling.');
  const fileId = photo[photo.length - 1].file_id;
  const childId = st.childId;
  db.prepare("UPDATE children SET photo = ? WHERE id = ?").run(fileId, childId);
  delete flowState[chatId];
  const c = db.prepare('SELECT full_name FROM children WHERE id = ?').get(childId);
  return bot.sendMessage(chatId, `✅ Rasm yuklandi — <b>${c ? c.full_name : 'Bola'}</b>`, { parse_mode: 'HTML' });
}

/* ---------- Ishga tushirish ---------- */

function startBot() {
  const s = getSettings();
  const token = (s.tg_token || '').trim();
  if (!token) return false;
  if (bot) return true;
  try {
    bot = new TelegramBot(token, { polling: true, filepath: false });
    bot.on('message', msg => { onMessage(msg).catch(e => console.error('[bot] message xatosi:', e.message)); });
    bot.on('callback_query', cb => { onCallback(cb).catch(e => console.error('[bot] callback xatosi:', e.message)); });
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
        { command: 'qarzdorlar', description: 'Barcha qarzdorlar' },
        { command: 'export', description: 'Bugungi hisobotni olish' },
        { command: 'kontakt', description: 'Bog\'cha kontakti' },
        { command: 'faq', description: 'Ko\'p beriladigan savollar' },
        { command: 'chiqish', description: 'Tizimdan chiqish' },
        { command: 'profil', description: 'Shaxsiy profil' },
        { command: 'bogcha', description: 'Bog\'cha haqida' },
        { command: 'rasm', description: 'Bolalar rasmlari' },
        { command: 'reyting', description: 'Bog\'chani baholash' },
        { command: 'chat', description: 'Admin bilan chat' },
        { command: 'eslatma', description: 'Eslatma sozlash' },
        { command: 'menyu', description: 'Haftalik ovqat menyu' },
        { command: 'eklon', description: 'Bog\'cha e\'lonlari' },
        { command: 'help', description: 'Yordam' },
        { command: 'xabar', description: 'Ommaviy xabar (admin)' },
        { command: 'otaonalar', description: 'Ulangan ota-onalar' },
        { command: 'tolovtarixi', description: 'To\'lov tarixi (oylik)' }
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
  sendGroup,
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
  checkBirthdays,
  checkMonthEndReminder,
  showExport,
  unpaidMonthsCount,
  sendToParent
};
