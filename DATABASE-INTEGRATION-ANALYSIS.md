# 🗄️ Database Integration Analysis - Workout Generator Features

## Current State: What's Connected vs What's Missing

---

## ✅ **What IS Currently Connected to Supabase**

### **1. User Profiles** ([`profiles` table](supabase/migrations/0004_profiles_table_update.sql))
**Stored Data**:
- ✅ `display_name`, `username`, `bio`, `avatar_url`
- ✅ `fitness_goals` (array of goals)
- ✅ `gender`, `level`
- ✅ `stats` (JSONB):
  - `workoutsCompleted`
  - `totalMinutes`
  - `streakDays`
  - `achievementsCount`
  - `followersCount`
  - `followingCount`
- ✅ `achievements` (JSONB array)
- ✅ `recent_workouts` (JSONB array)
- ✅ `notification_preferences` (JSONB)

**Used By**: Profile page, Stats page, Homepage

---

### **2. Workout Templates** ([`workout_templates` table](supabase/migrations/0013_workout_templates.sql))
**Stored Data**:
- ✅ Template name
- ✅ Workout preferences (JSONB):
  - Goal, equipment, muscles, duration, etc.
- ✅ Tags (for filtering)
- ✅ Usage tracking (`use_count`, `last_used_at`)

**Connected**: ✅ **Fully Integrated**
- Users can save workout preferences as templates
- Templates stored in Supabase with RLS policies
- Can load templates on welcome screen

**Implementation**: [`template.service.ts`](src/lib/template.service.ts)

---

### **3. Workout History** ([`user_workout_history` table](supabase/migrations/0010_user_workout_history.sql))
**Stored Data**:
- ✅ `user_id`
- ✅ `exercise_id` (which exercise was completed)
- ✅ `completed_at` (timestamp)
- ✅ `notes` (optional notes)

**Used For**:
- ✅ Exercise variety tracking
- ✅ Recent exercises filtering (avoid repetition)
- ✅ Workout stats

**Implementation**: [`exercise-variety.service.ts`](src/lib/exercise-variety.service.ts)

---

### **4. Saved Workouts** (via `saveWorkout` hook)
**What Gets Saved**:
- ✅ Workout name
- ✅ Exercise plan (all exercises with sets/reps/rest)
- ✅ Metadata:
  - User preferences
  - Generation timestamp
  - Schedule info

**Where**: Likely stored in a workouts table (need to verify exact schema)

---

## ❌ **What IS NOT Currently Connected to Supabase**

### **1. Periodization State** 🔄
**Current State**: ❌ **NOT SAVED**
- Calculated on-the-fly each workout generation
- Uses `progressionLevel` from preferences (derived from frequency)
- No historical tracking of:
  - Current week in macro/micro cycle
  - Deload week history
  - Phase transitions
  - Volume/intensity over time

**What Should Be Saved**:
```typescript
{
  user_id: string;
  current_week: number;
  total_weeks_completed: number;
  macro_phase: 'base' | 'build' | 'peak' | 'recovery';
  micro_week: 'week1' | 'week2' | 'week3' | 'deload';
  last_deload_week: number;
  started_at: timestamp;
  updated_at: timestamp;
}
```

**Impact**:
- Periodization resets if user refreshes or logs out
- No long-term progression tracking
- Can't show periodization history on stats page

---

### **2. Workout Style Preferences** 🎨
**Current State**: ❌ **NOT SAVED**
- Auto-selected each time based on goal/fitness level
- User can't set preferred styles
- No tracking of which styles user has tried

**What Should Be Saved**:
```typescript
// In user preferences or profile
{
  preferred_workout_styles: ['circuit', 'superset']; // User favorites
  workout_style_history: [
    { style: 'emom', used_count: 5, last_used: timestamp },
    { style: 'amrap', used_count: 3, last_used: timestamp }
  ];
}
```

**Impact**:
- Can't let users choose favorite styles
- Can't show "Try EMOM this week" recommendations
- No workout style analytics

---

### **3. Workout Generation Metadata** 📊
**Current State**: ❌ **PARTIALLY SAVED**
- Saves workout plan and basic metadata
- Does NOT save:
  - Periodization state at generation time
  - Workout style used
  - Quality scores
  - Progressive overload adjustments

**What Should Be Saved** (in workout metadata):
```typescript
{
  workout_id: string;
  user_id: string;
  generated_at: timestamp;

  // NEW: Advanced metadata
  periodization: {
    week: number;
    phase: string;
    is_deload: boolean;
  };

  workout_style: 'emom' | 'circuit' | etc.;

  quality_metrics: {
    push_pull_balance: number;
    compound_to_isolation_ratio: number;
    muscle_balance_score: number;
  };

  progression_level: number; // Week number in program
}
```

