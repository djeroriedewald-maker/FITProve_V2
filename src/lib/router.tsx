import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import ExerciseDetailPage from '../pages/ExerciseDetailPage';
import HomePage from '../pages/HomePage';
import ProfilePagePremium from '../pages/ProfilePagePremium';
import { FollowingList } from '../components/profile/FollowingList';
import { CommunityPage } from '../pages/CommunityPage';
import { ModulesPage } from '../pages/ModulesPage';
import { WorkoutPage } from '../pages/WorkoutPage';
import WorkoutLibraryPage from '../pages/workout-library/WorkoutLibraryPage';
import ProgramDetailPage from '../pages/workout-library/ProgramDetailPage';
import ProgramBuilderPage from '../pages/workout-library/ProgramBuilderPage';
import { ExerciseLibraryPage } from '../pages/ExerciseLibraryPage';
import { WorkoutCreatorPage } from '../pages/workout-creator/WorkoutCreatorPage';
import { PremiumExerciseSelectionPage } from '../pages/workout-creator/PremiumExerciseSelectionPage';
import { WorkoutExecutePage } from '../pages/workout-creator/WorkoutExecutePage';
import { MyWorkoutsPage } from '../pages/MyWorkoutsPage';
import PlannerPage from '../pages/PlannerPage';
import WorkoutGenerator from '../pages/workout-generator';
import { PremiumCommunityWorkoutsPage } from '../pages/PremiumCommunityWorkoutsPage';
import { SignInForm } from '../components/SignInForm';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import SettingsPage from '../pages/SettingsPage';
import FriendsPage from '../pages/FriendsPage';
import { StatsPage } from '../pages/StatsPage';
import { WorkoutsPage } from '../pages/WorkoutsPage';
import DebugLoginPage from '../pages/DebugLoginPage';
import { AppLayout } from '../components/ui/AppLayout';

export const router = createBrowserRouter(
  [
    {
      element: (
        <AppLayout>
          <Outlet />
        </AppLayout>
      ),
      children: [
        {
          path: '/',
          element: <HomePage />,
        },
        {
          path: '/profile',
          element: <ProfilePagePremium />,
        },
        {
          path: '/coach',
          element: <div className="p-4">Coach Page (Coming Soon)</div>,
        },
        { path: 'stats', element: <StatsPage /> },
        { path: 'news', element: <div className="p-4">News Page (Coming Soon)</div> },
        { path: 'modules', element: <ModulesPage /> },
        { path: 'modules/workout', element: <WorkoutPage /> },
        { path: 'modules/workout/exercise-library', element: <ExerciseLibraryPage /> },
        { path: 'exercise/:id', element: <ExerciseDetailPage /> },
        { path: 'modules/workout/workout-creator', element: <WorkoutCreatorPage /> },
        {
          path: 'modules/workout/workout-creator/select-exercises',
          element: <PremiumExerciseSelectionPage />,
        },
        { path: 'modules/workout/execute/:workoutId', element: <WorkoutExecutePage /> },
        { path: 'modules/workout/my-workouts', element: <MyWorkoutsPage /> },
        { path: 'modules/workout/planner', element: <PlannerPage /> },
        { path: 'modules/workout/workout-library', element: <WorkoutLibraryPage /> },
        { path: 'modules/workout/workout-library/:id', element: <ProgramDetailPage /> },
        { path: 'modules/workout/create-program', element: <ProgramBuilderPage /> },
        { path: 'modules/workout/community', element: <PremiumCommunityWorkoutsPage /> },
        { path: 'workout-generator', element: <WorkoutGenerator /> },
        { path: 'workouts', element: <WorkoutsPage /> },
        { path: 'community', element: <CommunityPage /> },
        { path: 'friends', element: <FriendsPage /> },
        { path: 'signin', element: <SignInForm /> },
        { path: 'reset-password', element: <ResetPasswordPage /> },
        { path: 'debug-login', element: <DebugLoginPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: 'following', element: <FollowingList /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);
