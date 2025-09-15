import React, { useState, useEffect } from 'react';
import { Play, Loader, AlertCircle, ExternalLink } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
  onLoad?: () => void;
}

// YouTube iframe embed component
function YouTubeEmbed({ videoId, title, autoplay = false, onLoad }: YouTubeEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const embedUrl = `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Loader className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 dark:text-red-400 text-sm">Failed to load video</p>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center justify-center gap-1 mt-2"
            >
              Watch on YouTube <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

export function YouTubePlayer({ 
  videoId, 
  title = 'Exercise Video',
  className = '',
  autoplay = false,
  onLoad,
  onError 
}: YouTubePlayerProps) {
  const [showEmbed, setShowEmbed] = useState(autoplay);

  // Validate YouTube video ID
  const isValidVideoId = /^[a-zA-Z0-9_-]{11}$/.test(videoId);

  useEffect(() => {
    if (!isValidVideoId) {
      onError?.('Invalid YouTube video ID');
    }
  }, [videoId, isValidVideoId, onError]);

  const handlePlayClick = () => {
    setShowEmbed(true);
  };

  const handleVideoLoad = () => {
    onLoad?.();
  };

  if (!isValidVideoId) {
    return (
      <div className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400 text-sm">Invalid video ID</p>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center justify-center gap-1 mt-2"
          >
            Try YouTube <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  if (!showEmbed) {
    // Show thumbnail with play button
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden aspect-video group cursor-pointer ${className}`}>
        <img 
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to standard quality thumbnail
            const target = e.target as HTMLImageElement;
            target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-200" />
        
        {/* Play button */}
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 flex items-center justify-center"
          aria-label={`Play video: ${title}`}
        >
          <div className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 group-hover:scale-110 transition-all duration-200 shadow-lg">
            <Play className="w-8 h-8 ml-1" />
          </div>
        </button>
        
        {/* YouTube branding */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-white text-xs font-medium">
          YouTube
        </div>
      </div>
    );
  }

  // Show embedded player
  return (
    <div className={`relative bg-black rounded-lg overflow-hidden aspect-video ${className}`}>
      <YouTubeEmbed
        videoId={videoId}
        title={title}
        autoplay={autoplay}
        onLoad={handleVideoLoad}
      />
    </div>
  );
}

// Enhanced video player with additional controls
interface EnhancedYouTubePlayerProps extends YouTubePlayerProps {
  showControls?: boolean;
  showTitle?: boolean;
  fallbackContent?: React.ReactNode;
}

export function EnhancedYouTubePlayer({
  videoId,
  title = 'Exercise Video',
  className = '',
  autoplay = false,
  showControls = true,
  showTitle = true,
  fallbackContent,
  onLoad,
  onError
}: EnhancedYouTubePlayerProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = (error: string) => {
    setHasError(true);
    onError?.(error);
  };

  if (hasError && fallbackContent) {
    return <div className={className}>{fallbackContent}</div>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {title}
          </h3>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
      
      <YouTubePlayer
        videoId={videoId}
        title={title}
        autoplay={autoplay}
        onLoad={onLoad}
        onError={handleError}
      />
      
      {showControls && (
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>YouTube Video</span>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Watch on YouTube →
          </a>
        </div>
      )}
    </div>
  );
}