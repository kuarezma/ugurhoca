import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  HomeNavbarNotificationBell,
  resolveNotificationTarget,
} from './HomeNavbarNotificationBell';
import type { DashboardNotification } from '@/types/dashboard';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockDeleteNotification = vi.fn();

const dummyNotifications: DashboardNotification[] = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    title: 'Yeni Ödev: Çarpanlar ve Katlar',
    message: 'Haftalık ödevini cuma gününe kadar tamamla.',
    type: 'assignment',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 dk önce
  },
  {
    id: 'notif-2',
    user_id: 'user-1',
    title: 'Canlı Ders Başlıyor',
    message: 'LGS Matematik Kampı 1. Oturum yayında.',
    type: 'live-lesson',
    is_read: true,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 sa önce
  },
  {
    id: 'notif-3',
    user_id: 'user-1',
    title: 'Uğur Hoca sana mesaj yazdı',
    message: 'Sorunun çözümünü inceledim.',
    type: 'message',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Dün
  },
];

vi.mock('@/features/home/hooks/useNavbarNotifications', () => ({
  useNavbarNotifications: () => ({
    notifications: dummyNotifications,
    unreadCount: 1,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
    deleteNotification: mockDeleteNotification,
    loading: false,
  }),
}));

describe('HomeNavbarNotificationBell Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bildirim rozetini ve açıldığında sekmeleri render eder', () => {
    render(<HomeNavbarNotificationBell userId="user-1" isLight={true} />);

    const bellBtn = screen.getByRole('button', { name: /Bildirimler/i });
    expect(bellBtn).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    fireEvent.click(bellBtn);

    expect(screen.getByText('Bildirim Merkezi')).toBeInTheDocument();
    expect(screen.getByText('Tümü')).toBeInTheDocument();
    expect(screen.getByText('Ödevler')).toBeInTheDocument();
    expect(screen.getByText('Dersler')).toBeInTheDocument();
    expect(screen.getByText('Mesajlar')).toBeInTheDocument();
  });

  it('sekmeler arasında filtreleme yapar', () => {
    render(<HomeNavbarNotificationBell userId="user-1" isLight={true} />);
    fireEvent.click(screen.getByRole('button', { name: /Bildirimler/i }));

    expect(screen.getByText('Yeni Ödev: Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.getByText('Canlı Ders Başlıyor')).toBeInTheDocument();

    // Sadece Ödevler sekmesine tıkla
    fireEvent.click(screen.getByRole('button', { name: /Ödevler/i }));
    expect(screen.getByText('Yeni Ödev: Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.queryByText('Canlı Ders Başlıyor')).not.toBeInTheDocument();
  });

  it('bildirime tıklandığında akıllı yönlendirmeyi (deep linking) çalıştırır', async () => {
    render(<HomeNavbarNotificationBell userId="user-1" isLight={true} />);
    fireEvent.click(screen.getByRole('button', { name: /Bildirimler/i }));

    const assignmentItem = screen.getByText('Yeni Ödev: Çarpanlar ve Katlar');
    fireEvent.click(assignmentItem);

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
      expect(mockPush).toHaveBeenCalledWith('/odevler');
    });
  });

  it('tekil bildirim silme butonuna tıklandığında deleteNotification servisini tetikler', () => {
    render(<HomeNavbarNotificationBell userId="user-1" isLight={true} />);
    fireEvent.click(screen.getByRole('button', { name: /Bildirimler/i }));

    const deleteBtns = screen.getAllByRole('button', { name: /Bildirimi sil/i });
    expect(deleteBtns.length).toBeGreaterThan(0);

    fireEvent.click(deleteBtns[0]);
    expect(mockDeleteNotification).toHaveBeenCalledWith('notif-1');
  });

  it('resolveNotificationTarget doğru rotaları ve hedefleri belirler', () => {
    expect(
      resolveNotificationTarget({
        id: '1',
        type: 'assignment',
        title: 'Ödev',
        message: '',
        is_read: false,
        created_at: '',
        user_id: 'u1',
      }),
    ).toEqual({ path: '/odevler' });

    expect(
      resolveNotificationTarget({
        id: '2',
        type: 'live-lesson',
        title: 'Canlı Ders',
        message: '',
        is_read: false,
        created_at: '',
        user_id: 'u1',
        metadata: { room_id: 'room-abc' },
      }),
    ).toEqual({ path: '/canli-ders/d/room-abc' });

    expect(
      resolveNotificationTarget({
        id: '3',
        type: 'message',
        title: 'Hocadan Mesaj',
        message: '',
        is_read: false,
        created_at: '',
        user_id: 'u1',
      }),
    ).toEqual({ openChat: true });
  });
});
