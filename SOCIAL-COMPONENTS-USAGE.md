# 🎨 Social Components Usage Guide

Complete guide for using all social feature components in FitProve.

---

## 📦 **Components Built:**

✅ **WorkoutComments** - Comments with nested replies
✅ **WorkoutRating** - 5-star rating system
✅ **FavoriteButton** - Save to favorites
✅ **FollowButton** - Follow/unfollow users

---

## 🚀 **Quick Start**

### Import Components:

```typescript
import {
  WorkoutComments,
  WorkoutRating,
  FavoriteButton,
  FollowButton,
} from '../components/social';
```

---

## 💬 **1. WorkoutComments**

Display and manage comments on workouts.

### Basic Usage:

```tsx
<WorkoutComments workoutId="workout-uuid" />
```

### Full Example:

```tsx
import { WorkoutComments } from '../components/social';

function WorkoutDetailPage() {
  return (
    <div>
      <h1>My Awesome Workout</h1>

      {/* Full comments section */}
      <WorkoutComments
        workoutId="550e8400-e29b-41d4-a716-446655440000"
      />
    </div>
  );
}
```

### Compact Mode:

```tsx
{/* Show only first 3 comments */}
<WorkoutComments
  workoutId="workout-id"
  compact={true}
/>
```

### Features:
- ✅ Add top-level comments
- ✅ Reply to comments (nested)
- ✅ Like/unlike comments
- ✅ Delete own comments
- ✅ Real-time like counts
- ✅ Auto-load replies
- ✅ Beautiful animations

---

## ⭐ **2. WorkoutRating**

5-star rating system with distribution chart.

### Basic Usage:

```tsx
<WorkoutRating workoutId="workout-uuid" />
```

### Full Example:

```tsx
import { WorkoutRating } from '../components/social';

function WorkoutDetailPage() {
  return (
    <div>
      {/* Full rating section with distribution */}
      <WorkoutRating
        workoutId="550e8400-e29b-41d4-a716-446655440000"
        showDistribution={true}
      />
    </div>
  );
}
```

### Compact Mode (for cards):

```tsx
{/* Show just average rating */}
<WorkoutRating
  workoutId="workout-id"
  compact={true}
/>
```

### Props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `workoutId` | string | required | Workout UUID |
| `compact` | boolean | false | Show compact view |
| `showDistribution` | boolean | false | Show rating breakdown |

### Features:
- ✅ Display average rating
- ✅ Show total rating count
- ✅ 5-star selector modal
- ✅ Optional review text
- ✅ Rating distribution chart
- ✅ Update existing rating
- ✅ Beautiful modal UI

---

## ❤️ **3. FavoriteButton**

Heart/bookmark button to save workouts.

### Basic Usage:

```tsx
<FavoriteButton workoutId="workout-uuid" />
```

### Full Example:

```tsx
import { FavoriteButton } from '../components/social';

function WorkoutCard({ workout }) {
  return (
    <div className="workout-card">
      <img src={workout.image} />
      <h3>{workout.name}</h3>

      {/* Favorite button in top right */}
      <div className="absolute top-2 right-2">
        <FavoriteButton
          workoutId={workout.id}
          variant="heart"
          size="md"
          showCount={true}
          onToggle={(isFavorited) => {
            console.log('Favorited:', isFavorited);
          }}
        />
      </div>
    </div>
  );
}
```

### Props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `workoutId` | string | required | Workout UUID |
| `variant` | 'heart' \| 'bookmark' | 'heart' | Icon style |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| `showCount` | boolean | false | Show favorite count |
| `onToggle` | function | - | Callback on state change |

### Variants:

```tsx
{/* Heart icon (default) */}
<FavoriteButton workoutId="id" variant="heart" />

{/* Bookmark icon */}
<FavoriteButton workoutId="id" variant="bookmark" />

{/* Different sizes */}
<FavoriteButton workoutId="id" size="sm" />
<FavoriteButton workoutId="id" size="md" />
<FavoriteButton workoutId="id" size="lg" />
```

### Features:
- ✅ Animated heart/bookmark
- ✅ Particle effects on favorite
- ✅ Optimistic updates
- ✅ Toast notifications
- ✅ Optional counter
- ✅ Prevent clicks when not signed in

---

## 👥 **4. FollowButton**

Follow/unfollow users with hover states.

### Basic Usage:

```tsx
<FollowButton userId="user-uuid" />
```

### Full Example:

```tsx
import { FollowButton } from '../components/social';

function CreatorProfile({ creator }) {
  return (
    <div>
      <img src={creator.avatar} />
      <h2>{creator.name}</h2>
      <p>{creator.follower_count} followers</p>

      {/* Follow button */}
      <FollowButton
        userId={creator.id}
        variant="default"
        onToggle={(isFollowing) => {
          console.log('Now following:', isFollowing);
        }}
      />
    </div>
  );
}
```

### Compact Variant (for cards):

```tsx
{/* Small follow button */}
<FollowButton
  userId="user-id"
  variant="compact"
/>
```

### Props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userId` | string | required | User UUID to follow |
| `variant` | 'default' \| 'compact' | 'default' | Button size |
| `onToggle` | function | - | Callback on state change |

