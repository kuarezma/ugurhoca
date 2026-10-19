import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  PacMathMaze,
  generateArrowCombo,
  CHARACTERS,
  DIRECTIONS,
} from './PacMathMaze';
import { gameAudio } from '@/features/games/utils/gameAudio';

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

describe('PacMathMaze Pure Arcade Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders idle screen with title and "Labirente Gir" as primary button', () => {
    const onScore = vi.fn();
    const { unmount } = render(
      <PacMathMaze onScore={onScore} scoreMultiplier={1} />,
    );

    expect(screen.getByText('Pac-Matik: Ok Labirenti')).toBeInTheDocument();
    expect(
      screen.getByText('Arcade Pac-Man & Ok Refleksi'),
    ).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Labirente Gir');

    // 4 cute characters with role="radio"
    const radioItems = screen.getAllByRole('radio');
    expect(radioItems).toHaveLength(4);

    unmount();
  });

  it('allows selecting different characters in idle state', () => {
    const onScore = vi.fn();
    const { unmount } = render(
      <PacMathMaze onScore={onScore} scoreMultiplier={1} />,
    );

    const radioItems = screen.getAllByRole('radio');
    expect(radioItems[0]).toHaveAttribute('aria-checked', 'true');

    // Click on Princess Pink
    fireEvent.click(radioItems[1]);
    expect(radioItems[1]).toHaveAttribute('aria-checked', 'true');
    expect(radioItems[0]).toHaveAttribute('aria-checked', 'false');

    unmount();
  });

  it('starts game when "Labirente Gir" is clicked and renders at least 4 direction buttons', () => {
    const onScore = vi.fn();
    const { unmount } = render(
      <PacMathMaze onScore={onScore} scoreMultiplier={1} />,
    );

    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);

    expect(gameAudio.playPop).toHaveBeenCalled();

    // In playing state, at least 4 arrow buttons must be present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);

    // Verify arrow buttons by accessible role and name
    expect(screen.getByRole('button', { name: /Yukarı/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sol/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aşağı/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sağ/i })).toBeInTheDocument();

    unmount();
  });

  it('handles keyboard navigation and on-screen button clicks', () => {
    const onScore = vi.fn();
    const { unmount } = render(
      <PacMathMaze onScore={onScore} scoreMultiplier={1} />,
    );

    // Start game
    fireEvent.click(screen.getAllByRole('button')[0]);

    // Press ArrowUp
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });
    expect(gameAudio.playPop).toHaveBeenCalled();

    // Press W
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    });
    expect(gameAudio.playPop).toHaveBeenCalled();

    // Click on "Sağ" on-screen button
    const rightBtn = screen.getByRole('button', { name: /Sağ/i });
    fireEvent.click(rightBtn);
    expect(gameAudio.playPop).toHaveBeenCalled();

    unmount();
  });

  it('completes game after timer expires and calls onScore once', () => {
    const onScore = vi.fn();
    const { unmount } = render(
      <PacMathMaze onScore={onScore} scoreMultiplier={1.5} />,
    );

    // Start game
    fireEvent.click(screen.getAllByRole('button')[0]);

    // Advance 60 seconds
    act(() => {
      vi.advanceTimersByTime(61000);
    });

    expect(gameAudio.playFanfare).toHaveBeenCalled();
    expect(onScore).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/Labirent Macerası Tamamlandı!/),
    ).toBeInTheDocument();
    expect(screen.getByText('Yeniden Oyna')).toBeInTheDocument();

    unmount();
  });

  it('generateArrowCombo produces valid sequences of specified length', () => {
    const combo = generateArrowCombo(3);
    expect(combo).toHaveLength(3);
    for (const dir of combo) {
      expect(DIRECTIONS).toContain(dir);
    }

    const longerCombo = generateArrowCombo(5);
    expect(longerCombo).toHaveLength(5);
  });

  it('has 4 cute characters defined', () => {
    expect(CHARACTERS).toHaveLength(4);
    expect(CHARACTERS[0].name).toContain('Pac-Man');
    expect(CHARACTERS[1].name).toContain('Prenses');
    expect(CHARACTERS[2].name).toContain('Unicorn');
    expect(CHARACTERS[3].name).toContain('Pati');
  });
});
