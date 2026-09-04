const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const FONT = path.join(__dirname, 'assets', 'fonts', 'DejaVuSans.ttf');
const FONT_BOLD = path.join(__dirname, 'assets', 'fonts', 'DejaVuSans-Bold.ttf');

function fontOk() {
  return fs.existsSync(FONT) && fs.existsSync(FONT_BOLD);
}

function fmtMoney(v) {
  return new Intl.NumberFormat('uz-UZ').format(Number(v || 0)) + ' so\'m';
}

function monthLabel(m) {
  const names = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  if (!m || m.length < 7) return m || '';
  const [y, mo] = m.split('-');
  const i = parseInt(mo, 10) - 1;
  return (names[i] || mo) + ' ' + y;
}

/**
 * Moliyaviy oylik hisobot PDF.
 * data: { siteName, month, income, expense, profit, att: {present,late,absent},
 *         payments: [], expenses: [], debts: [] }
 */
function buildReportPdf(data) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 30,
    info: { Title: data.siteName + ' hisobot', Author: data.siteName }
  });
  const chunks = [];
  doc.on('data', c => chunks.push(c));
  const done = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const W = doc.page.width - 60;
  const font = () => doc.font(FONT);
  const bold = () => doc.font(FONT_BOLD);

  // ---------------------------------------------------------------- header
  doc.fillColor('#6366f1').rect(0, 0, doc.page.width, 8).fill();
  doc.y = 26;
  bold().fontSize(17).fillColor('#0f172a').text(data.siteName, { align: 'center' });
  doc.font(FONT).fontSize(11).fillColor('#64748b').text(`${monthLabel(data.month)} — Moliyaviy hisobot`, { align: 'center' });
  doc.moveDown(1);

  // ---------------------------------------------------------------- summary boxes
  const boxW = (W - 20) / 3;
  const bx = doc.x, by = doc.y;
  const items = [
    { label: 'Daromad (to\'lovlar)', val: data.income, color: '#10b981' },
    { label: 'Xarajatlar', val: data.expense, color: '#ef4444' },
    { label: 'Sof foyda', val: data.profit, color: data.profit >= 0 ? '#6366f1' : '#ef4444' }
  ];
  items.forEach((it, i) => {
    const x = bx + i * (boxW + 10);
    doc.fillColor('#f8fafc').roundedRect(x, by, boxW, 54, 8).fill();
    doc.fillColor('#64748b').font(FONT).fontSize(9).text(it.label, x + 10, by + 8, { width: boxW - 20 });
    bold().fontSize(13).fillColor(it.color).text(fmtMoney(it.val), x + 10, by + 24, { width: boxW - 20 });
  });
  doc.y = by + 70;

  // ---------------------------------------------------------------- attendance
  bold().fontSize(12).fillColor('#0f172a').text('📊 Davomat', { continue: true }).fillColor('#6366f1').fontSize(9).text('    (har bir bola uchun yagona belgi)', { align: 'right' });
  doc.moveDown(0.3);
  const att = data.att || { present: 0, late: 0, absent: 0 };
  const attSum = att.present + att.late + att.absent;
  if (attSum) {
    doc.font(FONT).fontSize(10);
    const labels = [['Keldi', att.present, '#10b981'], ['Kech keldi', att.late, '#f59e0b'], ['Kelmadi', att.absent, '#ef4444']];
    labels.forEach((l, i) => {
      const x = bx + i * (boxW + 10);
      doc.fillColor('#f1f5f9').roundedRect(x, doc.y, boxW, 30, 6).fill();
      doc.fillColor('#334155').text(`${l[0]}: ${l[1]} (${Math.round(l[1] / attSum * 100)}%)`, x + 8, doc.y + 4, { width: boxW - 16 });
    });
    doc.moveDown(1.2);
  } else {
    doc.fillColor('#64748b').fontSize(10).text('Ma\'lumot yo\'q', { align: 'center' });
    doc.moveDown(0.6);
  }

  // ---------------------------------------------------------------- payments table
  const drawTable = (title, headers, rows, widths, valFmt) => {
    bold().fontSize(12).fillColor('#0f172a').text(title);
    doc.moveDown(0.35);
    const colWidths = widths;
    const rowH = 18;
    const startY = doc.y;
    const th = (t, x, w, opt = {}) => {
      doc.fillColor('#6366f1').rect(x, doc.y, w, rowH).fill();
      doc.fillColor('#ffffff').font(FONT_BOLD).fontSize(8.5).text(t, x + 4, doc.y + 5, { width: w - 8, height: rowH - 4 });
    };
    headers.forEach((h, i) => th(h, doc.x + colWidths.slice(0, i).reduce((a, b) => a + b, 0), colWidths[i]));
    doc.y += rowH;
    let seen = 1;
    rows.forEach((r, ri) => {
      if (doc.y > doc.page.height - 60) { doc.addPage(); doc.y = 40; }
      doc.fillColor(ri % 2 === 1 ? '#f8fafc' : '#ffffff');
      const y0 = doc.y;
      doc.rect(doc.x, doc.y, W, rowH).fill();
      r.forEach((v, ci) => {
        const x = doc.x + colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
        const txt = valFmt && valFmt[ci] ? valFmt[ci](v) : String(v == null ? '' : v);
        doc.fillColor('#334155').font(FONT).fontSize(8.5).text(txt, x + 4, doc.y + 5, { width: colWidths[ci] - 8, height: rowH - 4 });
        seen++;
      });
      doc.y = y0 + rowH;
    });
    doc.fillColor('#e2e8f0').moveTo(doc.x, doc.y - 2).lineTo(doc.x + W, doc.y - 2).stroke();
    doc.moveDown(0.8);
  };

  drawTable(
    `💰 To'lovlar (${data.payments.length} ta)`,
    ['№', 'Bola', 'Guruh', 'Oy', 'Sana', 'Summa', 'Usul', 'Kvitansiya'],
    data.payments.map((p, i) => [i + 1, p.child_name, p.group_name || '', p.month, p.paid_date || '', p.amount, p.method, p.receipt_no || '']),
    [22, 150, 80, 70, 60, 80, 70, 70],
    { 5: v => fmtMoney(v).replace(' so\'m', '') }
  );

  drawTable(
    `💸 Xarajatlar (${data.expenses.length} ta)`,
    ['№', 'Xarajat nomi', 'Kategoriya', 'Sana', 'Summa', 'Izoh'],
    data.expenses.map((e, i) => [i + 1, e.name, e.category || '', e.expense_date || '', e.amount, e.notes || '']),
    [22, 180, 90, 70, 80, 160],
    { 4: v => fmtMoney(v).replace(' so\'m', '') }
  );

  const debtRows = (data.debts || []).filter(d => d.due > 0);
  if (debtRows.length) {
    drawTable(
      `⚠️ Qarzdorlar (${debtRows.length} ta)`,
      ['№', 'Bola', 'Guruh', 'Oylik', 'To\'langan', 'Qarz', 'Oylar'],
      debtRows.map((d, i) => [i + 1, d.child_name, d.group_name || '', d.fee, d.paid, d.due, d.unpaidMonths || 0]),
      [22, 150, 80, 70, 70, 70, 50],
      { 3: v => fmtMoney(v).replace(' so\'m', ''), 4: v => fmtMoney(v).replace(' so\'m', ''), 5: v => fmtMoney(v).replace(' so\'m', '') }
    );
  }

  // footer
  doc.fillColor('#6366f1').rect(0, doc.page.height - 10, doc.page.width, 10).fill();
  doc.fillColor('#cbd5e1').font(FONT).fontSize(7).text(
    `${data.siteName} — ${new Date().toLocaleDateString('uz-UZ')}   •   Ushbu hisobot avtomatik yaratildi`,
    doc.page.width / 2, doc.page.height - 8, { align: 'center', width: 0 }
  );

  doc.end();
  return done;
}

module.exports = { buildReportPdf, fontOk };