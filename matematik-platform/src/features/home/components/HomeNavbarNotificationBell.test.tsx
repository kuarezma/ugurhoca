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
    title: 'Yeni Yaprak Test Eklendi',
    message: '8. Sınıf Üslü İfadeler yaprak test yayında.',
    type: 'document',
    is_read: true,
    metadata: { href: '/icerikler?grade=8&type=yaprak-test' },
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 sa önce
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
    render(<HomeNavbarNotificationBell userId="user-1" />);

    const bellBtn = screen.getByRole('button', { name: /Bildirimler/i });
    expect(bellBtn).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    fireEvent.click(bellBtn);

    expect(screen.getByText('Bildirimler')).toBeInTheDocument();
    expect(screen.getByText('Tümü')).toBeInTheDocument();
    expect(screen.getByText('Okunmamış')).toBeInTheDocument();
    expect(screen.getByText('Ödevler')).toBeInTheDocument();
    expect(screen.getByText('Yaprak Testler')).toBeInTheDocument();
  });

  it('sekmeler arasında filtreleme yapar', () => {
    render(<HomeNavbarNotificationBell userId="user-1" />);
    fireEvent.click(screen.getByRole('button', { name: /Bildirimler/i }));

    expect(screen.getByText('Yeni Ödev: Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.getByText('Yeni Yaprak Test Eklendi')).toBeInTheDocument();

    // Sadece Ödevler sekmesine tıkla
    fireEvent.click(screen.getByRole('button', { name: /Ödevler/i }));
    expect(screen.getByText('Yeni Ödev: Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.queryByText('Yeni Yaprak Test Eklendi')).not.toBeInTheDocument();

    // Sadece Yaprak Testler sekmesine tıkla
    fireEvent.click(screen.getByRole('button', { name: /Yaprak Testler/i }));
    expect(screen.getByText('Yeni Yaprak Test Eklendi')).toBeInTheDocument();
    expect(screen.queryByText('Yeni Ödev: Çarpanlar ve Katlar')).not.toBeInTheDocument();
  });

  it('okunmamış sekmesine tıklandığında yalnızca okunmamışları listeler', () => {
    render(<HomeNavbarNotificationBell userId="user-1" />);
    fireEvent.click(screen.getByRole('button', { name: /Bildirimler/i }));

    expect(screen.getByText('Yeni Ödev: Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.getByText('Yeni Yaprak Test Eklendi')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Okunmamış'));
    expect(screen.getByText('Yeni Ödev: Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.queryByText('Yeni Yaprak Test Eklendi')).not.toBeInTheDocument();
  });

  it('tümünü oku butonuna tıklandığında markAllAsRead servisini tetikler', () => {
    render(<HomeNavbarNotificationBell userId="user-1" />);
    fireEvent.click(screen.getByRole('button', { name: /Bildirimler/i }));

    const markAllBtn = screen.getByRole('button', { name: /Tümünü oku/i });
    expect(markAllBtn).toBeInTheDocument();

    fireEvent.click(markAllBtn);
    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it('bildirime tıklandığında akıllı yönlendirmeyi (deep linking) çalıştırır', async () => {
    render(<HomeNavbarNotificationBell userId="user-1" />);
    fireEvent.click(screen.getByRole('button', { name: /Bildirimler/i }));

    const assignmentItem = screen.getByText('Yeni Ödev: Çarpanlar ve Katlar');
    fireEvent.click(assignmentItem);

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
      expect(mockPush).toHaveBeenCalledWith('/odevler');
    });
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
        type: 'document',
        title: 'Yeni Yaprak Test',
        message: '',
        is_read: false,
        created_at: '',
        user_id: 'u1',
        metadata: { href: '/icerikler?grade=8&type=yaprak-test' },
      }),
    ).toEqual({ path: '/icerikler?grade=8&type=yaprak-test' });

    expect(
      resolveNotificationTarget({
        id: '3',
        type: 'document',
        title: 'Genel Doküman',
        message: '',
        is_read: false,
        created_at: '',
        user_id: 'u1',
      }),
    ).toEqual({ path: '/icerikler' });
  });
});
