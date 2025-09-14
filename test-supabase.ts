import { supabase } from './src/lib/supabase';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');

  try {
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth status:', user ? 'Authenticated' : 'Not authenticated');
    if (authError) console.error('Auth error:', authError);

    // Test database query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    console.log('Can query profiles:', profiles);
    if (profilesError) console.error('Profiles error:', profilesError);

    // Test RLS policies
    const { data: insertResult, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@test.com',
        name: 'Test User'
      } as any)
      .select()
      .single();

    console.log('Insert test result:', insertResult);
    if (insertError) console.error('Insert error:', insertError);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSupabaseConnection();