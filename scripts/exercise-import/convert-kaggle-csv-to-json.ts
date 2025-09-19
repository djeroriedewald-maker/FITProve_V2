import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

// Pas dit pad aan naar jouw gedownloade Kaggle CSV bestand
const CSV_PATH = './kaggle-exercises.csv';
const OUT_PATH = './kaggle-exercises.json';

const results: any[] = [];

fs.createReadStream(CSV_PATH)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
    console.log('✅ Kaggle CSV converted to JSON');
  });
