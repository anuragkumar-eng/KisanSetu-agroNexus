const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:5173/login');
  
  // Click buyer demo button
  // text is " Buyer" or has icon
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const buyerBtn = btns.find(b => b.innerText.includes('Buyer') || b.innerText.includes('खरीदार'));
    if (buyerBtn) buyerBtn.click();
  });
  
  // Wait a bit for state to update
  await new Promise(r => setTimeout(r, 500));
  
  // Click submit (Login button)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.type === 'submit');
    if (submitBtn) submitBtn.click();
  });
  
  // Wait for navigation and logs
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('CURRENT URL:', page.url());
  
  await browser.close();
})();
