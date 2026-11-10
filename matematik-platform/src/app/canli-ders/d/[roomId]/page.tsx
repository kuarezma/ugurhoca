import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RoomPageShell } from '@/features/live-lessons/components/room/RoomPageShell';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  toClientLiveLesson,
} from '@/features/live-lessons/server/liveLessons';
import type { LiveLesson } from '@/features/live-lessons/types';
import { getVerifiedServerUser } from '@/lib/auth-verify.server';
import { createPageMetadata } from '@/lib/site-metadata';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const metadata: Metadata = createPageMetadata({
  title: 'Canlı Ders Odası',
  description: 'Uğur Hoca canlı matematik ders odası.',
  path: '/canli-ders',
  noIndex: true,
});

type Props = {
  params: Promise<{ roomId: string }>;
};

export default async function CanliDersRoomPage({ params }: Props) {
  const user = await getVerifiedServerUser();
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

  const lesson = toClientLiveLesson(data as LiveLesson);
  const isAdmin = isLiveLessonAdmin(user);
  if (!isAdmin && !canUserAccessLiveLesson(lesson, user)) {
    redirect('/canli-ders');
  }

  return (
    <RoomPageShell
      displayName={user.name}
      lesson={lesson}
      role={isAdmin ? 'teacher' : 'student'}
      userId={user.id}
    />
  );
}
