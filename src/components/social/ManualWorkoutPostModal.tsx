import React, { useState } from 'react';
import { Plus, Zap, Clock, Flame, Dumbbell } from 'lucide-react';
import { createManualWorkoutPost } from '../../lib/auto-posts';
import { Modal } from '../ui/Modal';

interface ManualWorkoutPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (postId: string) => void;
}

const WORKOUT_TYPES = [
  { value: 'strength', label: 'Krachttraining', emoji: '💪' },
  { value: 'cardio', label: 'Cardio', emoji: '❤️' },
  { value: 'hiit', label: 'HIIT', emoji: '🔥' },
  { value: 'yoga', label: 'Yoga', emoji: '🧘' },
  { value: 'flexibility', label: 'Flexibiliteit', emoji: '🤸' },
  { value: 'running', label: 'Hardlopen', emoji: '🏃' },
  { value: 'cycling', label: 'Fietsen', emoji: '🚴' },
  { value: 'swimming', label: 'Zwemmen', emoji: '🏊' },
  { value: 'crossfit', label: 'CrossFit', emoji: '⚡' },
  { value: 'pilates', label: 'Pilates', emoji: '🤸‍♀️' },
  { value: 'boxing', label: 'Boksen', emoji: '🥊' },
  { value: 'dance', label: 'Dans', emoji: '💃' }
];

export const ManualWorkoutPostModal: React.FC<ManualWorkoutPostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated
}) => {
  const [formData, setFormData] = useState({
    workoutName: '',
    workoutType: 'strength',
    duration: 30,
    caloriesBurned: 200
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.workoutName.trim()) {
      setError('Workout naam is verplicht');
      return;
    }

    if (formData.duration < 1) {
      setError('Duur moet minimaal 1 minuut zijn');
      return;
    }

    if (formData.caloriesBurned < 1) {
      setError('Calorieën moeten minimaal 1 zijn');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const postId = await createManualWorkoutPost({
        workoutName: formData.workoutName.trim(),
        workoutType: formData.workoutType,
        duration: formData.duration,
        caloriesBurned: formData.caloriesBurned
      });

      if (postId) {
        onPostCreated?.(postId);
        onClose();
        // Reset form
        setFormData({
          workoutName: '',
          workoutType: 'strength', 
          duration: 30,
          caloriesBurned: 200
        });
      } else {
        setError('Post kon niet worden aangemaakt. Controleer je instellingen.');
      }
    } catch (error) {
      console.error('Error creating manual workout post:', error);
      setError('Er is een fout opgetreden bij het maken van de post');
    } finally {
      setCreating(false);
    }
  };

  const selectedWorkoutType = WORKOUT_TYPES.find(type => type.value === formData.workoutType);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workout Post Maken">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workout Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workout Naam *
          </label>
          <div className="relative">
            <Dumbbell className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.workoutName}
              onChange={(e) => handleInputChange('workoutName', e.target.value)}
              placeholder="bijv. Full Body Workout, Morning Run, HIIT Session"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={creating}
            />
          </div>
        </div>

        {/* Workout Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workout Type
          </label>
          <select
            value={formData.workoutType}
            onChange={(e) => handleInputChange('workoutType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={creating}
          >
            {WORKOUT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.emoji} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duration and Calories */}
        <div className="grid grid-cols-2 gap-4">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duur (minuten)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="1"
                max="300"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 1)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={creating}
              />
            </div>
          </div>

          {/* Calories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calorieën
            </label>
            <div className="relative">
              <Flame className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="1"
                max="2000"
                step="10"
                value={formData.caloriesBurned}
                onChange={(e) => handleInputChange('caloriesBurned', parseInt(e.target.value) || 1)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={creating}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Post Preview:</span>
          </h4>
          <div className="bg-white p-3 rounded border border-gray-200">
            <p className="text-sm text-gray-800">
              <span className="font-medium">{selectedWorkoutType?.emoji} Net klaar met {formData.workoutName || 'mijn training'}!</span>
              {' '}💪 {formData.duration} minuten getraind en {formData.caloriesBurned} calorieën verbrand. #FitLife
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={creating}
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={creating || !formData.workoutName.trim()}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{creating ? 'Post Maken...' : 'Post Maken'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};