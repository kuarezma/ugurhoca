import { NextResponse } from 'next/server';
import { loadActiveLiveLessonForCurrentUser } from '@/features/live-lessons/server/liveLessons';

export async function GET() {
  const lesson = await loadActiveLiveLessonForCurrentUser();

  return NextResponse.json(
    {
      lesson: lesson ? { room_id: lesson.room_id, title: lesson.title } : null,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
