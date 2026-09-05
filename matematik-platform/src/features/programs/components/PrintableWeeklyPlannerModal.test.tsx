import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrintableWeeklyPlannerModal } from './PrintableWeeklyPlannerModal';

describe('PrintableWeeklyPlannerModal', () => {
  it('renders weekly planner modal with default 7 days and question sum', () => {
    const onClose = vi.fn();
    render(<PrintableWeeklyPlannerModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText(/A4 Masabaşı Haftalık Çalışma Çizelgesi/i)).toBeInTheDocument();
    expect(screen.getByText('Pazartesi')).toBeInTheDocument();
    expect(screen.getByText('Pazar')).toBeInTheDocument();
    expect(screen.getAllByText(/460 Soru/i).length).toBeGreaterThanOrEqual(1);
  });

  it('updates student name and allows resetting schedule', () => {
    render(<PrintableWeeklyPlannerModal isOpen={true} onClose={vi.fn()} />);

    const nameInput = screen.getByPlaceholderText('Adın Soyadın');
    fireEvent.change(nameInput, { target: { value: 'Ali Yılmaz' } });

    expect(screen.getByText(/Ali Yılmaz/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Sıfırla/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText('Pazartesi')).toBeInTheDocument();
  });

  it('triggers window.print when print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<PrintableWeeklyPlannerModal isOpen={true} onClose={vi.fn()} />);

    const printBtn = screen.getByRole('button', { name: /Yazdır \/ PDF/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<PrintableWeeklyPlannerModal isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
