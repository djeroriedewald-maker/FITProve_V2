// Simple Node.js script to process exercise data
const fs = require('fs');
const path = require('path');

// Muscle group mapping from raw data to our schema
const muscleGroupMapping = {
  'abdominals': 'abs',
  'abductors': 'glutes',
  'adductors': 'glutes', 
  'biceps': 'biceps',
  'calves': 'calves',
  'chest': 'chest',
  'forearms': 'forearms',
  'glutes': 'glutes',
  'hamstrings': 'hamstrings',
  'lats': 'back',
  'lower back': 'lower_back',
  'middle back': 'back',
  'neck': 'shoulders',
  'quadriceps': 'quadriceps',
  'shoulders': 'shoulders',
  'traps': 'back',
  'triceps': 'triceps',
  'upper back': 'back'
};

// Equipment mapping
const equipmentMapping = {
  'body only': ['bodyweight'],
  'dumbbell': ['dumbbells'],
  'barbell': ['barbell'],
  'kettlebell': ['kettlebell'],
  'cable': ['cable_machine'],
  'machine': ['cable_machine'],
  'e-z curl bar': ['barbell'],
  'exercise ball': ['exercise_ball'],
  'foam roll': ['foam_roller'],
  'medicine ball': ['medicine_ball'],
  'bands': ['resistance_bands'],
  'other': ['none']
};

// Category mapping
const categoryMapping = {
  'strength': 'strength',
  'stretching': 'flexibility',
  'plyometrics': 'power',
  'cardio': 'cardio',
  'olympic weightlifting': 'strength',
  'powerlifting': 'strength',
  'strongman': 'strength'
};

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapMuscleGroups(muscles) {
  if (!muscles || !Array.isArray(muscles)) return [];
  return muscles
    .map(muscle => muscleGroupMapping[muscle.toLowerCase()] || muscle.toLowerCase())
    .filter((muscle, index, array) => array.indexOf(muscle) === index);
}

function mapEquipment(equipment) {
  if (!equipment) return ['none'];
  const equipmentLower = equipment.toLowerCase();
  return equipmentMapping[equipmentLower] || ['none'];
}

function mapCategory(category) {
  return categoryMapping[category.toLowerCase()] || 'strength';
}

function generateTags(exercise) {
  const tags = new Set();
  
  // Add name words
  if (exercise.name) {
    exercise.name.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) tags.add(word);
    });
  }
  
  // Add muscle groups
  if (exercise.primaryMuscles) {
    exercise.primaryMuscles.forEach(muscle => tags.add(muscle.toLowerCase()));
  }
  if (exercise.secondaryMuscles) {
    exercise.secondaryMuscles.forEach(muscle => tags.add(muscle.toLowerCase()));
  }
  
  // Add equipment
  if (exercise.equipment) {
    tags.add(exercise.equipment.toLowerCase());
  }
  
  // Add category
  if (exercise.category) {
    tags.add(exercise.category.toLowerCase());
  }
  
  // Add force type
  if (exercise.force) {
    tags.add(exercise.force.toLowerCase());
  }
  
  return Array.from(tags);
}

function processExercises(rawData) {
  const processed = [];
  const seenNames = new Set();
  
  for (const raw of rawData) {
    // Skip duplicates by name
    if (seenNames.has(raw.name.toLowerCase())) {
      console.log(`Skipping duplicate: ${raw.name}`);
      continue;
    }
    seenNames.add(raw.name.toLowerCase());
    
    // Skip exercises without proper instructions
    if (!raw.instructions || raw.instructions.length === 0) {
      console.log(`Skipping exercise without instructions: ${raw.name}`);
      continue;
    }
    
    // Skip exercises without muscle groups
    if (!raw.primaryMuscles || raw.primaryMuscles.length === 0) {
      console.log(`Skipping exercise without muscle groups: ${raw.name}`);
      continue;
    }
    
    const primaryMuscles = mapMuscleGroups(raw.primaryMuscles);
    const secondaryMuscles = mapMuscleGroups(raw.secondaryMuscles);
    
    // Skip if we couldn't map any muscle groups
    if (primaryMuscles.length === 0) {
      console.log(`Skipping exercise with unmappable muscles: ${raw.name}`);
      continue;
    }
    
    const exercise = {
      name: raw.name,
      slug: createSlug(raw.name),
      description: raw.instructions[0] || '',
      instructions: raw.instructions,
      primary_muscles: primaryMuscles,
      secondary_muscles: secondaryMuscles,
      equipment: mapEquipment(raw.equipment),
      difficulty: raw.level || 'beginner',
      category_id: mapCategory(raw.category),
      force_type: raw.force,
      mechanics: raw.mechanic,
      image_url: raw.images?.[0] ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${raw.images[0]}` : null,
      gif_url: raw.images?.[1] ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${raw.images[1]}` : null,
      tags: generateTags(raw),
      is_featured: false,
      approval_status: 'approved',
      is_active: true
    };
    
    processed.push(exercise);
  }
  
  return processed;
}

