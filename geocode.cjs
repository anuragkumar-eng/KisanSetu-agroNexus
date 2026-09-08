const https = require('https');
const fs = require('fs');

const markets = [
  "Jhijhank", "Purwa", "Bangarmau", "Uttaripura", "Achalda", "Rura",
  "Farukhabad", "Etawah", "Pukharayan", "Bharthna", "Kamlaganj", "Kayamganj",
  "Jasvantnagar", "Dibiapur", "Mohamadabad", "Choubepur", "Auraiya", "Baripaal", "Unnao", "Kanpur"
];

async function geocode(city) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', Uttar Pradesh, India')}&format=json&limit=1`;
    const options = {
      headers: {
        'User-Agent': 'KisanSetu-Prototype/1.0'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0) {
            resolve({ lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) });
          } else {
            resolve(null);
          }
        } catch (e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  const mapping = {};
  for (const m of markets) {
    const coords = await geocode(m);
    // map the exact APMC string
    let key = m === 'Kanpur' ? 'Kanpur(Grain) APMC' : `${m} APMC`;
    if (coords) {
      mapping[key] = { latitude: coords.lat, longitude: coords.lon };
    } else {
      mapping[key] = { latitude: "NEEDS_CONFIG", longitude: "NEEDS_CONFIG" };
    }
    // delay to respect nominatim rate limits
    await new Promise(r => setTimeout(r, 1000));
  }
  
  fs.writeFileSync('marketLocations.json', JSON.stringify(mapping, null, 2));
  console.log('Done!');
}
run();
