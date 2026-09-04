import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeDailyGoalWidget } from './HomeDailyGoalWidget';

// Mock ConfettiBurst
vi.mock('@/components/ConfettiBurst', () => ({
  fireConfetti: vi.fn(),
}));

describe('HomeDailyGoalWidget', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders daily goal widget with default values', () => {
    render(<HomeDailyGoalWidget isLight={false} />);

    expect(screen.getByText('Günlük Soru Hedefim')).toBeInTheDocument();
    expect(screen.getByTestId('solved-count')).toHaveTextContent('0');
    expect(screen.getByText(/\/ 20 Soru/i)).toBeInTheDocument();
  });

  it('increments questions solved on clicking +1 and +5 buttons', () => {
    render(<HomeDailyGoalWidget isLight={false} />);

    const plusOneBtn = screen.getByRole('button', { name: /1 soru çözüldü ekle/i });
    fireEvent.click(plusOneBtn);

    expect(screen.getByTestId('solved-count')).toHaveTextContent('1');

    const plusFiveBtn = screen.getByRole('button', { name: /5 soru çözüldü ekle/i });
    fireEvent.click(plusFiveBtn);

    expect(screen.getByTestId('solved-count')).toHaveTextContent('6');
  });

  it('allows opening target editor and selecting a preset', () => {
    render(<HomeDailyGoalWidget isLight={false} />);

    const editBtn = screen.getByRole('button', { name: /Günlük hedefi düzenle/i });
    fireEvent.click(editBtn);

    expect(screen.getByText('Günlük Hedef Belirle:')).toBeInTheDocument();

    const presetFifty = screen.getByRole('button', { name: /50 Soru/i });
    fireEvent.click(presetFifty);

    expect(screen.getByText(/\/ 50 Soru/i)).toBeInTheDocument();
  });
});
