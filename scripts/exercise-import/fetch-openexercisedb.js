// Download Open Exercise DB JSON (exercises.json) from GitHub
// https://github.com/jeremyschlatter/open-exercise-db
// Dit script downloadt de data en slaat deze lokaal op

const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/jeremyschlatter/open-exercise-db/main/exercises.json';
const outPath = './open-exercise-db.json';

https.get(url, (res) => {
  if (res.statusCode !== 200) throw new Error('Failed to download');
  const file = fs.createWriteStream(outPath);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('✅ Open Exercise DB downloaded');
  });
});
