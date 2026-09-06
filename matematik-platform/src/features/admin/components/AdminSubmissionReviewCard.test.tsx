import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AdminSubmissionReviewCard from './AdminSubmissionReviewCard';
import type { AdminSubmission } from '@/features/admin/types';

vi.mock('@/components/Toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

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

  it('opens teacher feedback library modal and selects a pedagogical note', () => {
    const onUpdate = vi.fn();
    render(
      <AdminSubmissionReviewCard
        submission={mockSubmission}
        onUpdateSubmission={onUpdate}
      />,
    );

    const libraryBtn = screen.getByRole('button', { name: /Geri Bildirim Kütüphanesi/i });
    expect(libraryBtn).toBeInTheDocument();
    fireEvent.click(libraryBtn);

    // Modal should be visible with categories
    expect(screen.getByText('Öğretmen Geri Bildirim Kütüphanesi')).toBeInTheDocument();

    // Select a template from the library using "İliştir"
    const attachBtns = screen.getAllByRole('button', { name: /İliştir/i });
    expect(attachBtns.length).toBeGreaterThan(0);
    fireEvent.click(attachBtns[0]);

    const textarea = screen.getByPlaceholderText('Geri bildirim yazın...') as HTMLTextAreaElement;
    expect(textarea.value.length).toBeGreaterThan(5);
  });

  it('attaches step prefix when a step chip is clicked and template is selected', () => {
    const onUpdate = vi.fn();
    render(
      <AdminSubmissionReviewCard
        submission={mockSubmission}
        onUpdateSubmission={onUpdate}
      />,
    );

    // Click on "1. Adım" chip
    const step1Btn = screen.getByRole('button', { name: /1\. Adım/i });
    fireEvent.click(step1Btn);

    // Modal should open with banner indicating step context
    expect(screen.getByText('Öğretmen Geri Bildirim Kütüphanesi')).toBeInTheDocument();
    expect(screen.getAllByText(/1\. Adım: Verilenleri Belirleme/i).length).toBeGreaterThan(0);

    // Pick first template using "İliştir"
    const attachBtns = screen.getAllByRole('button', { name: /İliştir/i });
    fireEvent.click(attachBtns[0]);

    const textarea = screen.getByPlaceholderText('Geri bildirim yazın...') as HTMLTextAreaElement;
    expect(textarea.value).toContain('[1. Adım: Verilenleri Belirleme]');
  });
});
