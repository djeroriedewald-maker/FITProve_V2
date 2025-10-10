# ✅ Phase 1 & 2: Database Migrations Complete

## 📋 Summary

We've successfully created **2 new Supabase migrations** to support:
- **Phase 1**: Fitness profile enhancement (persistent user preferences)
- **Phase 2**: Periodization tracking (long-term progression)

---

## 🗄️ Migration Files Created

### **Migration #1: `0014_add_fitness_profile_fields.sql`**
**Purpose**: Add fitness-related fields to the `profiles` table

**New Columns Added**:
```sql
✅ fitness_level          TEXT      -- 'beginner' | 'intermediate' | 'advanced'
✅ age                    INTEGER   -- For volume/intensity adjustments
✅ event_type             TEXT      -- 'hyrox', 'spartan', 'marathon', etc.
✅ limitations            TEXT[]    -- ['knee', 'shoulder', 'back']
✅ available_equipment    TEXT[]    -- ['barbell', 'dumbbells', 'kettlebell']
✅ preferred_duration     INTEGER   -- Minutes (5-180)
✅ preferred_workout_styles TEXT[]  -- ['emom', 'circuit', 'traditional']
✅ preferred_muscles      TEXT[]    -- ['chest', 'legs', 'back']
✅ frequency_days         TEXT[]    -- ['monday', 'wednesday', 'friday']
✅ preferred_time         TEXT      -- 'morning' | 'afternoon' | 'evening'
✅ onboarding_completed   BOOLEAN   -- Onboarding completion status
✅ onboarding_completed_at TIMESTAMPTZ -- When onboarding was completed
✅ last_workout_generated_at TIMESTAMPTZ -- Last workout generation
✅ total_workouts_generated INTEGER -- Total workouts generated count
```

**Features**:
- ✅ Check constraints for data validation
- ✅ Default values for arrays
- ✅ Indexes for faster queries
- ✅ Column comments for documentation

---

### **Migration #2: `0015_user_periodization.sql`**
**Purpose**: Create `user_periodization` table for long-term progression tracking

**Table Structure**:
```sql
CREATE TABLE user_periodization (
  id                          UUID PRIMARY KEY
  user_id                     UUID → auth.users (CASCADE DELETE)

  -- Training context
  goal                        TEXT -- 'strength', 'muscle', 'endurance', etc.

  -- Week tracking
  current_week                INTEGER (DEFAULT 1)
  total_weeks_completed       INTEGER (DEFAULT 0)
  workouts_this_week          INTEGER (DEFAULT 0)

  -- Macro cycle (12-16 weeks)
  macro_phase                 TEXT -- 'base', 'build', 'peak', 'recovery'
  macro_cycle_started_at      TIMESTAMPTZ

  -- Micro cycle (4 weeks)
  micro_week                  TEXT -- 'week1', 'week2', 'week3', 'deload'

  -- Deload tracking
  is_deload_week              BOOLEAN (DEFAULT false)
  last_deload_week            INTEGER
  weeks_since_last_deload     INTEGER (DEFAULT 0)
  next_deload_week            INTEGER (DEFAULT 4)

  -- Multipliers
  current_volume_multiplier   NUMERIC(3,2) (DEFAULT 1.0)
  current_intensity_multiplier NUMERIC(3,2) (DEFAULT 1.0)

  -- Timestamps
  started_at                  TIMESTAMPTZ (DEFAULT NOW)
  updated_at                  TIMESTAMPTZ (DEFAULT NOW)
  last_workout_at             TIMESTAMPTZ

  -- Constraints
  UNIQUE(user_id, goal)  -- One periodization per user per goal
)
```

**Features**:
- ✅ Row Level Security (RLS) enabled
- ✅ RLS policies for CRUD operations (users can only access their own data)
- ✅ Automatic `updated_at` trigger
- ✅ Indexes for performance
- ✅ Check constraints for data integrity
- ✅ Comprehensive comments

**RLS Policies**:
- `read_own_periodization` - Users can SELECT their own data
- `insert_own_periodization` - Users can INSERT their own data
- `update_own_periodization` - Users can UPDATE their own data
- `delete_own_periodization` - Users can DELETE their own data

---

## 🚀 How to Apply Migrations

### **Option 1: Local Supabase (Recommended for Testing)**

1. **Start Docker Desktop**
   ```bash
   # Ensure Docker Desktop is running
   ```

2. **Reset Local Database** (applies all migrations):
   ```bash
   npx supabase db reset
   ```

3. **Or Apply New Migrations Only**:
   ```bash
   npx supabase migration up
   ```

---

### **Option 2: Production Supabase**

1. **Push Migrations to Remote**:
   ```bash
   npx supabase db push
   ```

2. **Or Apply via Supabase Dashboard**:
   - Go to Supabase Dashboard → SQL Editor
   - Copy content of `0014_add_fitness_profile_fields.sql`
   - Execute SQL
   - Repeat for `0015_user_periodization.sql`

---

## 📊 What These Migrations Enable

### **Before**:
```
❌ Onboarding data in local storage (lost on clear/new device)
❌ Periodization calculated fresh each time (resets on refresh)
❌ No cross-device preference sync
❌ No long-term progression tracking
```

