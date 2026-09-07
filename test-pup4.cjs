const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173/login');
  
  // Clean localStorage first to simulate fresh state
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  
  await page.type('input[type="email"]', 'buyer1@example.com');
  await page.type('input[type="password"]', 'password123');
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.type === 'submit');
    if (submitBtn) submitBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('BUYER URL AFTER LOGIN:', page.url());
  
  // Logout
  await page.goto('http://localhost:4173/buyer/profile');
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const logoutBtn = btns.find(b => b.innerText.includes('लॉगआउट'));
    if (logoutBtn) logoutBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  console.log('URL AFTER LOGOUT:', page.url());
  
  // Try Farmer
  await page.goto('http://localhost:4173/login');
  await page.type('input[type="email"]', 'farmer1@example.com');
  await page.type('input[type="password"]', 'password123');
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.type === 'submit');
    if (submitBtn) submitBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  console.log('FARMER URL AFTER LOGIN:', page.url());
  
  // Unauthorized cross access test
  await page.goto('http://localhost:4173/buyer');
  await new Promise(r => setTimeout(r, 1000));
  console.log('FARMER TRYING TO ACCESS BUYER URL:', page.url());
  
  await browser.close();
})();
