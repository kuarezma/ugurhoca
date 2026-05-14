import { redirect } from 'next/navigation';
import { RoomPageShell } from '@/features/live-lessons/components/room/RoomPageShell';
import { isLiveLessonAdmin } from '@/features/live-lessons/server/liveLessons';
import type { LiveLesson } from '@/features/live-lessons/types';
import { getServerAuthSnapshot } from '@/lib/auth-snapshot.server';
import { createServiceRoleClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ roomId: string }>;
};

export default async function CanliDersRoomPage({ params }: Props) {
  const user = await getServerAuthSnapshot();
  if (!user) {
    redirect('/giris');
  }

  const { roomId } = await params;
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from('live_lessons')
    .select('*')
    .eq('room_id', roomId)
    .single();

  if (!data) {
    redirect('/canli-ders');
  }

  const lesson = data as LiveLesson;
  const isAdmin = isLiveLessonAdmin(user);
  if (!isAdmin && String(user.grade) !== String(lesson.target_grade)) {
    redirect('/canli-ders');
  }

  return (
    <RoomPageShell
      displayName={user.name}
      lesson={lesson}
      role={isAdmin ? 'teacher' : 'student'}
      teacherProof={isAdmin ? lesson.teacher_proof : null}
      userId={user.id}
    />
  );
}
