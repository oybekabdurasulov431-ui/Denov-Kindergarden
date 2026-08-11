const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: false, userDataDir: PROFILE, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.namecheap.com/myaccount/login/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 7000));
  const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map(i => ({ id: i.id, name: i.name, type: i.type, ph: i.placeholder, cls: i.className })));
  console.log(JSON.stringify(inputs, null, 1));
  const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => ({ t: (b.textContent||'').trim(), cls: b.className, id: b.id, type: b.type })));
  console.log('BUTTONS: ' + JSON.stringify(buttons, null, 1));
  await browser.close();
})();
