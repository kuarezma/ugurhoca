import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatBubble from './ChatBubble';

const mockGetClientSession = vi.fn();
const mockSendSupportMessage = vi.fn();

vi.mock('@/lib/auth-client', () => ({
  getClientSession: () => mockGetClientSession(),
}));

vi.mock('@/lib/admin', () => ({
  isAdminEmail: (email?: string) => email === 'admin@ugurhoca.com',
}));

vi.mock('@/features/home/queries', () => ({
  sendSupportMessage: (...args: unknown[]) => mockSendSupportMessage(...args),
  uploadSupportFiles: vi.fn().mockResolvedValue([]),
  validateSupportImageFile: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'fake-token' } },
      }),
    },
    channel: () => ({
      on: () => ({ subscribe: vi.fn() }),
    }),
    removeChannel: vi.fn(),
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            order: () => ({
              limit: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'admin-msg-1',
                    user_id: 'admin-id',
                    type: 'message',
                    title: 'Öğrenci Mesajı',
                    message: JSON.stringify({
                      sender_id: 'student-99',
                      sender_name: 'Zeynep Kaya',
                      text: 'Hocam 5. soruyu anlamadım',
                    }),
                    is_read: false,
                    created_at: new Date().toISOString(),
                  },
                ],
              }),
            }),
          }),
        }),
      }),
    }),
  },
}));

vi.mock('@/features/home/hooks/useNavbarMessages', () => ({
  useNavbarMessages: () => ({
    appendMessage: vi.fn(),
    markAllAsRead: vi.fn(),
    messages: [
      {
        id: 'msg-1',
        title: "Uğur Hoca'dan Mesaj",
        message: 'Bugünkü ödevini tamamlamayı unutma!',
        type: 'admin-message',
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ],
    refetch: vi.fn(),
    unreadCount: 1,
  }),
}));

describe('ChatBubble Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('giriş yapmış öğrenci için Uğur Hoca sohbet butonunu ve okunmamış rozetini gösterir', async () => {
    mockGetClientSession.mockResolvedValue({
      user: {
        id: 'student-123',
        email: 'ogrenci@ugurhoca.local',
        user_metadata: { name: 'Ahmet Yılmaz' },
      },
    });

    render(<ChatBubble />);

    const triggerBtn = await screen.findByRole('button', {
      name: /Uğur Hoca'ya mesaj yaz/i,
    });
    expect(triggerBtn).toBeInTheDocument();

    expect(screen.getByText('1')).toBeInTheDocument();

    fireEvent.click(triggerBtn);

    expect(await screen.findByText('Uğur Hoca')).toBeInTheDocument();
    expect(screen.getByText('Matematik Öğretmeni')).toBeInTheDocument();
  });

  it('öğrenci mesaj yazıp gönderdiğinde sendSupportMessage servisini tetikler', async () => {
    mockGetClientSession.mockResolvedValue({
      access_token: 'fake-student-token',
      user: {
        id: 'student-123',
        email: 'ogrenci@ugurhoca.local',
        user_metadata: { name: 'Ahmet Yılmaz' },
      },
    });
    mockSendSupportMessage.mockResolvedValue({
      id: 'sent-1',
      type: 'sent-message',
      created_at: new Date().toISOString(),
    });

    render(<ChatBubble />);

    const triggerBtn = await screen.findByRole('button', {
      name: /Uğur Hoca'ya mesaj yaz/i,
    });
    fireEvent.click(triggerBtn);

    const textarea = await screen.findByPlaceholderText(/Uğur Hoca'ya mesaj yaz/i);
    fireEvent.change(textarea, { target: { value: 'Merhaba hocam' } });

    const submitBtn = screen.getByRole('button', { name: 'Gönder' });
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSendSupportMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Merhaba hocam',
          sender_id: 'student-123',
        }),
        'fake-student-token',
      );
    });
  });

  it('admin girişi yapıldığında öğrenci sohbetleri panelini açar', async () => {
    mockGetClientSession.mockResolvedValue({
      user: {
        id: 'admin-1',
        email: 'admin@ugurhoca.com',
        user_metadata: { name: 'Uğur Hoca' },
      },
    });

    render(<ChatBubble />);

    const triggerBtn = await screen.findByRole('button', {
      name: /Öğrenci mesajları/i,
    });
    fireEvent.click(triggerBtn);

    expect(await screen.findByText('Öğrenci Sohbetleri')).toBeInTheDocument();
    expect(await screen.findByText('Zeynep Kaya')).toBeInTheDocument();
  });

  it('giriş yapmamış misafir kullanıcı tıkladığında giriş/kayıt yönlendirmesi sunar', async () => {
    mockGetClientSession.mockResolvedValue(null);

    render(<ChatBubble />);

    const triggerBtn = await screen.findByRole('button', {
      name: /Uğur Hoca'ya mesaj yaz/i,
    });
    fireEvent.click(triggerBtn);

    expect(
      await screen.findByText(/Uğur Hoca ile Sohbet/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Giriş Yap/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Ücretsiz Hesap Oluştur/i }),
    ).toBeInTheDocument();
  });
});
