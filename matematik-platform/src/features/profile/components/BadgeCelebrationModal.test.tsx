import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BadgeCelebrationModal, type CelebrationBadge } from './BadgeCelebrationModal';

describe('BadgeCelebrationModal', () => {
  const mockBadge: CelebrationBadge = {
    id: 'century_solver',
    name: 'Yüzler Kulübü',
    description: '100 matematik sorusunu başarıyla çözdün.',
    requirement: '100 soru tamamla',
    gradient: 'from-amber-500 to-rose-600',
  };

  it('renders badge celebration details and congratulatory elements', () => {
    const onClose = vi.fn();
    render(
      <BadgeCelebrationModal
        isOpen={true}
        onClose={onClose}
        badge={mockBadge}
        studentName="Ahmet Yılmaz"
      />,
    );

    expect(screen.getByText('Yeni Rozet Açıldı!')).toBeInTheDocument();
    expect(screen.getByText('Yüzler Kulübü')).toBeInTheDocument();
    expect(screen.getByText('100 matematik sorusunu başarıyla çözdün.')).toBeInTheDocument();
    expect(screen.getByText(/🎯 Şart: 100 soru tamamla/i)).toBeInTheDocument();

    const downloadBtn = screen.getByRole('button', { name: /Başarı Kartını İndir/i });
    expect(downloadBtn).toBeInTheDocument();

    const closeBtns = screen.getAllByRole('button', { name: /Kapat/i });
    expect(closeBtns.length).toBeGreaterThan(0);
    fireEvent.click(closeBtns[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when closed or badge is null', () => {
    const { container } = render(
      <BadgeCelebrationModal
        isOpen={false}
        onClose={vi.fn()}
        badge={null}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
