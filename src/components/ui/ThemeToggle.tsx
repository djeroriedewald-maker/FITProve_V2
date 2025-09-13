import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    // Check local storage or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedTheme || (prefersDark ? 'dark' : 'light');
    }
    return 'light';
  });

  useEffect(() => {
    // Update class and localStorage
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
      aria-label="Toggle theme"
    >
      <Sun className="w-5 h-5 text-amber-500 dark:text-gray-400 transition-transform duration-300 rotate-0 scale-100 dark:rotate-90 dark:scale-0" />
      <Moon className="w-5 h-5 text-gray-900 dark:text-blue-300 transition-transform duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100 absolute top-2 left-2" />
    </button>
  );
};