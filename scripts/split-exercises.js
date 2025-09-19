// Script om combined-exercises.json op te splitsen in chunks van 500 oefeningen
const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, 'exercise-import', 'combined-exercises.json');
const OUT_DIR = __dirname;
const CHUNK_SIZE = 500;

if (!fs.existsSync(INPUT)) {
  console.error('❌ combined-exercises.json niet gevonden');
  process.exit(1);
}

const all = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
console.log(`📦 Totaal ${all.length} oefeningen gevonden`);

let chunkCount = 0;
for (let i = 0; i < all.length; i += CHUNK_SIZE) {
  const chunk = all.slice(i, i + CHUNK_SIZE);
  chunkCount++;
  const outPath = path.join(OUT_DIR, `exercises-chunk-${chunkCount}.json`);
  fs.writeFileSync(outPath, JSON.stringify(chunk, null, 2));
  console.log(`✅ Chunk ${chunkCount} (${chunk.length} oefeningen) opgeslagen als ${outPath}`);
}

console.log(`🎉 Splitsen voltooid: ${chunkCount} chunks aangemaakt.`);