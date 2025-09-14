import { useState } from 'react';
import { REACTIONS, ReactionType } from '../../types/social.types';

interface ReactionPickerProps {
  onReactionSelect: (reactionType: ReactionType) => void;
  currentReaction?: ReactionType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReactionPicker({ 
  onReactionSelect, 
  currentReaction, 
  isOpen, 
  onClose 
}: ReactionPickerProps) {
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);

  if (!isOpen) return null;

  const reactionList = Object.values(REACTIONS);

  return (
    <>
      {/* Backdrop to close picker */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Reaction picker */}
      <div className="absolute bottom-full left-0 mb-2 z-50 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 px-2 py-1.5 flex space-x-1">
        {reactionList.map((reaction) => {
          const isSelected = currentReaction === reaction.type;
          const isHovered = hoveredReaction === reaction.type;
          
          return (
            <button
              key={reaction.type}
              onClick={() => {
                onReactionSelect(reaction.type);
                onClose();
              }}
              onMouseEnter={() => setHoveredReaction(reaction.type)}
              onMouseLeave={() => setHoveredReaction(null)}
              className={`
                relative w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700
                ${isSelected ? 'bg-primary/10 ring-2 ring-primary/30' : ''}
                ${isHovered ? 'scale-125' : 'scale-100'}
              `}
              title={reaction.label}
            >
              <span className="text-xl select-none">
                {reaction.emoji}
              </span>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 bg-primary rounded-full transform -translate-x-1/2" />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}