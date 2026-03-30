import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Session kontrolü
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
    }

    // Admin kontrolü
    const adminEmails = ['admin@ugurhoca.com', 'admin@matematiklab.com'];
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Yetkiniz yok.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const { student_id, student_name, title, message, sender_id, sender_name } = body || {};

    if (!student_id || (!message?.trim() && !title?.trim())) {
      return NextResponse.json({ error: 'Eksik alanlar.' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const notification = {
      user_id: student_id,
      title: title?.trim() || 'Uğur Hoca\'dan Mesaj',
      message: message?.trim(),
      type: 'admin-message',
      is_read: false,
      metadata: {
        sender_id: sender_id || 'admin',
        sender_name: sender_name || 'Uğur Hoca',
        student_name,
        ip,
        user_agent: userAgent,
        sent_at: new Date().toISOString(),
      },
    };

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.from('notifications').insert(notification);

    if (error) {
      console.error('Admin message error:', error);
      return NextResponse.json({ error: 'Mesaj gönderilemedi.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin message route error:', err);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
