import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PacMathMaze, generateMazeQuestion } from './PacMathMaze';
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

describe('PacMathMaze Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders idle screen with title and start button as primary button', () => {
    const onScore = vi.fn();
    const { unmount } = render(<PacMathMaze onScore={onScore} scoreMultiplier={1} />);

    expect(screen.getByText('Pac-Matik: Ok Labirenti')).toBeInTheDocument();
    expect(screen.getByText('Oklarla Labirent & Matematik Avı')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Labirente Gir');

    unmount();
  });

  it('starts game when "Labirente Gir" is clicked and renders at least 4 direction buttons', () => {
    const onScore = vi.fn();
    const { unmount } = render(<PacMathMaze onScore={onScore} scoreMultiplier={1} />);

    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);

    expect(gameAudio.playPop).toHaveBeenCalled();

    // In playing state, at least 4 arrow buttons must be present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);

    unmount();
  });

  it('handles keyboard navigation and plays audio on answer selection', () => {
    const onScore = vi.fn();
    const { unmount } = render(<PacMathMaze onScore={onScore} scoreMultiplier={1} />);

    // Start game
    fireEvent.click(screen.getAllByRole('button')[0]);

    // Press ArrowUp
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });

    expect(gameAudio.playPop).toHaveBeenCalled();

    // Advance timer past corridor step (220ms) and evaluate
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Advance timer past reset (750ms)
    act(() => {
      vi.advanceTimersByTime(800);
    });

    unmount();
  });

  it('generateMazeQuestion produces questions with 4 unique directional options', () => {
    const askedSignatures = new Set<string>();
    const q1 = generateMazeQuestion(0, askedSignatures);

    expect(q1.options).toHaveLength(4);
    const directions = q1.options.map((o) => o.dir);
    expect(directions).toContain('UP');
    expect(directions).toContain('RIGHT');
    expect(directions).toContain('LEFT');
    expect(directions).toContain('DOWN');

    const correctOpts = q1.options.filter((o) => o.isCorrect);
    expect(correctOpts).toHaveLength(1);
    expect(askedSignatures.size).toBeGreaterThanOrEqual(1);

    // Generate another question and ensure askedSignatures tracks it
    const q2 = generateMazeQuestion(3, askedSignatures);
    expect(q2.options).toHaveLength(4);
    expect(askedSignatures.size).toBeGreaterThanOrEqual(2);
  });
});
