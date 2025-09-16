// Test script for live exercise data - TypeScript version
import { ExerciseService } from './src/lib/exercise.service';

async function testLiveExercises() {
  console.log('🧪 Testing live exercise data from Supabase...\n');

  try {
    // Test 1: Get all exercises with count
    console.log('📊 Test 1: Fetching all exercises...');
    const allResult = await ExerciseService.getExercises();
    console.log(`✅ Total exercises: ${allResult.total_count}`);
    console.log(`✅ Exercises fetched: ${allResult.exercises.length}`);
    
    if (allResult.exercises.length > 0) {
      const firstExercise = allResult.exercises[0];
      console.log(`✅ Sample exercise: "${firstExercise.name}" - ${firstExercise.muscle_group}`);
    }

    // Test 2: Search for specific exercises
    console.log('\n🔍 Test 2: Searching for "push" exercises...');
    const searchResult = await ExerciseService.searchExercises('push');
    console.log(`✅ Push exercises found: ${searchResult.exercises.length}`);
    
    if (searchResult.exercises.length > 0) {
      console.log(`✅ Sample: "${searchResult.exercises[0].name}"`);
    }

    // Test 3: Filter by muscle group
    console.log('\n💪 Test 3: Filtering by chest exercises...');
    const chestResult = await ExerciseService.getExercises({
      muscle_groups: ['chest']
    });
    console.log(`✅ Chest exercises: ${chestResult.exercises.length}`);

    // Test 4: Filter by equipment
    console.log('\n🏋️ Test 4: Filtering by bodyweight exercises...');
    const bodyweightResult = await ExerciseService.getExercises({
      equipment: ['bodyweight']
    });
    console.log(`✅ Bodyweight exercises: ${bodyweightResult.exercises.length}`);

    // Test 5: Filter by difficulty
    console.log('\n📈 Test 5: Filtering by beginner exercises...');
    const beginnerResult = await ExerciseService.getExercises({
      difficulty: ['beginner']
    });
    console.log(`✅ Beginner exercises: ${beginnerResult.exercises.length}`);

    // Test 6: Get featured exercises
    console.log('\n⭐ Test 6: Fetching featured exercises...');
    const featuredResult = await ExerciseService.getFeaturedExercises();
    console.log(`✅ Featured exercises: ${featuredResult.length}`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`   • Total exercises in database: ${allResult.total_count}`);
    console.log(`   • Push exercises: ${searchResult.exercises.length}`);
    console.log(`   • Chest exercises: ${chestResult.exercises.length}`);
    console.log(`   • Bodyweight exercises: ${bodyweightResult.exercises.length}`);
    console.log(`   • Beginner exercises: ${beginnerResult.exercises.length}`);
    console.log(`   • Featured exercises: ${featuredResult.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run the tests
testLiveExercises();