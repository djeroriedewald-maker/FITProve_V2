# 🚀 Apply Migrations to Production - Step by Step

Since we can't use CLI directly without interactive login, here are the exact steps to apply migrations to production:

## **Method 1: Supabase Dashboard (Easiest - 5 minutes)**

### **Step 1: Open Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn
2. Login if needed
3. Click **"SQL Editor"** in the left sidebar

---

### **Step 2: Apply Migration #1 (Fitness Profile Fields)**

1. Click **"New Query"** button
2. Copy **ALL** content from file: `supabase/migrations/0014_add_fitness_profile_fields.sql`
3. Paste into the SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)
5. ✅ You should see: **"Success. No rows returned"**

**What this does**:
- Adds 14 new columns to `profiles` table
- Creates indexes for performance
- Adds check constraints for data validation

---

### **Step 3: Apply Migration #2 (Periodization Tracking)**

1. Click **"New Query"** button (to clear previous query)
2. Copy **ALL** content from file: `supabase/migrations/0015_user_periodization.sql`
3. Paste into the SQL Editor
4. Click **"Run"**
5. ✅ You should see: **"Success. No rows returned"**

**What this does**:
- Creates new `user_periodization` table
- Sets up RLS policies
- Creates triggers for auto-updates
- Adds indexes

---

### **Step 4: Verify Tables**

1. Click **"Table Editor"** in left sidebar
2. Find `profiles` table:
   - Click on it
   - Scroll right to see new columns:
     - `fitness_level`
     - `age`
     - `event_type`
     - `limitations`
     - `available_equipment`
     - `preferred_duration`
     - `preferred_workout_styles`
     - `onboarding_completed`
     - etc.

3. Find `user_periodization` table:
   - Should be in the list
   - Click on it to see all columns
   - Check "RLS" tab - should show 4 policies enabled

---

## **Method 2: Using Database Password (Alternative)**

If you have your database password, you can connect directly:

```bash
# Get your database password from Supabase Dashboard:
# Settings → Database → Connection string → Password

# Then run:
psql "postgresql://postgres:[YOUR-PASSWORD]@db.kktyvxhwhuejotsqnbhn.supabase.co:5432/postgres" < supabase/migrations/0014_add_fitness_profile_fields.sql

psql "postgresql://postgres:[YOUR-PASSWORD]@db.kktyvxhwhuejotsqnbhn.supabase.co:5432/postgres" < supabase/migrations/0015_user_periodization.sql
```

---

## **Verification SQL Queries**

After applying migrations, run these in SQL Editor to verify:

### **Check profiles table has new columns**:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN (
    'fitness_level',
    'age',
    'event_type',
    'limitations',
    'available_equipment',
    'preferred_duration',
    'preferred_workout_styles',
    'onboarding_completed'
  )
ORDER BY column_name;
```

**Expected**: Should return 8 rows

---

### **Check user_periodization table exists**:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_periodization'
ORDER BY ordinal_position;
```

**Expected**: Should return ~20 rows (all columns)

---

### **Check RLS policies**:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'user_periodization')
ORDER BY tablename, policyname;
```

**Expected**: Should show RLS policies for both tables

---

## **Quick Checklist**

After migration:

- [ ] SQL Editor shows "Success" for migration #1
- [ ] SQL Editor shows "Success" for migration #2
- [ ] `profiles` table has 14 new columns
- [ ] `user_periodization` table exists
- [ ] `user_periodization` has 4 RLS policies
- [ ] No errors in Table Editor

---

## **What to Tell Me**

Once you've applied the migrations, let me know:

1. ✅ "Migration #1 applied successfully"
2. ✅ "Migration #2 applied successfully"
3. ✅ "I can see the new columns in Table Editor"

Then I'll proceed with:
- Update TypeScript types
- Create services
- Integrate with the app

---

## **If You Get Errors**

**Error: "column already exists"**
- This means migration was already applied (that's fine!)
- Skip to verification step

**Error: "permission denied"**
- Make sure you're logged into the correct Supabase project
- Make sure you have owner/admin access

**Error: "syntax error"**
- Make sure you copied the ENTIRE migration file
- Check there are no missing characters

---

**Ready to apply? Go to the Supabase Dashboard and follow Step 1-4 above!** 🚀

Once done, let me know and we'll continue with the TypeScript integration.
