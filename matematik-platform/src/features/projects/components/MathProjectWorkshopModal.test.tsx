import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MathProjectWorkshopModal from './MathProjectWorkshopModal';

describe('MathProjectWorkshopModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders correctly when open and displays projects and rubric', () => {
    const onClose = vi.fn();
    render(<MathProjectWorkshopModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Matematik Proje Atölyesi')).toBeInTheDocument();
    expect(screen.getAllByText(/Evimizin Enerji Verimliliği & Doğrusal Fonksiyonlar/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Değerlendirme Rubriği \(100 Puan\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Proje Adımları & Teslim Takvimi/i)).toBeInTheDocument();
  });

  it('toggles milestone completion when milestone button is clicked', () => {
    const onClose = vi.fn();
    render(<MathProjectWorkshopModal isOpen={true} onClose={onClose} />);

    // Click on 1. Aşama
    const step1Btn = screen.getByRole('button', { name: /1\. Aşama: Veri Toplama/i });
    fireEvent.click(step1Btn);

    expect(screen.getByText('Tamamlandı')).toBeInTheDocument();
  });

  it('switches active project when another project is selected from sidebar', () => {
    const onClose = vi.fn();
    render(<MathProjectWorkshopModal isOpen={true} onClose={onClose} />);

    // Click on Altın Oran project
    const goldenRatioBtn = screen.getByRole('button', { name: /Altın Oran & Mimari Tasarım Atölyesi/i });
    fireEvent.click(goldenRatioBtn);

    expect(screen.getByText(/Fibonacci Spirali Çizimi/i)).toBeInTheDocument();
  });
});
