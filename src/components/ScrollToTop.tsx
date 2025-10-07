
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  scrollRef?: React.RefObject<HTMLDivElement>;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ scrollRef }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (scrollRef && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, scrollRef]);
  return null;
};

export default ScrollToTop;
