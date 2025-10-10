# 🎨 Workout Template System - Complete Implementation

## Overview
The workout template system allows users to **save and reuse their workout generator preferences** for quick workout generation. No more filling out the same settings repeatedly!

---

## ✅ Features Implemented

### 1. **Save Workout as Template** 💾
- **Location**: Workout summary screen (after generating workout)
- **Button**: "💾 Save as Template"
- **Functionality**:
  - Opens modal to name and describe template
  - Auto-generates tags from preferences (goal, equipment, muscles)
  - Saves all generator settings (goal, duration, frequency, equipment, etc.)
  - Success toast notification

### 2. **Load Template** 📋
- **Location**: Welcome screen (before starting generator)
- **Button**: "📋 Load Template"
- **Functionality**:
  - Shows list of saved templates
  - Displays template name, description, and usage stats
  - Shows when last used
  - One-click to load all preferences
  - Auto-tracks usage count
  - Skips directly to workout generation

### 3. **Template Management** 🗂️
- **View all templates**: Sorted by most recently used
- **Delete templates**: Swipe or click delete icon
- **Search templates**: By name or description (future enhancement)
- **Usage tracking**: See how many times each template was used
- **Last used tracking**: Shows "Used 2 days ago" timestamps

---

## 🗄️ Database Schema

### Table: `workout_templates`

```sql
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 100),
  description TEXT,

  -- All generator preferences stored as JSON
  preferences JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  use_count INTEGER DEFAULT 0,

  -- Tags for filtering (auto-generated from preferences)
  tags TEXT[] DEFAULT '{}'
);
```

**Indexes**:
- `workout_templates_user_id_idx` - Fast user queries
- `workout_templates_created_at_idx` - Sorted by date

**RLS Policies**:
- Users can only view/edit/delete their own templates
- Full CRUD operations enabled per user

---

## 📁 Files Structure

### **Types** (`src/types/template.types.ts`)
```typescript
interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  preferences: WorkoutTemplatePreferences;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  use_count: number;
  tags: string[];
}

interface CreateTemplateInput {
  name: string;
  description?: string;
  preferences: WorkoutTemplatePreferences;
  tags?: string[];
}
```

### **Service Layer** (`src/lib/template.service.ts`)
Functions:
- `saveWorkoutTemplate()` - Create new template
- `getUserTemplates()` - Fetch all user templates
- `getTemplateById()` - Get single template
- `updateWorkoutTemplate()` - Update template
- `deleteWorkoutTemplate()` - Delete template
- `markTemplateAsUsed()` - Increment use_count & update last_used_at
- `searchTemplates()` - Search by name/description

### **UI Components**

#### **SaveTemplateModal** (`src/components/ui/SaveTemplateModal.tsx`)
- Input for template name (required)
- Textarea for description (optional)
- Auto-generates tags from preferences
- Save button with loading state
- Toast notifications

#### **TemplateModal** (`src/components/ui/TemplateModal.tsx`)
- Displays all user templates as cards
- Shows usage stats and last used timestamp
- Delete confirmation
- Click to load template
- Empty state when no templates exist

---

## 🎯 User Flow

### **Saving a Template**:
1. User completes workout generation
2. Clicks "💾 Save as Template" button
3. Modal opens with pre-filled goal-based name suggestion
4. User enters custom name (required) and description (optional)
5. Clicks "Save Template"
6. Template saved to database
7. Success toast: "Template saved! ✅"

### **Loading a Template**:
1. User on welcome screen
2. Clicks "📋 Load Template" button
3. Modal shows all saved templates
4. User clicks on a template card
5. All preferences loaded instantly
6. Modal closes, generator jumps to summary/results
7. Success toast: "Template 'HYROX Training' loaded! 🎯"
8. Template `use_count` increments, `last_used_at` updates

### **Managing Templates**:
1. User opens template modal
2. Sees templates sorted by most recently used
3. Can delete unwanted templates (trash icon)
4. Delete confirmation prevents accidents
5. Template removed from list immediately

---

## 🧪 Template Preferences Stored

All workout generator settings are saved:

```typescript
{
  goal: string;                    // 'strength', 'muscle', 'endurance', etc.
  duration: number;                // 30, 45, 60 minutes
  frequency: {
    type: string;
    days: string[];                // ['Monday', 'Wednesday', 'Friday']
    preferredTime?: string;        // 'morning', 'afternoon', 'evening'
  };
  equipment: string[];             // ['barbell', 'dumbbell', 'bodyweight']
  experience?: string;             // 'beginner', 'intermediate', 'advanced'
  specificMuscles?: string[];      // ['chest', 'back', 'legs']
  avoidMuscles?: string[];         // ['shoulder', 'wrist']
  gender?: string;                 // 'male', 'female'
  age?: number;                    // 25, 35, 50
  eventType?: string;              // 'hyrox', 'spartan', 'marathon'
  eventDate?: string;              // ISO date string
  limitations?: string[];          // ['knee', 'back', 'shoulder']
  workoutStyle?: string;           // 'circuit', 'straight-sets'
  music?: any;                     // Music preferences
  tracking?: any;                  // Tracking preferences
}
```

---

## 📊 Auto-Generated Tags

Tags are automatically extracted from preferences for future filtering:

```typescript
const tags: string[] = [];
if (preferences.goal) tags.push(preferences.goal);                    // 'strength'
if (preferences.equipment) tags.push(...preferences.equipment);       // ['barbell', 'dumbbell']
if (preferences.specificMuscles) tags.push(...preferences.specificMuscles); // ['chest', 'back']
```

