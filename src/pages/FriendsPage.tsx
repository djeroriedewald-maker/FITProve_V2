import { useState } from 'react';
import { FollowingList } from '../components/profile/FollowingList';
import { UserSearchModal } from '../components/profile/UserSearchModal';
import { DirectMessageModal } from '../components/profile/DirectMessageModal';
import { ConversationList } from '../components/profile/ConversationList';

// Simple SVG icons for search and inbox
const SearchIcon = () => (
  <svg
    className="w-5 h-5 mr-2 -ml-1 inline"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
    />
  </svg>
);
const InboxIcon = () => (
  <svg
    className="w-5 h-5 mr-2 -ml-1 inline"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0h-4a2 2 0 01-2 2v0a2 2 0 01-2-2H4"
    />
  </svg>
);

const FriendsPage = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  // Handler to close chat and return to inbox
  const handleBackToInbox = () => setSelectedUser(null);
  // Handler to close everything and return to Friends page
  const handleCloseAll = () => {
    setShowInbox(false);
    setSelectedUser(null);
  };
  return (
    <div>
      {/* Hero Section */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 mb-10">
        <img
          src="/images/friendszone.webp"
          alt="FriendsZone Hero"
          className="object-cover w-full h-full rounded-none"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white">FriendsZone</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Search Friend Button */}
        <div className="flex justify-end mb-4 gap-3">
          <button
            className="flex items-center px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow"
            onClick={() => setShowSearch(true)}
          >
            <SearchIcon />
            Search friend
          </button>
          <button
            className="flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
            type="button"
            onClick={() => setShowInbox(true)}
          >
            <InboxIcon />
            Inbox
          </button>
        </div>
      {/* Inbox Modal */}
      {showInbox && !selectedUser && (
        <div className="fixed z-50 inset-0 flex flex-col bg-black bg-opacity-60">
          <div className="flex flex-col w-full h-full bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary to-purple-600">
              <button
                onClick={() => setShowInbox(false)}
                className="text-white text-2xl font-bold opacity-80 hover:opacity-100 focus:outline-none"
                aria-label="Close inbox"
              >
                ←
              </button>
              <span className="text-xl font-extrabold text-white tracking-wide">Inbox</span>
              <button
                onClick={handleCloseAll}
                className="text-white text-2xl font-bold opacity-80 hover:opacity-100 focus:outline-none"
                aria-label="Close all"
                style={{ marginLeft: 8 }}
              >
                ×
              </button>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <ConversationList
                onSelect={(user) => setSelectedUser(user)}
                selectedUserId={undefined}
              />
            </div>
          </div>
        </div>
      )}
      {showInbox && selectedUser && (
        <div className="fixed z-50 inset-0 flex flex-col bg-black bg-opacity-60">
          <div className="flex flex-col w-full h-full bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary to-purple-600">
              <button
                onClick={handleBackToInbox}
                className="text-white text-2xl font-bold opacity-80 hover:opacity-100 focus:outline-none"
                aria-label="Back to inbox"
              >
                ←
              </button>
              <span className="text-xl font-extrabold text-white tracking-wide">Chat</span>
              <button
                onClick={handleCloseAll}
                className="text-white text-2xl font-bold opacity-80 hover:opacity-100 focus:outline-none"
                aria-label="Close all"
                style={{ marginLeft: 8 }}
              >
                ×
              </button>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <DirectMessageModal
                isOpen={true}
                onClose={handleBackToInbox}
                recipientId={selectedUser.id}
                recipientName={selectedUser.displayName || selectedUser.username}
                recipientAvatarUrl={selectedUser.avatarUrl}
              />
            </div>
          </div>
        </div>
      )}
        {/* Friends List */}
        <div className="mb-8">
          <FollowingList />
        </div>
  {/* Removed placeholder text and feature coming soon message as requested */}
      </div>
      <UserSearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
};

export default FriendsPage;
