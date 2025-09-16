-- Create pre-confirmed test users for development
-- Run this in Supabase SQL Editor

-- Method 1: Create a confirmed test user directly
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@fitprove.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Test User"}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- Method 2: Update existing users to be confirmed
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE 
  email_confirmed_at IS NULL
  AND email LIKE '%@fitprove.com';

-- Method 3: Create a specific dev user
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'dev@fitprove.com',
    crypt('devpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Development User"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    email_confirmed_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO user_id;

  -- Create profile if profiles table exists
  INSERT INTO profiles (
    id,
    email,
    full_name,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    'dev@fitprove.com',
    'Development User',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Created development user: dev@fitprove.com / devpassword123';
END $$;