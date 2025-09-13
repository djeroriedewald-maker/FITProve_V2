import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Brain, Sparkles } from 'lucide-react';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full"
  >
    <span className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
      {icon}
    </span>
    <span className="font-medium">{label}</span>
  </motion.button>
);

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAIAction = (action: string) => {
    // Handle different AI coach actions here
    console.log('AI action:', action);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 mb-4 space-y-2 min-w-[240px]"
          >
            <QuickAction
              icon={<Brain className="w-5 h-5 text-primary" />}
              label="Get Workout Suggestion"
              onClick={() => handleAIAction('workout-suggestion')}
            />
            <QuickAction
              icon={<Sparkles className="w-5 h-5 text-primary" />}
              label="Analyze Progress"
              onClick={() => handleAIAction('analyze-progress')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        className="group bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <motion.div className="relative">
          <Bot className="w-6 h-6" />
          <span className="absolute -top-12 right-0 min-w-max px-2 py-1 text-sm font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            AI Coach
          </span>
        </motion.div>
      </motion.button>
    </div>
  );
};