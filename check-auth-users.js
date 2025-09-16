const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthUsers() {
  console.log('🔍 Controleren van auth.users en profiles synchronisatie...\n');
  
  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('1. Huidige sessie status:');
    if (sessionError) {
      console.log('❌ Sessie fout:', sessionError.message);
    } else if (session) {
      console.log('✅ Actieve sessie gevonden');
      console.log('   User ID:', session.user.id);
      console.log('   Email:', session.user.email);
      console.log('   Email bevestigd:', session.user.email_confirmed_at ? '✅ Ja' : '❌ Nee');
    } else {
      console.log('❌ Geen actieve sessie');
    }
    
    // Check profiles table
    console.log('\n2. Profiles tabel check:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .limit(10);
      
    if (profilesError) {
      console.log('❌ Kan profiles niet lezen:', profilesError.message);
      if (profilesError.message.includes('policy')) {
        console.log('🔒 RLS blokkeert toegang tot profiles');
      }
    } else {
      console.log(`✅ ${profiles.length} profielen gevonden in profiles tabel`);
      profiles.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.email} (${p.name}) - ID: ${p.id}`);
      });
    }
    
    // Test if we can query auth.users directly (usually not allowed)
    console.log('\n3. Test direct auth.users toegang:');
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id, email')
        .limit(3);
        
      if (authError) {
        console.log('❌ Kan auth.users niet direct benaderen (normaal):', authError.message);
      } else {
        console.log('✅ Auth users gevonden:', authUsers.length);
      }
    } catch (e) {
      console.log('❌ Direct auth.users toegang niet mogelijk (normaal)');
    }
    
    // Test workout tables
    console.log('\n4. Test workout tables toegang:');
    const { data: workouts, error: workoutError } = await supabase
      .from('custom_workouts')
      .select('id, name, user_id')
      .limit(3);
      
    if (workoutError) {
      console.log('❌ Workout toegang fout:', workoutError.message);
      if (workoutError.message.includes('policy')) {
        console.log('🔒 RLS policies blokkeren toegang');
      }
    } else {
      console.log(`✅ Workout tables toegankelijk - ${workouts.length} workouts`);
    }
    
    console.log('\n🎯 DIAGNOSE:');
    console.log('- Auth Users: Bestaan in Supabase Dashboard');
    console.log('- Profiles Sync: ', profiles?.length > 0 ? '✅ Gesynchroniseerd' : '❌ Niet gesynchroniseerd');
    console.log('- Workout Access: ', workoutError ? '❌ Geblokkeerd door RLS' : '✅ Toegankelijk');
    
    if (session) {
      console.log('\n🧪 Test met huidige gebruiker:');
      console.log(`User ID om te gebruiken: ${session.user.id}`);
    }
    
  } catch (error) {
    console.error('❌ Onverwachte fout:', error);
  }
}

checkAuthUsers();