const fs = require('fs');
const path = 'src/lib/exercise.service.ts';
let text = fs.readFileSync(path, 'utf8');
const catchRegex = /\} catch \(error\) \{\s+console\.error\('Failed to fetch exercises:', error\);\s+return \{\s+exercises: \[],\s+total_count: 0,\s+filtered_count: 0\s+};\s+}/;
text = text.replace(catchRegex, `} catch (error) {
      console.error('Failed to fetch exercises:', error);
      const fallback = appendHyroxEventExercises(
        exerciseLibrary.map(applyExerciseEnhancements),
        {
          muscleGroups: filters?.muscle_groups,
          equipment: filters?.equipment,
          difficulty: filters?.difficulty,
          categories: filters?.category,
          searchQuery: filters?.search_query,
        }
      );

      return {
        exercises: fallback,
        total_count: fallback.length,
        filtered_count: fallback.length,
      };
    }`);
fs.writeFileSync(path, text, 'utf8');
