-- Create storage bucket for avatars and add policies
-- Idempotent-ish: create bucket if missing, then add RLS-like policies via storage API

-- Create bucket (Supabase's storage schema)
insert into storage.buckets (id, name, public)
select 'avatars', 'avatars', true
where not exists (select 1 from storage.buckets where id = 'avatars');

-- Allow authenticated users to upload/manage their own files under their userId directory
-- These policies are examples; adjust to your security needs.

-- Upload (insert) policy
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'upload_own_avatars'
  ) then
    create policy "upload_own_avatars"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'avatars'
        and (auth.uid()::text || '/') = left(name, length(auth.uid()::text) + 1)
      );
  end if;
end$$;

-- Update (e.g., replace) policy
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'update_own_avatars'
  ) then
    create policy "update_own_avatars"
      on storage.objects for update to authenticated
      using (
        bucket_id = 'avatars'
        and (auth.uid()::text || '/') = left(name, length(auth.uid()::text) + 1)
      )
      with check (
        bucket_id = 'avatars'
        and (auth.uid()::text || '/') = left(name, length(auth.uid()::text) + 1)
      );
  end if;
end$$;

-- Delete policy
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'delete_own_avatars'
  ) then
    create policy "delete_own_avatars"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'avatars'
        and (auth.uid()::text || '/') = left(name, length(auth.uid()::text) + 1)
      );
  end if;
end$$;

-- Read policy: allow public read if your app expects public URLs; otherwise restrict to authenticated
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'public_read_avatars'
  ) then
    create policy "public_read_avatars"
      on storage.objects for select to public
      using (bucket_id = 'avatars');
  end if;
end$$;
