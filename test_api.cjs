const https = require('https');
const API_KEY = '579b464db66ec23bdd0000013cd6f349fcb9447757ea5f8fba977eb1';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const url = 'https://api.data.gov.in/resource/' + RESOURCE_ID + '?api-key=' + API_KEY + '&format=json&filters[state.keyword]=Uttar%20Pradesh&filters[district]=Kanpur&limit=2';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
  });
}).on('error', console.error);
