import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToggCyberRacer } from './ToggCyberRacer';

vi.mock('@/features/games/utils/gameAudio', () => ({
  gameAudio: {
    playCorrect: vi.fn(),
    playWrong: vi.fn(),
    playCombo: vi.fn(),
    playFanfare: vi.fn(),
    playPop: vi.fn(),
    playWhack: vi.fn(),
    playNitro: vi.fn(),
    playLevelUp: vi.fn(),
    playSlice: vi.fn(),
  },
}));

describe('ToggCyberRacer ("TOGG & Süper Garaj Yarışı" - Pure Arcade Racing)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders title, badge, garage showroom cars and starts pure arcade game', () => {
    const onScore = vi.fn();
    const { unmount } = render(
      <ToggCyberRacer onScore={onScore} scoreMultiplier={1} />,
    );

    // Title & Badge verification
    expect(screen.getByText('TOGG & Süper Garaj Yarışı')).toBeInTheDocument();
    expect(screen.getByText('Milli Teknoloji & Hız Pisti')).toBeInTheDocument();

    // Vehicles verification in garage
    expect(screen.getByText('TOGG T10X')).toBeInTheDocument();
    expect(screen.getByText('TOGG T10F')).toBeInTheDocument();
    expect(screen.getByText('Fırtına GT-R')).toBeInTheDocument();
    expect(screen.getByText('Siber Hiper-X')).toBeInTheDocument();

    // The first button in the DOM must be the Start Game button
    const startBtn = screen.getAllByRole('button')[0];
    expect(startBtn).toHaveTextContent('Yarışa Başla');
    fireEvent.click(startBtn);

    // After clicking start, 4 lane buttons + steering & nitro action buttons must be rendered
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText('Şerit 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Şerit 2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Şerit 3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Şerit 4').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Sola Kır')).toBeInTheDocument();
    expect(screen.getByText('Sağa Kır')).toBeInTheDocument();
    expect(screen.getByText(/TRUGO NİTRO/i)).toBeInTheDocument();

    unmount();
  });

  it('allows garage customization: selecting vehicle, color and race track', () => {
    const onScore = vi.fn();
    const { unmount } = render(
      <ToggCyberRacer onScore={onScore} scoreMultiplier={1} />,
    );

    // Select TOGG T10F
    const t10fCard = screen.getByText('TOGG T10F').closest('[role="radio"]');
    expect(t10fCard).toBeInTheDocument();
    if (t10fCard) {
      fireEvent.click(t10fCard);
      expect(t10fCard).toHaveAttribute('aria-checked', 'true');
    }

    // Select Gemlik Mavisi color
    const gemlikColor = screen.getByText('Gemlik Mavisi').closest('[role="radio"]');
    if (gemlikColor) {
      fireEvent.click(gemlikColor);
      expect(gemlikColor).toHaveAttribute('aria-checked', 'true');
    }

    // Select Gemlik track
    const gemlikTrack = screen.getByText('Gemlik Teknoloji Kampüsü').closest('[role="radio"]');
    if (gemlikTrack) {
      fireEvent.click(gemlikTrack);
      expect(gemlikTrack).toHaveAttribute('aria-checked', 'true');
    }

    unmount();
  });

  it('steers player across lanes via direct lane buttons, action buttons and keyboard', () => {
    const onScore = vi.fn();
    const { unmount } = render(
      <ToggCyberRacer onScore={onScore} scoreMultiplier={1} />,
    );

    // Start game
    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);

    // Click direct lane buttons using getByRole
    const lane4Btn = screen.getByRole('button', { name: /şerit 4/i });
    expect(lane4Btn).toBeInTheDocument();
    fireEvent.click(lane4Btn);
    expect(lane4Btn).toHaveTextContent('Aktif Şerit 🚗');

    const lane1Btn = screen.getByRole('button', { name: /şerit 1/i });
    fireEvent.click(lane1Btn);
    expect(lane1Btn).toHaveTextContent('Aktif Şerit 🚗');

    // Steer with arcade action buttons
    const rightBtn = screen.getByRole('button', { name: /sağa kır/i });
    fireEvent.click(rightBtn);
    const lane2Btn = screen.getByRole('button', { name: /şerit 2/i });
    expect(lane2Btn).toHaveTextContent('Aktif Şerit 🚗');

    const leftBtn = screen.getByRole('button', { name: /sola kır/i });
    fireEvent.click(leftBtn);
    expect(lane1Btn).toHaveTextContent('Aktif Şerit 🚗');

    // Steer with keyboard keys
    fireEvent.keyDown(window, { key: '3' });
    const lane3Btn = screen.getByRole('button', { name: /şerit 3/i });
    expect(lane3Btn).toHaveTextContent('Aktif Şerit 🚗');

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(lane2Btn).toHaveTextContent('Aktif Şerit 🚗');

    fireEvent.keyDown(window, { key: 'd' });
    expect(lane3Btn).toHaveTextContent('Aktif Şerit 🚗');

    unmount();
  });

  it('runs game loop ticks and handles time expiration to podium finish', () => {
    const onScore = vi.fn();
    const { unmount } = render(
      <ToggCyberRacer onScore={onScore} scoreMultiplier={1.5} />,
    );

    // Start game
    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);

    // Advance loop ticks
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Advance time until 60-second race finishes
    act(() => {
      vi.advanceTimersByTime(61000);
    });

    // Check finish screen
    expect(screen.getByText(/Yarış Tamamlandı!|Şampiyonu|Süper Sürücü/i)).toBeInTheDocument();
    expect(screen.getByText('Yeniden Yarış')).toBeInTheDocument();
    expect(screen.getByText('Garaja Dön')).toBeInTheDocument();

    // Verify score submitted and capped at 4800
    expect(onScore).toHaveBeenCalledTimes(1);
    const submittedScore = onScore.mock.calls[0][0];
    expect(submittedScore).toBeLessThanOrEqual(4800);
    expect(submittedScore).toBeGreaterThanOrEqual(0);

    // Test restarting race
    const restartBtn = screen.getByText('Yeniden Yarış');
    fireEvent.click(restartBtn);
    expect(screen.getAllByText('Şerit 1').length).toBeGreaterThanOrEqual(1);

    unmount();
  });
});
