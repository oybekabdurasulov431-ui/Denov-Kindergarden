const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\namecheap-profile';
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: false, userDataDir: PROFILE, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.namecheap.com/myaccount/login/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 7000));
  const html = await page.content();
  const i = html.toLowerCase().indexOf('accounts.google');
  console.log(html.slice(Math.max(0, i - 300), i + 400));
  await browser.close();
})();
