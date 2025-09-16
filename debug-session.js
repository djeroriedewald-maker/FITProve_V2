// Debug Session Script
// Paste this in browser console to debug session issues

console.log('🔍 FITProve Session Debug');
console.log('========================\n');

// 1. Check localStorage
console.log('1. LocalStorage Check:');
const authTokens = Object.keys(localStorage).filter(key => 
  key.includes('auth') || key.includes('supabase') || key.includes('fitprove')
);

if (authTokens.length > 0) {
  console.log('✅ Auth tokens found in localStorage:');
  authTokens.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      console.log(`   ${key}:`, value ? JSON.parse(value) : value);
    } catch (e) {
      console.log(`   ${key}:`, localStorage.getItem(key));
    }
  });
} else {
  console.log('❌ No auth tokens found in localStorage');
}

// 2. Check Supabase session
console.log('\n2. Supabase Session Check:');
try {
  import('@supabase/supabase-js').then(({ createClient }) => {
    const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';
    
    const client = createClient(supabaseUrl, supabaseKey);
    
    client.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.log('❌ Session error:', error);
      } else if (data.session) {
        console.log('✅ Active session found!');
        console.log('   User:', data.session.user.email);
        console.log('   Expires:', new Date(data.session.expires_at * 1000));
        console.log('   Access token exists:', !!data.session.access_token);
      } else {
        console.log('❌ No active session');
      }
    });
  });
} catch (e) {
  console.log('❌ Error checking session:', e);
}

// 3. Instructions
console.log('\n3. Next Steps:');
console.log('If no session found:');
console.log('1. Go to /signin page');
console.log('2. Login with: djeroriedewald@gmail.com');
console.log('3. Run this script again');
console.log('4. Check if session persists after page reload');

// 4. Quick signin test
console.log('\n4. Quick Sign In Test:');
console.log('Run this in console after going to /signin:');
console.log(`
document.querySelector('input[type="email"]').value = 'djeroriedewald@gmail.com';
document.querySelector('input[type="password"]').value = 'YOUR_PASSWORD';
document.querySelector('form').submit();
`);

export { }; // Make this a module