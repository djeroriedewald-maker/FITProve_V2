import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import { CommunityPage } from '../pages/CommunityPage';
import { ModulesPage } from '../pages/ModulesPage';
import { WorkoutPage } from '../pages/WorkoutPage';
import { ExerciseLibraryPage } from '../pages/ExerciseLibraryPage';
import { WorkoutCreatorPage } from '../pages/workout-creator/WorkoutCreatorPage';
import { WorkoutExecutePage } from '../pages/workout-creator/WorkoutExecutePage';
import { MyWorkoutsPage } from '../pages/workout-creator/MyWorkoutsPage';
import { CommunityWorkoutsPage } from '../pages/CommunityWorkoutsPage';
import { SignInForm } from '../components/SignInForm';
import { RootLayout } from '../components/RootLayout';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'coach', element: <div className="p-4">Coach Page (Coming Soon)</div> },
        { path: 'stats', element: <div className="p-4">Stats Page (Coming Soon)</div> },
        { path: 'news', element: <div className="p-4">News Page (Coming Soon)</div> },
        { path: 'modules', element: <ModulesPage /> },
        { path: 'modules/workout', element: <WorkoutPage /> },
        { path: 'modules/workout/exercise-library', element: <ExerciseLibraryPage /> },
        { path: 'modules/workout/workout-creator', element: <WorkoutCreatorPage /> },
        { path: 'modules/workout/execute/:workoutId', element: <WorkoutExecutePage /> },
        { path: 'modules/workout/my-workouts', element: <MyWorkoutsPage /> },
  { path: 'modules/workout/workout-library', element: <div className="p-4">Workout Library Page (Coming Soon)</div> },
  { path: 'modules/workout/community', element: <CommunityWorkoutsPage /> },
        { path: 'community', element: <CommunityPage /> },
        { path: 'signin', element: <SignInForm /> }
        ,{ path: 'reset-password', element: <ResetPasswordPage /> }
      ]
    }
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    }
  }
);