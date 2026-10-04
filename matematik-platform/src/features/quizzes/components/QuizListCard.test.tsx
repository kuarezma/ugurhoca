import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Quiz } from '@/types/quiz';
import { QuizListCard, getDifficultyColor } from './QuizListCard';

const { iconRender } = vi.hoisted(() => ({ iconRender: vi.fn() }));
vi.mock('lucide-react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('lucide-react')>()),
  FileText: () => {
    iconRender();
    return <svg />;
  },
}));
const quiz: Quiz = {
  id: 'quiz-1',
  title: 'Kesirler',
  grade: 6,
  time_limit: 20,
  difficulty: 'Kolay',
  description: 'Kesirlerle işlemler',
  is_active: true,
  created_at: '',
  updated_at: '',
};

describe('QuizListCard', () => {
  it('skips unchanged props and updates changed data without losing actions', () => {
    iconRender.mockClear();
    const props = {
      quiz,
      index: 2,
      onStart: vi.fn(),
      onWorksheetPreview: vi.fn(),
    };
    const { rerender, container } = render(<QuizListCard {...props} />);
    expect(iconRender).toHaveBeenCalledTimes(1);
    expect(container.firstElementChild).toHaveStyle({
      animationDelay: '160ms',
    });
    rerender(<QuizListCard {...props} />);
    expect(iconRender).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Teste Başla' }));
    fireEvent.click(screen.getByTitle('A4 Yazdırılabilir Yaprak Test'));
    expect(props.onStart).toHaveBeenCalledWith(quiz);
    expect(props.onWorksheetPreview).toHaveBeenCalledWith(quiz);
    rerender(
      <QuizListCard {...props} quiz={{ ...quiz, title: 'Yeni başlık' }} />,
    );
    expect(iconRender).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Yeni başlık')).toBeInTheDocument();
  });

  it.each([
    ['Kolay', 'from-green-500 to-emerald-500'],
    ['Orta', 'from-yellow-500 to-orange-500'],
    ['Zor', 'from-red-500 to-pink-500'],
    ['bilinmeyen', 'from-blue-500 to-cyan-500'],
  ])('preserves the %s difficulty color', (difficulty, color) => {
    expect(getDifficultyColor(difficulty)).toBe(color);
  });
});
