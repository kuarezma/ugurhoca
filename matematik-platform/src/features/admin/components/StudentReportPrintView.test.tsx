import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StudentReportPrintView } from './StudentReportPrintView';

describe('StudentReportPrintView', () => {
  it('renders Veri yok instead of a fabricated %85 when averageScore is null and renders real notes', () => {
    render(
      <StudentReportPrintView
        isOpen={true}
        onClose={vi.fn()}
        student={{
          adminNotes: [
            {
              body: 'Üslü ifadelerde işlem hızı arttı.',
              created_at: '2026-04-14T10:00:00Z',
              id: 'note-1',
              student_id: 'student-1',
            },
          ],
          averageScore: null,
          completedAssignments: 3,
          completedQuizzes: 0,
          focusTopic: 'Kareköklü İfadeler',
          grade: 8,
          id: 'student-1',
          name: 'Zeynep Kaya',
          strongTopic: 'Çarpanlar ve Katlar',
          totalMinutes: 215,
          weeklyCompletedMinutes: 90,
          weeklyTargetMinutes: 180,
        }}
      />,
    );

    expect(screen.getByText('Veri yok')).toBeInTheDocument();
    expect(screen.queryByText('%85')).not.toBeInTheDocument();
    expect(screen.getByText('215 dk')).toBeInTheDocument();
    expect(screen.getByText('Bu hafta: 90/180 dk')).toBeInTheDocument();
    expect(
      screen.getByText('Üslü ifadelerde işlem hızı arttı.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.getByText('Kareköklü İfadeler')).toBeInTheDocument();
  });

  it('renders %0 accurately when averageScore is 0, shows empty notes fallback, and allows editable print note', () => {
    render(
      <StudentReportPrintView
        isOpen={true}
        onClose={vi.fn()}
        student={{
          adminNotes: [],
          averageScore: 0,
          completedAssignments: 1,
          completedQuizzes: 2,
          grade: 'Mezun',
          id: 'student-2',
          name: 'Ali Demir',
          totalMinutes: 45,
        }}
      />,
    );

    expect(screen.getByText('%0')).toBeInTheDocument();
    expect(screen.getByText('Mezun')).toBeInTheDocument();
    expect(
      screen.getByText('Henüz öğretmen gözlem notu eklenmedi.'),
    ).toBeInTheDocument();

    const textarea = screen.getByLabelText(
      'Baskı için ek gözlem notu (isteğe bağlı)',
    );
    fireEvent.change(textarea, {
      target: { value: 'Deneme sonrası birebir tekrar önerildi.' },
    });
    expect(textarea).toHaveValue('Deneme sonrası birebir tekrar önerildi.');
    expect(
      screen.queryByText('Henüz öğretmen gözlem notu eklenmedi.'),
    ).not.toBeInTheDocument();
  });
});
