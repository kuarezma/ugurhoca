import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';

function generateTicketCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit('exit-ticket-get', ip, {
    limit: 120,
    windowSeconds: 60,
  });
  if (rateLimit) return rateLimit;

  const url = new URL(request.url);
  const code = url.searchParams.get('code')?.trim();

  if (!code || code.length !== 6) {
    return NextResponse.json(
      { error: 'Geçersiz katılım kodu.' },
      { status: 400 },
    );
  }

  // İstek sahibi admin mi kontrol et
  const adminCheck = await requireAdmin(request);
  const isAdmin = !('error' in adminCheck);

  if (isAdmin) {
    const supabase = adminCheck.serviceRole;
    const { data: session, error: sessionErr } = await supabase
      .from('exit_ticket_sessions')
      .select('*')
      .eq('code', code)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı.' },
        { status: 404 },
      );
    }

    const { data: responses } = await supabase
      .from('exit_ticket_responses')
      .select('*')
      .eq('session_id', session.id);

    return NextResponse.json({
      session: {
        id: session.id,
        code: session.code,
        title: session.title,
        grade: session.grade,
        status: session.status,
        currentQuestionIndex: session.current_question_index,
        showDistribution: session.show_distribution,
        questions: session.questions,
        createdAt: session.created_at,
        responses: (responses || []).map((r) => ({
          id: r.id,
          sessionId: r.session_id,
          questionIndex: r.question_index,
          studentName: r.student_name,
          selectedIndex: r.selected_index,
          submittedAt: r.answered_at,
        })),
      },
      isAdmin: true,
    });
  }

  // Öğrenci / misafir için: Öğrenci İzolasyonu (site.md)
  // ASLA diğer öğrencilerin isimleri, id'leri veya bireysel yanıtları döndürülemez!
  const supabase = createServiceRoleClient();
  const { data: session, error: sessionErr } = await supabase
    .from('exit_ticket_sessions')
    .select(
      'id, code, title, grade, status, current_question_index, show_distribution, questions, created_at',
    )
    .eq('code', code)
    .single();

  if (sessionErr || !session) {
    return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 404 });
  }

  const { data: responses } = await supabase
    .from('exit_ticket_responses')
    .select('question_index, selected_index')
    .eq('session_id', session.id);

  const currentQIndex = session.current_question_index;
  const currentQResponses = (responses || []).filter(
    (r) => r.question_index === currentQIndex,
  );
  const totalResponses = currentQResponses.length;

  let optionCounts: [number, number, number, number] | undefined = undefined;
  if (session.show_distribution) {
    const counts: [number, number, number, number] = [0, 0, 0, 0];
    for (const r of currentQResponses) {
      if (r.selected_index >= 0 && r.selected_index <= 3) {
        counts[r.selected_index]++;
      }
    }
    optionCounts = counts;
  }

  return NextResponse.json({
    id: session.id,
    code: session.code,
    title: session.title,
    grade: session.grade,
    status: session.status,
    currentQuestionIndex: session.current_question_index,
    showDistribution: session.show_distribution,
    questions: session.questions,
    totalResponses,
    optionCounts,
    isAdmin: false,
  });
}

export async function POST(request: Request) {
  const adminCheck = await requireAdmin(request);
  if ('error' in adminCheck) {
    return adminCheck.error;
  }

  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit('exit-ticket-post', ip, {
    limit: 20,
    windowSeconds: 60,
  });
  if (rateLimit) return rateLimit;

  let body: {
    title?: string;
    grade?: number;
    questions?: unknown[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Geçersiz istek gövdesi.' },
      { status: 400 },
    );
  }

  const title = (body.title || 'Çıkış Bileti').trim();
  const grade = Number(body.grade) || 8;
  const questions = Array.isArray(body.questions) ? body.questions : [];

  const supabase = adminCheck.serviceRole;

  // 6 haneli benzersiz kod bul
  let code = generateTicketCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from('exit_ticket_sessions')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (!existing) break;
    code = generateTicketCode();
    attempts++;
  }

  const { data: session, error } = await supabase
    .from('exit_ticket_sessions')
    .insert({
      code,
      title,
      grade,
      status: 'lobby',
      current_question_index: 0,
      show_distribution: false,
      questions,
      created_by: adminCheck.user.id,
    })
    .select('*')
    .single();

  if (error || !session) {
    return NextResponse.json(
      { error: 'Oturum oluşturulamadı.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    session: {
      id: session.id,
      code: session.code,
      title: session.title,
      grade: session.grade,
      status: session.status,
      currentQuestionIndex: session.current_question_index,
      showDistribution: session.show_distribution,
      questions: session.questions,
      responses: [],
      createdAt: session.created_at,
    },
  });
}

export async function PATCH(request: Request) {
  const adminCheck = await requireAdmin(request);
  if ('error' in adminCheck) {
    return adminCheck.error;
  }

  let body: {
    code?: string;
    sessionId?: string;
    status?: string;
    currentQuestionIndex?: number;
    showDistribution?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Geçersiz istek gövdesi.' },
      { status: 400 },
    );
  }

  const { code, sessionId, status, currentQuestionIndex, showDistribution } =
    body;

  if (!code && !sessionId) {
    return NextResponse.json(
      { error: 'Oturum kodu veya kimliği gereklidir.' },
      { status: 400 },
    );
  }

  const supabase = adminCheck.serviceRole;

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (status !== undefined) {
    if (!['lobby', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Geçersiz durum.' }, { status: 400 });
    }
    updateData.status = status;
  }

  if (currentQuestionIndex !== undefined) {
    if (
      typeof currentQuestionIndex !== 'number' ||
      currentQuestionIndex < 0 ||
      currentQuestionIndex > 20
    ) {
      return NextResponse.json(
        { error: 'Geçersiz soru indeksi.' },
        { status: 400 },
      );
    }
    updateData.current_question_index = currentQuestionIndex;
  }

  if (showDistribution !== undefined) {
    updateData.show_distribution = Boolean(showDistribution);
  }

  let query = supabase.from('exit_ticket_sessions').update(updateData);
  if (code) {
    query = query.eq('code', code.trim());
  } else if (sessionId) {
    query = query.eq('id', sessionId);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Oturum güncellenemedi.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