**Impact**:
- Can't analyze workout patterns over time
- Can't show "You've done 5 EMOM workouts this month"
- Can't track periodization compliance

---

### **4. Profile Fitness Settings** 🎯
**Current State**: ✅ **PARTIALLY SAVED**
- `fitness_goals` array is saved ✅
- Missing from profile:
  - ❌ Current fitness level ('beginner', 'intermediate', 'advanced')
  - ❌ Age (used for volume adjustments)
  - ❌ Event type (if goal is event-based)
  - ❌ Limitations (injuries, restrictions)
  - ❌ Available equipment
  - ❌ Preferred workout duration

**Currently**: These are saved in **onboarding preferences** (local/session storage), not in **profile table**

**Should Be in Profile**:
```typescript
// Add to profiles table
{
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  age: number;
  event_type: string; // 'hyrox', 'spartan', 'marathon', etc.
  limitations: string[]; // ['knee', 'shoulder']
  available_equipment: string[]; // ['barbell', 'dumbbells']
  preferred_duration: number; // minutes
  onboarding_completed: boolean;
  onboarding_completed_at: timestamp;
}
```

**Impact**:
- Users must re-enter preferences if they switch devices
- Can't pre-populate onboarding with existing data
- Homepage can't show personalized workout suggestions

---

## 📊 **What COULD Be Connected to Stats/Homepage**

### **Homepage Potential Connections**:

1. **Next Workout Suggestion** (using periodization):
   ```
   "Week 3 - Peak Week! 🔥"
   "Your next workout will have 20% more volume"
   [Generate Workout Button]
   ```

2. **Workout Style Variety**:
   ```
   "Try something new: EMOM Workout 💡"
   "You haven't done Tabata in 2 weeks"
   ```

3. **Recent Workout Preview**:
   ```
   "Last workout: Circuit Training (3 days ago)"
   "Periodization: Base Phase, Week 2"
   ```

---

### **Stats Page Potential Connections**:

1. **Periodization Timeline**:
   ```
   [Week 1] [Week 2] [Week 3] [Deload] [Week 5]...
   Base Phase ━━━━━━ Build Phase ━━━━━━━━
   ```

2. **Workout Style Distribution**:
   ```
   Circuit:    ████████░░ 40%
   Traditional:████░░░░░░ 20%
   AMRAP:      ███░░░░░░░ 15%
   Superset:   ███░░░░░░░ 15%
   ```

3. **Volume/Intensity Trends**:
   ```
   [Graph showing volume multipliers over 16 weeks]
   Shows deload weeks, peak weeks, progression
   ```

4. **Exercise Variety Score**:
   ```
   "You've used 45 different exercises this month"
   "Most frequent: Squat (8x), Bench Press (6x)"
   ```

---

## 🛠️ **What Needs to Be Built**

### **Priority 1: Critical for User Experience**

1. **Database Migration: Add to `profiles` table**
   ```sql
   ALTER TABLE profiles ADD COLUMN fitness_level TEXT;
   ALTER TABLE profiles ADD COLUMN age INTEGER;
   ALTER TABLE profiles ADD COLUMN event_type TEXT;
   ALTER TABLE profiles ADD COLUMN limitations TEXT[];
   ALTER TABLE profiles ADD COLUMN available_equipment TEXT[];
   ALTER TABLE profiles ADD COLUMN preferred_duration INTEGER;
   ALTER TABLE profiles ADD COLUMN preferred_workout_styles TEXT[];
   ```

2. **Save Onboarding Data to Profile**
   - After onboarding completion, save all preferences to profile
   - Auto-populate onboarding if returning user

---

### **Priority 2: Periodization Tracking**

1. **Database Migration: `user_periodization` table**
   ```sql
   CREATE TABLE user_periodization (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     goal TEXT NOT NULL,
     current_week INTEGER NOT NULL DEFAULT 1,
     total_weeks_completed INTEGER NOT NULL DEFAULT 0,
     macro_phase TEXT NOT NULL,
     micro_week TEXT NOT NULL,
     last_deload_week INTEGER,
     started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

     UNIQUE(user_id, goal)
   );
   ```

2. **Service: `periodization-tracking.service.ts`**
   - `getPeriodizationState(userId, goal)` - Fetch from DB
   - `updatePeriodizationState(userId, goal, state)` - Save after workout
   - `resetPeriodization(userId, goal)` - Start new cycle

