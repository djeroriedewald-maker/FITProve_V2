import React from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SignInForm } from './components/SignInForm';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { ProfilePage } from './pages/ProfilePage';
import { supabase } from './lib/supabase';

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="pt-16 pb-16"> {/* Add padding for both header and navigation bar */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/coach" element={<div className="p-4">Coach Page (Coming Soon)</div>} />
                <Route path="/stats" element={<div className="p-4">Stats Page (Coming Soon)</div>} />
                <Route path="/news" element={<div className="p-4">News Page (Coming Soon)</div>} />
                <Route path="/modules" element={<div className="p-4">Modules Page (Coming Soon)</div>} />
                <Route path="/signin" element={<SignInForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Navigation />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </SessionContextProvider>
  );
}

export default App;