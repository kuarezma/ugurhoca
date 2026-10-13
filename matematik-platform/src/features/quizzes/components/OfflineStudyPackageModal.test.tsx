import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OfflineStudyPackageModal from './OfflineStudyPackageModal';

describe('OfflineStudyPackageModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders correctly when open and displays honest question counts', () => {
    const onClose = vi.fn();
    render(<OfflineStudyPackageModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Çevrimdışı Çalışma Modu')).toBeInTheDocument();
    expect(screen.getByText('Henüz indirilmiş bir soru seti yok')).toBeInTheDocument();
    expect(screen.getByText('2 Soru & Çözüm Notu')).toBeInTheDocument();
    expect(screen.getAllByText('1 Soru & Çözüm Notu')).toHaveLength(2);
  });

  it('allows downloading a preset package to device storage and clearing with two-step confirmation', () => {
    const onClose = vi.fn();
    render(<OfflineStudyPackageModal isOpen={true} onClose={onClose} />);

    const downloadBtns = screen.getAllByRole('button', { name: /Çevrimdışı İndir/i });
    expect(downloadBtns.length).toBeGreaterThan(0);
    fireEvent.click(downloadBtns[0]);

    // Now it should show in downloaded packages
    expect(screen.getByText('Cihazınızda Hazır Soru Setleri')).toBeInTheDocument();
    expect(screen.getByText('Çözmeye Başla')).toBeInTheDocument();

    // Two-step clear all
    const clearBtn = screen.getByRole('button', { name: /Hepsini Temizle/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText('Tüm setler silinsin mi?')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /Evet, Temizle/i });
    fireEvent.click(confirmBtn);

    expect(screen.getByText('Henüz indirilmiş bir soru seti yok')).toBeInTheDocument();
  });

  it('calls onStartOfflineQuiz when start button is clicked', () => {
    const onClose = vi.fn();
    const onStart = vi.fn();

    render(
      <OfflineStudyPackageModal
        isOpen={true}
        onClose={onClose}
        onStartOfflineQuiz={onStart}
      />,
    );

    // Download first
    const downloadBtns = screen.getAllByRole('button', { name: /Çevrimdışı İndir/i });
    fireEvent.click(downloadBtns[0]);

    // Start quiz
    const startBtn = screen.getByRole('button', { name: /Çözmeye Başla/i });
    fireEvent.click(startBtn);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
