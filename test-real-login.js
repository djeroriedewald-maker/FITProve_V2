const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const client = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'fitprove-auth-token',
    flowType: 'pkce'
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testRealUserLogin() {
  try {
    console.log('🔐 Testing login for real user: djeroriedewald@gmail.com');
    console.log('This user last signed in today at 12:53\n');
    
    // Prompt for password
    rl.question('Enter password for djeroriedewald@gmail.com: ', async (password) => {
      try {
        console.log('\n🔄 Attempting login...');
        
        const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
          email: 'djeroriedewald@gmail.com',
          password: password
        });

        if (signInError) {
          console.log('❌ Sign in failed:', signInError.message);
          
          if (signInError.message.includes('Invalid login credentials')) {
            console.log('\n💡 Tips:');
            console.log('- Check if password is correct');
            console.log('- Try going to the app and using "forgot password"');
            console.log('- Check if account is still active');
          }
        } else {
          console.log('✅ Sign in successful!');
          console.log('User:', signInData.user?.email);
          console.log('User ID:', signInData.user?.id);
          console.log('Session exists:', !!signInData.session);
          console.log('Access token length:', signInData.session?.access_token?.length || 0);
          
          // Test immediate session retrieval
          console.log('\n🔍 Testing session persistence...');
          const { data: sessionData, error: sessionError } = await client.auth.getSession();
          
          if (sessionError) {
            console.log('❌ Session retrieval error:', sessionError.message);
          } else if (sessionData.session) {
            console.log('✅ Session persisted successfully!');
            console.log('Session user:', sessionData.session.user?.email);
            
            // Test profile access
            console.log('\n👤 Testing profile access...');
            const { data: profileData, error: profileError } = await client
              .from('profiles')
              .select('*')
              .eq('id', sessionData.session.user.id)
              .single();

            if (profileError) {
              console.log('❌ Profile access error:', profileError.message);
            } else {
              console.log('✅ Profile accessed successfully!');
              console.log('Profile name:', profileData.name);
              console.log('Profile email:', profileData.email);
            }

            // Test workout creation
            console.log('\n💾 Testing workout creation capability...');
            const testWorkout = {
              title: 'Test Workout from CLI',
              level: 'beginner',
              goal: 'strength',
              duration_min: 30,
              tags: ['test', 'cli'],
              signature: `test-${Date.now()}`
            };

            const { data: workoutData, error: workoutError } = await client
              .from('workouts')
              .insert(testWorkout)
              .select()
              .single();

            if (workoutError) {
              console.log('❌ Workout creation error:', workoutError.message);
              console.log('This might be the same error you see in the app!');
            } else {
              console.log('✅ Workout created successfully!');
              console.log('Workout ID:', workoutData.id);
              console.log('Workout title:', workoutData.title);
              
              // Clean up test workout
              await client.from('workouts').delete().eq('id', workoutData.id);
              console.log('🗑️ Test workout cleaned up');
            }
            
          } else {
            console.log('❌ Session not persisted');
          }
        }
      } catch (err) {
        console.error('❌ Login test error:', err);
      } finally {
        rl.close();
      }
    });

  } catch (err) {
    console.error('❌ Test setup error:', err);
    rl.close();
  }
}

console.log('This script will test login with your real user account.');
console.log('We know the account exists and was last used today at 12:53.\n');

testRealUserLogin();