const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listExistingProfiles() {
  console.log('🔍 Controleren van bestaande profielen in Supabase...\n');
  
  try {
    // Haal alle profielen op
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name, display_name, username, created_at')
      .order('created_at', { ascending: true });
      
    if (profilesError) {
      console.log('❌ Fout bij ophalen profielen:', profilesError.message);
      
      // Probeer met alleen basis velden
      const { data: basicProfiles, error: basicError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
        
      if (basicError) {
        console.log('❌ Ook basis query faalt:', basicError.message);
      } else {
        console.log('✅ Basis profielen gevonden:', basicProfiles.length);
        console.log('📋 Profiel structuur:', Object.keys(basicProfiles[0] || {}));
      }
      return;
    }
    
    if (profiles.length === 0) {
      console.log('⚠️ Geen profielen gevonden in de database');
      console.log('   Mogelijk moet je eerst profielen aanmaken of RLS uitschakelen');
      return;
    }
    
    console.log(`✅ ${profiles.length} profielen gevonden:\n`);
    
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.name || profile.display_name || 'Geen naam'}`);
      console.log(`   📧 Email: ${profile.email || 'Geen email'}`);
      console.log(`   🆔 ID: ${profile.id}`);
      console.log(`   👤 Username: ${profile.username || 'Geen username'}`);
      console.log(`   📅 Aangemaakt: ${new Date(profile.created_at).toLocaleDateString('nl-NL')}`);
      console.log('');
    });
    
    // Test toegang tot workout tables
    console.log('🧪 Testen van toegang tot workout tables...');
    
    const { data: workouts, error: workoutError } = await supabase
      .from('custom_workouts')
      .select('id, name, user_id')
      .limit(3);
      
    if (workoutError) {
      console.log('❌ Kan geen workouts ophalen:', workoutError.message);
      if (workoutError.message.includes('policy')) {
        console.log('🚨 RLS blokkeert toegang - run het access script!');
      }
    } else {
      console.log(`✅ Kan workout table benaderen - ${workouts.length} workouts gevonden`);
    }
    
    console.log('\n🎯 VOLGENDE STAPPEN:');
    console.log('1. Run het enable-all-profiles-access.sql script in Supabase');
    console.log('2. Refresh je browser op de workout creator pagina');
    console.log('3. Gebruik een van de bovenstaande profiel IDs voor testing');
    
    if (profiles.length > 0) {
      console.log(`\n💡 Tip: Je kunt profile ID ${profiles[0].id} gebruiken voor testing`);
    }
    
  } catch (error) {
    console.error('❌ Onverwachte fout:', error);
  }
}

listExistingProfiles();