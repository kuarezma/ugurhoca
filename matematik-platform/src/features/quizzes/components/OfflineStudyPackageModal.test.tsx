import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OfflineStudyPackageModal from './OfflineStudyPackageModal';

describe('OfflineStudyPackageModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders correctly when open', () => {
    const onClose = vi.fn();
    render(<OfflineStudyPackageModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Çevrimdışı Çalışma Modu')).toBeInTheDocument();
    expect(screen.getByText('Henüz indirilmiş bir soru seti yok')).toBeInTheDocument();
  });

  it('allows downloading a preset package to device storage', () => {
    const onClose = vi.fn();
    render(<OfflineStudyPackageModal isOpen={true} onClose={onClose} />);

    const downloadBtns = screen.getAllByRole('button', { name: /Çevrimdışı İndir/i });
    expect(downloadBtns.length).toBeGreaterThan(0);
    fireEvent.click(downloadBtns[0]);

    // Now it should show in downloaded packages
    expect(screen.getByText('Cihazınızda Hazır Soru Setleri')).toBeInTheDocument();
    expect(screen.getByText('Çözmeye Başla')).toBeInTheDocument();
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
