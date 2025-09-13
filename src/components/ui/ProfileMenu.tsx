import React, { useState } from 'react';
import { User, Settings, LogOut } from 'lucide-react';

export const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-medium shadow-lg">
          DJ
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              Signed in as
              <div className="text-gray-900 dark:text-white font-medium">djer@example.com</div>
            </div>
            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <User className="w-4 h-4" />
              <span>Your Profile</span>
            </button>
            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};