**Max 10 unique tags** per template for performance.

---

## 🎨 UI/UX Details

### **SaveTemplateModal**
- **Title**: "Save Workout Template"
- **Default name**: Auto-suggested based on goal (e.g., "Strength Workout")
- **Fields**:
  - Template Name (required, max 100 chars)
  - Description (optional, textarea)
- **Buttons**:
  - "Cancel" (ghost)
  - "Save Template" (primary, with loading spinner)

### **TemplateModal**
- **Title**: "Load Template"
- **Empty state**: "No templates yet. Create your first template!"
- **Template Card**:
  - Template name (bold)
  - Description (muted)
  - Tags (pills)
  - Usage stats: "Used 5 times"
  - Last used: "2 days ago" (moment.js)
  - Delete icon (trash, with confirmation)
- **Sorting**: Most recently used first

---

## 🚀 Integration Points

### **workout-generator.tsx**
```typescript
// State
const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
const [showLoadTemplateModal, setShowLoadTemplateModal] = useState(false);

// Welcome Screen: Load Template Button
<button onClick={() => setShowLoadTemplateModal(true)}>
  📋 Load Template
</button>

// Summary Screen: Save Template Button
<button onClick={() => setShowSaveTemplateModal(true)}>
  💾 Save as Template
</button>

// Load Template Handler
const handleLoadTemplate = (template: WorkoutTemplate) => {
  // Map template.preferences to setPreferences()
  // Jump to summary step
  // Mark template as used
};

// Modals
<SaveTemplateModal
  isOpen={showSaveTemplateModal}
  onClose={() => setShowSaveTemplateModal(false)}
  preferences={mappedPreferences}
  userId={user.id}
  defaultName={`${preferences.goal} Workout`}
/>

<TemplateModal
  isOpen={showLoadTemplateModal}
  onClose={() => setShowLoadTemplateModal(false)}
  onSelectTemplate={handleLoadTemplate}
  userId={user.id}
/>
```

---

## ✅ Benefits

### **For Users:**
1. ⚡ **Faster workout generation** - One click instead of 10+ steps
2. 💾 **Consistent training** - Reuse proven workout configurations
3. 📊 **Track favorites** - See which templates you use most
4. 🎯 **Goal-specific templates** - Save different templates for different goals
5. 📅 **Schedule templates** - "Monday: Push Day", "Wednesday: Pull Day"

### **For Product:**
1. 📈 **Increased retention** - Users come back to their templates
2. 💡 **Usage insights** - See which workout types are most popular
3. 🔄 **Feature discovery** - Templates encourage exploration
4. 👥 **User segments** - Identify power users vs casual users
5. 🎁 **Upsell potential** - Premium templates library (future)

---

## 🔮 Future Enhancements (Not Yet Implemented)

### **Template Sharing** 🔗
- Share templates with friends via link
- Public template marketplace
- Community-voted top templates

### **Template Categories** 🗂️
- Folders: "Strength", "HYROX", "Quick Workouts"
- Smart categories: "Most Used", "Recent", "Favorites"
- Color-coded templates

### **Advanced Features** ⚡
- Duplicate template (create variant)
- Template versioning (track changes)
- Template analytics (success rate, completion rate)
- AI-suggested template names
- Template scheduling (auto-load on specific days)

### **Premium Features** 💎
- Unlimited templates (free: 10 max)
- Template export/import (JSON)
- Cross-device sync
- Template recommendations based on goals

---

## 🧪 Testing Checklist

### **Save Template Flow**:
- [ ] Generate workout
- [ ] Click "Save as Template"
- [ ] Enter name and description
- [ ] Save successfully
- [ ] See success toast
- [ ] Template appears in template list

### **Load Template Flow**:
- [ ] Click "Load Template" on welcome screen
- [ ] See saved templates
- [ ] Click a template
- [ ] All preferences loaded correctly
- [ ] Workout generated with correct settings
- [ ] Template use_count incremented
- [ ] Template last_used_at updated

### **Delete Template Flow**:
- [ ] Open template modal
- [ ] Click delete icon
- [ ] Confirm deletion
- [ ] Template removed from list
- [ ] Template deleted from database

### **Edge Cases**:
- [ ] Save template without name (should show error)
- [ ] Load template with missing user (should handle gracefully)
- [ ] Delete last template (should show empty state)
- [ ] Template with very long name (should truncate)
- [ ] Template with many tags (should limit to 10)

---

## 📝 Migration Status

**Migration**: `0013_workout_templates.sql` ✅
- **Created**: Table, indexes, RLS policies
- **Triggers**: Auto-update `updated_at` timestamp
- **Status**: Already applied to database

---

## 🎉 Conclusion

The **Workout Template System** is **fully implemented and ready to use**!

Users can now:
1. ✅ Save their workout preferences as templates
2. ✅ Load templates with one click
3. ✅ Manage their template library
4. ✅ Track usage statistics

This feature provides **massive time savings** and **improved user experience** for repeat users! 🚀

---

## 📚 Related Documentation

- **Database Schema**: `supabase/migrations/0013_workout_templates.sql`
- **Service Layer**: `src/lib/template.service.ts`
- **Type Definitions**: `src/types/template.types.ts`
- **UI Components**:
  - `src/components/ui/SaveTemplateModal.tsx`
  - `src/components/ui/TemplateModal.tsx`
- **Integration**: `src/pages/workout-generator.tsx`
