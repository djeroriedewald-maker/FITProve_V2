# Apply Storage Bucket Migration

## Issue
When uploading hero images, you get: **"Error uploading image: StorageApiError: Bucket not found"**

## Solution
Apply migration `0018_create_workout_images_bucket.sql` to create the storage bucket and policies.

## Steps

### Option 1: Using Supabase CLI (Recommended)

```bash
npx supabase migration up
```

### Option 2: Manual SQL Execution

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/0018_create_workout_images_bucket.sql`
3. Paste and run the SQL

### Option 3: Direct Bucket Creation (Alternative)

If the migration fails, you can create the bucket manually:

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Configure:
   - **Name**: `workout-images`
   - **Public**: ✅ Enabled
   - **File size limit**: 5MB (5242880 bytes)
   - **Allowed MIME types**:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`

4. Then create the policies manually in Storage → Policies:

   **Upload Policy** (Insert):
   ```sql
   bucket_id = 'workout-images' AND
   (storage.foldername(name))[1] = 'hero-images' AND
   (storage.foldername(name))[2] = auth.uid()::text
   ```

   **Read Policy** (Select):
   ```sql
   bucket_id = 'workout-images'
   ```

   **Delete Policy**:
   ```sql
   bucket_id = 'workout-images' AND
   (storage.foldername(name))[1] = 'hero-images' AND
   (storage.foldername(name))[2] = auth.uid()::text
   ```

   **Update Policy**:
   ```sql
   bucket_id = 'workout-images' AND
   (storage.foldername(name))[1] = 'hero-images' AND
   (storage.foldername(name))[2] = auth.uid()::text
   ```

## Verification

After applying the migration, verify:

1. Go to Supabase Dashboard → Storage
2. You should see a `workout-images` bucket
3. It should be marked as "Public"
4. Try uploading a hero image in the workout creator

## What This Does

- Creates a public storage bucket named `workout-images`
- Sets file size limit to 5MB
- Restricts file types to images only (JPG, PNG, WebP)
- Creates RLS policies:
  - Users can upload images to their own folder (`hero-images/{user_id}/...`)
  - Everyone can view/download images (public read)
  - Users can only delete/update their own images

## File Structure

Images will be stored as:
```
workout-images/
  └── hero-images/
      └── {user_id}/
          └── {timestamp}_{random}.{ext}
```

For example:
```
workout-images/hero-images/89d52d81-6b92-46f5-9fff-d655a89b5d3f/1704103825585_abc123.webp
```