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

    // Kapat butonu
    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
