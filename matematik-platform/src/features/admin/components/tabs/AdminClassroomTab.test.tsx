import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminClassroomTab from './AdminClassroomTab';
import type { AdminUser, AdminAssignment, AdminQuizResultRow, AdminSubmission } from '@/features/admin/types';

vi.mock('@/components/Toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('AdminClassroomTab', () => {
  const mockStudents: AdminUser[] = [
    {
      id: 'student-1',
      name: 'Ali Yılmaz',
      email: 'ali@example.com',
      grade: 8,
      isAdmin: false,
    },
    {
      id: 'student-2',
      name: 'Ayşe Kaya',
      email: 'ayse@example.com',
      grade: 8,
      isAdmin: false,
    },
    {
      id: 'student-3',
      name: 'Mehmet Demir',
      email: 'mehmet@example.com',
      grade: 7, // different grade
      isAdmin: false,
    },
  ];

  const mockAssignments: AdminAssignment[] = [
    {
      id: 'ass-1',
      title: 'Çarpanlar ve Katlar Ödevi',
      grade: 8,
      due_date: '2026-10-01T00:00:00.000Z',
      file_url: null,
      created_at: '2026-09-01T00:00:00.000Z',
    },
  ];

  const mockQuizResults: AdminQuizResultRow[] = [
    {
      id: 'qr-1',
      user_id: 'student-1',
      quiz_id: 'quiz-1',
      score: 80,
      total_questions: 20,
      completed_at: new Date().toISOString(), // this week
    },
    {
      id: 'qr-2',
      user_id: 'student-2',
      quiz_id: 'quiz-2',
      score: 100,
      total_questions: 50,
      completed_at: new Date().toISOString(), // this week
    },
  ];

  const mockSubmissions: AdminSubmission[] = [
    {
      id: 'sub-1',
      assignment_id: 'ass-1',
      student_id: 'student-1',
      student_name: 'Ali Yılmaz',
      status: 'submitted',
      grade: 95,
      submitted_at: '2026-09-05T00:00:00.000Z',
      file_url: 'https://example.com/file.pdf',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders homeroom header and KPI summary cards correctly for 8th grade', () => {
    render(
      <AdminClassroomTab
        students={mockStudents}
        assignments={mockAssignments}
        quizResults={mockQuizResults}
        submissions={mockSubmissions}
        studySessions={[]}
        onSendMessage={vi.fn()}
        onViewProfile={vi.fn()}
      />
    );

    expect(screen.getByText(/Sınıf Rehberliği Masası/i)).toBeInTheDocument();
    expect(screen.getByText(/8\. Sınıf Şube Yönetim & Takip Panosu/i)).toBeInTheDocument();
    expect(screen.getByText('Sınıf Mevcudu')).toBeInTheDocument();
    expect(screen.getByText('Bu Hafta Çözülen Soru')).toBeInTheDocument();
    expect(screen.getByText('Haftanın Sınıf Yıldızı')).toBeInTheDocument();
    expect(screen.getAllByText('Ayşe Kaya').length).toBeGreaterThan(0); // top student with 50 questions
  });

  it('renders student roster and allows writing guidance notes to localStorage', () => {
    render(
      <AdminClassroomTab
        students={mockStudents}
        assignments={mockAssignments}
        quizResults={mockQuizResults}
        submissions={mockSubmissions}
        studySessions={[]}
        onSendMessage={vi.fn()}
        onViewProfile={vi.fn()}
      />
    );

    const inputs = screen.getAllByPlaceholderText('Rehberlik notu ekle...');
    expect(inputs.length).toBe(2); // 2 students in 8th grade

    fireEvent.change(inputs[0], { target: { value: 'Problem çözme hızı çok iyi, dikkati yüksek.' } });
    fireEvent.blur(inputs[0]);

    expect(localStorage.getItem('ugurhoca_guidance_note_student-1')).toBe(
      'Problem çözme hızı çok iyi, dikkati yüksek.'
    );
  });

  it('switches between roster, matrix, and risk views', () => {
    render(
      <AdminClassroomTab
        students={mockStudents}
        assignments={mockAssignments}
        quizResults={mockQuizResults}
        submissions={mockSubmissions}
        studySessions={[]}
        onSendMessage={vi.fn()}
        onViewProfile={vi.fn()}
      />
    );

    // Switch to matrix view
    const matrixBtn = screen.getByRole('button', { name: /Ödev Takip Matrisi/i });
    fireEvent.click(matrixBtn);

    expect(screen.getByText(/8\. Sınıf Ödev Teslim Defteri/i)).toBeInTheDocument();
    expect(screen.getByText('Çarpanlar ve Katlar Ödevi')).toBeInTheDocument();
    expect(screen.getByText('✓ 95P')).toBeInTheDocument(); // student-1 submitted
    expect(screen.getByText('✕ Yok')).toBeInTheDocument(); // student-2 missing

    // Switch to risk view
    const riskBtn = screen.getByRole('button', { name: /Risk Radarı/i });
    fireEvent.click(riskBtn);

    // In risk view, student-2 has missing assignment so should appear
    expect(screen.getAllByText('Ayşe Kaya').length).toBeGreaterThan(0);
  });

  it('triggers onSendMessage when action button is clicked', () => {
    const onSendMessageMock = vi.fn();

    render(
      <AdminClassroomTab
        students={mockStudents}
        assignments={mockAssignments}
        quizResults={mockQuizResults}
        submissions={mockSubmissions}
        studySessions={[]}
        onSendMessage={onSendMessageMock}
        onViewProfile={vi.fn()}
      />
    );

    const messageBtns = screen.getAllByTitle('Öğrenciye mesaj gönder');
    expect(messageBtns.length).toBeGreaterThan(0);

    fireEvent.click(messageBtns[0]);
    expect(onSendMessageMock).toHaveBeenCalledWith(mockStudents[0]);
  });

  it('calls window.print on print button click', () => {
    const printMock = vi.fn();
    window.print = printMock;

    render(
      <AdminClassroomTab
        students={mockStudents}
        assignments={mockAssignments}
        quizResults={mockQuizResults}
        submissions={mockSubmissions}
        studySessions={[]}
        onSendMessage={vi.fn()}
        onViewProfile={vi.fn()}
      />
    );

    const printBtn = screen.getByRole('button', { name: /Çizelge Yazdır/i });
    fireEvent.click(printBtn);
    expect(printMock).toHaveBeenCalled();
  });
});
