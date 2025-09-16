/**
 * Scroll utilities for consistent page navigation experience
 */

/**
 * Scrolls to the top of the page
 * @param behavior - 'smooth' for animated scroll, 'instant' for immediate jump
 */
export const scrollToTop = (behavior: 'smooth' | 'instant' = 'instant') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
};

/**
 * Scrolls to a specific element by ID
 * @param elementId - The ID of the element to scroll to
 * @param behavior - Scroll behavior
 */
export const scrollToElement = (elementId: string, behavior: 'smooth' | 'instant' = 'smooth') => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior, block: 'start' });
  }
};

/**
 * Scrolls to the top of a specific container element
 * @param container - The container element or selector
 * @param behavior - Scroll behavior
 */
export const scrollContainerToTop = (
  container: HTMLElement | string, 
  behavior: 'smooth' | 'instant' = 'instant'
) => {
  const element = typeof container === 'string' 
    ? document.querySelector(container) as HTMLElement
    : container;
    
  if (element) {
    element.scrollTo({
      top: 0,
      left: 0,
      behavior
    });
  }
};