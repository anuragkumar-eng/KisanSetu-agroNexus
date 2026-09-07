require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const https = require('https');
const MandiPrice = require('../src/models/MandiPrice');

const API_KEY = process.env.GOVERNMENT_API_KEY;
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kisansetu';

const TARGET_DISTRICTS = [
  'Kanpur',
  'Kanpur Dehat',
  'Unnao',
  'Kannauj',
  'Farukhabad', // Commonly used spelling in AGMARKNET/data.gov.in
  'Farrukhabad',
  'Etawah',
  'Auraiya'
];

async function fetchDataForDistrict(district, offset = 0, limit = 100) {
  return new Promise((resolve, reject) => {
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&filters[state.keyword]=Uttar%20Pradesh&filters[district]=${encodeURIComponent(district)}&limit=${limit}&offset=${offset}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`API Error ${res.statusCode}: ${data}`));
        }
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error));
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function parseArrivalDate(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // YYYY-MM-DD
  }
  return new Date(dateStr);
}

async function syncMandiData() {
  if (!API_KEY || API_KEY.includes('your_data_gov_in_api_key_here')) {
    console.error('ERROR: Missing valid GOVERNMENT_API_KEY in backend/.env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');

  let totalImported = 0;

  for (const district of TARGET_DISTRICTS) {
    console.log(`Fetching government mandi prices for district: ${district}...`);
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await fetchDataForDistrict(district, offset, limit);
        const records = data.records || [];
        
        if (records.length === 0) {
          hasMore = false;
          break;
        }

        for (const rec of records) {
          const date = parseArrivalDate(rec.arrival_date);
          const minPrice = parseFloat(rec.min_price) || 0;
          const maxPrice = parseFloat(rec.max_price) || 0;
          const modalPrice = parseFloat(rec.modal_price) || 0;
          
          const doc = {
            cropName: rec.commodity,
            variety: rec.variety || 'Common',
            state: rec.state,
            district: rec.district,
            market: rec.market,
            minPrice: minPrice,
            maxPrice: maxPrice,
            modalPrice: modalPrice,
            price: modalPrice, // fallback for legacy
            unit: 'Quintal', // default for data.gov.in
            date: date
          };

          // Upsert strategy based on uniqueness
          await MandiPrice.updateOne(
            {
              state: doc.state,
              district: doc.district,
              market: doc.market,
              cropName: doc.cropName,
              variety: doc.variety,
              date: doc.date
            },
            { $set: doc },
            { upsert: true }
          );
          totalImported++;
        }

        if (records.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      } catch (err) {
        console.error(`Fetch error for ${district}:`, err.message);
        break;
      }
    }
  }

  console.log(`\nSync complete. Imported/Updated ${totalImported} records from the Kanpur region.`);
  await mongoose.disconnect();
}

syncMandiData().catch(console.error);
