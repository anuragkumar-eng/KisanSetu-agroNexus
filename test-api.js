import fs from 'fs';
let code = fs.readFileSync('src/services/api.js', 'utf-8');
code = code.replace(/import\.meta\.env\.VITE_API_URL/g, "'http://localhost:5000/api'");
fs.writeFileSync('temp_api.js', code);
import('./temp_api.js').then(async (m) => {
  const api = m.api;
  const res = await api.post('/auth/login', { email: 'buyer1@example.com', password: 'password123' });
  console.log('RES:', JSON.stringify(res));
  const { user: apiUser, token: jwt } = res.data;
  console.log('apiUser:', JSON.stringify(apiUser));
});
