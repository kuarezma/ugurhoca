import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeExamCountdownSection } from './HomeExamCountdownSection';

vi.mock('@/components/ExamCountdown', () => ({
  ExamCountdown: ({ exam }: { exam: { title: string } }) => (
    <div data-testid={`exam-card-${exam.title}`}>{exam.title}</div>
  ),
}));

describe('HomeExamCountdownSection', () => {
  it('renders mobile accordion button and desktop exam grid', () => {
    render(<HomeExamCountdownSection />);

    const accordionBtn = screen.getByRole('button', {
      name: /Sınav Sayaçları \(LGS & YKS\)/i,
    });
    expect(accordionBtn).toBeInTheDocument();
    expect(accordionBtn).toHaveAttribute('aria-expanded', 'false');

    // Mobilde başlangıçta kapalıdır, tıklandığında açılır
    fireEvent.click(accordionBtn);
    expect(accordionBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Sayaçları gizlemek için dokunun')).toBeInTheDocument();

    // Tekrar tıklandığında kapanır
    fireEvent.click(accordionBtn);
    expect(accordionBtn).toHaveAttribute('aria-expanded', 'false');
  });
});
