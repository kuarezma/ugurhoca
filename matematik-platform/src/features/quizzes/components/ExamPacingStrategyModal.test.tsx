import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamPacingStrategyModal } from './ExamPacingStrategyModal';

describe('ExamPacingStrategyModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <ExamPacingStrategyModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders LGS Sayısal pacing controls and metrics', () => {
    render(<ExamPacingStrategyModal isOpen={true} onClose={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: /Sınav Bölüm Süresi & Zaman Yönetimi/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/LGS Sayısal \(80 Dk \/ 40 Soru\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Matematik \(20 Soru\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Fen Bilimleri \(20 Soru\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Turlama & Geriye Dönüş Payı/i)).toBeInTheDocument();

    // Default total is 80/80
    expect(screen.getByText(/80 \/ 80 Dk/i)).toBeInTheDocument();
    expect(screen.getByText(/Süre Tam Dengelendi ✓/i)).toBeInTheDocument();
  });

  it('switches to YKS TYT tab and shows 165 minutes sections', () => {
    render(<ExamPacingStrategyModal isOpen={true} onClose={vi.fn()} />);

    const tytTabBtn = screen.getByRole('button', { name: /YKS TYT \(165 Dk \/ 120 Soru\)/i });
    fireEvent.click(tytTabBtn);

    expect(screen.getByText(/Türkçe \(40 Soru\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Temel Matematik \(40 Soru\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Sosyal Bilimler \(20 Soru\)/i)).toBeInTheDocument();
    expect(screen.getByText(/165 \/ 165 Dk/i)).toBeInTheDocument();
  });

  it('allows adjusting slider and recalculates remaining or overflow time', () => {
    render(<ExamPacingStrategyModal isOpen={true} onClose={vi.fn()} />);

    const matSlider = screen.getByLabelText(/LGS Matematik süresi/i);
    fireEvent.change(matSlider, { target: { value: '55' } });

    // 55 + 25 + 10 = 90 dk (10 dk overflow)
    expect(screen.getByText(/90 \/ 80 Dk/i)).toBeInTheDocument();
    expect(screen.getByText(/10 Dk Süre Aşımı!/i)).toBeInTheDocument();
  });

  it('saves strategy to localStorage and allows resetting defaults', () => {
    render(<ExamPacingStrategyModal isOpen={true} onClose={vi.fn()} />);

    const saveBtn = screen.getByRole('button', { name: /Stratejimi Kaydet/i });
    fireEvent.click(saveBtn);
    expect(screen.getByText(/Strateji Kaydedildi!/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Varsayılan Temposu/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText(/80 \/ 80 Dk/i)).toBeInTheDocument();
  });
});
