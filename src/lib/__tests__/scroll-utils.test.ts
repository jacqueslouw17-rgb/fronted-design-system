import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { prefersReducedMotion, scrollToStep, scrollToFirstInvalidField } from '../scroll-utils';

describe('scroll-utils', () => {
  let mockMatchMedia: any;

  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
    
    // Mock focus
    HTMLElement.prototype.focus = vi.fn();
    
    // Mock setAttribute
    HTMLElement.prototype.setAttribute = vi.fn();
    
    // Reset DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('prefersReducedMotion', () => {
    it('should return true when user prefers reduced motion', () => {
      mockMatchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      window.matchMedia = mockMatchMedia;
      
      expect(prefersReducedMotion()).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('should return false when user does not prefer reduced motion', () => {
      mockMatchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      window.matchMedia = mockMatchMedia;
      
      expect(prefersReducedMotion()).toBe(false);
    });

    it('should handle missing matchMedia support', () => {
      const originalMatchMedia = window.matchMedia;
      // @ts-ignore
      delete window.matchMedia;
      
      expect(prefersReducedMotion()).toBe(false);
      
      window.matchMedia = originalMatchMedia;
    });
  });

  describe('scrollToStep', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should scroll to step with smooth behavior when motion is not reduced', () => {
      mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = mockMatchMedia;

      const stepElement = document.createElement('div');
      stepElement.setAttribute('data-step', 'test-step');
      const header = document.createElement('div');
      header.setAttribute('data-step-header', 'true');
      stepElement.appendChild(header);
      document.body.appendChild(stepElement);

      scrollToStep('test-step');
      
      vi.advanceTimersByTime(100);

      expect(stepElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('should scroll to step with auto behavior when motion is reduced', () => {
      mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: true,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = mockMatchMedia;

      const stepElement = document.createElement('div');
      stepElement.setAttribute('data-step', 'test-step');
      const header = document.createElement('div');
      header.setAttribute('data-step-header', 'true');
      stepElement.appendChild(header);
      document.body.appendChild(stepElement);

      scrollToStep('test-step');
      
      vi.advanceTimersByTime(100);

      expect(stepElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'start',
      });
    });

    it('should focus header when focusHeader is true', () => {
      mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = mockMatchMedia;

      const stepElement = document.createElement('div');
      stepElement.setAttribute('data-step', 'test-step');
      const header = document.createElement('div');
      header.setAttribute('data-step-header', 'true');
      stepElement.appendChild(header);
      document.body.appendChild(stepElement);

      scrollToStep('test-step', { focusHeader: true });
      
      vi.advanceTimersByTime(100);

      expect(header.setAttribute).toHaveBeenCalledWith('tabindex', '-1');
      expect(header.focus).toHaveBeenCalledWith({ preventScroll: true });
    });

    it('should not focus header when focusHeader is false', () => {
      mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = mockMatchMedia;

      const stepElement = document.createElement('div');
      stepElement.setAttribute('data-step', 'test-step');
      const header = document.createElement('div');
      header.setAttribute('data-step-header', 'true');
      stepElement.appendChild(header);
      document.body.appendChild(stepElement);

      scrollToStep('test-step', { focusHeader: false });
      
      vi.advanceTimersByTime(100);

      expect(header.focus).not.toHaveBeenCalled();
    });

    it('should respect custom delay', () => {
      mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = mockMatchMedia;

      const stepElement = document.createElement('div');
      stepElement.setAttribute('data-step', 'test-step');
      document.body.appendChild(stepElement);

      scrollToStep('test-step', { delay: 500 });
      
      vi.advanceTimersByTime(400);
      expect(stepElement.scrollIntoView).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      expect(stepElement.scrollIntoView).toHaveBeenCalled();
    });

    it('should handle missing step element gracefully', () => {
      scrollToStep('non-existent-step');
      
      vi.advanceTimersByTime(100);
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should handle missing header element gracefully', () => {
      mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = mockMatchMedia;

      const stepElement = document.createElement('div');
      stepElement.setAttribute('data-step', 'test-step');
      // No header child
      document.body.appendChild(stepElement);

      scrollToStep('test-step', { focusHeader: true });
      
      vi.advanceTimersByTime(100);

      // Should still scroll even without header
      expect(stepElement.scrollIntoView).toHaveBeenCalled();
    });
  });

  describe('scrollToFirstInvalidField', () => {
    beforeEach(() => {
      mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = mockMatchMedia;
    });

    it('should scroll to and focus first invalid field in document', () => {
      const invalidInput = document.createElement('input');
      invalidInput.setAttribute('aria-invalid', 'true');
      document.body.appendChild(invalidInput);

      const validInput = document.createElement('input');
      document.body.appendChild(validInput);

      scrollToFirstInvalidField();

      expect(invalidInput.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
      expect(invalidInput.focus).toHaveBeenCalled();
    });

    it('should scroll to first invalid field in specific container', () => {
      const container = document.createElement('div');
      container.id = 'test-container';
      
      const invalidInput = document.createElement('input');
      invalidInput.setAttribute('aria-invalid', 'true');
      container.appendChild(invalidInput);
      
      document.body.appendChild(container);

      scrollToFirstInvalidField('test-container');

      expect(invalidInput.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
      expect(invalidInput.focus).toHaveBeenCalled();
    });

    it('should handle missing container gracefully', () => {
      scrollToFirstInvalidField('non-existent-container');
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should handle no invalid fields gracefully', () => {
      const validInput = document.createElement('input');
      document.body.appendChild(validInput);

      scrollToFirstInvalidField();

      expect(validInput.scrollIntoView).not.toHaveBeenCalled();
    });

    it('should respect reduced motion for invalid field scroll', () => {
      mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: true,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = mockMatchMedia;

      const invalidInput = document.createElement('input');
      invalidInput.setAttribute('aria-invalid', 'true');
      document.body.appendChild(invalidInput);

      scrollToFirstInvalidField();

      expect(invalidInput.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'center',
      });
    });
  });
});