### **After**:
```
✅ Onboarding data persists in database
✅ Periodization state survives page refreshes
✅ Preferences sync across all devices
✅ True long-term progression (16+ week programs)
✅ Homepage can show "Week 3 - Peak Phase 🔥"
✅ Stats page can show periodization timeline
```

---

## 🔍 Database Schema Diagram

```
┌─────────────────────────────────────┐
│          PROFILES TABLE             │
├─────────────────────────────────────┤
│ id                     UUID (PK)    │
│ display_name           TEXT         │
│ username               TEXT         │
│ fitness_goals          TEXT[]       │
│ ┌─────────────────────────────────┐ │
│ │ NEW FITNESS FIELDS (Phase 1)    │ │
│ ├─────────────────────────────────┤ │
│ │ fitness_level      TEXT         │ │
│ │ age                INTEGER      │ │
│ │ event_type         TEXT         │ │
│ │ limitations        TEXT[]       │ │
│ │ available_equipment TEXT[]      │ │
│ │ preferred_duration INTEGER      │ │
│ │ preferred_workout_styles TEXT[] │ │
│ │ preferred_muscles  TEXT[]       │ │
│ │ frequency_days     TEXT[]       │ │
│ │ preferred_time     TEXT         │ │
│ │ onboarding_completed BOOLEAN    │ │
│ │ total_workouts_generated INT    │ │
│ └─────────────────────────────────┘ │
│ stats                  JSONB        │
│ achievements           JSONB[]      │
│ recent_workouts        JSONB[]      │
│ created_at             TIMESTAMPTZ  │
└─────────────────────────────────────┘
                 │
                 │ (user_id)
                 ▼
┌─────────────────────────────────────┐
│   USER_PERIODIZATION TABLE (NEW)   │
├─────────────────────────────────────┤
│ id                     UUID (PK)    │
│ user_id                UUID (FK)    │
│ goal                   TEXT         │
│ current_week           INTEGER      │
│ total_weeks_completed  INTEGER      │
│ macro_phase            TEXT         │
│ micro_week             TEXT         │
│ is_deload_week         BOOLEAN      │
│ last_deload_week       INTEGER      │
│ weeks_since_last_deload INTEGER     │
│ current_volume_multiplier NUMERIC   │
│ current_intensity_multiplier NUMERIC│
│ started_at             TIMESTAMPTZ  │
│ updated_at             TIMESTAMPTZ  │
│ UNIQUE(user_id, goal)               │
└─────────────────────────────────────┘
```

---

## 🎯 Next Steps

Now that migrations are created, we need to:

### **Step 1: Apply Migrations**
- [ ] Start Docker Desktop
- [ ] Run `npx supabase db reset` to apply migrations locally
- [ ] Verify tables exist in Supabase Studio

### **Step 2: Update TypeScript Types**
- [ ] Update `profile.types.ts` with new fields
- [ ] Create `periodization-tracking.types.ts`
- [ ] Update `database.types.ts` (auto-generated)

### **Step 3: Create Services**
- [ ] `profile-fitness.service.ts` - Save/load fitness data
- [ ] `periodization-tracking.service.ts` - CRUD for periodization

### **Step 4: Integration**
- [ ] Update onboarding to save to profile on completion
- [ ] Update `useGenerateWorkout` to fetch/save periodization
- [ ] Update workout save to include metadata

### **Step 5: Testing**
- [ ] Test profile data persists after logout/login
- [ ] Test periodization continues across sessions
- [ ] Verify deload weeks happen correctly

---

## 📝 Migration Details

### **Data Integrity**

Both migrations include:
- ✅ **Check constraints** - Ensure valid data (e.g., age 13-120, fitness_level in allowed values)
- ✅ **Default values** - Sensible defaults for all fields
- ✅ **Foreign keys** - Cascade deletes when user is deleted
- ✅ **Unique constraints** - One periodization per user per goal
- ✅ **NOT NULL constraints** - Critical fields can't be null

### **Performance**

Both migrations include:
- ✅ **Indexes** - Fast queries on common filters
- ✅ **Composite indexes** - Optimized for (user_id, goal) lookups
- ✅ **Timestamp indexes** - Fast sorting by date

### **Security**

Both migrations include:
- ✅ **Row Level Security (RLS)** - Enabled on all tables
- ✅ **Policy-based access** - Users can only access their own data
- ✅ **Authenticated-only** - No anonymous access

---

## 🔒 Security Notes

**Row Level Security Policies**:
- Users can **ONLY** read/write their **OWN** periodization data
- `auth.uid() = user_id` enforced on all operations
- No cross-user data leakage possible

**Data Validation**:
- All enum fields use `CHECK` constraints
- Numeric fields have min/max ranges
- Arrays default to empty `{}` instead of NULL

---

## 🎉 Summary

**Migrations Created**: ✅ 2 files
- `0014_add_fitness_profile_fields.sql` (Phase 1)
- `0015_user_periodization.sql` (Phase 2)

**Tables Modified**: 1
- `profiles` - Added 14 new columns

**Tables Created**: 1
- `user_periodization` - New table with 18 columns

**Indexes Created**: 4
- `profiles_fitness_level_idx`
- `profiles_onboarding_completed_idx`
- `user_periodization_user_id_idx`
- `user_periodization_user_goal_idx`

**RLS Policies Created**: 4
- Read, Insert, Update, Delete policies for `user_periodization`

**Ready for**: TypeScript types, services, and integration! 🚀
