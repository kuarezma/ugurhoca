import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminLiveLessonsTab from './AdminLiveLessonsTab';
import type { LiveLessonDashboardData, LiveLesson } from '@/features/live-lessons/types';

describe('AdminLiveLessonsTab', () => {
  const mockLesson: LiveLesson = {
    id: 'lesson-1',
    room_id: 'room-101',
    title: 'Üslü Sayılar LGS Kampı',
    description: 'Yeni nesil soruların çözümü',
    target_grade: '8',
    starts_at: '2026-09-12T17:00:00.000Z',
    duration_minutes: 60,
    status: 'ended',
    recording_url: 'https://youtube.com/watch?v=mockRec',
    materials_url: 'https://ugurhoca.com/pdf/mockNotes.pdf',
  };

  const mockData: LiveLessonDashboardData = {
    lessons: [mockLesson],
    participants: [],
    events: [],
    chatMessages: [],
  };

  it('renders live lessons with recording and materials badges', () => {
    render(
      <AdminLiveLessonsTab
        data={mockData}
        onRefresh={vi.fn()}
        students={[]}
      />
    );

    expect(screen.getByText('Üslü Sayılar LGS Kampı')).toBeInTheDocument();
    expect(screen.getByText('Kayıt İzle')).toBeInTheDocument();
    expect(screen.getByText('Notlar')).toBeInTheDocument();
  });

  it('opens edit form and reveals recording and materials inputs', () => {
    render(
      <AdminLiveLessonsTab
        data={mockData}
        onRefresh={vi.fn()}
        students={[]}
      />
    );

    const editBtn = screen.getByRole('button', { name: /Düzenle/i });
    fireEvent.click(editBtn);

    expect(screen.getByDisplayValue('https://youtube.com/watch?v=mockRec')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://ugurhoca.com/pdf/mockNotes.pdf')).toBeInTheDocument();
  });
});
