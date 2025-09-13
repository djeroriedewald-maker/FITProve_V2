import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function RouterTransition() {
  const navigate = useNavigationType();
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Check if we're coming from another page
    if (navigate === 'PUSH') {
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [navigate, pathname]);
  
  return null;
}