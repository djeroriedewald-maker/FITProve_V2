import { Exercise } from '../types/exercise.types';

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
    youtube_id: 'IODxDxX7oi4', // Athlean-X proper push-up form
    primary_muscles: ['chest'],
    secondary_muscles: ['shoulders', 'triceps', 'abs'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    category: 'strength',
    force_type: 'push',
    mechanics: 'compound',
    tips: [
      'Keep your core engaged throughout the movement',
      'Don\'t let your hips sag or pike up',
      'Control the descent as much as the ascent'
    ],
    common_mistakes: [
      'Placing hands too wide or too narrow',
      'Not going through full range of motion',
      'Letting hips sag or rise'
    ],
    variations: [
      'Incline Push-Up (easier)',
      'Decline Push-Up (harder)',
      'Diamond Push-Up',
      'Wide-Grip Push-Up'
    ],
    recommended_sets: 3,
    recommended_reps: '8-15',
    rest_time: 60,
    tags: ['bodyweight', 'chest', 'beginner', 'compound'],
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
    youtube_id: '4Y2ZdHCOXok', // Athlean-X bench press
    primary_muscles: ['chest'],
    secondary_muscles: ['shoulders', 'triceps'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    category: 'strength',
    force_type: 'push',
    mechanics: 'compound',
    tips: [
      'Keep your shoulder blades retracted',
      'Maintain a slight arch in your back',
      'Don\'t bounce the bar off your chest'
    ],
    common_mistakes: [
      'Grip too wide or too narrow',
      'Not retracting shoulder blades',
      'Lifting feet off the ground'
    ],
    variations: [
      'Incline Bench Press',
      'Decline Bench Press',
      'Dumbbell Bench Press',
      'Close-Grip Bench Press'
    ],
    recommended_sets: 4,
    recommended_reps: '6-10',
    rest_time: 120,
    tags: ['barbell', 'chest', 'compound', 'strength'],
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
    youtube_id: 'eozdVDA78K0', // Dumbbell flyes form
    primary_muscles: ['chest'],
    secondary_muscles: ['shoulders'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
    category: 'strength',
    force_type: 'push',
    mechanics: 'isolation',
    tips: [
      'Focus on the squeeze at the top',
      'Don\'t go too heavy - focus on form',
      'Control the negative portion'
    ],
    common_mistakes: [
      'Going too heavy and using momentum',
      'Straightening arms completely',
      'Not controlling the descent'
    ],
    variations: [
      'Incline Dumbbell Flyes',
      'Decline Dumbbell Flyes',
      'Cable Flyes'
    ],
    recommended_sets: 3,
    recommended_reps: '10-15',
    rest_time: 90,
    tags: ['dumbbells', 'chest', 'isolation'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // BACK EXERCISES
  {
    id: 'pull-up',
    name: 'Pull-Up',
    description: 'Upper body pulling exercise using a pull-up bar.',
    instructions: [
      'Hang from a pull-up bar with palms facing away',
      'Pull your body up until chin clears the bar',
      'Lower yourself back down with control',
      'Keep your core engaged throughout'
    ],
    image_url: '/images/exercises/pull-up.jpg',
    youtube_id: 'eGo4IYlbE5g', // Pull-up form
    primary_muscles: ['back'],
    secondary_muscles: ['biceps', 'shoulders'],
    equipment: ['pull_up_bar'],
    difficulty: 'intermediate',
    category: 'strength',
    force_type: 'pull',
    mechanics: 'compound',
    tips: [
      'Focus on pulling with your back, not just arms',
      'Don\'t swing or use momentum',
      'Squeeze shoulder blades together at the top'
    ],
    common_mistakes: [
      'Not going through full range of motion',
      'Using momentum to swing up',
      'Not engaging the back muscles'
    ],
    variations: [
      'Chin-Up (palms facing toward you)',
      'Wide-Grip Pull-Up',
      'Assisted Pull-Up',
      'Weighted Pull-Up'
    ],
    recommended_sets: 3,
    recommended_reps: '5-12',
    rest_time: 120,
    tags: ['bodyweight', 'back', 'pulling', 'compound'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  {
    id: 'deadlift',
    name: 'Deadlift',
    description: 'The king of all exercises - a compound movement targeting the entire posterior chain.',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip the bar',
      'Keep chest up and back straight',
      'Drive through heels and hips to lift the bar',
      'Stand tall with shoulders back at the top'
    ],
    image_url: '/images/exercises/deadlift.jpg',
    youtube_id: 'ytGaGIn3SjE', // Deadlift form
    primary_muscles: ['back', 'glutes', 'hamstrings'],
    secondary_muscles: ['quadriceps', 'abs', 'forearms'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    category: 'strength',
    force_type: 'pull',
    mechanics: 'compound',
    tips: [
      'Keep the bar close to your body',
      'Engage your lats to protect your spine',
      'Don\'t round your back'
    ],
    common_mistakes: [
      'Rounding the back',
      'Bar drifting away from body',
      'Not engaging core properly'
    ],
    variations: [
      'Romanian Deadlift',
      'Sumo Deadlift',
      'Trap Bar Deadlift',
      'Single-Leg Deadlift'
    ],
    recommended_sets: 4,
    recommended_reps: '3-8',
    rest_time: 180,
    tags: ['barbell', 'back', 'compound', 'posterior-chain'],
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
    youtube_id: 'CnBmiBqp-AI', // Overhead press form
    primary_muscles: ['shoulders'],
    secondary_muscles: ['triceps', 'abs'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    category: 'strength',
    force_type: 'push',
    mechanics: 'compound',
    tips: [
      'Keep your core tight for stability',
      'Don\'t arch your back excessively',
      'Push your head forward slightly at the top'
    ],
    common_mistakes: [
      'Pressing in front of the head instead of overhead',
      'Excessive back arch',
      'Not engaging core'
    ],
    variations: [
      'Dumbbell Shoulder Press',
      'Seated Overhead Press',
      'Arnold Press',
      'Pike Push-Up'
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
    description: 'The king of leg exercises, targeting quads, glutes, and hamstrings.',
    instructions: [
      'Position the bar on your upper back/traps',
      'Stand with feet slightly wider than shoulder-width',
      'Lower your body by bending at hips and knees',
      'Descend until thighs are parallel to floor',
      'Drive through heels to return to starting position'
    ],
    image_url: '/images/exercises/squat.jpg',
    youtube_id: 'ultWZbUMPL8', // Squat form
    primary_muscles: ['quadriceps', 'glutes'],
    secondary_muscles: ['hamstrings', 'abs', 'back'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    category: 'strength',
    force_type: 'push',
    mechanics: 'compound',
    tips: [
      'Keep your chest up and core engaged',
      'Track your knees over your toes',
      'Go as deep as your mobility allows'
    ],
    common_mistakes: [
      'Knees caving inward',
      'Not going deep enough',
      'Leaning too far forward'
    ],
    variations: [
      'Front Squat',
      'Goblet Squat',
      'Bulgarian Split Squat',
      'Jump Squat'
    ],
    recommended_sets: 4,
    recommended_reps: '6-12',
    rest_time: 150,
    tags: ['barbell', 'legs', 'compound', 'squat'],
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
    youtube_id: 'auBLPXO8Fww', // Burpee form
    primary_muscles: ['full_body'],
    secondary_muscles: ['cardio'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    category: 'cardio',
    mechanics: 'compound',
    tips: [
      'Focus on smooth transitions',
      'Keep your core engaged throughout',
      'Land softly when jumping'
    ],
    common_mistakes: [
      'Sloppy form when tired',
      'Not going through full range of motion',
      'Landing heavily on jumps'
    ],
    variations: [
      'Half Burpees (no push-up)',
      'Burpee Box Jumps',
      'Single-Arm Burpees'
    ],
    recommended_sets: 3,
    recommended_reps: '8-15',
    rest_time: 60,
    calories_per_minute: 10,
    tags: ['bodyweight', 'cardio', 'full-body', 'hiit'],
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
    youtube_id: 'ASdvN_XEl_c', // Plank form
    primary_muscles: ['abs'],
    secondary_muscles: ['shoulders', 'back'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    category: 'strength',
    force_type: 'static',
    mechanics: 'isolation',
    tips: [
      'Don\'t let your hips sag or pike up',
      'Breathe normally throughout',
      'Squeeze your glutes for stability'
    ],
    common_mistakes: [
      'Holding breath',
      'Hips too high or too low',
      'Not engaging core properly'
    ],
    variations: [
      'Side Plank',
      'Plank Up-Downs',
      'Plank Jacks',
      'Reverse Plank'
    ],
    recommended_sets: 3,
    recommended_reps: '30-60 seconds',
    rest_time: 60,
    tags: ['bodyweight', 'core', 'isometric', 'stability'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Note: This is a sample of 10 exercises. The full library would contain 200+ exercises
  // covering all muscle groups, equipment types, and difficulty levels.
  // Additional exercises would be added following the same pattern.
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