import { useState } from 'react';
import { Heart } from 'lucide-react';
import { REACTIONS, ReactionType } from '../../types/social.types';
import { ReactionPicker } from './ReactionPicker';

interface ReactionButtonProps {
  onReactionToggle: (reactionType: ReactionType) => void;
  currentReaction?: ReactionType | null;
  reactionCounts?: Record<ReactionType, number>;
  totalLikes: number;
  className?: string;
}

export function ReactionButton({ 
  onReactionToggle, 
  currentReaction, 
  reactionCounts,
  totalLikes,
  className = '' 
}: ReactionButtonProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleQuickLike = () => {
    if (currentReaction === 'like') {
      // If already liked with 'like', remove the reaction
      onReactionToggle('like');
    } else {
      // Quick like with thumbs up
      onReactionToggle('like');
    }
  };

  const handleLongPress = () => {
    setShowPicker(true);
  };

  // Get the display reaction (prioritize user's reaction, or most common)
  const getDisplayReaction = () => {
    if (currentReaction) {
      return REACTIONS[currentReaction];
    }
    
    if (reactionCounts) {
      const mostCommon = Object.entries(reactionCounts)
        .filter(([_, count]) => count > 0)
        .sort(([_, a], [__, b]) => b - a)[0];
      
      if (mostCommon) {
        return REACTIONS[mostCommon[0] as ReactionType];
      }
    }
    
    return null;
  };

  const displayReaction = getDisplayReaction();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleQuickLike}
        onMouseDown={() => {
          // Start long press timer
          const timer = setTimeout(handleLongPress, 500);
          
          const cleanup = () => {
            clearTimeout(timer);
            document.removeEventListener('mouseup', cleanup);
            document.removeEventListener('mouseleave', cleanup);
          };
          
          document.addEventListener('mouseup', cleanup);
          document.addEventListener('mouseleave', cleanup);
        }}
        className={`
          flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium
          transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700
          ${currentReaction 
            ? 'text-primary bg-primary/10' 
            : 'text-gray-600 dark:text-gray-400 hover:text-primary'
          }
        `}
      >
        {displayReaction ? (
          <span className="text-base">{displayReaction.emoji}</span>
        ) : (
          <Heart className={`w-4 h-4 transition-colors ${
            currentReaction ? 'fill-current' : ''
          }`} />
        )}
        
        {totalLikes > 0 && (
          <span className="min-w-0">
            {totalLikes}
          </span>
        )}
      </button>

      <ReactionPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        currentReaction={currentReaction}
        onReactionSelect={onReactionToggle}
      />
    </div>
  );
}