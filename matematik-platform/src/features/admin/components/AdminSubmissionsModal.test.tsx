import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminSubmissionsModal from './AdminSubmissionsModal';
import type { AdminAssignment, AdminSubmission } from '@/features/admin/types';

describe('AdminSubmissionsModal Component', () => {
  const mockAssignment: AdminAssignment = {
    id: 'ass-1',
    title: 'Üslü Sayılar Çalışma Kağıdı',
    description: 'Açıklama',
    due_date: '2026-09-10T10:00:00Z',
    target_grade: '8',
    is_active: true,
    file_url: null,
    created_at: '2026-09-01T10:00:00Z',
  };

  const mockSubmissions: AdminSubmission[] = [
    {
      id: 'sub-1',
      assignment_id: 'ass-1',
      assignment_title: 'Üslü Sayılar',
      student_id: 'std-1',
      student_name: 'Ayşe Kaya',
      student_email: 'ayse@example.com',
      file_url: null,
      comment: 'Soruları çözdüm.',
      grade: 95,
      feedback: 'Çok iyi',
      status: 'graded',
      submitted_at: '2026-09-02T10:00:00Z',
      reviewed_at: null,
    },
    {
      id: 'sub-2',
      assignment_id: 'ass-1',
      assignment_title: 'Üslü Sayılar',
      student_id: 'std-2',
      student_name: 'Mehmet Demir',
      student_email: 'mehmet@example.com',
      file_url: null,
      comment: null,
      grade: null,
      feedback: null,
      status: 'submitted',
      submitted_at: '2026-09-03T10:00:00Z',
      reviewed_at: null,
    },
  ];

  it('renders submissions modal and toggles Speed Grader mode', () => {
    const onUpdate = vi.fn();
    const onClose = vi.fn();

    render(
      <AdminSubmissionsModal
        assignment={mockAssignment}
        onClose={onClose}
        onUpdateSubmission={onUpdate}
        submissions={mockSubmissions}
      />
    );

    expect(screen.getByText('Üslü Sayılar Çalışma Kağıdı')).toBeInTheDocument();
    expect(screen.getByText(/1\/2 Değerlendirildi/i)).toBeInTheDocument();

    // Default list view contains both students
    expect(screen.getByText('Ayşe Kaya')).toBeInTheDocument();
    expect(screen.getByText('Mehmet Demir')).toBeInTheDocument();

    // Switch to Speed Grader
    const speedBtn = screen.getByRole('button', { name: /Hızlı İnceleme/i });
    fireEvent.click(speedBtn);

    expect(screen.getByText(/Öğrenci 1 \/ 2/i)).toBeInTheDocument();

    // Navigate to next student
    const nextBtn = screen.getByRole('button', { name: /Sonraki/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Öğrenci 2 \/ 2/i)).toBeInTheDocument();
  });
});
