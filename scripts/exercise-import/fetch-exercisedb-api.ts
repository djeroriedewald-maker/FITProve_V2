import fs from 'fs';
import https from 'https';

const url = 'https://exercisedb.io/api/exercises';
const outPath = './exercisedb-api.json';

https.get(url, (res) => {
  if (res.statusCode !== 200) throw new Error('Failed to download');
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    fs.writeFileSync(outPath, data);
    console.log('✅ ExerciseDB API data downloaded');
  });
});