function markFeaturedExercises(exercises) {
  const featuredKeywords = [
    'push-up', 'squat', 'deadlift', 'pull-up', 'bench press', 'plank',
    'burpee', 'lunge', 'crunch', 'jumping jack', 'mountain climber',
    'bicep curl', 'tricep dip', 'shoulder press', 'row'
  ];
  
  exercises.forEach(exercise => {
    const nameLower = exercise.name.toLowerCase();
    exercise.is_featured = featuredKeywords.some(keyword => 
      nameLower.includes(keyword)
    );
  });
}

// Main processing function
async function main() {
  try {
    console.log('🔄 Reading raw exercise data...');
    const rawDataPath = path.join(__dirname, 'exercises-raw.json');
    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
    
    console.log(`📊 Found ${rawData.length} raw exercises`);
    
    console.log('⚙️ Processing exercises...');
    const processedExercises = processExercises(rawData);
    
    console.log('⭐ Marking featured exercises...');
    markFeaturedExercises(processedExercises);
    
    console.log(`✅ Processed ${processedExercises.length} exercises`);
    
    // Split into chunks for easier import
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < processedExercises.length; i += chunkSize) {
      chunks.push(processedExercises.slice(i, i + chunkSize));
    }
    
    // Save processed data
    const outputPath = path.join(__dirname, 'processed-exercises.json');
    fs.writeFileSync(outputPath, JSON.stringify(processedExercises, null, 2));
    console.log(`💾 Saved processed exercises to: ${outputPath}`);
    
    // Save chunks for easier import
    chunks.forEach((chunk, index) => {
      const chunkPath = path.join(__dirname, `exercises-chunk-${index + 1}.json`);
      fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
    });
    console.log(`📦 Created ${chunks.length} import chunks`);
    
    // Generate statistics
    const stats = {
      total_exercises: processedExercises.length,
      featured_exercises: processedExercises.filter(e => e.is_featured).length,
      by_difficulty: {
        beginner: processedExercises.filter(e => e.difficulty === 'beginner').length,
        intermediate: processedExercises.filter(e => e.difficulty === 'intermediate').length,
        advanced: processedExercises.filter(e => e.difficulty === 'advanced').length
      },
      by_category: processedExercises.reduce((acc, exercise) => {
        acc[exercise.category_id] = (acc[exercise.category_id] || 0) + 1;
        return acc;
      }, {}),
      by_equipment: processedExercises.reduce((acc, exercise) => {
        exercise.equipment.forEach(eq => {
          acc[eq] = (acc[eq] || 0) + 1;
        });
        return acc;
      }, {})
    };
    
    console.log('\n📊 Processing Statistics:');
    console.log(`✅ Total exercises: ${stats.total_exercises}`);
    console.log(`⭐ Featured exercises: ${stats.featured_exercises}`);
    console.log(`📈 By difficulty:`, JSON.stringify(stats.by_difficulty, null, 2));
    console.log(`🏷️ By category:`, JSON.stringify(stats.by_category, null, 2));
    console.log(`🏋️ By equipment:`, JSON.stringify(stats.by_equipment, null, 2));
    
    const statsPath = path.join(__dirname, 'processing-stats.json');
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    
    console.log('\n🎉 Exercise data processing complete!');
    console.log(`📁 Files created:`);
    console.log(`   - processed-exercises.json (${processedExercises.length} exercises)`);
    console.log(`   - exercises-chunk-*.json (${chunks.length} import files)`);
    console.log(`   - processing-stats.json (statistics)`);
    
  } catch (error) {
    console.error('❌ Error processing exercise data:', error);
    process.exit(1);
  }
}

// Run the main function
main();