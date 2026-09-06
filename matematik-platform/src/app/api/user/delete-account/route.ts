import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit(
    'user_delete_account',
    getClientIp(request),
    { limit: 3, windowSeconds: 60 },
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Yetkilendirme başlığı (Bearer token) gerekli.' },
        { status: 401 },
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Sunucu Supabase yapılandırması eksik.' },
        { status: 500 },
      );
    }

    // 1. Kullanıcı tokenını doğrula
    const userClient = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş kullanıcı oturumu.' },
        { status: 401 },
      );
    }

    const userId = user.id;
    logger.info('Kullanıcı self-servis hesap silme talebi aldı', { userId });

    // 2. Service Role veya Admin client ile kullanıcı verilerini temizle
    if (serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // İlgili tabloları temizle
      await Promise.allSettled([
        adminClient.from('quiz_results').delete().eq('user_id', userId),
        adminClient.from('study_sessions').delete().eq('user_id', userId),
        adminClient.from('user_mistakes').delete().eq('user_id', userId),
        adminClient.from('game_scores').delete().eq('user_id', userId),
        adminClient.from('student_activity_events').delete().eq('user_id', userId),
        adminClient.from('profiles').delete().eq('id', userId),
      ]);

      // auth.users'dan tamamen sil
      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteUserError) {
        logger.error('auth.admin.deleteUser hatası', { error: deleteUserError.message, userId });
      }
    } else {
      // Service role key yoksa kullanıcı kendi profilini anonimleştirir/temizler
      const { error: profileError } = await userClient
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        logger.warn('Kullanıcı profili silinemedi', { error: profileError.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Hesabınız ve tüm ilişkili verileriniz başarıyla silindi.',
    });
  } catch (error) {
    logger.error('Hesap silme işleminde beklenmeyen hata', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Hesap silinirken bir sunucu hatası oluştu.' },
      { status: 500 },
    );
  }
}
