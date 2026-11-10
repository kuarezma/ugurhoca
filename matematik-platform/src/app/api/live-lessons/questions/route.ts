import { NextResponse } from 'next/server';
import { getBearerOrCookieAccessToken, requireAdmin } from '@/lib/api-auth';
import { isAdminEmail } from '@/lib/admin';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';

async function getAuthenticatedUser(request: Request) {
  const token = await getBearerOrCookieAccessToken(request);
  if (!token) return null;
  const client = createServerSupabaseClient(token);
  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit('live-questions-get', ip, {
    limit: 120,
    windowSeconds: 60,
  });
  if (rateLimit) return rateLimit;

  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Oturum açmanız gerekiyor.' },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const lessonId = url.searchParams.get('lessonId');

  const supabase = createServiceRoleClient();
  const isAdmin = isAdminEmail(user.email);

  let query = supabase
    .from('live_lesson_questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (isAdmin) {
    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }
  } else {
    // Öğrenci İzolasyonu (site.md): Öğrenci yalnızca kendi gönderdiği soruları görebilir!
    query = query.eq('student_id', user.id);
    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }
  }

  const { data: questions, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Sorular yüklenemedi.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    questions: questions || [],
    isAdmin,
  });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Oturum açmanız gerekiyor.' },
      { status: 401 },
    );
  }

  const rateLimit = await enforceRateLimit(
    'live-lesson-question-post',
    user.id,
    {
      limit: 15,
      windowSeconds: 60,
    },
  );
  if (rateLimit) return rateLimit;

  let body: {
    lesson_id?: string;
    student_name?: string;
    topic?: string;
    difficulty?: string;
    question_text?: string;
    image_url?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Geçersiz istek gövdesi.' },
      { status: 400 },
    );
  }

  const topic = body.topic?.trim();
  const questionText = body.question_text?.trim();
  const difficulty = body.difficulty?.trim() || 'Orta';
  const studentName = body.student_name?.trim() || 'Öğrenci';
  const lessonId = body.lesson_id?.trim() || null;
  const imageUrl = body.image_url?.trim() || null;

  if (!topic || topic.length < 2 || topic.length > 100) {
    return NextResponse.json(
      { error: 'Lütfen geçerli bir konu başlığı girin (2-100 karakter).' },
      { status: 400 },
    );
  }

  if (!questionText || questionText.length < 3 || questionText.length > 2000) {
    return NextResponse.json(
      { error: 'Lütfen soru metnini girin (3-2000 karakter).' },
      { status: 400 },
    );
  }

  const allowedDifficulties = ['Kolay', 'Orta', 'Zor'];
  const finalDifficulty = allowedDifficulties.includes(difficulty)
    ? difficulty
    : 'Orta';

  const supabase = createServiceRoleClient();

  const { data: inserted, error } = await supabase
    .from('live_lesson_questions')
    .insert({
      lesson_id: lessonId,
      student_id: user.id,
      student_name: studentName.slice(0, 60),
      topic,
      difficulty: finalDifficulty,
      question_text: questionText,
      image_url: imageUrl,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error || !inserted) {
    return NextResponse.json({ error: 'Soru kaydedilemedi.' }, { status: 500 });
  }

  return NextResponse.json({ question: inserted }, { status: 201 });
}

export async function PATCH(request: Request) {
  const adminCheck = await requireAdmin(request);
  if ('error' in adminCheck) {
    return adminCheck.error;
  }

  let body: {
    id?: string;
    status?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Geçersiz istek gövdesi.' },
      { status: 400 },
    );
  }

  const { id, status } = body;

  if (!id) {
    return NextResponse.json(
      { error: 'Soru kimliği gereklidir.' },
      { status: 400 },
    );
  }

  const allowedStatuses = ['pending', 'projected', 'resolved'];
  if (!status || !allowedStatuses.includes(status)) {
    return NextResponse.json(
      { error: 'Geçersiz durum değeri.' },
      { status: 400 },
    );
  }

  const supabase = adminCheck.serviceRole;

  const { error } = await supabase
    .from('live_lesson_questions')
    .update({ status })
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { error: 'Soru durumu güncellenemedi.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
