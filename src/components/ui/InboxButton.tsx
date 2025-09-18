
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { DirectMessageModal } from '../profile/DirectMessageModal';
import { ConversationList } from '../profile/ConversationList';
import { useAuth } from '../../contexts/AuthContext';

export const InboxButton = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleOpen = () => setOpen(true);
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
        <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black bg-opacity-40">
          <div className="flex w-full max-w-3xl h-[32rem] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden mx-auto">
            {/* Conversation List */}
            <ConversationList
              onSelect={setSelectedUser}
              selectedUserId={selectedUser?.id}
            />
            {/* Chat Window */}
            <div className="flex-1 flex flex-col h-full">
              {selectedUser ? (
                <DirectMessageModal
                  isOpen={true}
                  onClose={handleClose}
                  recipientId={selectedUser.id}
                  recipientName={selectedUser.displayName || selectedUser.username}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Mail className="w-12 h-12 mb-2" />
                  <div>Select a conversation to start chatting</div>
                </div>
              )}
            </div>
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 shadow focus:outline-none"
              aria-label="Close inbox"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};
