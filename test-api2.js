import fs from 'fs';
let code = fs.readFileSync('src/services/api.js', 'utf-8');
code = code.replace(/import\.meta\.env\.VITE_API_URL/g, "'http://localhost:5000/api'");
code = code.replace(/localStorage\.getItem\('kisansetu_token'\)/g, "global.testToken");
fs.writeFileSync('temp_api2.js', code);
import('./temp_api2.js').then(async (m) => {
  const api = m.api;
  const loginRes = await api.post('/auth/login', { email: 'buyer1@example.com', password: 'password123' });
  global.testToken = loginRes.data.token;
  
  const res = await api.get('/auth/me');
  console.log('GET /auth/me RES:', JSON.stringify(res));
  
  const freshUser = res.data?.user ?? res.data;
  console.log('freshUser:', JSON.stringify(freshUser));
});
