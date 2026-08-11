const login = await fetch('http://localhost:3000/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'mexriddin', password: 'mexriddin123' }) });
const j = await login.json();
const sc = login.headers.get('set-cookie') || '';
console.log('LOGIN_STATUS:', login.status);
console.log('LOGIN_USER:', JSON.stringify((j.user && { id: j.user.id, username: j.user.username, role: j.user.role }) || j.error));
const s = await fetch('http://localhost:3000/api/birthdays', { headers: { 'Cookie': sc } });
console.log('BIRTHDAYS_STATUS:', s.status);
console.log('BIRTHDAYS:', (await s.text()).slice(0, 500));
