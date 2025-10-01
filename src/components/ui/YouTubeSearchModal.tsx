import React, { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';
import { Exercise } from '../../types/exercise.types';
import { ExerciseImage } from './ProgressiveImage';

interface YouTubeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  exercise?: Exercise | null;
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
  exerciseName,
  exercise,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && exerciseName) {
      setSearchQuery(`${exerciseName} exercise tutorial`);
      setSelectedVideoId(null);
    }
  }, [isOpen, exerciseName]);

  // Your YouTube Data API key (keep private in production)
  const YOUTUBE_API_KEY = "AIzaSyCbUSh6WV_4u0qgx8GavqIRgTTIsXCeX8Q";

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
          searchQuery
        )}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items) {
        const results = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          duration: '', // To fetch duration, use videos.list API
          viewCount: '', // To fetch view count, use videos.list API
        }));
        setVideos(results);
      } else {
        setVideos([]);
      }
    } catch (err) {
      setVideos([]);
    }
    setIsLoading(false);
  };

  const openYouTubeVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const closeVideoModal = () => {
    setSelectedVideoId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative">
        {/* Hero Image */}
        {exercise && (
          <div className="w-full h-48 sm:h-64 md:h-72 bg-black bg-opacity-10 flex items-center justify-center overflow-hidden">
            <ExerciseImage
              exercise={exercise}
              className="w-full h-full object-cover"
              priority={true}
            />
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              YouTube Videos voor {exerciseName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Klik op een video om deze in de app te bekijken
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Sluit"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        {/* Search Bar */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Zoek YouTube videos..."
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Zoeken...' : 'Videos Zoeken'}
          </button>
        </div>
        {/* Results */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openYouTubeVideo(video.id)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-40">
                      <div className="bg-black bg-opacity-60 rounded-full p-3">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
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
                Klik op &quot;Zoeken&quot; om YouTube videos te vinden voor &quot;{exerciseName}
                &quot;
              </p>
            </div>
          )}
        </div>
        {/* Floating YouTube Player Modal */}
        {selectedVideoId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-4 relative w-full max-w-2xl">
              <button
                onClick={closeVideoModal}
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Sluit video"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-300" />
              </button>
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
