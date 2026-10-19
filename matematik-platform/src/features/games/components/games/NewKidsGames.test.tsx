import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PenaltyShootout } from './PenaltyShootout';
import { PotionLab } from './PotionLab';
import { DinoRunner } from './DinoRunner';
import { MeteorDefense } from './MeteorDefense';
import { SecretAgent } from './SecretAgent';
import { GeometryArcher } from './GeometryArcher';
import { ToggCyberRacer } from './ToggCyberRacer';
import { PacMathMaze } from './PacMathMaze';

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

describe('New Kids Games (20-27)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders and starts PenaltyShootout (20)', () => {
    const onScore = vi.fn();
    const { unmount } = render(<PenaltyShootout onScore={onScore} scoreMultiplier={1} />);
    expect(screen.getByText('Penaltı Şampiyonu')).toBeInTheDocument();
    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    unmount();
  });

  it('renders and starts PotionLab (21)', () => {
    const onScore = vi.fn();
    const { unmount } = render(<PotionLab onScore={onScore} scoreMultiplier={1} />);
    expect(screen.getByText('İksir Laboratuvarı')).toBeInTheDocument();
    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    unmount();
  });

  it('renders and starts DinoRunner (22)', () => {
    const onScore = vi.fn();
    const { unmount } = render(<DinoRunner onScore={onScore} scoreMultiplier={1} />);
    expect(screen.getByText('Dinozor Macerası')).toBeInTheDocument();
    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    unmount();
  });

  it('renders and starts MeteorDefense (23)', () => {
    const onScore = vi.fn();
    const { unmount } = render(<MeteorDefense onScore={onScore} scoreMultiplier={1} />);
    expect(screen.getByText('Meteor Savunması')).toBeInTheDocument();
    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    unmount();
  });

  it('renders and starts SecretAgent (24)', () => {
    const onScore = vi.fn();
    const { unmount } = render(<SecretAgent onScore={onScore} scoreMultiplier={1} />);
    expect(screen.getByText('Gizli Ajan: Kasa Şifresi')).toBeInTheDocument();
    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    unmount();
  });

  it('renders and starts GeometryArcher (25)', () => {
    const onScore = vi.fn();
    const { unmount } = render(<GeometryArcher onScore={onScore} scoreMultiplier={1} />);
    expect(screen.getByText('Okçu Şampiyonu')).toBeInTheDocument();
    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    unmount();
  });

  it('renders and starts ToggCyberRacer (26)', () => {
    const onScore = vi.fn();
    const { unmount } = render(<ToggCyberRacer onScore={onScore} scoreMultiplier={1} />);
    expect(screen.getByText('TOGG & Süper Garaj Yarışı')).toBeInTheDocument();
    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    unmount();
  });

  it('renders and starts PacMathMaze (27)', () => {
    const onScore = vi.fn();
    const { unmount } = render(<PacMathMaze onScore={onScore} scoreMultiplier={1} />);
    expect(screen.getByText('Pac-Matik: Ok Labirenti')).toBeInTheDocument();
    const startBtn = screen.getAllByRole('button')[0];
    fireEvent.click(startBtn);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    unmount();
  });
});
