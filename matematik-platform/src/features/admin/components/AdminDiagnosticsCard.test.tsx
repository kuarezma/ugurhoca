import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDiagnosticsCard } from './AdminDiagnosticsCard';

describe('AdminDiagnosticsCard', () => {
  it('renders system status correctly with connected drive', () => {
    render(
      <AdminDiagnosticsCard
        driveConnected={true}
        pendingCandidatesCount={4}
        unreadMessagesCount={2}
        studentCount={120}
      />
    );

    expect(screen.getByText('Sistem Sağlığı & Entegrasyonlar')).toBeInTheDocument();
    expect(screen.getByText('Bağlı & Hazır')).toBeInTheDocument();
    expect(screen.getByText('LiveKit Hazır')).toBeInTheDocument();
    expect(screen.getByText('120 Aktif Profil')).toBeInTheDocument();
  });

  it('renders disconnected drive status when driveConnected is false', () => {
    render(
      <AdminDiagnosticsCard
        driveConnected={false}
        pendingCandidatesCount={0}
        unreadMessagesCount={0}
        studentCount={50}
      />
    );

    expect(screen.getByText('Bağlı Değil')).toBeInTheDocument();
  });

  it('toggles detailed queue panel when button is clicked', () => {
    render(
      <AdminDiagnosticsCard
        driveConnected={true}
        pendingCandidatesCount={7}
        unreadMessagesCount={3}
        studentCount={80}
      />
    );

    expect(screen.queryByText('Bekleyen İş Kuyrukları ve Teşhis Verileri')).not.toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Detayları Göster/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText('Bekleyen İş Kuyrukları ve Teşhis Verileri')).toBeInTheDocument();
    expect(screen.getByText('7 Test')).toBeInTheDocument();
    expect(screen.getByText('3 Mesaj')).toBeInTheDocument();
  });
});
