import React, { useState } from 'react';
import { UserProfile } from '../../types/profile.types';
import { Modal } from '../ui/Modal';
import { X, Plus, Loader2 } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfile: Partial<UserProfile>) => void;
  isUpdating?: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  isUpdating = false,
}) => {
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    username: profile.username,
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl,
    fitnessGoals: [...profile.fitnessGoals],
    avatarFile: null as File | null,
  });

  const [newGoal, setNewGoal] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddGoal = () => {
    if (newGoal.trim() && formData.fitnessGoals.length < 5) {
      setFormData(prev => ({
        ...prev,
        fitnessGoals: [...prev.fitnessGoals, newGoal.trim()],
      }));
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.avatarFile) {
        // We already have a blob URL in formData.avatarUrl
        await onSave(formData);
        
        // Clean up the blob URL after saving
        if (formData.avatarUrl.startsWith('blob:')) {
          URL.revokeObjectURL(formData.avatarUrl);
        }
      } else {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      // Clean up blob URL on error too
      if (formData.avatarFile && formData.avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.avatarUrl);
      }
      throw error; // Let the parent handle the error display
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file');
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('Image must be smaller than 5MB');
        }

        // Clean up previous blob URL if it exists
        if (formData.avatarUrl.startsWith('blob:')) {
          URL.revokeObjectURL(formData.avatarUrl);
        }

        // Create a temporary preview URL
        const previewUrl = URL.createObjectURL(file);
        
        setFormData(prev => ({
          ...prev,
          avatarUrl: previewUrl,
          avatarFile: file, // Store the file for later upload
        }));
      } catch (error) {
        if (error instanceof Error) {
          // Show error to user via toast or alert
          throw error;
        }
        console.error('Avatar validation error:', error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Top Section - Avatar and Names */}
        <div className="flex items-start gap-3">
          {/* Avatar Upload */}
          <div className="relative flex-shrink-0">
            <img
              src={formData.avatarUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover bg-gray-100 dark:bg-gray-700"
            />
            <label className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
              <Plus className="w-3 h-3" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          
          {/* Name Fields */}
          <div className="flex-1 space-y-2">
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Display Name"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Bio - Compact */}
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Write a short bio..."
          rows={2}
          className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
        />

        {/* Fitness Goals - Compact */}
        <div>
          <div className="flex flex-wrap gap-1 mb-2">
            {formData.fitnessGoals.map((goal, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 dark:bg-primary/20 text-primary"
              >
                {goal}
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(index)}
                  className="ml-1 hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {formData.fitnessGoals.length < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a fitness goal"
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddGoal}
                className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};