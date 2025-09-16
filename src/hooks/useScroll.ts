/**
 * React hooks for scroll management
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '../utils/scroll';

/**
 * Hook that automatically scrolls to top when route changes
 * Use this in page components to ensure users start at the top of new pages
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTop('instant');
  }, [pathname]);
};

/**
 * Hook that provides scroll utility functions
 * @returns Object with scroll functions
 */
export const useScrollUtils = () => {
  return {
    scrollToTop: (smooth = false) => scrollToTop(smooth ? 'smooth' : 'instant'),
    scrollToElement: (elementId: string, smooth = true) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ 
          behavior: smooth ? 'smooth' : 'instant', 
          block: 'start' 
        });
      }
    }
  };
};