const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/bogcha.db', { readOnly: true });
const t = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
for (const x of t) {
  try {
    const c = db.prepare('SELECT COUNT(*) n FROM "' + x.name + '"').get().n;
    console.log(x.name + ': ' + c);
  } catch (e) { console.log(x.name + ': ERR ' + e.message); }
}
