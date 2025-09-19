// Download Everkinetic JSON (exercises.json) from GitHub
// https://github.com/everkinetic/data
// Dit script downloadt de data en slaat deze lokaal op

const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/everkinetic/data/master/exercises.json';
const outPath = './everkinetic.json';

https.get(url, (res) => {
  if (res.statusCode !== 200) throw new Error('Failed to download');
  const file = fs.createWriteStream(outPath);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('✅ Everkinetic downloaded');
  });
});
