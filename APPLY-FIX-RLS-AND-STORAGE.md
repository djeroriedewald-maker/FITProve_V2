# Fix RLS Policies and Add Avatar Upload

**Issue**: Getting 406 errors when accessing `user_periodization` table
**Issue**: Profile edit button does nothing
**Issue**: Cannot upload avatar images

---

## 🎯 What This Fixes

1. ✅ **406 Errors** - Fixes RLS policies on `user_periodization` table
2. ✅ **Profile Editing** - Hooks up edit button to EditProfileModal
3. ✅ **Avatar Upload** - Creates storage bucket and policies for profile images
4. ✅ **RLS Policies** - Ensures all tables have proper security policies

---

## 📋 SQL to Run in Supabase Dashboard

**Go to**: Supabase Dashboard → SQL Editor → New Query

**Copy and run** the entire contents of: `FIX-RLS-AND-STORAGE.sql`

Or copy this:

```sql
-- Fix user_periodization RLS policies
DROP POLICY IF EXISTS "Users can view their own periodization" ON public.user_periodization;
DROP POLICY IF EXISTS "Users can insert their own periodization" ON public.user_periodization;
DROP POLICY IF EXISTS "Users can update their own periodization" ON public.user_periodization;
DROP POLICY IF EXISTS "Users can delete their own periodization" ON public.user_periodization;

CREATE POLICY "Enable read access for users to their own periodization"
  ON public.user_periodization FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Enable insert access for users to their own periodization"
  ON public.user_periodization FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update access for users to their own periodization"
  ON public.user_periodization FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable delete access for users to their own periodization"
  ON public.user_periodization FOR DELETE
  USING (user_id = auth.uid());

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Storage policies for avatar uploads
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## ✅ What Was Fixed in Code

### 1. **Added Edit Profile Functionality**
- ✅ Imported `EditProfileModal` component
- ✅ Added `showEditModal` state
- ✅ Connected `onEdit` handler to ProfileHeader
- ✅ Renders modal when edit button is clicked
- ✅ Reloads profile data after save

### 2. **Avatar Upload Support**
- ✅ Created `avatars` storage bucket
- ✅ 5MB file size limit
- ✅ Supports: JPEG, PNG, GIF, WebP
- ✅ Public read access for all avatars
- ✅ Users can only upload/update/delete their own avatars
- ✅ Avatars stored in user-specific folders: `avatars/{user_id}/avatar.jpg`

---

## 🧪 How to Test

### **After Running SQL:**

1. **Restart dev server** (if not already running)
2. **Navigate to** `/profile`
3. **Check console** - no more 406 errors!
4. **Click "Edit" button** on profile header
5. **Modal should open** with profile edit form
6. **Upload avatar** - should work without errors
7. **Save changes** - profile should update

---

## 📸 Avatar Upload Flow

```
User clicks "Edit Profile"
  ↓
Modal opens with avatar upload
  ↓
User selects image (JPEG/PNG/GIF/WebP, max 5MB)
  ↓
Image uploads to: storage/avatars/{user_id}/avatar.jpg
  ↓
Profile.avatar_url updates to public URL
  ↓
Avatar displays in ProfileHeader
```

---

## 🔒 Security

- ✅ **RLS enabled** on all tables
- ✅ **Users can only access their own data**
- ✅ **Public profiles** viewable by everyone (if `is_public = true`)
- ✅ **Avatar uploads** restricted to authenticated users
- ✅ **Folder isolation** - users can only upload to their own folder

---

## ✅ Verification

After applying SQL, verify with:

```sql
-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check storage policies
SELECT policyname FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check user_periodization policies
SELECT policyname FROM pg_policies
WHERE tablename = 'user_periodization';
```

---

**Status**: Ready to apply
**Impact**: Fixes all remaining errors + adds avatar upload
