const db = require('/app/db.js');
const bcrypt = require('bcryptjs');
const r = db.prepare('UPDATE users SET password_hash = ? WHERE id = 1').run(bcrypt.hashSync('000000', 10));
console.log('UPDATE_RUN:', JSON.stringify(r));
const u = db.prepare('SELECT id, username, role FROM users WHERE id = 1').get();
const ok = bcrypt.compareSync('000000', db.prepare('SELECT password_hash FROM users WHERE id = 1').get().password_hash);
console.log('USER:', JSON.stringify(u), 'VERIFY_000000:', ok);
