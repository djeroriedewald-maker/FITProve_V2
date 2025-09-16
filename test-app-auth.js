// TEST AUTH IN APP CONTEXT
const { createClient } = require('@supabase/supabase-js');

async function testAppAuth() {
  console.log('🔍 Testing auth in app context...');
  
  // Get env vars (you may need to adjust these paths)
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase environment variables');
    console.log('VITE_SUPABASE_URL:', !!supabaseUrl);
    console.log('VITE_SUPABASE_ANON_KEY:', !!supabaseKey);
    return;
  }
  
  console.log('✅ Environment variables found');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test 1: getUser()
  console.log('\n1️⃣ Testing getUser()...');
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('getUser result:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      error: userError
    });
  } catch (e) {
    console.log('getUser exception:', e.message);
  }
  
  // Test 2: getSession()
  console.log('\n2️⃣ Testing getSession()...');
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('getSession result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      email: session?.user?.email,
      error: sessionError
    });
  } catch (e) {
    console.log('getSession exception:', e.message);
  }
  
  // Test 3: Try direct custom_workouts access
  console.log('\n3️⃣ Testing custom_workouts table access...');
  try {
    const { data, error } = await supabase
      .from('custom_workouts')
      .select('id, name, user_id')
      .limit(3);
    
    console.log('custom_workouts access:', {
      success: !error,
      recordCount: data?.length || 0,
      error: error?.message
    });
  } catch (e) {
    console.log('custom_workouts exception:', e.message);
  }
  
  // Test 4: Try minimal insert test
  console.log('\n4️⃣ Testing minimal insert (will rollback)...');
  try {
    const { data, error } = await supabase
      .from('custom_workouts')
      .insert([{
        user_id: '89d52d81-6b92-46f5-9fff-d655a8905d3f', // Your first user ID
        name: 'TEST WORKOUT - WILL DELETE',
        description: 'Test description'
      }])
      .select();
      
    console.log('Insert test result:', {
      success: !error,
      insertedId: data?.[0]?.id,
      error: error?.message
    });
    
    // Clean up - delete the test workout
    if (data?.[0]?.id) {
      await supabase
        .from('custom_workouts')
        .delete()
        .eq('id', data[0].id);
      console.log('✅ Test workout deleted');
    }
  } catch (e) {
    console.log('Insert test exception:', e.message);
  }
}

testAppAuth().catch(console.error);