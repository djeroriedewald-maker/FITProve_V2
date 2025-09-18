import React from 'react';

const FriendsPage = () => {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Friends</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <p className="text-gray-700 dark:text-gray-200 mb-4">
          This is your Friends page. Here you will soon see users you follow, your followers, and access your inbox.
        </p>
        <div className="text-gray-400 italic">(Feature coming soon)</div>
      </div>
    </div>
  );
};

export default FriendsPage;
