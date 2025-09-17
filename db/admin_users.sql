-- admin_users.sql: beheer van admin rechten voor badge/admin module

-- 1. Admin users tabel
CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    invited_by uuid REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Voeg initiële admin toe (djeroriedewald@gmail.com)
INSERT INTO public.admin_users (user_id, email)
SELECT id, 'djeroriedewald@gmail.com'
FROM auth.users
WHERE email = 'djeroriedewald@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- 3. RLS: alleen admins mogen admin_users lezen/schrijven
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage admin_users" ON public.admin_users
    USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()));
CREATE POLICY "Admins can insert admin_users" ON public.admin_users
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()));

-- Einde admin_users.sql
