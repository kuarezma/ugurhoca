import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToggCyberRacer, generateRallyQuestion } from './ToggCyberRacer';

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

describe('ToggCyberRacer ("TOGG & Süper Garaj Yarışı")', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders title, badge, garage options and starts game', () => {
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

    // After clicking start, 4 lane buttons should be rendered
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText('Şerit 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Şerit 2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Şerit 3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Şerit 4').length).toBeGreaterThanOrEqual(1);

    unmount();
  });

  it('generates non-repeating unique questions with 4 unique numeric options', () => {
    const askedSignatures = new Set<string>();

    for (let i = 0; i < 50; i++) {
      const q = generateRallyQuestion(i, askedSignatures);
      expect(q.prompt).toBeTruthy();
      expect(q.options.length).toBe(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.correctAnswer);
      expect(askedSignatures.has(q.sig)).toBe(true);
    }

    expect(askedSignatures.size).toBe(50);
  });
});
