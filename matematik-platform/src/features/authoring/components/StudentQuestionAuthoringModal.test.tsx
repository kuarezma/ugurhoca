import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentQuestionAuthoringModal } from './StudentQuestionAuthoringModal';

describe('StudentQuestionAuthoringModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('açık olduğunda modal başlığını ve yazılan soruları gösterir', () => {
    render(<StudentQuestionAuthoringModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Öğrenci Soru Yazarlık Atölyesi')).toBeInTheDocument();
    expect(screen.getByText(/Yazılan Sorular/)).toBeInTheDocument();
  });

  it('yeni soru yaz sekmesine geçer ve formu gösterir', () => {
    render(<StudentQuestionAuthoringModal isOpen={true} onClose={vi.fn()} />);

    const newQuestionTab = screen.getByRole('button', { name: /Yeni Soru Yaz/i });
    fireEvent.click(newQuestionTab);

    expect(screen.getByText(/Matematik Konusu/i)).toBeInTheDocument();
    expect(screen.getByText(/Seçenekler ve Çeldirici Kurgusu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Soruyu İncelemeye Gönder/i })).toBeInTheDocument();
  });

  it('kapalıyken render edilmez', () => {
    const { container } = render(<StudentQuestionAuthoringModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
