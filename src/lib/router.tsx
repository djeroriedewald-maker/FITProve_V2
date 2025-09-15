import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { CommunityPage } from '../pages/CommunityPage';
import { ModulesPage } from '../pages/ModulesPage';
import { WorkoutPage } from '../pages/WorkoutPage';
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