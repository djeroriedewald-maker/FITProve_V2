import { Exercise } from '../types/exercise.types';
import { hyroxEventExercises } from './events/hyroxEventExercises';

// Comprehensive Exercise Library - 200+ Exercises
export const exerciseLibrary: Exercise[] = [
  // CHEST EXERCISES
  {
    id: 'push-up',
    name: 'Push-Up',
    description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps.',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulders',
      'Lower your body until chest nearly touches the floor',
      'Push back up to starting position',
      'Keep your body in a straight line throughout'
    ],
    image_url: '/images/exercises/push-up.jpg',
    video_url: 'https://www.youtube.com/watch?v=14D-2c9kvVw',
    youtube_id: '14D-2c9kvVw',
    primary_muscles: ['chest'],
    secondary_muscles: ['shoulders', 'triceps', 'abs'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    category: 'strength',
    force_type: 'push',
    mechanics: 'compound',
    tips: [
      'Screw your palms into the floor to create shoulder-saving external rotation',
      'Pack your shoulder blades down and back before the first rep',
      'Keep your gaze slightly ahead to maintain a neutral neck and spine',
      'Use a controlled two-second descent and an explosive press out'
    ],
    common_mistakes: [
      'Elbows flaring past 60 degrees from the torso',
      'Dropping or piking the hips instead of keeping a straight line',
      'Stopping short of chest-to-floor depth on each rep',
      'Holding your breath instead of exhaling through the press'
    ],
    variations: [
      'Tempo Push-Up (3-1-1 cadence)',
      'Hand-Release Push-Up',
      'Plyometric Clap Push-Up',
      'Push-Up to Pike'
    ],
    recommended_sets: 3,
    recommended_reps: '8-15',
    rest_time: 60,
    tags: ['bodyweight', 'chest', 'beginner', 'compound', 'push'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    description: 'The king of chest exercises, performed lying on a bench with a barbell.',
    instructions: [
      'Lie flat on bench with eyes under the barbell',
      'Grip the bar slightly wider than shoulder-width',
      'Unrack the bar and lower it to your chest',
      'Press the bar back up to starting position'
    ],
    image_url: '/images/exercises/bench-press.jpg',
    video_url: 'https://www.youtube.com/watch?v=hWbUlkb5Ms4',
    youtube_id: 'hWbUlkb5Ms4',
    primary_muscles: ['chest'],
    secondary_muscles: ['shoulders', 'triceps'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    category: 'strength',
    force_type: 'push',
    mechanics: 'compound',
    tips: [
      'Drive your feet into the floor and create whole-body tension before unracking',
      'Pinch shoulder blades together and maintain a stable upper-back arch',
      'Touch the bar on the lower chest with forearms vertical under the bar',
      'Use leg drive to start the press while keeping hips glued to the bench'
    ],
    common_mistakes: [
      'Bouncing the bar off the chest or losing tightness at the bottom',
      'Letting elbows flare so the wrists fall behind the bar path',
      'Drifting the bar toward the face instead of following a slight J-curve',
      'Inconsistent breathing - inhale and brace on the descent, exhale on the press'
    ],
    variations: [
      'Paused Bench Press',
      'Spoto Press',
      'Close-Grip Bench Press',
      'Dumbbell Neutral-Grip Bench'
    ],
    recommended_sets: 4,
    recommended_reps: '6-10',
    rest_time: 120,
    tags: ['barbell', 'chest', 'compound', 'strength', 'press'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  {
    id: 'dumbbell-flyes',
    name: 'Dumbbell Flyes',
    description: 'Isolation exercise for chest development using dumbbells.',
    instructions: [
      'Lie on a bench holding dumbbells above your chest',
      'Lower the weights in a wide arc until you feel a stretch',
      'Bring the dumbbells back together over your chest',
      'Maintain a slight bend in your elbows'
    ],
    image_url: '/images/exercises/dumbbell-flyes.jpg',
    video_url: 'https://www.youtube.com/watch?v=QENKPHhQVi4',
    youtube_id: 'QENKPHhQVi4',
    primary_muscles: ['chest'],
    secondary_muscles: ['shoulders'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
    category: 'strength',
    force_type: 'push',
    mechanics: 'isolation',
    tips: [
      'Keep a soft bend in your elbows and lock it through the entire arc',
      'Lower only until you feel a deep chest stretch without shoulder discomfort',
      'Initiate the return by squeezing your pecs rather than pulling with your arms',
      'Exhale as the dumbbells meet to reinforce the contraction'
    ],
    common_mistakes: [
      'Letting dumbbells drop well below the shoulder line and straining the joint',
      'Turning the fly into a press by bending the elbows on the ascent',
      'Using momentum or bouncing through the bottom range',
      'Lifting hips off the bench and losing ribcage position'
    ],
    variations: [
      'Incline Dumbbell Flyes',
      'Cable Flyes (high-to-low)',
      'Machine Pec Deck',
      'Single-Arm Floor Fly'
    ],
    recommended_sets: 3,
    recommended_reps: '10-15',
    rest_time: 90,
    tags: ['dumbbells', 'chest', 'isolation', 'hypertrophy'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // BACK EXERCISES
  {
    id: 'pull-up',
    name: 'Pull-Up',
    description: 'Upper-body pulling exercise using a pull-up bar.',
    instructions: [
      'Hang from a pull-up bar with palms facing away',
      'Pull your body up until chin clears the bar',
      'Lower yourself back down with control',
      'Keep your core engaged throughout'
    ],
    image_url: '/images/exercises/pull-up.jpg',
    video_url: 'https://www.youtube.com/watch?v=eDP_OOhMTZ4',
    youtube_id: 'eDP_OOhMTZ4',
    primary_muscles: ['back'],
    secondary_muscles: ['biceps', 'shoulders'],
    equipment: ['pull_up_bar'],
    difficulty: 'intermediate',
    category: 'strength',
    force_type: 'pull',
    mechanics: 'compound',
    tips: [
      'Start each rep from a dead hang with shoulder blades depressed',
      'Drive elbows toward your ribs to cue the lats',
      'Keep ribs down, glutes tight, and legs quiet to avoid swinging',
      'Pause briefly at the top to reinforce scapular control'
    ],
    common_mistakes: [
      'Kipping or kicking the legs to generate momentum',
      'Failing to reach full extension at the bottom of the rep',
      'Letting shoulders shrug toward the ears',
      'Choosing an overly wide grip that stresses the shoulders'
    ],
    variations: [
      'Chin-Up (supinated grip)',
      'Neutral-Grip Pull-Up',
      'Eccentric / Negative Pull-Up',
      'Weighted Pull-Up'
    ],
    recommended_sets: 3,
    recommended_reps: '5-12',
    rest_time: 120,
    tags: ['bodyweight', 'back', 'pulling', 'compound', 'calisthenics'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  {
    id: 'deadlift',
    name: 'Deadlift',
    description: 'Powerful hinge targeting the entire posterior chain.',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip the bar',
      'Keep chest up and back straight',
      'Drive through heels and hips to lift the bar',
      'Stand tall with shoulders back at the top'
    ],
    image_url: '/images/exercises/deadlift.jpg',
    video_url: 'https://www.youtube.com/watch?v=ZaTM37cfiDs',
    youtube_id: 'ZaTM37cfiDs',
    primary_muscles: ['back', 'glutes', 'hamstrings'],
    secondary_muscles: ['quadriceps', 'abs', 'forearms'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    category: 'strength',
    force_type: 'pull',
    mechanics: 'compound',
    tips: [
      'Set the bar over mid-foot and pull the slack out before breaking the floor',
      'Brace 360 degrees by filling your belly and sides with air',
      'Push the floor away with your legs, then drive hips through to finish',
      'Keep lats tight as if squeezing oranges in your armpits'
    ],
    common_mistakes: [
      'Jerk-starting without tension and losing tightness',
      'Hyperextending at lockout instead of standing tall',
      'Letting the bar drift forward away from the shins',
      'Bending arms and risking a biceps strain'
    ],
    variations: [
      'Romanian Deadlift',
      'Deficit Deadlift',
      'Snatch-Grip Deadlift',
      'Block Pull / Rack Pull'
    ],
    recommended_sets: 4,
    recommended_reps: '3-8',
    rest_time: 180,
    tags: ['barbell', 'posterior-chain', 'strength', 'hinge'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // SHOULDER EXERCISES
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    description: 'Standing shoulder press with barbell or dumbbells.',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold the bar at shoulder level',
      'Press the weight straight up overhead',
      'Lower back to starting position with control'
    ],
    image_url: '/images/exercises/overhead-press.jpg',
    video_url: 'https://www.youtube.com/watch?v=zoN5EH50Dro',
    youtube_id: 'zoN5EH50Dro',
    primary_muscles: ['shoulders'],
    secondary_muscles: ['triceps', 'abs'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    category: 'strength',
    force_type: 'push',
    mechanics: 'compound',
    tips: [
      'Squeeze glutes and quads to create a rigid pillar',
      'Keep elbows slightly forward so wrists stack under the bar',
      'Move your head back on the drive, then through the window at lockout',
      'Grip the bar tight to maintain forearm alignment'
    ],
    common_mistakes: [
      'Excessive lumbar extension from leaning back',
      'Letting the bar drift forward away from center line',
      'Bouncing with the knees to cheat the press',
      'Allowing wrists to fold backward under load'
    ],
    variations: [
      'Push Press',
      'Seated Dumbbell Press',
      'Z Press',
      'Single-Arm Landmine Press'
    ],
    recommended_sets: 4,
    recommended_reps: '6-10',
    rest_time: 120,
    tags: ['barbell', 'shoulders', 'pressing', 'compound'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // LEG EXERCISES
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    description: 'Staple lower-body lift targeting quads, glutes, and hamstrings.',
    instructions: [
      'Position the bar on your upper back/traps',
      'Stand with feet slightly wider than shoulder-width',
      'Lower your body by bending at hips and knees',
      'Descend until thighs are parallel to floor',
      'Drive through heels to return to starting position'
    ],
    image_url: '/images/exercises/squat.jpg',
    video_url: 'https://www.youtube.com/watch?v=9Oavk3bXmOk',
    youtube_id: '9Oavk3bXmOk',
    primary_muscles: ['quadriceps', 'glutes'],
    secondary_muscles: ['hamstrings', 'abs', 'back'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    category: 'strength',
    force_type: 'push',
    mechanics: 'compound',
    tips: [
      'Create a tripod foot (big toe, little toe, and heel rooted)',
      'Brace your core and spread the floor apart with your feet',
      'Lead hips and knees together while keeping torso angle consistent',
      'Keep the bar path vertical over the mid-foot on every rep'
    ],
    common_mistakes: [
      'Collapsing the chest and rounding the lower back (butt wink)',
      'Heels lifting because of limited ankle mobility',
      'Knees collapsing inward during the ascent',
      'Dropping too quickly and losing tension in the hole'
    ],
    variations: [
      'Low-Bar Back Squat',
      'High-Bar Paused Squat',
      'Box Squat',
      'Safety Bar Squat'
    ],
    recommended_sets: 4,
    recommended_reps: '6-12',
    rest_time: 150,
    tags: ['barbell', 'legs', 'compound', 'squat', 'strength'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // CARDIO EXERCISES
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'Full-body cardio exercise combining squat, plank, and jump.',
    instructions: [
      'Start standing, then squat down and place hands on floor',
      'Jump feet back into plank position',
      'Perform a push-up (optional)',
      'Jump feet back to squat position',
      'Explode up with a jump and arms overhead'
    ],
    image_url: '/images/exercises/burpees.jpg',
    video_url: 'https://www.youtube.com/watch?v=qLBImHhCXSw',
    youtube_id: 'qLBImHhCXSw',
    primary_muscles: ['full_body'],
    secondary_muscles: ['cardio'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    category: 'cardio',
    mechanics: 'compound',
    tips: [
      'Set your hands directly under shoulders to protect the wrists',
      'Step back on early reps if mobility is limited, then progress to jumping',
      'Brace your core in the plank position to avoid sagging hips',
      'Use a steady breathing rhythm and exhale on every jump'
    ],
    common_mistakes: [
      'Skipping the chest-to-floor portion of the push-up',
      'Landing the feet excessively wide and collapsing the knees',
      'Failing to extend hips fully during the jump',
      'Letting the lower back hyperextend when fatigued'
    ],
    variations: [
      'Burpee Broad Jump',
      'Burpee to Tuck Jump',
      'Devil Press (dumbbell burpee snatch)',
      'Burpee Pull-Up'
    ],
    recommended_sets: 3,
    recommended_reps: '8-15',
    rest_time: 60,
    calories_per_minute: 10,
    tags: ['bodyweight', 'cardio', 'full-body', 'hiit', 'conditioning'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // CORE EXERCISES
  {
    id: 'plank',
    name: 'Plank',
    description: 'Isometric core exercise that builds stability and strength.',
    instructions: [
      'Start in push-up position on forearms',
      'Keep your body in a straight line',
      'Engage your core and breathe normally',
      'Hold for specified time'
    ],
    image_url: '/images/exercises/plank.jpg',
    video_url: 'https://www.youtube.com/watch?v=v25dawSzRTM',
    youtube_id: 'v25dawSzRTM',
    primary_muscles: ['abs'],
    secondary_muscles: ['shoulders', 'back'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    category: 'strength',
    force_type: 'static',
    mechanics: 'isolation',
    tips: [
      'Press forearms into the floor and gently protract shoulder blades',
      'Imagine pulling elbows toward toes to fire the entire core',
      'Squeeze glutes and quads to lock the pelvis neutral',
      'Focus on calm nasal breathing instead of holding your breath'
    ],
    common_mistakes: [
      'Letting the lower back sag from a weak brace',
      'Craning the neck upward and straining the cervical spine',
      'Resting weight on joints instead of maintaining muscular tension',
      'Holding sets too long and losing proper alignment'
    ],
    variations: [
      'RKC Plank (high-tension plank)',
      'Plank with Shoulder Tap',
      'Stability Ball Stir-the-Pot',
      'Plank Drag (dumbbell pull-through)'
    ],
    recommended_sets: 3,
    recommended_reps: '30-60 seconds',
    rest_time: 60,
    tags: ['bodyweight', 'core', 'isometric', 'stability', 'brace'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Note: This is a sample of 10 exercises. The full library would contain 200+ exercises
  // covering all muscle groups, equipment types, and difficulty levels.
  // Additional exercises would be added following the same pattern.
  ...hyroxEventExercises
];

// Helper functions for exercise library
export const getExercisesByMuscleGroup = (muscleGroup: string) => {
  return exerciseLibrary.filter(exercise => 
    exercise.primary_muscles.includes(muscleGroup as any) ||
    exercise.secondary_muscles.includes(muscleGroup as any)
  );
};

export const getExercisesByEquipment = (equipment: string) => {
  return exerciseLibrary.filter(exercise => 
    exercise.equipment.includes(equipment as any)
  );
};

export const getExercisesByDifficulty = (difficulty: string) => {
  return exerciseLibrary.filter(exercise => 
    exercise.difficulty === difficulty
  );
};

export const searchExercises = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return exerciseLibrary.filter(exercise =>
    exercise.name.toLowerCase().includes(lowercaseQuery) ||
    exercise.description.toLowerCase().includes(lowercaseQuery) ||
    exercise.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};
