import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computeChatDisplayName } from '@/lib/chat-display-name';

/**
 * Sohbet girişi: tarayıcıdan RLS/anon yerine service role ile upsert.
 * Vercel’de SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı (sunucu only, NEXT_PUBLIC değil).
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      {
        error:
          'Sunucu yapılandırması eksik: Vercel’e SUPABASE_SERVICE_ROLE_KEY ekleyin (Settings → Environment Variables).',
      },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    full_name?: string;
    grade?: number;
    school_number?: string;
  } | null;

  const fullName = typeof body?.full_name === 'string' ? body.full_name.trim() : '';
  const grade = typeof body?.grade === 'number' ? body.grade : null;
  const schoolNumber = typeof body?.school_number === 'string' ? body.school_number.trim() : '';

  if (!grade || grade < 1 || grade > 12) {
    return NextResponse.json(
      { error: 'Sınıf 1-12 arasında olmalıdır.' },
      { status: 400 }
    );
  }
  if (!fullName) {
    return NextResponse.json({ error: 'İsim soyisim girin.' }, { status: 400 });
  }
  if (!schoolNumber) {
    return NextResponse.json({ error: 'Okul numarası girin.' }, { status: 400 });
  }

  const display_name = computeChatDisplayName(fullName);

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from('chat_users').upsert(
    {
      full_name: fullName,
      grade: grade,
      school_number: schoolNumber,
      display_name,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'full_name,grade,school_number' }
  );

  if (error) {
    console.error('chat-register upsert', error);
    return NextResponse.json(
      { error: error.message || 'Veritabanına yazılamadı. chat_users tablosunu kontrol edin.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    user: {
      full_name: fullName,
      grade: grade,
      school_number: schoolNumber,
      display_name,
    },
  });
}
