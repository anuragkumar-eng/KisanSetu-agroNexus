const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:5173/login');
  
  await page.type('input[type="email"]', 'buyer1@example.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  console.log('Current URL:', page.url());
  
  const user = await page.evaluate(() => localStorage.getItem('kisansetu_user'));
  console.log('LocalStorage User:', user);
  
  await browser.close();
})();
