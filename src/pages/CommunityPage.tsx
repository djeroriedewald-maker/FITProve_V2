
import { SocialFeed } from '../components/social';
import { CommunityHighlights } from '../components/ui/CommunityHighlights';
import { CommunityWorkoutsPromoCard } from '../components/community/CommunityWorkoutsPromoCard';
import { CommunityChallengePromoCard } from '../components/community/CommunityChallengePromoCard';
import { CommunityNetworkPromoCard } from '../components/community/CommunityNetworkPromoCard';
import { useEffect } from 'react';

export function CommunityPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Header */}
      <div className="w-full relative">
        <img
          src="/images/community.webp"
          alt="Community Hero"
          className="w-full h-64 object-cover object-center shadow-lg"
          style={{ maxHeight: 320 }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-center">
          <h1 className="w-full text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">Community</h1>
          <p className="w-full mt-2 text-lg md:text-2xl text-gray-100 font-medium drop-shadow">Connect with other fitness enthusiasts and share your journey</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-8">
        <CommunityHighlights />
  <CommunityWorkoutsPromoCard />
  <CommunityChallengePromoCard />
  <CommunityNetworkPromoCard />
      </div>
    </div>
  );
}