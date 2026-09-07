const http = require('http');

const request = (options, body) => new Promise((resolve, reject) => {
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try { resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }); } 
      catch(e) { resolve({ status: res.statusCode, data }); }
    });
  });
  req.on('error', reject);
  if (body) req.write(JSON.stringify(body));
  req.end();
});

async function run() {
  console.log('Testing...');

  const reg = await request({ hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } }, 
    { name: 'Ramesh', email: 'ramesh2@example.com', password: 'password123', role: 'farmer', phone: '9999999991' }
  );

  const login = await request({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, 
    { email: 'ramesh2@example.com', password: 'password123' }
  );
  
  if(login.status === 200) console.log("Login: PASS");
  else console.log("Login: FAIL", login.data);

  const token = login.data.data.token;
  const h = { 'Authorization': `Bearer ${token}` };

  const mandi = await request({ hostname: 'localhost', port: 5000, path: '/api/mandi', method: 'GET', headers: h });
  console.log('Mandi:', mandi.status === 200 && mandi.data.data.length > 0 && mandi.data.data[0].minPrice !== undefined ? 'PASS' : 'FAIL');

  const lots = await request({ hostname: 'localhost', port: 5000, path: '/api/lots/my', method: 'GET', headers: h });
  console.log('Farmer Lots:', lots.status === 200 ? 'PASS' : 'FAIL');

  const offers = await request({ hostname: 'localhost', port: 5000, path: '/api/offers/farmer', method: 'GET', headers: h });
  console.log('Farmer Offers:', offers.status === 200 ? 'PASS' : 'FAIL');

  const storage = await request({ hostname: 'localhost', port: 5000, path: '/api/storage/nearby', method: 'GET', headers: h });
  console.log('Storage Options:', storage.status === 200 ? 'PASS' : 'FAIL');

  // Buyer test
  const breg = await request({ hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } }, 
    { name: 'Buyer1', email: 'buyer1@example.com', password: 'password123', role: 'buyer', phone: '9999999992' }
  );
  
  const blogin = await request({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, 
    { email: 'buyer1@example.com', password: 'password123' }
  );

  const bh = { 'Authorization': `Bearer ${blogin.data.data.token}` };
  const bOffers = await request({ hostname: 'localhost', port: 5000, path: '/api/offers/buyer', method: 'GET', headers: bh });
  console.log('Buyer Offers:', bOffers.status === 200 ? 'PASS' : 'FAIL');

}
run();
