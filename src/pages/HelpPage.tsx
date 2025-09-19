import React from 'react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-600">Help & Guide</h1>
        <p className="mb-6 text-lg text-gray-700 dark:text-gray-200 text-center">
          Welcome to the Workout Zone! Here’s how to navigate and get the most out of every module.
        </p>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-orange-500">Navigation</h2>
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
            <li>Use the sidebar or top navigation to access different modules.</li>
            <li>The <b>Back</b> button at the top left returns you to the previous section or main modules page.</li>
            <li>The floating <b>Help</b> button (bottom right) brings you back to this help section anytime.</li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-orange-500">Modules Overview</h2>
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
            <li><b>Exercise Library:</b> Browse and search for individual exercises. Each exercise includes instructions, muscle groups, equipment, and video demos.</li>
            <li><b>Workout Library:</b> Explore pre-built routines for different goals and levels. Click any workout to see details and start tracking.</li>
            <li><b>Workout Creator:</b> Build your own custom routines by selecting exercises, setting reps/sets, and saving for future use.</li>
            <li><b>Community Workouts:</b> Join and follow workouts created by other users. See public routines, track your progress, and connect with the community.</li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-orange-500">How to Use Each Module</h2>
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
            <li><b>Searching:</b> Use the search bars in each module to quickly find exercises or workouts.</li>
            <li><b>Filters:</b> Apply filters (muscle group, equipment, difficulty, etc.) to narrow down results.</li>
            <li><b>Tracking:</b> Mark workouts as complete, track your stats, and view your progress over time.</li>
            <li><b>Creating Workouts:</b> In the Workout Creator, drag and drop exercises, set reps/sets, and save your custom routine.</li>
            <li><b>Community:</b> Like, comment, and follow other users’ workouts. Share your own routines with the community.</li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-orange-500">Tips & Best Practices</h2>
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
            <li>Start with the Exercise Library to learn proper form before attempting new workouts.</li>
            <li>Use the Workout Library for inspiration or when you want a ready-made routine.</li>
            <li>Track your progress regularly to stay motivated and see improvements.</li>
            <li>Engage with the community for support, ideas, and accountability.</li>
            <li>Visit this Help section anytime for guidance!</li>
          </ul>
        </section>
        <div className="text-center mt-8">
          <span className="text-gray-500 dark:text-gray-400">Still have questions? Contact support or check our FAQ for more info.</span>
        </div>
      </div>
    </div>
  );
}
