// TEST MET ECHTE UUID
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithRealUserId() {
  console.log('🔍 TESTING WITH REAL USER ID...\n');
  
  try {
    // First get current session to get real user ID
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.log('❌ No session found, trying with existing profiles...');
      
      // Get an existing profile ID to test with
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (profileError || !profiles?.length) {
        console.log('❌ No profiles found either');
        return;
      }
      
      const testUserId = profiles[0].id;
      console.log('✅ Using existing profile ID:', testUserId);
      
      // Test insert with real UUID
      const testInsert = {
        user_id: testUserId,
        name: 'Test Workout UUID Check',
        description: 'Test description'
      };
      
      console.log('📤 Testing insert with data:', testInsert);
      
      const { data: insertTest, error: insertError } = await supabase
        .from('custom_workouts')
        .insert([testInsert])
        .select();
        
      if (insertError) {
        console.log('❌ Insert test failed:', insertError.message);
        console.log('❌ Error details:', insertError.details);
        console.log('❌ Error hint:', insertError.hint);
        console.log('❌ Error code:', insertError.code);
      } else {
        console.log('✅ INSERT SUCCESS!');
        console.log('✅ Created workout:', insertTest[0]);
        
        // Clean up test data
        const cleanup = await supabase.from('custom_workouts').delete().eq('id', insertTest[0].id);
        console.log('🧹 Cleanup result:', cleanup.error ? cleanup.error.message : 'Success');
      }
      
    } else {
      console.log('✅ Current session user ID:', session.user.id);
      console.log('✅ Session user email:', session.user.email);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithRealUserId();