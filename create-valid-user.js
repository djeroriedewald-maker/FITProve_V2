const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const client = createClient(supabaseUrl, supabaseKey);

async function createValidUser() {
  try {
    console.log('🔄 Creating a new valid user...');
    
    // Use dynamic email to avoid conflicts
    const testEmail = `user-${Date.now()}@fitprove.app`;
    const testPassword = 'testpassword123';
    const testName = 'Test User';

    console.log('Creating user:', testEmail);

    // Try to sign up
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName
        }
      }
    });

    if (signUpError) {
      console.log('❌ Sign up failed:', signUpError.message);
      return false;
    }

    console.log('✅ User created successfully!');
    console.log('User:', signUpData.user?.email);
    console.log('User ID:', signUpData.user?.id);
    console.log('Has session:', !!signUpData.session);

    // If we have a session immediately, we can proceed
    if (signUpData.session) {
      console.log('✅ User is immediately logged in!');
      
      // Test getting the session
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      
      if (sessionError) {
        console.log('❌ Session retrieval error:', sessionError.message);
      } else if (sessionData.session) {
        console.log('✅ Session confirmed!');
        console.log('Session user:', sessionData.session.user?.email);
        
        // Check if profile was auto-created
        const { data: profileData, error: profileError } = await client
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();

        if (profileError) {
          console.log('⚠️ Profile not found, might need to be created');
        } else {
          console.log('✅ Profile exists:', profileData.name || profileData.display_name);
        }

        return {
          email: testEmail,
          password: testPassword,
          userId: sessionData.session.user.id,
          session: true
        };
      }
    }

    return {
      email: testEmail,
      password: testPassword,
      userId: signUpData.user?.id,
      session: false
    };

  } catch (err) {
    console.error('❌ Error creating user:', err);
    return false;
  }
}

createValidUser().then(result => {
  if (result) {
    console.log('\n🎉 Result:', result);
    console.log('\nYou can now use these credentials:');
    console.log('Email:', result.email);
    console.log('Password:', result.password);
  }
});