const express = require('express');
const mandiRoutes = require('./backend/src/routes/mandiRoutes');
const { getMandiHistoryByCrop } = require('./backend/src/controllers/mandiController');
console.log('Controller has getMandiHistoryByCrop:', typeof getMandiHistoryByCrop === 'function');

const app = express();
// Mock the auth middleware
jest = { mock: () => {} };
app.use((req, res, next) => { req.user = { _id: '123' }; next(); });
app.use('/api/mandi', mandiRoutes);

const request = require('supertest');

(async () => {
  // We can't easily mock Mongoose here without a full setup, but we can verify 
  // that the route exists and doesn't return 404!
  
  // A 500 error means it hit the controller but failed on Mongoose.
  // A 404 means the route doesn't exist.
  
  const res = await request(app).get('/api/mandi/crop/wheat/history?days=14');
  console.log('Route /api/mandi/crop/wheat/history status:', res.status);
  
  const res2 = await request(app).get('/api/mandi/crop/some%20crop/history?days=14');
  console.log('Route /api/mandi/crop/some%20crop/history status:', res2.status);
})();
