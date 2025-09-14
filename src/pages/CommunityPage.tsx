import { SocialFeed } from '../components/social';

export function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Community
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect with other fitness enthusiasts and share your journey
          </p>
        </div>
        
        <SocialFeed />
      </div>
    </div>
  );
}