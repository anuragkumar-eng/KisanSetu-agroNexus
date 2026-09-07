require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const MandiPrice = require('./src/models/MandiPrice');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kisansetu';

async function runStats() {
  await mongoose.connect(MONGO_URI);
  
  // Group by district and count records
  const byDistrict = await MandiPrice.aggregate([
    { $group: { _id: "$district", count: { $sum: 1 }, markets: { $addToSet: "$market" } } },
    { $sort: { count: -1 } }
  ]);

  let totalUniqueMarkets = 0;
  console.log("Records by District:");
  byDistrict.forEach(d => {
    console.log(`- ${d._id}: ${d.count} records, Markets: ${d.markets.length} (${d.markets.join(', ')})`);
    totalUniqueMarkets += d.markets.length; // Actually we should do a global distinct for exact unique markets
  });

  const allUniqueMarkets = await MandiPrice.distinct('market');
  console.log(`\nTotal Unique Markets: ${allUniqueMarkets.length}`);
  
  await mongoose.disconnect();
}

runStats().catch(console.error);
