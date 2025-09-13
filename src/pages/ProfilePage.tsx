import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            My Profile
          </h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-medium text-gray-900">Email</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            {/* More profile information will be added here */}
          </div>
        </div>
      </div>
    </div>
  );
}