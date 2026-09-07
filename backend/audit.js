require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const https = require('https');
const mongoose = require('mongoose');
const MandiPrice = require('./src/models/MandiPrice');

const API_KEY = process.env.GOVERNMENT_API_KEY;
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kisansetu';

const TARGET_DISTRICTS = [
  'Kanpur', 'Kanpur Dehat', 'Unnao', 'Kannauj', 
  'Farukhabad', 'Farrukhabad', 'Etawah', 'Auraiya'
];

async function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function auditAPI() {
  console.log("=== A. API AUDIT ===");
  for (const district of TARGET_DISTRICTS) {
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&filters[state.keyword]=Uttar%20Pradesh&filters[district]=${encodeURIComponent(district)}&limit=100&offset=0`;
    
    const displayUrl = url.replace(API_KEY, 'HIDDEN_API_KEY');
    
    try {
      const data = await fetchData(url);
      const records = data.records || [];
      const total = data.total || records.length;
      
      const uniqueMarkets = new Set(records.map(r => r.market)).size;
      const uniqueCmd = new Set(records.map(r => r.commodity)).size;
      
      console.log(`\nDistrict: ${district}`);
      console.log(`URL: ${displayUrl}`);
      console.log(`Total API says available: ${total}`);
      console.log(`Records fetched (page 1): ${records.length}`);
      console.log(`Unique Markets: ${uniqueMarkets}, Unique Commodities: ${uniqueCmd}`);
    } catch (e) {
      console.log(`District: ${district} - ERROR: ${e.message}`);
    }
  }
}

async function auditDB() {
  console.log("\n=== B. DATABASE AUDIT ===");
  await mongoose.connect(MONGO_URI);
  
  const total = await MandiPrice.countDocuments();
  console.log(`Total documents: ${total}`);
  
  console.log("\nDocuments by District:");
  const byDist = await MandiPrice.aggregate([{ $group: { _id: "$district", count: { $sum: 1 } } }]);
  byDist.forEach(d => console.log(`- ${d._id}: ${d.count}`));
  
  console.log("\nDocuments by Market:");
  const byMarket = await MandiPrice.aggregate([{ $group: { _id: "$market", count: { $sum: 1 } } }]);
  byMarket.forEach(d => console.log(`- ${d._id}: ${d.count}`));
  
  console.log("\nDocuments by Commodity (Crop):");
  const byCrop = await MandiPrice.aggregate([{ $group: { _id: "$cropName", count: { $sum: 1 } } }]);
  byCrop.forEach(d => console.log(`- ${d._id}: ${d.count}`));
  
  console.log("\nDocuments by Arrival Date:");
  const byDate = await MandiPrice.aggregate([{ $group: { _id: "$date", count: { $sum: 1 } } }]);
  byDate.forEach(d => console.log(`- ${d._id}: ${d.count}`));
  
  console.log("\nDuplicate Check (by upsert key):");
  const duplicates = await MandiPrice.aggregate([
    { $group: { 
        _id: { state: "$state", district: "$district", market: "$market", cropName: "$cropName", variety: "$variety", date: "$date" }, 
        count: { $sum: 1 } 
    }},
    { $match: { count: { $gt: 1 } } }
  ]);
  console.log(`Found ${duplicates.length} duplicate groups.`);
  
  await mongoose.disconnect();
}

async function run() {
  await auditAPI();
  await auditDB();
}

run();
