import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ImageIcon, Loader } from 'lucide-react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loadingClassName?: string;
  fallbackIcon?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

interface ExerciseImageProps {
  exercise: {
    image_url?: string;
    gif_url?: string;
    name: string;
  };
  className?: string;
  showGif?: boolean;
  priority?: boolean;
  onClick?: () => void;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = '',
  loadingClassName = 'animate-pulse bg-gray-200 dark:bg-gray-700',
  fallbackIcon = <ImageIcon className="w-8 h-8 text-gray-400" />,
  onLoad,
  onError,
  priority = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    onError?.();
  };

  if (error) {
    return (
      <div className={`relative ${className} bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
        <div className="text-center">
          {fallbackIcon}
          <p className="text-xs text-gray-500 mt-1">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${loadingClassName} flex items-center justify-center`}
          >
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          </motion.div>
        )}
      </AnimatePresence>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};

// Enhanced exercise image component
export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  exercise,
  className = '',
  showGif = false,
  priority = false,
  onClick
}) => {
  const [imageError, setImageError] = useState(false);
  const [gifError, setGifError] = useState(false);

  const imageUrl = showGif && exercise.gif_url && !gifError 
    ? exercise.gif_url 
    : exercise.image_url;

  const handleImageError = () => {
    if (showGif && exercise.gif_url && !gifError) {
      setGifError(true);
    } else {
      setImageError(true);
    }
  };

  if (!imageUrl || imageError) {
    return (
      <div 
        className={`bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${className} ${onClick ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors' : ''}`}
        onClick={onClick}
      >
        <div className="text-center">
          <Dumbbell className="w-8 h-8 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">No image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <ProgressiveImage
        src={imageUrl}
        alt={exercise.name}
        className={className}
        priority={priority}
        onError={handleImageError}
        fallbackIcon={<Dumbbell className="w-8 h-8 text-gray-400" />}
      />
      
      {/* GIF indicator */}
      {showGif && exercise.gif_url && !gifError && (
        <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
          GIF
        </div>
      )}
      
      {/* Hover overlay for clickable images */}
      {onClick && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200" />
      )}
    </div>
  );
};

// Hook to preload images for better UX
export function useImagePreloader(urls: string[]) {
  useEffect(() => {
    urls.forEach(url => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [urls]);
}