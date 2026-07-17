// Run once: node server/scripts/exchange_token.js <short_lived_token>
const https = require('https');
const path  = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const shortToken = process.argv[2];
if (!shortToken) { console.error('Usage: node exchange_token.js <short_lived_token>'); process.exit(1); }

const appId     = process.env.INSTAGRAM_APP_ID;
const appSecret = process.env.INSTAGRAM_APP_SECRET;
if (!appId || !appSecret) { console.error('Missing INSTAGRAM_APP_ID or INSTAGRAM_APP_SECRET in .env'); process.exit(1); }

// Instagram Business Login tokens (IGA…) use graph.instagram.com + ig_exchange_token
const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortToken}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.error) { console.error('Error:', JSON.stringify(json.error)); process.exit(1); }
    console.log('\n=== LONG-LIVED TOKEN (expires in ~60 days) ===');
    console.log(json.access_token);
    console.log('\nAdd to server/.env:');
    console.log(`INSTAGRAM_ACCESS_TOKEN=${json.access_token}`);
  });
}).on('error', e => { console.error(e); process.exit(1); });
