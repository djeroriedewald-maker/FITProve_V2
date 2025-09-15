import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  /** The text to display next to the back arrow */
  text?: string;
  /** Custom onClick handler. If not provided, will use browser history back */
  onClick?: () => void;
  /** Show close icon instead of back arrow */
  variant?: 'back' | 'close';
  /** Custom route to navigate to instead of going back */
  to?: string;
  /** Additional CSS classes */
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  text = 'Back',
  onClick,
  variant = 'back',
  to,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back in browser history
    }
  };

  const Icon = variant === 'close' ? X : ArrowLeft;

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
    >
      <Icon className="w-4 h-4" />
      {variant === 'back' && (
        <span className="text-sm font-medium">{text}</span>
      )}
    </button>
  );
};