import { useState } from 'react';
import { Mail } from 'lucide-react';
import { DirectMessageModal } from '../profile/DirectMessageModal';
import { ConversationList } from '../profile/ConversationList';

export const InboxButton = () => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    displayName?: string;
    username?: string;
    avatarUrl?: string;
  } | null>(null);

  const handleOpen = () => {
    console.log('Inbox button clicked');
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
        aria-label="Inbox"
      >
        <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      {open && (
        <div
          className="fixed z-50 bg-black bg-opacity-40 flex items-center justify-center"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: '64px', // Adjust this value to match your BottomNavi height
          }}
        >
          <div
            className="flex flex-col w-full h-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
            style={{
              borderRadius: 0,
              width: '100%',
              height: '100%',
              maxWidth: '100vw',
              maxHeight: '100vh',
              overflow: 'auto',
            }}
          >
            <div style={{ background: 'red', color: 'white', padding: 16, textAlign: 'center' }}>MODAL TEST: If you see this, the modal is rendering.</div>
            {/* Header (mimics mobile app bar) */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary to-purple-600">
              <button
                onClick={handleClose}
                className="text-white text-2xl font-bold opacity-80 hover:opacity-100 focus:outline-none"
                aria-label="Close inbox"
              >
                ←
              </button>
              <span className="text-xl font-extrabold text-white tracking-wide">FITProve</span>
              <button className="text-white opacity-80 hover:opacity-100 focus:outline-none">
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-edit"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                </svg>
              </button>
            </div>
            {/* Conversation List only for debugging */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {!selectedUser ? (
                <ConversationList
                  onSelect={setSelectedUser}
                  selectedUserId={selectedUser?.id}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
