import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamCountdownCard, getMotivationMotto, getTimeRemaining } from './ExamCountdownCard';

describe('ExamCountdownCard', () => {
  it('shows a completed state instead of a stale LGS countdown', () => {
    render(<ExamCountdownCard userGrade={8} isLight={false} />);

    expect(screen.getByText('LGS tamamlandı')).toBeInTheDocument();
    expect(screen.getByText('MEB')).toBeInTheDocument();
    expect(screen.getByText(/Bu yılın sınavı tamamlandı/i)).toBeInTheDocument();
    expect(screen.getByText(/Hedef:/i)).toBeInTheDocument();
  });

  it('keeps the completed state when the past YKS tab is selected', () => {
    render(<ExamCountdownCard userGrade={8} isLight={false} />);

    const yksBtn = screen.getByRole('button', { name: 'YKS' });
    fireEvent.click(yksBtn);

    expect(screen.getByText('YKS tamamlandı')).toBeInTheDocument();
    expect(screen.getByText('ÖSYM')).toBeInTheDocument();
  });

  it('marks elapsed exams as completed and uses the completed-exam message', () => {
    expect(getTimeRemaining('2026-06-13T09:30:00+03:00', Date.parse('2026-09-07T12:00:00+03:00'))).toEqual({ days: 0, hours: 0, isCompleted: true, minutes: 0 });
    expect(getMotivationMotto(0, 'LGS', true)).toContain('tamamlandı');
  });
});
