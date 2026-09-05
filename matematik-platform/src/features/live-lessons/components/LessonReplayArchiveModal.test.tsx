import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonReplayArchiveModal } from './LessonReplayArchiveModal';

describe('LessonReplayArchiveModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <LessonReplayArchiveModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders archive modal with recorded lesson details and chapters', () => {
    render(
      <LessonReplayArchiveModal isOpen={true} onClose={vi.fn()} />
    );

    expect(
      screen.getByText(/Canlı Ders Kayıtları & Zaman Damgalı Arşiv/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/LGS Çarpanlara Ayırma & Yeni Nesil Soru Kampı/i)[0]
    ).toBeInTheDocument();

    // Check chapters
    expect(screen.getByText('Tam Kare Özdeşlikleri ve Geometrik İspat')).toBeInTheDocument();
    expect(screen.getByText('12:30')).toBeInTheDocument();

    // Toggle play
    const playBtn = screen.getByLabelText(/Dersi Oynat/i);
    fireEvent.click(playBtn);
    expect(screen.getByLabelText(/Dersi Duraklat/i)).toBeInTheDocument();

    // Jump to chapter
    const chapterBtn = screen.getByText('Tam Kare Özdeşlikleri ve Geometrik İspat');
    fireEvent.click(chapterBtn);

    // Filter by grade
    const ykstab = screen.getByRole('button', { name: /^YKS \/ TYT$/i });
    fireEvent.click(ykstab);
    expect(
      screen.getAllByText(/YKS \/ TYT Temel Matematik: Fonksiyon Grafikleri/i)[0]
    ).toBeInTheDocument();
  });
});
