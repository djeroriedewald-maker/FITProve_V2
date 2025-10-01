import React from 'react';
import { ProgressiveImage } from '../ui/ProgressiveImage';

interface FeaturedCommunityWorkoutCardProps {
  title: string;
  author: string;
  image: string;
}

export const FeaturedCommunityWorkoutCard: React.FC<FeaturedCommunityWorkoutCardProps> = ({ title, author, image }) => {
  return (
    <div className="w-48 flex-shrink-0 rounded-xl overflow-hidden bg-black/80 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative w-full h-32">
        <ProgressiveImage
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="p-3">
        <h4 className="text-base font-semibold text-white truncate mb-1">{title}</h4>
        <p className="text-xs text-gray-300 truncate">By {author}</p>
      </div>
    </div>
  );
};
