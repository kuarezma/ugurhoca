import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RETENTION_DAYS = 180;

const getClientIp = (request: Request) => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  if (realIp) return realIp;
  return 'unknown';
};

const parseJson = (value: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase ayarları eksik.' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const body = await request.json().catch(() => null);
  const senderId = body?.sender_id as string | undefined;
  const senderName = body?.sender_name as string | undefined;
  const senderEmail = body?.sender_email as string | undefined;
  const text = String(body?.text || '').trim();
  const attachments = Array.isArray(body?.attachments) ? body.attachments : [];

  if (!senderId || (!text && attachments.length === 0)) {
    return NextResponse.json({ error: 'Mesaj içeriği eksik.' }, { status: 400 });
  }

  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'admin@ugurhoca.com')
    .single();

  const adminId = admin?.id || 'admin-1';

  const cutoffIso = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('notifications')
    .delete()
    .in('type', ['message', 'moderation', 'report'])
    .lt('created_at', cutoffIso);

  const { data: moderationRows } = await supabase
    .from('notifications')
    .select('message,created_at')
    .eq('user_id', adminId)
    .eq('type', 'moderation')
    .order('created_at', { ascending: false })
    .limit(200);

  const activeAction = (moderationRows || [])
    .map((row) => parseJson(row.message))
    .find((entry) => {
      if (!entry || entry.sender_id !== senderId) return false;
      if (entry.action === 'block') return true;
      if (entry.action === 'mute') {
        return entry.expires_at && new Date(entry.expires_at).getTime() > Date.now();
      }
      return false;
    });

  if (activeAction?.action === 'block') {
    return NextResponse.json({ error: 'Mesaj gönderim hakkınız kaldırıldı.' }, { status: 403 });
  }

  if (activeAction?.action === 'mute') {
    return NextResponse.json({ error: 'Geçici olarak mesaj gönderemezsiniz.' }, { status: 403 });
  }

  const payload = {
    sender_id: senderId,
    sender_name: senderName || 'Öğrenci',
    sender_email: senderEmail || '',
    text,
    attachments,
    created_at: new Date().toISOString(),
    metadata: {
      ip: getClientIp(request),
      user_agent: request.headers.get('user-agent') || 'unknown',
    },
  };

  const { error: adminInsertError } = await supabase.from('notifications').insert([
    {
      user_id: adminId,
      title: `${senderName || 'Bir öğrenci'} sana yazdı`,
      message: JSON.stringify(payload),
      type: 'message',
    },
  ]);

  if (adminInsertError) {
    return NextResponse.json({ error: adminInsertError.message }, { status: 500 });
  }

  await supabase.from('notifications').insert([
    {
      user_id: senderId,
      title: 'Mesajın teslim edildi',
      message: 'Mesajın Uğur Hoca’ya ulaştı.',
      type: 'message',
    },
  ]);

  return NextResponse.json({ ok: true });
}
