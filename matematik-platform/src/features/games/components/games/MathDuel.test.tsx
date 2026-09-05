import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MathDuel } from './MathDuel';

// Mock gameAudio so audio API doesn't throw in jsdom
vi.mock('@/features/games/utils/gameAudio', () => ({
  gameAudio: {
    playCorrect: vi.fn(),
    playWrong: vi.fn(),
    playCombo: vi.fn(),
    playFanfare: vi.fn(),
    playPop: vi.fn(),
  },
}));

describe('MathDuel Component', () => {
  it('renders initial idle view with game instructions and start button', () => {
    const onScore = vi.fn();
    render(<MathDuel onScore={onScore} scoreMultiplier={1} />);

    expect(screen.getByText('Matematik Düellosu')).toBeInTheDocument();
    expect(screen.getByText('1v1 Hızlı İşlem')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Düelloyu Başlat/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Robot Düellosu')).toBeInTheDocument();
    expect(screen.getByText('Hız Antrenmanı')).toBeInTheDocument();
  });

  it('allows switching game mode between bot and solo blitz', () => {
    render(<MathDuel onScore={vi.fn()} scoreMultiplier={1} />);

    const soloButton = screen.getByRole('button', { name: /Hız Antrenmanı/i });
    fireEvent.click(soloButton);

    expect(
      screen.getByText(/kendi rekorunu kırmaya hazır mısın/i),
    ).toBeInTheDocument();
  });

  it('starts the game when start button is clicked and shows questions & answer options', () => {
    const onScore = vi.fn();
    render(<MathDuel onScore={onScore} scoreMultiplier={1} />);

    const startButton = screen.getByRole('button', {
      name: /Düelloyu Başlat/i,
    });
    fireEvent.click(startButton);

    // Timer should be visible
    expect(screen.getByText(/60 sn/i)).toBeInTheDocument();
    // Sen and Bot should be visible
    expect(screen.getByText('Sen')).toBeInTheDocument();

    // 4 multiple choice buttons should be displayed
    const buttons = screen.getAllByRole('button');
    const optionButtons = buttons.filter((btn) => btn.textContent?.includes('['));
    expect(optionButtons.length).toBe(4);

    // Click first option button
    act(() => {
      fireEvent.click(optionButtons[0]);
    });

    // Score or streak feedback should trigger
    expect(
      screen.getByText(/Doğru!|Yanlış!|Harika!/i),
    ).toBeInTheDocument();
  });
});
