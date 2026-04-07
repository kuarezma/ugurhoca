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
    tc_number?: string;
    full_name?: string;
  } | null;

  const tc =
    typeof body?.tc_number === 'string'
      ? body.tc_number.replace(/\D/g, '').slice(0, 11)
      : '';
  const fullName =
    typeof body?.full_name === 'string' ? body.full_name.trim() : '';

  if (tc.length !== 11) {
    return NextResponse.json(
      { error: 'TC kimlik numarası 11 haneli olmalıdır.' },
      { status: 400 }
    );
  }
  if (!fullName) {
    return NextResponse.json({ error: 'İsim soyisim girin.' }, { status: 400 });
  }

  const display_name = computeChatDisplayName(fullName);

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from('chat_users').upsert(
    {
      tc_number: tc,
      full_name: fullName,
      display_name,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'tc_number' }
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
      tc_number: tc,
      full_name: fullName,
      display_name,
    },
  });
}
