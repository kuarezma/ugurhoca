import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit('exit-ticket-respond', ip, {
    limit: 60,
    windowSeconds: 60,
  });
  if (rateLimit) return rateLimit;

  let body: {
    code?: string;
    studentKey?: string;
    studentName?: string;
    questionIndex?: number;
    selectedIndex?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Geçersiz istek gövdesi.' },
      { status: 400 },
    );
  }

  const code = body.code?.trim();
  const studentKey = body.studentKey?.trim();
  const studentName = body.studentName?.trim();
  const questionIndex = body.questionIndex;
  const selectedIndex = body.selectedIndex;

  if (!code || code.length !== 6) {
    return NextResponse.json(
      { error: 'Geçersiz katılım kodu.' },
      { status: 400 },
    );
  }

  if (!studentKey || studentKey.length < 1 || studentKey.length > 64) {
    return NextResponse.json(
      { error: 'Geçersiz öğrenci anahtarı.' },
      { status: 400 },
    );
  }

  if (!studentName || studentName.length < 1 || studentName.length > 60) {
    return NextResponse.json(
      { error: 'Öğrenci adı 1 ile 60 karakter arasında olmalıdır.' },
      { status: 400 },
    );
  }

  if (
    typeof questionIndex !== 'number' ||
    !Number.isInteger(questionIndex) ||
    questionIndex < 0 ||
    questionIndex > 20
  ) {
    return NextResponse.json(
      { error: 'Geçersiz soru indeksi.' },
      { status: 400 },
    );
  }

  if (
    typeof selectedIndex !== 'number' ||
    !Number.isInteger(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex > 5
  ) {
    return NextResponse.json(
      { error: 'Geçersiz seçenek indeksi.' },
      { status: 400 },
    );
  }

  const supabase = createServiceRoleClient();

  const { data: session, error: sessionErr } = await supabase
    .from('exit_ticket_sessions')
    .select('id, status')
    .eq('code', code)
    .single();

  if (sessionErr || !session) {
    return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 404 });
  }

  if (session.status !== 'active' && session.status !== 'in_progress') {
    return NextResponse.json({ error: 'Oturum aktif değil.' }, { status: 400 });
  }

  const { error: upsertErr } = await supabase
    .from('exit_ticket_responses')
    .upsert(
      {
        session_id: session.id,
        student_key: studentKey,
        student_name: studentName,
        question_index: questionIndex,
        selected_index: selectedIndex,
        answered_at: new Date().toISOString(),
      },
      { onConflict: 'session_id,student_key,question_index' },
    );

  if (upsertErr) {
    return NextResponse.json(
      { error: 'Yanıt kaydedilemedi.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
