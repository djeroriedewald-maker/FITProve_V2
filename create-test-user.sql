-- Quick test user creation for Supabase
-- Run this in Supabase SQL Editor if you need a test user

-- Option 1: Create a test user directly in auth.users (requires admin access)
-- This bypasses email confirmation
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'test@fitprove.com',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Test User"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create corresponding profile if you have a profiles table
INSERT INTO profiles (
  id,
  email,
  full_name,
  created_at,
  updated_at
) 
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  created_at,
  updated_at
FROM auth.users 
WHERE email = 'test@fitprove.com'
ON CONFLICT (id) DO NOTHING;