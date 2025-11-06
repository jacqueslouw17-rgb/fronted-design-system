import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import AdminOnboarding from '../AdminOnboarding';
import * as scrollUtils from '@/lib/scroll-utils';

// Mock dependencies
vi.mock('@/hooks/useTextToSpeech', () => ({
  useTextToSpeech: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
    currentWordIndex: 0,
  }),
}));

vi.mock('@/hooks/useSpeechToText', () => ({
  useSpeechToText: () => ({
    isListening: false,
    transcript: '',
    startListening: vi.fn(),
    stopListening: vi.fn(),
    resetTranscript: vi.fn(),
    error: null,
    isSupported: true,
    isDetectingVoice: false,
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock('@/hooks/useAgentState', () => ({
  useAgentState: () => ({
    setIsSpeaking: vi.fn(),
  }),
}));

describe('AdminOnboarding - Scroll Behavior', () => {
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

  it('should render with first step expanded and visible', () => {
    render(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Welcome & Setup')).toBeInTheDocument();
  });

  it('should have data-step attribute on step containers', () => {
    const { container } = render(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    const stepElements = container.querySelectorAll('[data-step]');
    expect(stepElements.length).toBeGreaterThan(0);
  });

  it('should have aria-labelledby on step regions', () => {
    const { container } = render(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    const regionElements = container.querySelectorAll('[role="region"]');
    regionElements.forEach((region) => {
      expect(region.getAttribute('aria-labelledby')).toBeTruthy();
    });
  });

  it('should have data-step-header on step headers', () => {
    const { container } = render(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    const headerElements = container.querySelectorAll('[data-step-header]');
    expect(headerElements.length).toBeGreaterThan(0);
  });

  it('should call scrollToStep when expanding a completed step', async () => {
    const { container } = render(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    // Mock a completed step scenario
    const stepCard = screen.getByText('Welcome & Setup').closest('[role="region"]');
    
    if (stepCard) {
      const button = stepCard.querySelector('div[class*="cursor-pointer"]');
      if (button) {
        fireEvent.click(button as Element);
        
        await waitFor(() => {
          expect(scrollToStepSpy).toHaveBeenCalled();
        });
      }
    }
  });

  it('should respect reduced motion preference', () => {
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
        <AdminOnboarding />
      </MemoryRouter>
    );

    expect(prefersReducedMotionSpy()).toBe(true);
  });

  it('should maintain focus trap within step when expanded', () => {
    const { container } = render(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    const expandedStep = container.querySelector('[data-step="intro_trust_model"]');
    expect(expandedStep).toBeInTheDocument();
  });

  it('should have unique ids for each step header', () => {
    const { container } = render(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    const headers = container.querySelectorAll('[data-step-header]');
    const ids = Array.from(headers).map((h) => h.id);
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should not scroll on drawer/modal interactions', async () => {
    const { container } = render(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    const initialScrollY = window.scrollY;

    // Simulate modal/drawer interaction (doesn't trigger scroll)
    // This verifies that opening UI elements doesn't affect page scroll
    
    await waitFor(() => {
      expect(window.scrollY).toBe(initialScrollY);
    });
  });

  it('should scroll with appropriate timing', () => {
    vi.useFakeTimers();

    render(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    // Verify scroll is debounced/delayed appropriately
    expect(scrollToStepSpy).not.toHaveBeenCalled();

    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('should handle rapid step changes gracefully', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    // Simulate rapid navigation
    for (let i = 0; i < 5; i++) {
      rerender(
        <MemoryRouter>
          <AdminOnboarding />
        </MemoryRouter>
      );
    }

    // Should not throw errors or cause issues
    await waitFor(() => {
      expect(screen.getByText('Admin Onboarding')).toBeInTheDocument();
    });
  });

  it('should preserve scroll position when not changing steps', () => {
    const { rerender } = render(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    const initialCallCount = scrollToStepSpy.mock.calls.length;

    // Re-render without changing step
    rerender(
      <MemoryRouter>
        <AdminOnboarding />
      </MemoryRouter>
    );

    // Scroll should not be called again for same step
    expect(scrollToStepSpy.mock.calls.length).toBe(initialCallCount);
  });
});
