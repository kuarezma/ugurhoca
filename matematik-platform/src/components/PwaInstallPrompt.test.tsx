import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PwaInstallPrompt } from './PwaInstallPrompt';

describe('PwaInstallPrompt', () => {
  beforeEach(() => {
    sessionStorage.clear();
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 Chrome/112.0.0.0 Mobile Safari/537.36',
      configurable: true,
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('handles beforeinstallprompt event and user interaction', async () => {
    render(<PwaInstallPrompt />);

    const promptEvent = new Event('beforeinstallprompt');
    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    Object.assign(promptEvent, {
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
      preventDefault: vi.fn(),
    });

    await act(async () => {
      window.dispatchEvent(promptEvent);
    });

    expect(screen.getByText('Uğur Hoca Uygulamasını Yükle')).toBeInTheDocument();

    const installBtn = screen.getByRole('button', { name: /Yükle/i });
    await act(async () => {
      fireEvent.click(installBtn);
    });
    expect(mockPrompt).toHaveBeenCalled();
  });

  it('allows dismissing prompt', async () => {
    render(<PwaInstallPrompt />);

    const promptEvent = new Event('beforeinstallprompt');
    Object.assign(promptEvent, {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'dismissed' }),
      preventDefault: vi.fn(),
    });

    await act(async () => {
      window.dispatchEvent(promptEvent);
    });

    const closeBtn = screen.getByLabelText('Kapat');
    await act(async () => {
      fireEvent.click(closeBtn);
    });

    expect(sessionStorage.getItem('ugurhoca_pwa_dismissed')).toBe('true');
  });
});
