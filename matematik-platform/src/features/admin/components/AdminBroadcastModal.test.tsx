import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminBroadcastModal } from './AdminBroadcastModal';
import type { AdminUser } from '@/features/admin/types';

const mockShowToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

describe('AdminBroadcastModal', () => {
  const mockStudents: AdminUser[] = [
    {
      id: 'student-1',
      name: 'Ali Yılmaz',
      email: 'ali@example.com',
      grade: 5,
      isAdmin: false,
    },
    {
      id: 'student-2',
      name: 'Zeynep Demir',
      email: 'zeynep@example.com',
      grade: 8,
      isAdmin: false,
    },
    {
      id: 'student-3',
      name: 'Can Akın',
      email: 'can@example.com',
      grade: 8,
      isAdmin: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and displays recipient count based on selected grade', () => {
    render(
      <AdminBroadcastModal
        isOpen={true}
        onClose={vi.fn()}
        students={mockStudents}
      />
    );

    expect(screen.getByText('Sınıfa Özel Toplu Bildirim')).toBeInTheDocument();
    // Initially 'all' is selected -> 3 students
    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/Öğrenciye Ulaşacak/)).toBeInTheDocument();

    // Change to 8. Sınıf -> 2 students
    const select = screen.getByLabelText(/Hedef Kitle \/ Sınıf/i);
    fireEvent.change(select, { target: { value: '8' } });

    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it('submits form to /api/admin-broadcast on submit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          recipient_count: 2,
          target_grade: '8',
        },
      }),
    });
    global.fetch = fetchMock;

    const onClose = vi.fn();
    render(
      <AdminBroadcastModal
        isOpen={true}
        onClose={onClose}
        students={mockStudents}
      />
    );

    const select = screen.getByLabelText(/Hedef Kitle \/ Sınıf/i);
    fireEvent.change(select, { target: { value: '8' } });

    const titleInput = screen.getByLabelText(/Bildirim Başlığı/i);
    fireEvent.change(titleInput, { target: { value: 'Haftalık LGS Denemesi' } });

    const messageInput = screen.getByLabelText(/Bildirim Metni/i);
    fireEvent.change(messageInput, { target: { value: 'Yeni deneme sınavınız yüklendi.' } });

    const submitBtn = screen.getByRole('button', { name: /Bildirimi Gönder/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin-broadcast',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            target_grade: '8',
            title: 'Haftalık LGS Denemesi',
            message: 'Yeni deneme sınavınız yüklendi.',
          }),
        })
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        'success',
        expect.stringContaining('öğrenciye toplu bildirim başarıyla iletildi')
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});
