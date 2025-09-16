const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const client = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  try {
    console.log('🔐 Attempting to sign in...');
    
    const testEmail = 'test@fitprove.app';
    const testPassword = 'testpassword123';

    // Try to sign in
    const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      console.log('Full error:', signInError);
      return false;
    }

    console.log('✅ Sign in successful!');
    console.log('User:', signInData.user?.email);
    console.log('User ID:', signInData.user?.id);
    console.log('Session exists:', !!signInData.session);

    // Now test if we can get the session
    console.log('\n🔍 Testing session retrieval...');
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Session found!');
      console.log('Session user:', sessionData.session.user?.email);
    } else {
      console.log('❌ No session found');
    }

    // Check if profile exists
    console.log('\n👤 Checking profile...');
    const { data: profileData, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('id', signInData.user?.id)
      .single();

    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
    } else {
      console.log('✅ Profile found:', profileData);
    }

    return true;

  } catch (err) {
    console.error('❌ Login test error:', err);
    return false;
  }
}

testLogin();