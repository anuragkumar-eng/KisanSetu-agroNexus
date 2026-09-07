const https = require('https');
const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const url = 'https://api.data.gov.in/resource/' + RESOURCE_ID + '?api-key=' + API_KEY + '&format=json&filters[state]=Uttar%20Pradesh&limit=100';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Status:', json.status);
      console.log('Total Records:', json.total);
      if (json.records && json.records.length > 0) {
        console.log('Sample Record:', json.records[0]);
        const districts = [...new Set(json.records.map(r => r.district))];
        console.log('Districts found in sample:', districts);
      } else {
        console.log('No records found.');
      }
    } catch(e) {
      console.error('Error parsing JSON', e);
      console.log('Raw output:', data.substring(0, 500));
    }
  });
}).on('error', e => console.error('Fetch error:', e));
