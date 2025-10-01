import React from 'react';

type HeaderBarProps = Readonly<{
  username: string;
  avatarUrl: string;
  onNotificationClick?: () => void;
  onSearchClick?: () => void;
}>;

export const HeaderBar: React.FC<HeaderBarProps> = ({
  username,
  avatarUrl,
  onNotificationClick,
  onSearchClick,
}) => {
  const handleNotify = onNotificationClick ?? (() => {});
  const handleSearch = onSearchClick ?? (() => {});

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between rounded-b-2xl bg-gradient-to-r from-green-900 to-green-700 px-4 py-3 shadow-md">
      {/* Left: Avatar + Greeting */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={avatarUrl}
            alt={`${username}'s avatar`}
            className="h-10 w-10 rounded-full border-2 border-purple-500 object-cover shadow-lg"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {/* Notification ring always visible */}
          <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-purple-500"></span>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-white">Hello {username}</span>
            <span className="text-xl" aria-hidden>
              👋
            </span>
          </div>
          <span className="text-sm text-green-200">Get ready</span>
        </div>
      </div>

      {/* Right: Notification + Search */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleNotify}
          className="relative rounded-full border-2 border-purple-500 bg-black p-2 transition hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-green-800"
          aria-label="Notifications"
        >
          {/* Bell Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6 text-purple-400"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {/* Red dot indicator always visible */}
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-full border-2 border-purple-500 bg-black p-2 transition hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-green-800"
          aria-label="Search"
        >
          {/* Search Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6 text-purple-400"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HeaderBar;
