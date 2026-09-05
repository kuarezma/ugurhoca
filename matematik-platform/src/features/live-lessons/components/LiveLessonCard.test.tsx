import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveLessonCard } from './LiveLessonCard';
import type { LiveLesson } from '@/features/live-lessons/types';

describe('LiveLessonCard', () => {
  const baseLesson: LiveLesson = {
    id: 'lesson-1',
    room_id: 'room-123',
    title: '8. Sınıf LGS Çarpanlar ve Katlar Tekrarı',
    description: 'Önemli yeni nesil soru çözümleri',
    target_grade: '8',
    target_student_ids: null,
    starts_at: '2026-09-10T15:00:00.000Z',
    duration_minutes: 60,
    status: 'scheduled',
  };

  it('renders standard lesson card with room ID and title', () => {
    render(
      <LiveLessonCard
        isAdmin={false}
        lesson={baseLesson}
        students={[]}
      />
    );

    expect(screen.getByText('8. Sınıf LGS Çarpanlar ve Katlar Tekrarı')).toBeInTheDocument();
    expect(screen.getByText('room-123')).toBeInTheDocument();
    expect(screen.getByText('Derse Giriş Yap')).toBeInTheDocument();
  });

  it('renders recording and materials buttons when URLs are provided', () => {
    const lessonWithLinks: LiveLesson = {
      ...baseLesson,
      status: 'ended',
      recording_url: 'https://youtube.com/watch?v=mock123',
      materials_url: 'https://ugurhoca.com/pdf/mock.pdf',
    };

    render(
      <LiveLessonCard
        isAdmin={false}
        lesson={lessonWithLinks}
        students={[]}
      />
    );

    const recordingLink = screen.getByTitle('Ders kaydını izle');
    expect(recordingLink).toBeInTheDocument();
    expect(recordingLink).toHaveAttribute('href', 'https://youtube.com/watch?v=mock123');

    const materialsLink = screen.getByTitle('Ders materyallerini aç');
    expect(materialsLink).toBeInTheDocument();
    expect(materialsLink).toHaveAttribute('href', 'https://ugurhoca.com/pdf/mock.pdf');
  });

  it('allows admin to edit ended lessons to attach recordings and materials', () => {
    const onEdit = vi.fn();
    const endedLesson: LiveLesson = {
      ...baseLesson,
      status: 'ended',
    };

    render(
      <LiveLessonCard
        isAdmin={true}
        lesson={endedLesson}
        students={[]}
        onEdit={onEdit}
      />
    );

    expect(screen.getByTitle('Dersi Düzenle')).toBeInTheDocument();
  });
});
