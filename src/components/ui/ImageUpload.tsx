/**
 * ImageUpload Component
 * Allows users to upload and preview hero images for workouts
 * Enforces 1MB file size limit with validation
 */

import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, X, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  imageUrl?: string | null;
  onChange: (imageUrl: string | undefined) => void;
  maxSizeMB?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  onChange,
  maxSizeMB = 0.5,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)';
    }

    // Check file size (convert MB to bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Image size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsUploading(true);

    try {
      // Genereer uniek pad: userId/timestamp-bestandsnaam (userId uit localStorage of fallback)
      const userId = localStorage.getItem('user_id') || 'anonymous';
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const filePath = `${userId}/${timestamp}.${ext}`;

      // Upload naar Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('workout_creation_images')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        throw uploadError;
      }

      // Haal public URL op
      const { data } = supabase.storage
        .from('workout_creation_images')
        .getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error('No public URL returned');

      onChange(publicUrl);
      toast('Image uploaded successfully!');
    } catch (error) {
      const errorMsg = 'Failed to upload image';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = () => {
    onChange(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {imageUrl ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
            <img src={imageUrl} alt="Workout hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openFileDialog}
                  disabled={isUploading}
                  className="px-3 py-2 bg-white text-gray-800 rounded-md text-sm font-medium hover:bg-gray-100 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Camera size={16} />
                  Change
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isUploading}
                  className="px-3 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <X size={16} />
                  Remove
                </button>
              </div>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                  Uploading...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={openFileDialog}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {isUploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Uploading image...
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                  {isDragOver ? 'Drop image here' : 'Add workout hero image'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  JPEG, PNG, WebP, GIF • Max {maxSizeMB}MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>• Hero images help make your workouts more visually appealing</p>
        <p>• Recommended dimensions: 16:9 aspect ratio (e.g., 1200x675px)</p>
        <p>• File size limit: {maxSizeMB}MB for optimal performance</p>
      </div>
    </div>
  );
};
