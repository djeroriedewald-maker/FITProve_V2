import React, { useState } from 'react';
import { X, Play, Clock, Target, Dumbbell, AlertTriangle, Lightbulb, Zap, ChevronDown, ChevronUp, Youtube } from 'lucide-react';
import { Exercise } from '../../types/exercise.types';
import { EnhancedYouTubePlayer } from './YouTubePlayer';
import { ExerciseImage } from './ProgressiveImage';
import { YouTubeSearchModal } from './YouTubeSearchModal';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToWorkout: (exercise: Exercise) => void;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  isExpandable?: boolean;
}

export function ExerciseDetailModal({ exercise, isOpen, onClose, onAddToWorkout }: ExerciseDetailModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['description', 'instructions']));
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'gif' | 'video'>('image');
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);

  if (!isOpen || !exercise) return null;

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getMechanicsColor = (mechanics: string) => {
    return mechanics === 'compound' 
      ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
      : 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
  };

  const sections: Section[] = [
    {
      id: 'description',
      title: 'Description',
      icon: <Target className="w-5 h-5" />,
      content: (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {exercise.description || 'No description available.'}
        </p>
      )
    },
    {
      id: 'instructions',
      title: 'Instructions',
      icon: <Lightbulb className="w-5 h-5" />,
      content: (
        <ol className="space-y-3">
          {exercise.instructions?.length > 0 ? (
            exercise.instructions.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {step}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No instructions available.</p>
          )}
        </ol>
      )
    },
    {
      id: 'tips',
      title: 'Tips & Form Cues',
      icon: <Zap className="w-5 h-5" />,
      content: (
        <ul className="space-y-2">
          {exercise.tips && exercise.tips.length > 0 ? (
            exercise.tips.map((tip, index) => (
              <li key={index} className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700 dark:text-gray-300">{tip}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No tips available.</p>
          )}
        </ul>
      ),
      isExpandable: true
    },
    {
      id: 'mistakes',
      title: 'Common Mistakes',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <ul className="space-y-2">
          {exercise.common_mistakes && exercise.common_mistakes.length > 0 ? (
            exercise.common_mistakes.map((mistake, index) => (
              <li key={index} className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700 dark:text-gray-300">{mistake}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No common mistakes listed.</p>
          )}
        </ul>
      ),
      isExpandable: true
    },
    {
      id: 'variations',
      title: 'Variations',
      icon: <Target className="w-5 h-5" />,
      content: (
        <ul className="space-y-2">
          {exercise.variations && exercise.variations.length > 0 ? (
            exercise.variations.map((variation, index) => (
              <li key={index} className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700 dark:text-gray-300">{variation}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No variations available.</p>
          )}
        </ul>
      ),
      isExpandable: true
    }
  ];

  const availableMedia = [
    { type: 'image' as const, available: !!exercise.image_url, label: 'Image' },
    { type: 'gif' as const, available: !!exercise.gif_url, label: 'GIF' },
    { type: 'video' as const, available: !!exercise.youtube_id, label: 'Video' }
  ].filter(media => media.available);

  // Debug log to see what's available
  console.log('Exercise data:', {
    name: exercise.name,
    image_url: exercise.image_url,
    gif_url: exercise.gif_url,
    youtube_id: exercise.youtube_id,
    availableMedia: availableMedia.map(m => m.type)
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-gray-800 w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-4xl sm:rounded-lg shadow-xl flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {exercise.name}
            </h2>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                {exercise.difficulty}
              </span>
              {exercise.mechanics && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMechanicsColor(exercise.mechanics)}`}>
                  {exercise.mechanics}
                </span>
              )}
              {exercise.force_type && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {exercise.force_type}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsYouTubeModalOpen(true)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0 group"
              title="Zoek YouTube videos"
            >
              <Youtube className="w-5 h-5 text-red-600 group-hover:text-red-700" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row min-h-full">
            {/* Media Section */}
            <div className="lg:w-1/2 p-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
              {/* Media Tabs */}
              {availableMedia.length > 1 && (
                <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {availableMedia.map(media => (
                    <button
                      key={media.type}
                      onClick={() => setActiveMediaTab(media.type)}
                      className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                        activeMediaTab === media.type
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {media.label}
                  </button>
                ))}
              </div>
            )}

            {/* Media Display */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
              {activeMediaTab === 'image' && exercise.image_url ? (
                <ExerciseImage
                  exercise={exercise}
                  className="w-full h-full"
                  priority={true}
                />
              ) : activeMediaTab === 'gif' && exercise.gif_url ? (
                <ExerciseImage
                  exercise={exercise}
                  className="w-full h-full"
                  showGif={true}
                  priority={true}
                />
              ) : activeMediaTab === 'video' && exercise.youtube_id ? (
                <EnhancedYouTubePlayer
                  videoId={exercise.youtube_id}
                  title={`${exercise.name} - Exercise Demonstration`}
                  className="w-full h-full"
                  showTitle={false}
                  showControls={false}
                  fallbackContent={
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <button 
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${exercise.youtube_id}`, '_blank')}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Play className="w-5 h-5" />
                        Watch on YouTube
                      </button>
                    </div>
                  }
                />
              ) : (
                <div className="text-gray-400 dark:text-gray-500">
                  <Dumbbell className="w-16 h-16 mx-auto mb-2" />
                  <p>No media available</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Target className="w-3 h-3 text-orange-600" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Primary</span>
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {exercise.primary_muscles?.[0] || 'N/A'}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Dumbbell className="w-3 h-3 text-orange-600" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Equipment</span>
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {exercise.equipment || 'None'}
                </p>
              </div>
              
              {exercise.recommended_sets && (
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="w-3 h-3 text-orange-600" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Sets</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {exercise.recommended_sets}
                  </p>
                </div>
              )}
              
              {exercise.recommended_reps && (
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-orange-600" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Reps</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {exercise.recommended_reps}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:w-1/2 flex-1">
            <div className="p-4 space-y-3">
              {sections.map((section) => {
                const isExpanded = expandedSections.has(section.id);
                
                return (
                  <div key={section.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-3 last:pb-0">
                    <button
                      onClick={() => section.isExpandable && toggleSection(section.id)}
                      className={`flex items-center gap-2 w-full text-left ${section.isExpandable ? 'hover:text-orange-600 dark:hover:text-orange-400' : ''}`}
                    >
                      <span className="text-orange-600 dark:text-orange-400">
                        {section.icon}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
                        {section.title}
                      </h3>
                      {section.isExpandable && (
                        <span className="text-gray-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      )}
                    </button>
                    
                    {(!section.isExpandable || isExpanded) && (
                      <div className="mt-2 ml-6 text-sm text-gray-700 dark:text-gray-300">
                        {section.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0 bg-white dark:bg-gray-800">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-center"
            >
              Close
            </button>
            <button
              onClick={() => onAddToWorkout(exercise)}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Add to Workout
            </button>
          </div>
        </div>
      </div>
      
      {/* YouTube Search Modal */}
      <YouTubeSearchModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
        exerciseName={exercise.name}
      />
    </div>
  );
}