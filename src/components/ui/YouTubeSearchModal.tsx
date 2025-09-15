import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Play } from 'lucide-react';

interface YouTubeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
}

export const YouTubeSearchModal: React.FC<YouTubeSearchModalProps> = ({
  isOpen,
  onClose,
  exerciseName
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && exerciseName) {
      setSearchQuery(`${exerciseName} exercise tutorial`);
    }
  }, [isOpen, exerciseName]);

  // Mock YouTube search results for demonstration
  // In a real app, you'd use the YouTube Data API
  const mockYouTubeResults: YouTubeVideo[] = [
    {
      id: 'IODxDxX7oi4',
      title: `How to Do ${exerciseName} - Perfect Form Tutorial`,
      thumbnail: `https://img.youtube.com/vi/IODxDxX7oi4/mqdefault.jpg`,
      channelTitle: 'Fitness Blender',
      duration: '3:24',
      viewCount: '2.1M views'
    },
    {
      id: '4Y2ZdHCOXok',
      title: `${exerciseName} Exercise - Complete Guide`,
      thumbnail: `https://img.youtube.com/vi/4Y2ZdHCOXok/mqdefault.jpg`,
      channelTitle: 'Athlean-X',
      duration: '5:12',
      viewCount: '1.5M views'
    },
    {
      id: 'eGo4IYlbE5g',
      title: `${exerciseName} for Beginners - Step by Step`,
      thumbnail: `https://img.youtube.com/vi/eGo4IYlbE5g/mqdefault.jpg`,
      channelTitle: 'Calisthenic Movement',
      duration: '4:30',
      viewCount: '890K views'
    },
    {
      id: 'ytGaGIn3SjE',
      title: `Advanced ${exerciseName} Techniques`,
      thumbnail: `https://img.youtube.com/vi/ytGaGIn3SjE/mqdefault.jpg`,
      channelTitle: 'Jeff Nippard',
      duration: '8:15',
      viewCount: '1.2M views'
    }
  ];

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setVideos(mockYouTubeResults);
      setIsLoading(false);
    }, 500);
  };

  const openYouTubeVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const openYouTubeSearch = () => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    window.open(searchUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              YouTube Videos voor {exerciseName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Klik op een video om deze op YouTube te bekijken
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek naar YouTube videos..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Zoeken...' : 'Zoeken'}
            </button>
            <button
              onClick={openYouTubeSearch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open YouTube
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Videos zoeken...</span>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => openYouTubeVideo(video.id)}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <div className="relative mb-3">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-60 rounded-full p-3">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{video.channelTitle}</span>
                    <span>{video.viewCount}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Klik op "Zoeken" om YouTube videos te vinden voor "{exerciseName}"
              </p>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Videos Zoeken
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Videos worden geopend op YouTube.com in een nieuw tabblad
          </p>
        </div>
      </div>
    </div>
  );
};