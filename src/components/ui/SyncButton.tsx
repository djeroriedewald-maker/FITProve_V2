import { useState } from 'react';
import { RotateCw } from 'lucide-react';

export const SyncButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    // Simuleer een sync actie
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
      aria-label="Sync data"
    >
      <RotateCw className={`w-5 h-5 text-gray-700 dark:text-gray-300 transition-all duration-300 ${
        isSyncing ? 'animate-spin' : 'hover:rotate-180'
      }`} />
    </button>
  );
};