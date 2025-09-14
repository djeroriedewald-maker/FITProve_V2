-- Create storage bucket for avatars if it doesn't exist
insert into storage.buckets (id, name, public)
select 'avatars', 'avatars', true
where not exists (
  select 1 from storage.buckets where id = 'avatars'
);

-- Allow public read access to the avatars bucket
create policy if not exists "Public read for avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload to their own folder
create policy if not exists "Users can upload their own avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (auth.role() = 'authenticated')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own files
create policy if not exists "Users can update their own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (auth.role() = 'authenticated')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (auth.role() = 'authenticated')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own files
create policy if not exists "Users can delete their own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (auth.role() = 'authenticated')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
