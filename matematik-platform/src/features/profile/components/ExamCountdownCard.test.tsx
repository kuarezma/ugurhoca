import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamCountdownCard } from './ExamCountdownCard';

describe('ExamCountdownCard', () => {
  it('renders LGS countdown by default for 8th grade student', () => {
    render(<ExamCountdownCard userGrade={8} isLight={false} />);

    expect(screen.getByText(/LGS'ye Kalan Süre/i)).toBeInTheDocument();
    expect(screen.getByText('MEB')).toBeInTheDocument();
    expect(screen.getByText('Gün')).toBeInTheDocument();
    expect(screen.getByText(/Hedef:/i)).toBeInTheDocument();
  });

  it('switches to YKS when YKS tab is clicked', () => {
    render(<ExamCountdownCard userGrade={8} isLight={false} />);

    const yksBtn = screen.getByRole('button', { name: 'YKS' });
    fireEvent.click(yksBtn);

    expect(screen.getByText(/YKS'ye Kalan Süre/i)).toBeInTheDocument();
    expect(screen.getByText('ÖSYM')).toBeInTheDocument();
  });
});
