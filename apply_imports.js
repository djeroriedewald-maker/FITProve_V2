const fs = require('fs');
const path = 'src/lib/exercise.service.ts';
let text = fs.readFileSync(path, 'utf8');
const importNeedle = "import { hyroxEventExercises } from '../data/events/hyroxEventExercises';";
if (!text.includes("data/exerciseEnhancements")) {
  text = text.replace(
    importNeedle + "\r\n",
    `${importNeedle}\r\nimport { exerciseLibrary } from '../data/exerciseLibrary';\r\nimport { applyExerciseEnhancements } from '../data/exerciseEnhancements';\r\n`
  );
}
fs.writeFileSync(path, text, 'utf8');
