# Run Workout Templates Migration

## Quick Steps

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new

2. **Copy the SQL**
   - Open file: `supabase/migrations/0013_workout_templates.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)

3. **Execute in Supabase**
   - Paste into SQL Editor
   - Click "Run" button
   - Wait for success message

4. **Verify**
   - Check "Tables" section in sidebar
   - Look for `workout_templates` table
   - Should see 10 columns: id, user_id, name, description, preferences, created_at, updated_at, last_used_at, use_count, tags

## What This Migration Creates

✅ **workout_templates** table with:
- UUID primary key
- User ID foreign key (auth.users)
- Name and description fields
- JSONB preferences storage
- Automatic timestamps
- Usage tracking (use_count, last_used_at)
- Tag array for filtering

✅ **Indexes** for:
- Fast user queries (user_id)
- Sorting by creation date (created_at)

✅ **RLS Policies**:
- Users can view their own templates
- Users can create their own templates
- Users can update their own templates
- Users can delete their own templates

✅ **Trigger**:
- Automatically updates `updated_at` on row changes

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```bash
cd c:\Users\djero\.vscode\fitprove_v2
supabase db push
```

## After Migration

Test the template feature:
1. Go to Workout Generator
2. Generate a workout
3. Click "Save as Template"
4. Enter a name
5. Check Supabase table viewer to see your template
6. Click "Load Template" from welcome screen

---

**Migration File**: `supabase/migrations/0013_workout_templates.sql`
**Database**: https://kktyvxhwhuejotsqnbhn.supabase.co
