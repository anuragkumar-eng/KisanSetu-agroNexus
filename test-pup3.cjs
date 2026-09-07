const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:5173/login');
  
  await page.type('input[type="email"]', 'buyer1@example.com');
  await page.type('input[type="password"]', 'password123');
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.type === 'submit');
    if (submitBtn) submitBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const userStr = await page.evaluate(() => localStorage.getItem('kisansetu_user'));
  console.log('LOCALSTORAGE:', userStr);
  console.log('CURRENT URL:', page.url());
  
  await browser.close();
})();
