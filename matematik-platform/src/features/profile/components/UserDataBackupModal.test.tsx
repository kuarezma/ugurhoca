import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserDataBackupModal } from './UserDataBackupModal';

vi.mock('@/lib/userDataBackup', () => ({
  downloadUserDataBackupFile: vi.fn(),
  importUserDataBackup: vi.fn((content: string) => {
    if (content.includes('valid')) {
      return {
        success: true,
        message: 'Verileriniz başarıyla geri yüklendi!',
        stats: { dailyStreak: 5, mistakesCount: 3, topicsCount: 2 },
      };
    }
    return { success: false, message: 'Geçersiz dosya' };
  }),
}));

describe('UserDataBackupModal', () => {
  it('does not render when isOpen is false', () => {
    render(<UserDataBackupModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    render(<UserDataBackupModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Veri Yedekleme ve Cihaz Aktarımı' })).toBeInTheDocument();
    expect(screen.getByText('Veri Yedekleme & Aktarım')).toBeInTheDocument();
    expect(screen.getByText('Verileri İndir')).toBeInTheDocument();
    expect(screen.getByText('Yedekten Yükle')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<UserDataBackupModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByRole('button', { name: 'Pencereyi kapat' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
