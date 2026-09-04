import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FocusPomodoroModal } from './FocusPomodoroModal';

describe('FocusPomodoroModal', () => {
  it('renders 25 min focus mode by default and switches modes', () => {
    const onClose = vi.fn();
    render(<FocusPomodoroModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Matematik Odak Sayacı ⏱️')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();

    // 50 Dk moduna geçiş
    const focus50Btn = screen.getByRole('button', { name: /50 Dk Derin Odak/i });
    fireEvent.click(focus50Btn);
    expect(screen.getByText('50:00')).toBeInTheDocument();

    // Mola moduna geçiş
    const break5Btn = screen.getByRole('button', { name: /5 Dk Kısa Mola/i });
    fireEvent.click(break5Btn);
    expect(screen.getByText('Mola Zamanı ☕')).toBeInTheDocument();
    expect(screen.getByText('05:00')).toBeInTheDocument();

    // Kapat butonu
    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