### Features:
- ✅ Shows "Following" when active
- ✅ Hover shows "Unfollow"
- ✅ Optimistic updates
- ✅ Loading states
- ✅ Auto-hides for own profile
- ✅ Creates notifications

---

## 🎯 **Real-World Examples**

### Example 1: Workout Detail Page

```tsx
import {
  WorkoutComments,
  WorkoutRating,
  FavoriteButton,
  FollowButton,
} from '../components/social';

function WorkoutDetailPage({ workout }) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{workout.name}</h1>
          <p className="text-gray-600">{workout.description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <FavoriteButton workoutId={workout.id} />
          <FollowButton userId={workout.creator_id} variant="compact" />
        </div>
      </div>

      {/* Rating Section */}
      <WorkoutRating
        workoutId={workout.id}
        showDistribution={true}
      />

      {/* Comments Section */}
      <WorkoutComments workoutId={workout.id} />
    </div>
  );
}
```

### Example 2: Workout Card (Grid)

```tsx
function WorkoutCard({ workout }) {
  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
      {/* Image */}
      <img src={workout.image} className="w-full h-48 object-cover" />

      {/* Favorite button overlay */}
      <div className="absolute top-3 right-3">
        <FavoriteButton
          workoutId={workout.id}
          variant="heart"
          size="md"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-white">{workout.name}</h3>

        {/* Compact rating */}
        <WorkoutRating
          workoutId={workout.id}
          compact={true}
        />

        {/* Creator info */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <img src={workout.creator.avatar} className="w-8 h-8 rounded-full" />
            <span className="text-sm text-gray-400">{workout.creator.name}</span>
          </div>

          <FollowButton
            userId={workout.creator_id}
            variant="compact"
          />
        </div>
      </div>
    </div>
  );
}
```

### Example 3: Creator Profile Page

```tsx
function CreatorProfilePage({ creator }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-6">
        <img src={creator.avatar} className="w-24 h-24 rounded-full" />

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{creator.name}</h1>
          <p className="text-gray-600">@{creator.username}</p>

          <div className="flex gap-4 mt-2 text-sm">
            <span>{creator.workout_count} workouts</span>
            <span>{creator.follower_count} followers</span>
            <span>{creator.following_count} following</span>
          </div>
        </div>

        {/* Follow button */}
        <FollowButton
          userId={creator.id}
          variant="default"
        />
      </div>

      {/* Creator's workouts with ratings */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        {creator.workouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🎨 **Customization**

### Custom Styling:

All components use Tailwind CSS and can be wrapped in custom containers:

```tsx
{/* Custom wrapper */}
<div className="bg-gray-800 rounded-lg p-6">
  <WorkoutComments workoutId="id" />
</div>
```

### Event Callbacks:

```tsx
<FavoriteButton
  workoutId="id"
  onToggle={(isFavorited) => {
    // Track analytics
    analytics.track('workout_favorited', { isFavorited });

    // Update parent state
    setFavoriteCount(prev => isFavorited ? prev + 1 : prev - 1);
  }}
/>

<FollowButton
  userId="id"
  onToggle={(isFollowing) => {
    // Refresh user data
    refetchUserProfile();

    // Show custom notification
    showNotification(`You are now ${isFollowing ? 'following' : 'not following'} this user`);
  }}
/>
```

---

## 🔧 **Backend Integration**

All components automatically use the `WorkoutSocialService`:

```typescript
import { WorkoutSocialService } from '../lib/workout-social.service';

// These happen automatically in the components:
await WorkoutSocialService.createComment({ ... });
await WorkoutSocialService.rateWorkout({ ... });
await WorkoutSocialService.addToFavorites({ ... });
await WorkoutSocialService.followUser(userId);
```

---

## 🚨 **Error Handling**

All components handle errors gracefully:

- ✅ Show loading states
- ✅ Display error toasts
- ✅ Revert optimistic updates on failure
- ✅ Require authentication
- ✅ Handle network errors

---

## ✨ **Best Practices**

1. **Always provide workoutId/userId**
   ```tsx
   <FavoriteButton workoutId={workout.id} />
   ```

2. **Use compact mode in cards**
   ```tsx
   <WorkoutRating workoutId={id} compact={true} />
   ```

3. **Show distribution on detail pages**
   ```tsx
   <WorkoutRating workoutId={id} showDistribution={true} />
   ```

4. **Add callbacks for analytics**
   ```tsx
   <FollowButton userId={id} onToggle={(following) => track(following)} />
   ```

5. **Position favorite buttons absolutely**
   ```tsx
   <div className="relative">
     <img />
     <div className="absolute top-2 right-2">
       <FavoriteButton />
     </div>
   </div>
   ```

---

## 🎉 **That's It!**

You now have a complete social platform with:
- ✅ Comments & replies
- ✅ 5-star ratings
- ✅ Favorites
- ✅ Follow system
- ✅ Notifications (auto-generated!)

All components are:
- 🎨 Beautifully animated
- 🔒 Secure (RLS policies)
- ⚡ Performant (optimistic updates)
- 📱 Mobile-friendly
- ♿ Accessible

**Need help?** Check the service layer: [workout-social.service.ts](src/lib/workout-social.service.ts)

---

**Happy coding! 💪**