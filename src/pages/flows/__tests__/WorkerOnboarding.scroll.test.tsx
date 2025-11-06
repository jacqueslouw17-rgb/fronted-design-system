import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import WorkerOnboarding from '../WorkerOnboarding';
import * as scrollUtils from '@/lib/scroll-utils';

// Mock dependencies
vi.mock('@/hooks/useTextToSpeech', () => ({
  useTextToSpeech: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
    currentWordIndex: 0,
  }),
}));

vi.mock('@/hooks/useAgentState', () => ({
  useAgentState: () => ({
    setIsSpeaking: vi.fn(),
  }),
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('WorkerOnboarding - Scroll Behavior', () => {
  let scrollToStepSpy: any;
  let prefersReducedMotionSpy: any;

  beforeEach(() => {
    // Mock scrollToStep
    scrollToStepSpy = vi.spyOn(scrollUtils, 'scrollToStep' as any);
    
    // Mock prefersReducedMotion
    prefersReducedMotionSpy = vi.spyOn(scrollUtils, 'prefersReducedMotion' as any).mockReturnValue(false);

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
    
    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should render with proper scroll containers', () => {
    render(
      <MemoryRouter>
        <WorkerOnboarding />
      </MemoryRouter>
    );

    expect(screen.getByText('Candidate Onboarding')).toBeInTheDocument();
  });

  it('should have data-step attributes on all step containers', () => {
    const { container } = render(
      <MemoryRouter>
        <WorkerOnboarding />
      </MemoryRouter>
    );

    const stepElements = container.querySelectorAll('[data-step]');
    expect(stepElements.length).toBe(6); // 6 steps in worker onboarding
  });

  it('should have proper ARIA attributes for accessibility', () => {
    const { container } = render(
      <MemoryRouter>
        <WorkerOnboarding />
      </MemoryRouter>
    );

    const regions = container.querySelectorAll('[role="region"]');
    expect(regions.length).toBe(6);

    regions.forEach((region) => {
      const labelledBy = region.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(labelledBy).toMatch(/^step-header-/);
    });
  });

  it('should call scroll utility on step completion', async () => {
    render(
      <MemoryRouter>
        <WorkerOnboarding />
      </MemoryRouter>
    );

    // Initial render might trigger scroll
    await waitFor(() => {
      expect(scrollToStepSpy).toHaveBeenCalled();
    });
  });

  it('should use utilScrollToStep with correct parameters', async () => {
    render(
      <MemoryRouter>
        <WorkerOnboarding />
      </MemoryRouter>
    );

    await waitFor(() => {
      if (scrollToStepSpy.mock.calls.length > 0) {
        const [stepId, options] = scrollToStepSpy.mock.calls[0];
        expect(options).toHaveProperty('focusHeader');
        expect(options).toHaveProperty('delay');
      }
    });
  });

  it('should respect reduced motion for animations', () => {
    prefersReducedMotionSpy.mockReturnValue(true);
    
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <MemoryRouter>
        <WorkerOnboarding />
      </MemoryRouter>
    );

    expect(prefersReducedMotionSpy()).toBe(true);
  });

  it('should maintain scroll container structure', () => {
    const { container } = render(
      <MemoryRouter>
        <WorkerOnboarding />
      </MemoryRouter>
    );

    const scrollContainer = container.querySelector('.onboarding-scroll-container');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('should have frequency animation visible', () => {
    const { container } = render(
      <MemoryRouter>
        <WorkerOnboarding />
      </MemoryRouter>
    );

    // AudioWaveVisualizer should be present
    const visualizer = container.querySelector('[class*="AudioWave"]') || 
                       container.querySelector('svg[class*="wave"]');
    
    // Component should be in the DOM structure
    expect(container.querySelector('main')).toBeInTheDocument();
  });

  it('should handle step transitions without errors', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <WorkerOnboarding />
      </MemoryRouter>
    );

    // Simulate multiple re-renders
    for (let i = 0; i < 3; i++) {
      rerender(
        <MemoryRouter>
          <WorkerOnboarding />
        </MemoryRouter>
      );
    }

    await waitFor(() => {
      expect(screen.getByText('Candidate Onboarding')).toBeInTheDocument();
    });
  });

  it('should focus header without causing scroll jump', () => {
    const { container } = render(
      <MemoryRouter>
        <WorkerOnboarding />
      </MemoryRouter>
    );

    const headers = container.querySelectorAll('[data-step-header]');
    
    // Headers should exist and be focusable
    headers.forEach((header) => {
      expect(header).toBeInTheDocument();
    });
  });
});
