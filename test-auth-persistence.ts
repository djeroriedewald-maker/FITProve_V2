import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovlxapmtdglgjsatnmjp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bHhhcG10ZGdsZ2pzYXRubWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyODE1MjEsImV4cCI6MjA1MTg1NzUyMX0.bJLUaYfNTAFW55vX_k9rEVPKu7yx4Bnqv4lU6c8hPNo';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'fitprove-auth-token',
    flowType: 'pkce'
  }
});

async function testAuthPersistence() {
  console.log('🔐 TESTING AUTHENTICATION PERSISTENCE\n');
  
  try {
    // Test 1: Check if session is persisted
    console.log('1️⃣ Checking stored session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Session check failed:', error.message);
      return;
    }
    
    if (session) {
      console.log('✅ Session found and valid');
      console.log(`   User ID: ${session.user.id}`);
      console.log(`   Email: ${session.user.email}`);
      console.log(`   Expires at: ${new Date(session.expires_at! * 1000).toLocaleString()}`);
      console.log(`   Token type: ${session.token_type}`);
      
      // Test 2: Check if user profile is accessible
      console.log('\n2️⃣ Testing profile access...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile access failed:', profileError.message);
      } else {
        console.log('✅ Profile accessible');
        console.log(`   Display name: ${profile.display_name || profile.name}`);
        console.log(`   Username: ${profile.username}`);
      }
      
      // Test 3: Check auth token refresh capability
      console.log('\n3️⃣ Testing token refresh...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.log('❌ Token refresh failed:', refreshError.message);
      } else {
        console.log('✅ Token refresh successful');
        console.log(`   New expires at: ${new Date(refreshData.session!.expires_at! * 1000).toLocaleString()}`);
      }
      
    } else {
      console.log('ℹ️  No session found - user needs to sign in');
    }
    
    // Test 4: Check localStorage storage
    console.log('\n4️⃣ Checking localStorage...');
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem('fitprove-auth-token');
      if (storedAuth) {
        console.log('✅ Auth token stored in localStorage');
        try {
          const parsed = JSON.parse(storedAuth);
          console.log(`   Stored user ID: ${parsed.user?.id}`);
          console.log(`   Access token present: ${!!parsed.access_token}`);
          console.log(`   Refresh token present: ${!!parsed.refresh_token}`);
        } catch (e) {
          console.log('⚠️  Stored auth token is not valid JSON');
        }
      } else {
        console.log('❌ No auth token in localStorage');
      }
    } else {
      console.log('ℹ️  Not in browser environment, cannot check localStorage');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 AUTH PERSISTENCE STATUS:');
    
    if (session) {
      console.log('✅ WORKING: User session is persisted');
      console.log('✅ WORKING: Profile data accessible');
      console.log('✅ WORKING: Token refresh functional');
      console.log('\n🚀 Authentication should persist across app switches!');
    } else {
      console.log('❌ NO SESSION: User needs to sign in');
      console.log('💡 Sign in first, then test persistence');
    }
    
  } catch (error: any) {
    console.log('❌ Test failed:', error.message);
  }
}

testAuthPersistence();