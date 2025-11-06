/**
 * Utility functions for managing scroll behavior in flows
 */

/**
 * Check if user has prefers-reduced-motion enabled
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Scroll to a step element with accessibility support
 * @param stepId - The step ID to scroll to
 * @param options - Optional configuration
 */
export function scrollToStep(
  stepId: string,
  options: {
    focusHeader?: boolean;
    delay?: number;
  } = {}
): void {
  const { focusHeader = true, delay = 100 } = options;

  setTimeout(() => {
    const stepElement = document.querySelector(`[data-step="${stepId}"]`) as HTMLElement;
    
    if (stepElement) {
      // Scroll the step into view
      stepElement.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start'
      });

      // Focus the header for accessibility
      if (focusHeader) {
        const header = stepElement.querySelector('[data-step-header]') as HTMLElement;
        if (header) {
          // Make it focusable temporarily
          header.setAttribute('tabindex', '-1');
          header.focus({ preventScroll: true });
        }
      }
    }
  }, delay);
}

/**
 * Scroll to the first invalid field in a form
 * @param containerId - The container to search within
 */
export function scrollToFirstInvalidField(containerId?: string): void {
  const container = containerId 
    ? document.getElementById(containerId) 
    : document;
  
  if (!container) return;

  const invalidField = container.querySelector('[aria-invalid="true"]') as HTMLElement;
  
  if (invalidField) {
    invalidField.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'center'
    });
    invalidField.focus();
  }
}
