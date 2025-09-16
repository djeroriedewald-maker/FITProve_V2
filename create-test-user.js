const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const client = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...');
    
    const testEmail = 'test@fitprove.app';
    const testPassword = 'testpassword123';
    const testName = 'Test User';

    // First try to sign up
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName
        }
      }
    });

    console.log('SignUp result:', { data: signUpData, error: signUpError });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✅ User already exists, trying to sign in...');
        
        // Try to sign in
        const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });

        console.log('SignIn result:', { data: signInData, error: signInError });
        
        if (signInError) {
          console.log('❌ Sign in failed:', signInError.message);
          return false;
        } else {
          console.log('✅ Signed in successfully!');
          console.log('User:', signInData.user?.email);
          console.log('Session:', !!signInData.session);
          return true;
        }
      } else {
        console.log('❌ Sign up failed:', signUpError.message);
        return false;
      }
    } else {
      console.log('✅ Sign up successful!');
      console.log('User:', signUpData.user?.email);
      console.log('Session:', !!signUpData.session);
      return true;
    }

  } catch (err) {
    console.error('❌ Error creating test user:', err);
    return false;
  }
}

createTestUser();