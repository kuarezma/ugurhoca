import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminSpotlightModal from './AdminSpotlightModal';
import type { AdminUser, AdminQuiz, AdminDocument } from '@/features/admin/types';

describe('AdminSpotlightModal', () => {
  const mockStudents: AdminUser[] = [
    {
      id: 'student-1',
      name: 'Mehmet Kaya',
      email: 'mehmet@example.com',
      grade: 7,
      isAdmin: false,
    },
  ];

  const mockQuizzes: AdminQuiz[] = [
    {
      id: 'quiz-1',
      title: '7. Sınıf Rasyonel Sayılar Testi',
      grade: 7,
      difficulty: 'Orta',
      time_limit: 20,
      description: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockDocs: AdminDocument[] = [
    {
      id: 'doc-1',
      title: 'Çarpanlar ve Katlar Çalışma Kağıdı',
      type: 'worksheet',
      grade: [8],
      file_url: 'https://example.com/doc.pdf',
    },
  ];

  it('renders search input and filters items on query', () => {
    const onSelectStudent = vi.fn();
    const onSelectTab = vi.fn();
    const onOpenModal = vi.fn();
    const onClose = vi.fn();

    render(
      <AdminSpotlightModal
        isOpen={true}
        onClose={onClose}
        students={mockStudents}
        quizzes={mockQuizzes}
        documents={mockDocs}
        liveLessons={[]}
        onSelectStudent={onSelectStudent}
        onSelectTab={onSelectTab}
        onOpenModal={onOpenModal}
      />
    );

    const input = screen.getByPlaceholderText(/Öğrenci, test, çalışma kağıdı veya işlem ara/i);
    expect(input).toBeInTheDocument();

    // Type student query
    fireEvent.change(input, { target: { value: 'Mehmet' } });
    expect(screen.getByText('Mehmet Kaya')).toBeInTheDocument();

    // Click student
    fireEvent.click(screen.getByText('Mehmet Kaya'));
    expect(onSelectStudent).toHaveBeenCalledWith(mockStudents[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders quick action buttons when search is empty', () => {
    const onOpenModal = vi.fn();

    render(
      <AdminSpotlightModal
        isOpen={true}
        onClose={vi.fn()}
        students={mockStudents}
        quizzes={mockQuizzes}
        documents={mockDocs}
        liveLessons={[]}
        onSelectStudent={vi.fn()}
        onSelectTab={vi.fn()}
        onOpenModal={onOpenModal}
      />
    );

    const newQuizAction = screen.getByText('Yeni Test Ekle');
    expect(newQuizAction).toBeInTheDocument();

    fireEvent.click(newQuizAction);
    expect(onOpenModal).toHaveBeenCalledWith('quiz');
  });
});
