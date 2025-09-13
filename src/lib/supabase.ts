import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');
}

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);