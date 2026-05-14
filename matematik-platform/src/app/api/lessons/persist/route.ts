import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  isValidRoomId,
  readBearerToken,
  verifyPersistToken,
} from '@/features/live-lessons/lib/lesson-auth';

export const runtime = 'nodejs';

type Body = {
  event: string;
  payload?: Record<string, unknown>;
  roomId: string;
};

export async function POST(request: Request) {
  const token = verifyPersistToken(readBearerToken(request.headers.get('authorization')));
  if (!token) {
    return NextResponse.json({ error: 'Geçersiz kayıt tokeni.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body || !isValidRoomId(body.roomId) || body.roomId !== token.roomId || !body.event) {
    return NextResponse.json({ error: 'Geçersiz olay verisi.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: lesson } = await supabase
    .from('live_lessons')
    .select('id')
    .eq('room_id', body.roomId)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: 'Ders bulunamadı.' }, { status: 404 });
  }

  await supabase.from('live_lesson_events').insert({
    event_type: body.event,
    lesson_id: lesson.id,
    payload: {
      ...body.payload,
      identity: token.identity,
      role: token.role,
    },
  });

  return NextResponse.json({ ok: true });
}
