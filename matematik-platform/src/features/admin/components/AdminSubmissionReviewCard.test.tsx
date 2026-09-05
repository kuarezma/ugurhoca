import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AdminSubmissionReviewCard from './AdminSubmissionReviewCard';
import type { AdminSubmission } from '@/features/admin/types';

describe('AdminSubmissionReviewCard Component', () => {
  const mockSubmission: AdminSubmission = {
    id: 'sub-123',
    assignment_id: 'ass-1',
    assignment_title: 'Köklü Sayılar Ödevi',
    student_id: 'std-456',
    student_name: 'Ahmet Yılmaz',
    student_email: 'ahmet@example.com',
    file_url: 'https://example.com/homework.png',
    comment: 'Hocam 4. soruda zorlandım.',
    grade: null,
    feedback: null,
    status: 'submitted',
    submitted_at: '2026-09-05T10:00:00Z',
    reviewed_at: null,
  };

  it('renders student submission details, comment, and review buttons', () => {
    const onUpdate = vi.fn();
    render(
      <AdminSubmissionReviewCard
        submission={mockSubmission}
        onUpdateSubmission={onUpdate}
      />,
    );

    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText(/"Hocam 4\. soruda zorlandım\."/i)).toBeInTheDocument();
    expect(screen.getByText('Çizimle İncele')).toBeInTheDocument();
  });

  it('applies quick template when template chip is clicked', () => {
    const onUpdate = vi.fn();
    render(
      <AdminSubmissionReviewCard
        submission={mockSubmission}
        onUpdateSubmission={onUpdate}
      />,
    );

    const kusursuzBtn = screen.getByRole('button', { name: /Kusursuz/i });
    fireEvent.click(kusursuzBtn);

    const input = screen.getByPlaceholderText('Geri bildirim yazın...') as HTMLInputElement;
    expect(input.value).toContain('Tebrikler!');
  });

  it('allows recording voice note and updates feedback input', () => {
    vi.useFakeTimers();
    const onUpdate = vi.fn();
    render(
      <AdminSubmissionReviewCard
        submission={mockSubmission}
        onUpdateSubmission={onUpdate}
      />,
    );

    // Start recording
    const micBtn = screen.getByTitle('Sesli not kaydet');
    fireEvent.click(micBtn);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Stop recording
    const stopBtn = screen.getByTitle('Kaydı bitir');
    fireEvent.click(stopBtn);

    const input = screen.getByPlaceholderText('Geri bildirim yazın...') as HTMLInputElement;
    expect(input.value).toContain('Sesli Öğretmen Notu');
    vi.useRealTimers();
  });
});
