# 🚀 Apply Migrations Guide

## Step-by-Step Instructions

### **Step 1: Start Docker Desktop**

**Windows**:
1. Press `Win` key and search for "Docker Desktop"
2. Click to open Docker Desktop
3. Wait for Docker Desktop to fully start (whale icon in system tray should be still)
4. You'll see "Docker Desktop is running" in the system tray

**Or use command line**:
```bash
# Open Docker Desktop via command
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

---

### **Step 2: Verify Docker is Running**

Open terminal and run:
```bash
docker ps
```

**Expected output**:
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

If you see this (even if empty), Docker is running! ✅

---

### **Step 3: Start Supabase Local Development**

```bash
cd c:/Users/djero/.vscode/fitprove_v2
npx supabase start
```

**This will**:
- Start PostgreSQL database
- Start Supabase Studio (UI)
- Start Auth server
- Start Storage server
- Apply all existing migrations

**Wait for output showing**:
```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
```

---

### **Step 4: Apply New Migrations**

Since `npx supabase start` applies all migrations automatically, your new migrations should already be applied! ✅

To verify, run:
```bash
npx supabase migration list
```

**You should see**:
```
0014_add_fitness_profile_fields.sql ✓
0015_user_periodization.sql ✓
```

---

### **Step 5: Verify Tables in Supabase Studio**

1. Open Supabase Studio: http://localhost:54323
2. Click "Table Editor" in left sidebar
3. You should see:
   - `profiles` table (with new columns)
   - `user_periodization` table (new!)

**Check profiles table**:
- Look for new columns: `fitness_level`, `age`, `event_type`, `limitations`, etc.

**Check user_periodization table**:
- Should have columns: `user_id`, `goal`, `current_week`, `macro_phase`, etc.

---

## Alternative: Apply Migrations Manually (if Supabase CLI fails)

### **Option A: Reset Database (applies all migrations)**

```bash
npx supabase db reset
```

⚠️ **Warning**: This drops all data and reapplies all migrations from scratch

---

### **Option B: Apply Only New Migrations**

```bash
npx supabase migration up
```

This applies only migrations that haven't been run yet.

---

### **Option C: Apply via SQL Editor**

If local setup isn't working, apply migrations via Supabase Dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"
5. Copy content from `supabase/migrations/0014_add_fitness_profile_fields.sql`
6. Click "Run"
7. Repeat for `0015_user_periodization.sql`

---

## Troubleshooting

### **Docker Desktop won't start**

**Fix**:
- Restart computer
- Run Docker Desktop as Administrator
- Check Windows Services: Docker Desktop Service should be running

---

### **`npx supabase start` fails with port conflicts**

**Fix**:
```bash
# Stop Supabase
npx supabase stop

# Start again
npx supabase start
```

---

### **Migrations already applied error**

**This is fine!** It means migrations were already run. Verify with:
```bash
npx supabase migration list
```

---

### **Database connection error**

**Fix**:
```bash
# Check status
npx supabase status

# If not running
npx supabase start
```

---

## Verify Migration Success

### **1. Check via Supabase Studio**

Go to http://localhost:54323 → Table Editor

**profiles table should have**:
- ✅ `fitness_level` column
- ✅ `age` column
- ✅ `event_type` column
- ✅ `limitations` column (array)
- ✅ `available_equipment` column (array)
- ✅ `preferred_duration` column
- ✅ `preferred_workout_styles` column (array)
- ✅ `onboarding_completed` column

**user_periodization table should exist** with:
- ✅ `user_id` column (UUID, FK to auth.users)
- ✅ `goal` column (text)
- ✅ `current_week` column (integer)
- ✅ `macro_phase` column (text)
- ✅ `micro_week` column (text)
- ✅ `is_deload_week` column (boolean)
- ✅ All other columns from migration

---

### **2. Check via SQL Query**

In Supabase Studio → SQL Editor, run:

```sql
-- Check profiles table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'fitness_level',
    'age',
    'event_type',
    'limitations',
    'available_equipment',
    'preferred_duration'
  );
```

**Expected**: Returns 6 rows

```sql
-- Check user_periodization table exists
SELECT * FROM user_periodization LIMIT 0;
```

**Expected**: Returns empty result (no error)

---

### **3. Check RLS Policies**

In Supabase Studio → SQL Editor:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_periodization';
```

**Expected**: `rowsecurity = true`

```sql
-- Check policies exist
SELECT policyname
FROM pg_policies
WHERE tablename = 'user_periodization';
```

**Expected**: Returns 4 policies:
- `read_own_periodization`
- `insert_own_periodization`
- `update_own_periodization`
- `delete_own_periodization`

---

## Next Steps After Migration Success

Once migrations are applied successfully:

1. ✅ **Update TypeScript types**
   - Update `profile.types.ts`
   - Create `periodization-tracking.types.ts`
   - Regenerate `database.types.ts`

2. ✅ **Create services**
   - `profile-fitness.service.ts`
   - `periodization-tracking.service.ts`

3. ✅ **Integrate with app**
   - Save onboarding to profile
   - Load/save periodization state
   - Update workout generation

4. ✅ **Test everything**
   - Profile persistence
   - Periodization continuity
   - Cross-device sync

---

## Quick Reference Commands

```bash
# Start Docker Desktop
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Check Docker is running
docker ps

# Start Supabase (applies migrations)
cd c:/Users/djero/.vscode/fitprove_v2
npx supabase start

# Check migration status
npx supabase migration list

# Open Supabase Studio
start http://localhost:54323

# Stop Supabase
npx supabase stop

# Reset database (careful - drops all data!)
npx supabase db reset
```

---

## Status Check

Run these commands to verify everything:

```bash
# 1. Docker running?
docker ps

# 2. Supabase running?
npx supabase status

# 3. Migrations applied?
npx supabase migration list

# 4. Open Studio
start http://localhost:54323
```

---

**Once you see both migrations marked as applied (✓), come back and we'll continue with TypeScript types and services!** 🚀
