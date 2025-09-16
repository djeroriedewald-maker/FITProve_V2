/**
 * TagInput Component
 * Allows users to add multiple tags with comma separation or Enter key
 */

import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  maxTags = 4,
  placeholder = 'Add tags (press Enter or comma to add)',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim().toLowerCase();

    // Validation checks
    if (!trimmedTag) return;
    if (tags.length >= maxTags) return;
    if (tags.includes(trimmedTag)) return;
    if (trimmedTag.length > 20) return; // Prevent very long tags

    onChange([...tags, trimmedTag]);
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspacing on empty input
      removeTag(tags.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Handle comma-separated input
    if (value.includes(',')) {
      const newTags = value
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag);
      newTags.forEach((tag) => {
        if (tags.length < maxTags && !tags.includes(tag) && tag.length <= 20) {
          addTag(tag);
        }
      });
      return;
    }

    setInputValue(value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2 min-h-[2.75rem] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-colors">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm font-medium rounded-full"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800 hover:text-orange-800 dark:hover:text-orange-200 focus:outline-none focus:bg-orange-200 dark:focus:bg-orange-800 transition-colors"
              aria-label={`Remove ${tag} tag`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {tags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            maxLength={20}
          />
        )}
      </div>

      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Press Enter or comma to add tags</span>
        <span
          className={`${tags.length >= maxTags ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}`}
        >
          {tags.length}/{maxTags} tags
        </span>
      </div>

      {tags.length >= maxTags && (
        <p className="text-xs text-orange-600 dark:text-orange-400">
          Maximum number of tags reached. Remove a tag to add more.
        </p>
      )}
    </div>
  );
};