3. **Update `useGenerateWorkout.ts`**
   - Fetch periodization from DB instead of calculating fresh
   - Save updated state after generation

---

### **Priority 3: Workout Style Tracking**

1. **Add to `workout_templates` or create `user_workout_style_history`**
   ```sql
   ALTER TABLE profiles ADD COLUMN preferred_workout_styles TEXT[];

   CREATE TABLE user_workout_style_history (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     workout_style TEXT NOT NULL,
     used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     workout_id UUID -- reference to generated workout if exists
   );
   ```

2. **Update Workout Save**
   - Include `workoutStyle` in saved workout metadata
   - Track style usage for analytics

---

### **Priority 4: Enhanced Workout Metadata**

1. **Expand workout save to include**:
   ```typescript
   {
     // Existing
     name: string;
     exercises: WorkoutPlanItem[];
     meta: {...};

     // NEW
     periodization: PeriodizationState;
     workout_style: WorkoutStyle;
     quality_metrics: QualityMetrics;
     progression_level: number;
   }
   ```

---

## 📈 **Implementation Roadmap**

### **Phase 1: Profile Enhancement (Highest Priority)**
- [ ] Add fitness fields to profiles table
- [ ] Save onboarding data to profile
- [ ] Load profile data into onboarding flow
- [ ] Update profile page to show/edit fitness settings

**Impact**: Persistent preferences across devices

---

### **Phase 2: Periodization Persistence**
- [ ] Create `user_periodization` table
- [ ] Build periodization tracking service
- [ ] Integrate with workout generation
- [ ] Add periodization stats to stats page

**Impact**: True long-term progression tracking

---

### **Phase 3: Workout Style Analytics**
- [ ] Add style preferences to profile
- [ ] Track style usage history
- [ ] Build style recommendation engine
- [ ] Add style analytics to stats page

**Impact**: Personalized workout variety

---

### **Phase 4: Homepage Integration**
- [ ] Fetch user's current periodization state
- [ ] Show next workout preview
- [ ] Display workout streak
- [ ] Recommend workout styles

**Impact**: Engaging, personalized homepage

---

## 🔍 **Current Integration Summary**

| Feature | Database | Profile Page | Stats Page | Homepage | Priority to Fix |
|---------|----------|--------------|------------|----------|-----------------|
| **Templates** | ✅ Full | ⚠️ Partial | ❌ No | ❌ No | Medium |
| **Periodization** | ❌ No | ❌ No | ❌ No | ❌ No | **HIGH** |
| **Workout Styles** | ❌ No | ❌ No | ❌ No | ❌ No | **HIGH** |
| **Exercise History** | ✅ Full | ❌ No | ⚠️ Partial | ❌ No | Medium |
| **Fitness Profile** | ⚠️ Partial | ⚠️ Partial | ❌ No | ❌ No | **HIGH** |
| **Recent Workouts** | ✅ Full | ✅ Yes | ⚠️ Partial | ⚠️ Partial | Low |
| **Workout Count** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Partial | Low |

---

## 💡 **Recommendations**

### **Immediate Actions**:

1. **Profile Enhancement** (Phase 1)
   - Add fitness settings to profile table
   - Save onboarding results to profile
   - This enables cross-device consistency

2. **Periodization Tracking** (Phase 2)
   - Create periodization table
   - Track progression properly
   - Enable true long-term programming

### **Quick Wins**:

1. **Homepage "Next Workout" Widget**
   - Use existing workout count from profile
   - Calculate periodization state client-side
   - Show "Week X - Phase Y" preview

2. **Stats Page "Style Breakdown"**
   - Query saved workouts metadata
   - Show distribution of workout styles (if we start saving them)

---

## 🎯 **Conclusion**

**Currently Working**:
- ✅ Template system (save/load preferences)
- ✅ Exercise history tracking
- ✅ Basic workout stats (count, minutes, streak)

**Missing Critical Connections**:
- ❌ Periodization state persistence
- ❌ Workout style tracking
- ❌ Complete fitness profile in database
- ❌ Advanced workout metadata

**Impact on User Experience**:
- Periodization resets every session
- Can't analyze workout patterns over time
- Homepage/stats pages lack personalized insights
- Preferences don't persist across devices

**Recommendation**: Start with **Phase 1 (Profile Enhancement)** to get the foundation right, then add **Phase 2 (Periodization Persistence)** for true long-term programming.

---

**Ready to implement?** Let me know which phase you'd like to tackle first!
