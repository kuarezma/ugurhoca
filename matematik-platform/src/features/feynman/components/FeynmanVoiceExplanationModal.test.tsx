import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeynmanVoiceExplanationModal } from './FeynmanVoiceExplanationModal';

describe('FeynmanVoiceExplanationModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('açık olduğunda başlığı ve vitrin kartlarını gösterir', () => {
    render(<FeynmanVoiceExplanationModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('60 Saniyede Feynman Anlatımı')).toBeInTheDocument();
    expect(screen.getByText(/Anlatım Vitrini/)).toBeInTheDocument();
  });

  it('kayıt sekmesine geçer ve mikrofon arayüzünü gösterir', () => {
    render(<FeynmanVoiceExplanationModal isOpen={true} onClose={vi.fn()} />);

    const recordTab = screen.getByRole('button', { name: /Kendi Anlatımını Kaydet/i });
    fireEvent.click(recordTab);

    expect(screen.getByText(/Anlatacağın Kavram veya Soru/i)).toBeInTheDocument();
    expect(screen.getByText(/00:00 \/ 01:00/)).toBeInTheDocument();
  });

  it('kapalıyken hiçbir şey render etmez', () => {
    const { container } = render(<FeynmanVoiceExplanationModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
