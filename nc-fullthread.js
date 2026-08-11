const puppeteer = require('puppeteer-core');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9223', defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  await page.bringToFront();
  await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => console.log('nav err: ' + e.message));
  await sleep(8000);
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[jsaction*="t"]'));
    for (const r of rows) { if (/namecheap/i.test(r.innerText) && /account access/i.test(r.innerText)) { r.click(); return; } }
  });
  await sleep(7000);
  const body = await page.evaluate(() => {
    const msg = document.querySelector('.nH.if, div[role="main"]');
    return (msg ? msg.innerText : document.body.innerText).replace(/\s+/g, ' ');
  });
  console.log('FULL_THREAD:', body);
  await browser.disconnect();
  process.exit(0);
})();
