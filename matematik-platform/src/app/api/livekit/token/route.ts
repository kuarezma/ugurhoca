import { AccessToken, type VideoGrant } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  requireLiveLessonUser,
} from '@/features/live-lessons/server/liveLessons';
import type { LiveLesson } from '@/features/live-lessons/types';
import {
  isValidRoomId,
  signPersistToken,
  verifyTeacherProof,
} from '@/features/live-lessons/lib/lesson-auth';

export const runtime = 'nodejs';

type Body = {
  identity: string;
  lessonId: string;
  roomName: string;
  role: 'teacher' | 'student';
  teacherProof?: string;
};

export async function POST(request: Request) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Sunucuda LIVEKIT_API_KEY ve LIVEKIT_API_SECRET tanımlı değil.' },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (
    !body ||
    !isValidRoomId(body.roomName) ||
    typeof body.identity !== 'string' ||
    body.identity.length === 0 ||
    body.identity.length > 128 ||
    (body.role !== 'teacher' && body.role !== 'student')
  ) {
    return NextResponse.json({ error: 'Geçersiz ders bağlantısı.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: lesson } = await supabase
    .from('live_lessons')
    .select('*')
    .eq('id', body.lessonId)
    .eq('room_id', body.roomName)
    .single();

  if (!lesson || lesson.status === 'ended' || lesson.status === 'cancelled') {
    return NextResponse.json({ error: 'Ders aktif değil.' }, { status: 404 });
  }

  const isAdmin = isLiveLessonAdmin(auth.user);
  if (body.role === 'teacher') {
    const validProof = verifyTeacherProof(body.roomName, body.teacherProof);
    if (!isAdmin || !validProof) {
      return NextResponse.json({ error: 'Öğretmen yetkisi doğrulanamadı.' }, { status: 403 });
    }
  }
  if (body.role === 'student' && !canUserAccessLiveLesson(lesson as LiveLesson, auth.user)) {
    return NextResponse.json({ error: 'Bu ders size açık değil.' }, { status: 403 });
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: body.identity,
    name: auth.user.name || auth.user.email,
    ttl: '8h',
  });

  const grant: VideoGrant = {
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    room: body.roomName,
    roomJoin: true,
  };
  token.addGrant(grant);

  return NextResponse.json({
    persistToken: signPersistToken({
      identity: body.identity,
      role: body.role,
      roomId: body.roomName,
    }),
    token: await token.toJwt(),
  });
}
