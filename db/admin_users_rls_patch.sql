-- admin_users_rls_patch.sql: verbeterde RLS policies voor admin_users


DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can insert admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Anyone can read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Truly anyone can read admin_users" ON public.admin_users;

-- Iedereen die is ingelogd mag lezen
CREATE POLICY "Anyone can read admin_users" ON public.admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Alleen service_role mag muteren (insert/update/delete)
CREATE POLICY "Service role can manage admin_users" ON public.admin_users
  FOR ALL TO service_role USING (true);

-- Einde admin_users_rls_patch.sql
