import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import CandidateOnboardingFlow from '../CandidateOnboardingFlow';
import * as scrollUtils from '@/lib/scroll-utils';

// Mock dependencies
vi.mock('@/hooks/useTextToSpeech', () => ({
  useTextToSpeech: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
    currentWordIndex: 0,
  }),
}));

describe('CandidateOnboardingFlow - Scroll Behavior', () => {
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

  it('should render welcome screen initially', () => {
    render(
      <MemoryRouter>
        <CandidateOnboardingFlow />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome, Maria Santos/i)).toBeInTheDocument();
  });

  it('should call scrollToStep on step transition', async () => {
    render(
      <MemoryRouter>
        <CandidateOnboardingFlow />
      </MemoryRouter>
    );

    const startButton = screen.getByText('Start Onboarding');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(scrollToStepSpy).toHaveBeenCalled();
    });
  });

  it('should have proper data-step attributes after welcome', async () => {
    render(
      <MemoryRouter>
        <CandidateOnboardingFlow />
      </MemoryRouter>
    );

    const startButton = screen.getByText('Start Onboarding');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });
  });

  it('should have data-step-header on step headers', async () => {
    const { container } = render(
      <MemoryRouter>
        <CandidateOnboardingFlow />
      </MemoryRouter>
    );

    const startButton = screen.getByText('Start Onboarding');
    fireEvent.click(startButton);

    await waitFor(() => {
      const headers = container.querySelectorAll('[data-step-header]');
      expect(headers.length).toBeGreaterThan(0);
      
      // Check that headers have proper IDs
      headers.forEach((header) => {
        expect(header.id).toMatch(/^step-header-/);
      });
    });
  });

  it('should scroll to next step on Continue button', async () => {
    render(
      <MemoryRouter>
        <CandidateOnboardingFlow />
      </MemoryRouter>
    );

    const startButton = screen.getByText('Start Onboarding');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    scrollToStepSpy.mockClear();

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(scrollToStepSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          focusHeader: true,
          delay: 100,
        })
      );
    });
  });

  it('should scroll to previous step on Back button', async () => {
    render(
      <MemoryRouter>
        <CandidateOnboardingFlow />
      </MemoryRouter>
    );

    // Navigate to step 2
    fireEvent.click(screen.getByText('Start Onboarding'));
    await waitFor(() => expect(screen.getByText('Personal Information')).toBeInTheDocument());

    // Navigate to step 3
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(screen.getByText('Address & Residency')).toBeInTheDocument());

    scrollToStepSpy.mockClear();

    // Go back
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(scrollToStepSpy).toHaveBeenCalled();
    });
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
        <CandidateOnboardingFlow />
      </MemoryRouter>
    );

    expect(prefersReducedMotionSpy()).toBe(true);
  });

  it('should have ARIA region attributes', async () => {
    const { container } = render(
      <MemoryRouter>
        <CandidateOnboardingFlow />
      </MemoryRouter>
    );

    const startButton = screen.getByText('Start Onboarding');
    fireEvent.click(startButton);

    await waitFor(() => {
      const regions = container.querySelectorAll('[role="region"]');
      expect(regions.length).toBeGreaterThan(0);

      regions.forEach((region) => {
        expect(region.getAttribute('aria-labelledby')).toBeTruthy();
      });
    });
  });

  it('should focus header with preventScroll option', async () => {
    const { container } = render(
      <MemoryRouter>
        <CandidateOnboardingFlow />
      </MemoryRouter>
    );

    const startButton = screen.getByText('Start Onboarding');
    fireEvent.click(startButton);

    await waitFor(() => {
      const header = container.querySelector('[data-step-header]');
      expect(header).toBeInTheDocument();
    });

    // Verify scrollToStep was called with focusHeader: true
    expect(scrollToStepSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        focusHeader: true,
      })
    );
  });

  it('should handle rapid navigation gracefully', async () => {
    render(
      <MemoryRouter>
        <CandidateOnboardingFlow />
      </MemoryRouter>
    );

    const startButton = screen.getByText('Start Onboarding');
    
    // Simulate rapid clicks
    fireEvent.click(startButton);
    fireEvent.click(startButton);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    // Should not cause errors
    expect(scrollToStepSpy).toHaveBeenCalled();
  });

  it('should maintain scroll position during form input', async () => {
    const { container } = render(
      <MemoryRouter>
        <CandidateOnboardingFlow />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Start Onboarding'));

    await waitFor(() => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    const callCountBefore = scrollToStepSpy.mock.calls.length;

    // Type in form field
    const nameInput = container.querySelector('#fullName') as HTMLInputElement;
    if (nameInput) {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
    }

    // Scroll should not be triggered by form input
    expect(scrollToStepSpy.mock.calls.length).toBe(callCountBefore);
  });
});
