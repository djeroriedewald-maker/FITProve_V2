const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

console.log('🔗 Testing Supabase connection...');
const client = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    console.log('📡 Testing auth.getSession()...');
    const { data, error } = await client.auth.getSession();
    
    console.log('Session data:', data);
    console.log('Session error:', error);
    
    if (error) {
      console.log('❌ Session error:', error.message);
    } else if (data?.session) {
      console.log('✅ Session found:', data.session.user?.email);
    } else {
      console.log('❌ No session found - user not logged in');
    }

    // Test database connection
    console.log('\n📊 Testing database connection...');
    const { data: testData, error: testError } = await client
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('❌ Database error:', testError.message);
    } else {
      console.log('✅ Database connection works');
    }

  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

testConnection();