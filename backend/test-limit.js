const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const mandiRoutes = require('./src/routes/mandiRoutes');
require('dotenv').config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kisansetu';

async function testLimit() {
  await mongoose.connect(MONGO_URI);
  
  const app = express();
  app.use((req, res, next) => { req.user = { _id: 'mock_user_id' }; next(); }); // mock auth
  app.use('/api/mandi', mandiRoutes);
  
  // Test with no limit (defaults to 20)
  const res1 = await request(app).get('/api/mandi');
  console.log(`No limit param: ${res1.body.data.length} records returned.`);
  
  // Test with limit=500
  const res2 = await request(app).get('/api/mandi?limit=500');
  console.log(`Limit=500 param: ${res2.body.data.length} records returned.`);
  
  await mongoose.disconnect();
}

testLimit().catch(console.error);
