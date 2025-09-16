-- Simple script to create a test user and profile
-- This creates both auth.users and profiles entries

DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
BEGIN
    -- Create user in auth.users
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
        new_user_id,
        'test@fitprove.com',
        crypt('testpassword123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"full_name": "Test User"}'::jsonb,
        false,
        'authenticated'
    ) ON CONFLICT (email) DO UPDATE SET
        email_confirmed_at = now(),
        updated_at = now();

    -- Get the user ID (in case of conflict)
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'test@fitprove.com';

    -- Create profile
    INSERT INTO public.profiles (
        id,
        email,
        name,
        display_name,
        username,
        bio,
        level,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'test@fitprove.com',
        'Test User',
        'Test User',
        'testuser',
        'Test user for FitProve app development',
        1,
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = now();

    RAISE NOTICE 'Created test user with ID: %', new_user_id;
END $$;

-- Verify the user was created
SELECT 
    p.id,
    p.email,
    p.name,
    p.username,
    p.created_at,
    'Profile created successfully' as status
FROM public.profiles p 
WHERE p.email = 'test@fitprove.com';

-- Check auth user
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN 'Email Confirmed ✓'
        ELSE 'Email NOT Confirmed ✗'
    END as email_status
FROM auth.users u 
WHERE u.email = 'test@fitprove.com';