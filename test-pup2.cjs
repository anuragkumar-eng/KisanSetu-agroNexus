const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:5173/login');
  
  // Fill credentials
  await page.type('input[type="email"]', 'buyer1@example.com');
  await page.type('input[type="password"]', 'password123');
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 200));
  
  // Click submit (Login button)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.type === 'submit');
    if (submitBtn) submitBtn.click();
  });
  
  // Wait for navigation and logs
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('CURRENT URL:', page.url());
  
  await browser.close();
})();
