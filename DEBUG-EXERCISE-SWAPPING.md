# 🐛 Exercise Swapping - Debug Guide

## Changes Made to Fix Issues

### 1. **Fixed State Initialization**
```typescript
// BEFORE (could cause timing issues)
const [workoutPlan, setWorkoutPlan] = useState(generatedWorkout.plan);

// AFTER (lazy initialization)
const [workoutPlan, setWorkoutPlan] = useState(() => generatedWorkout.plan);
```

### 2. **Fixed useEffect Dependencies**
```typescript
// BEFORE (problematic - direct array comparison)
useEffect(() => {
  setWorkoutPlan(generatedWorkout.plan);
}, [generatedWorkout.plan]);

// AFTER (stable key based on exercise IDs)
const generatedWorkoutKey = useMemo(
  () => generatedWorkout.plan.map(p => p.exercise.id).join(','),
  [generatedWorkout.plan]
);

useEffect(() => {
  console.log('[WorkoutPlan] Updating from generated workout');
  setWorkoutPlan(generatedWorkout.plan);
}, [generatedWorkoutKey, generatedWorkout.plan]);
```

### 3. **Added Console Logging**
Added detailed logging to track swap operations:
- When swap is initiated
- Current plan state
- Exercise being swapped
- New plan after swap

---

## Testing Steps

### Step 1: Open Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Clear any existing logs
4. Filter by `[Swap]` or `[WorkoutPlan]` if needed

### Step 2: Generate a Workout
1. Complete onboarding flow
2. Click "Generate Workout"
3. Check console for: `[WorkoutPlan] Updating from generated workout`

### Step 3: Try Swapping
1. Scroll to a main exercise (not warmup/cooldown)
2. Look for orange **"Swap Exercise"** button
3. Click it

**Expected:**
- Alternatives dropdown should open
- Should show 3-5 similar exercises

### Step 4: Select Alternative
1. Click one of the alternative exercises

**Expected Console Logs:**
```
[Swap] Swapping exercise: <exercise-id> → <new-exercise-name>
[Swap] Current plan length: <number>
[Swap] Found exercise to swap: <old-exercise-name>
[Swap] New plan created, length: <number>
```

**Expected UI:**
- Toast message: "Swapped to [Exercise Name]!"
- Exercise card should update with new exercise
- Sets/reps/rest should stay the same
- Modal should close

### Step 5: Verify Swap Persisted
1. Check that the exercise name changed in the card
2. Check that prescription (sets/reps) didn't change
3. Try swapping another exercise
4. Both swaps should persist

---

## Common Issues & Solutions

### Issue 1: "Swap Exercise" Button Not Showing
**Possible Causes:**
- No alternatives found for that exercise
- `onSwapExercise` or `exerciseAlternatives` props missing

**Check:**
```javascript
// In browser console:
const exercise = workoutPlan.find(item => item.exercise.id === 'some-id')?.exercise;
ExerciseVarietyService.findAlternativeExercises(exercise, allExercises, 5);
```

### Issue 2: Clicking Alternative Does Nothing
**Possible Causes:**
- State not updating
- React strict mode causing double renders

**Check Console For:**
- `[Swap] Swapping exercise:` - should appear
- `[Swap] Found exercise to swap:` - should appear
- If missing, the exercise ID might not match

### Issue 3: Exercise Changes But Reverts
**Possible Causes:**
- useEffect re-syncing with generated workout
- Infinite render loop

**Check Console For:**
- Repeated `[WorkoutPlan] Updating from generated workout` logs
- Should only happen once per generation, not after swaps

### Issue 4: Chrome Extension Errors
**Those errors in your screenshot:**
```
Uncaught Error: Extension context invalidated
```

**These are NOT from our app!** They're from Chrome extensions (like kwift-CHROME). They won't affect functionality. You can:
- Ignore them
- Disable extensions
- Filter console to hide extension errors

---

## What to Look For

### ✅ Success Indicators:
- [ ] Swap button appears on main exercises
- [ ] Clicking swap shows alternatives modal
- [ ] Alternatives show exercise images, names, difficulty
- [ ] Clicking alternative swaps the exercise
- [ ] Toast notification appears
- [ ] Exercise card updates immediately
- [ ] Sets/reps/rest stay the same
- [ ] Can swap multiple exercises
- [ ] Swaps persist when scrolling
- [ ] Can save workout with swapped exercises

### ❌ Failure Indicators:
- [ ] Swap button doesn't appear
- [ ] Clicking swap does nothing
- [ ] Modal doesn't open
- [ ] Clicking alternative doesn't swap
- [ ] Exercise reverts back
- [ ] Console shows errors (not extension errors)
- [ ] App crashes

---

## Test Data

Try swapping these exercise types to verify matching works:

### Test 1: Barbell → Dumbbell
**Original:** Barbell Bench Press
**Expected Alternatives:**
- Dumbbell Bench Press
- Dumbbell Flyes
- Push-Ups

### Test 2: Compound → Isolation
**Original:** Barbell Back Squat
**Expected Alternatives:**
- Front Squat
- Goblet Squat
- Leg Press
- Bulgarian Split Squat

### Test 3: Cardio Equipment
**Original:** Rowing Machine
**Expected Alternatives:**
- Ski Erg
- Assault Bike
- Running

---

## Need More Help?

If swapping still doesn't work, check:

1. **React DevTools:**
   - Install React DevTools extension
   - Check `WorkoutGenerator` component
   - Look at `workoutPlan` state
   - Verify it updates when you swap

2. **Network Tab:**
   - Check if any API calls are failing
   - Verify exercise library is loaded

3. **Console Errors:**
   - Filter out extension errors
   - Look for actual app errors
   - Check for TypeScript/build errors

4. **State in Console:**
   ```javascript
   // Type this in console to inspect state:
   document.querySelector('[data-workout-plan]')
   // Or use React DevTools
   ```

---

## Report Back

When testing, please report:
1. **What happens** when you click "Swap Exercise"
2. **Console logs** starting with `[Swap]` or `[WorkoutPlan]`
3. **Screenshots** of the UI (before/after swap)
4. **Any error messages** (excluding Chrome extension errors)

This will help us pinpoint exactly what's not working!
