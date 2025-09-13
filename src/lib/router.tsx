import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { SignInForm } from '../components/SignInForm';
import { RootLayout } from '../components/RootLayout';

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
        { path: 'modules', element: <div className="p-4">Modules Page (Coming Soon)</div> },
        { path: 'signin', element: <SignInForm /> }
      ]
    }
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    }
  }
);