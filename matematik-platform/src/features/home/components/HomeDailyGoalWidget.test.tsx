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

  it('renders and interacts with 3-tier daily quests and toggle actions', () => {
    render(<HomeDailyGoalWidget isLight={true} />);

    expect(screen.getByText('Günün Çalışma Görevleri')).toBeInTheDocument();
    expect(screen.getByText(/0\/3 Tamamlandı/i)).toBeInTheDocument();
    expect(screen.getByText('Günün Sorusunu Çöz')).toBeInTheDocument();
    expect(screen.getByText('En Az 15 Soru Tamamla')).toBeInTheDocument();
    expect(screen.getByText('Formül veya Hata Tekrarı')).toBeInTheDocument();

    // Toggle review quest completed
    const toggleBtn = screen.getByRole('button', {
      name: /Formül veya hata tekrarını tamamlandı işaretle/i,
    });
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/1\/3 Tamamlandı/i)).toBeInTheDocument();

    // Collapse quests
    const collapseBtn = screen.getByRole('button', { name: /Görevleri gizle/i });
    fireEvent.click(collapseBtn);
    expect(screen.queryByText('Günün Sorusunu Çöz')).toBeNull();

    // Expand quests again
    const expandBtn = screen.getByRole('button', { name: /Görevleri göster/i });
    fireEvent.click(expandBtn);
    expect(screen.getByText('Günün Sorusunu Çöz')).toBeInTheDocument();
  });

  it('handles decrement button and custom target saving', () => {
    render(<HomeDailyGoalWidget isLight={false} />);

    // Add 2 questions then decrement 1
    const plusOneBtn = screen.getByRole('button', { name: /1 soru çözüldü ekle/i });
    fireEvent.click(plusOneBtn);
    fireEvent.click(plusOneBtn);
    expect(screen.getByTestId('solved-count')).toHaveTextContent('2');

    const minusBtn = screen.getByRole('button', { name: /1 soru geri al/i });
    fireEvent.click(minusBtn);
    expect(screen.getByTestId('solved-count')).toHaveTextContent('1');

    // Open target editor and enter custom number
    const editBtn = screen.getByRole('button', { name: /Günlük hedefi düzenle/i });
    fireEvent.click(editBtn);

    const customInput = screen.getByRole('spinbutton', { name: /Özel hedef sayısı/i });
    fireEvent.change(customInput, { target: { value: '45' } });

    const saveBtn = screen.getByRole('button', { name: /Kaydet/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/\/ 45 Soru/i)).toBeInTheDocument();
  });
});
