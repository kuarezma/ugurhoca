import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopicChecklistModal } from './TopicChecklistModal';

describe('TopicChecklistModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders topics for 8th grade and allows toggling status', () => {
    const onClose = vi.fn();
    render(
      <TopicChecklistModal
        isOpen={true}
        onClose={onClose}
        initialGrade="8"
      />,
    );

    expect(
      screen.getByText('MEB Matematik Konu Takip Çizelgesi'),
    ).toBeInTheDocument();
    expect(screen.getByText('Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.getByText('Üslü İfadeler')).toBeInTheDocument();

    // Toggle Konu
    const konuButtons = screen.getAllByRole('button', { name: /Konu/i });
    fireEvent.click(konuButtons[0]);

    // A4 Yazdır butonu
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const printBtn = screen.getByRole('button', { name: /A4 Yazdır/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();

    // Kapat butonu
    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
