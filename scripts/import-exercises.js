// Supabase Exercise Import Script
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importExerciseChunk(chunkNumber) {
  try {
    console.log(`📦 Importing chunk ${chunkNumber}...`);
    
    const chunkPath = path.join(__dirname, `exercises-chunk-${chunkNumber}.json`);
    if (!fs.existsSync(chunkPath)) {
      console.log(`❌ Chunk ${chunkNumber} not found`);
      return false;
    }
    
    const exercises = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
    console.log(`   📋 Loading ${exercises.length} exercises`);
    
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercises)
      .select('id, name');
    
    if (error) {
      console.error(`❌ Error importing chunk ${chunkNumber}:`, error);
      
      // Try to import individually to identify problematic exercises
      console.log(`   🔄 Attempting individual imports...`);
      let successCount = 0;
      let errorCount = 0;
      
      for (const exercise of exercises) {
        try {
          const { error: singleError } = await supabase
            .from('exercises')
            .insert([exercise]);
          
          if (singleError) {
            console.log(`   ❌ Failed to import: ${exercise.name}`, singleError.message);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.log(`   ❌ Exception importing: ${exercise.name}`, err.message);
          errorCount++;
        }
      }
      
      console.log(`   📊 Individual results: ${successCount} success, ${errorCount} errors`);
      return successCount > 0;
    } else {
      console.log(`   ✅ Successfully imported ${data.length} exercises`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Exception in chunk ${chunkNumber}:`, error);
    return false;
  }
}

async function importAllExercises() {
  try {
    console.log('🚀 Starting exercise import to Supabase...');
    console.log(`🔗 Database: ${supabaseUrl}`);
    
    // Test connection
    console.log('🔌 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('exercise_categories')
      .select('name')
      .limit(1);
    
    if (testError) {
      console.error('❌ Cannot connect to Supabase:', testError);
      process.exit(1);
    }
    console.log('✅ Supabase connection successful');
    
    // Check if exercises table exists and has data
    const { count: existingCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Current exercises in database: ${existingCount || 0}`);
    
    if (existingCount > 0) {
      console.log('⚠️ Warning: Exercises already exist in database');
      console.log('   This import will attempt to add new exercises');
      console.log('   Duplicates will be skipped based on unique constraints');
    }
    
    // Find all chunk files
    const scriptDir = __dirname;
    const chunkFiles = fs.readdirSync(scriptDir)
      .filter(file => file.match(/^exercises-chunk-\d+\.json$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      });
    
    console.log(`📁 Found ${chunkFiles.length} chunk files to import`);
    
    let totalImported = 0;
    let successfulChunks = 0;
    let failedChunks = 0;
    
    // Import each chunk
    for (let i = 0; i < chunkFiles.length; i++) {
      const chunkNumber = i + 1;
      const success = await importExerciseChunk(chunkNumber);
      
      if (success) {
        successfulChunks++;
        
        // Estimate imported count (not exact due to potential duplicates)
        const chunkPath = path.join(scriptDir, `exercises-chunk-${chunkNumber}.json`);
        const exercises = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
        totalImported += exercises.length;
      } else {
        failedChunks++;
      }
      
      // Small delay between chunks to avoid rate limiting
      if (i < chunkFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Final count check
    const { count: finalCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n🎉 Import completed!');
    console.log(`📊 Results:`);
    console.log(`   📦 Chunks processed: ${chunkFiles.length}`);
    console.log(`   ✅ Successful chunks: ${successfulChunks}`);
    console.log(`   ❌ Failed chunks: ${failedChunks}`);
    console.log(`   📈 Estimated imported: ~${totalImported} exercises`);
    console.log(`   🎯 Total in database: ${finalCount || 0} exercises`);
    
    if (finalCount >= 800) {
      console.log('🏆 SUCCESS: You now have 800+ exercises in your database!');
    } else if (finalCount >= 500) {
      console.log('🎯 GOOD: You have 500+ exercises in your database!');
    } else if (finalCount >= 200) {
      console.log('✅ DECENT: You have 200+ exercises in your database!');
    } else {
      console.log('⚠️ WARNING: Less than 200 exercises imported, check for errors');
    }
    
  } catch (error) {
    console.error('💥 Fatal error during import:', error);
    process.exit(1);
  }
}

// Test individual exercise import
async function testSingleImport() {
  try {
    console.log('🧪 Testing single exercise import...');
    
    const testExercise = {
      name: 'Test Push-Up',
      slug: 'test-push-up',
      description: 'A test exercise for import validation',
      instructions: ['Get into push-up position', 'Lower your body', 'Push back up'],
      primary_muscles: ['chest'],
      secondary_muscles: ['triceps'],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      category_id: 'strength',
      force_type: 'push',
      mechanics: 'compound',
      tags: ['test', 'push-up', 'chest', 'bodyweight'],
      is_featured: false,
      approval_status: 'approved',
      is_active: true
    };
    
    const { data, error } = await supabase
      .from('exercises')
      .insert([testExercise])
      .select();
    
    if (error) {
      console.error('❌ Test import failed:', error);
      return false;
    } else {
      console.log('✅ Test import successful:', data[0].name);
      
      // Clean up test exercise
      await supabase
        .from('exercises')
        .delete()
        .eq('id', data[0].id);
      
      console.log('🧹 Test exercise cleaned up');
      return true;
    }
  } catch (error) {
    console.error('💥 Test import exception:', error);
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    const success = await testSingleImport();
    process.exit(success ? 0 : 1);
  } else if (args.includes('--chunk') && args[1]) {
    const chunkNumber = parseInt(args[1]);
    const success = await importExerciseChunk(chunkNumber);
    process.exit(success ? 0 : 1);
  } else {
    await importAllExercises();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { importAllExercises, importExerciseChunk, testSingleImport };