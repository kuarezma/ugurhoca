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

      // Kullanıcıya ait veri tutan tüm tablolar. Bazıları artık DB seviyesinde
      // ON DELETE CASCADE ile de korunuyor (bkz. migration
      // 20260907090000_cascade_delete_user_owned_tables.sql) — buradaki
      // açık silme, o migration henüz uygulanmamış bir ortamda da hesap
      // silmenin eksiksiz çalışmasını garanti eden bağımsız bir savunma
      // katmanıdır. Önce veri, sonra auth hesabı silinir: veri silme
      // başarısız olursa hesap silinmez, aksi halde sahipsiz PII kalır ve
      // kullanıcı bir daha talebi tekrar edemez.
      const deletions: Array<{ table: string; promise: PromiseLike<{ error: { message: string } | null }> }> = [
        { table: 'assignment_submissions', promise: adminClient.from('assignment_submissions').delete().eq('student_id', userId) },
        { table: 'game_scores', promise: adminClient.from('game_scores').delete().eq('user_id', userId) },
        { table: 'quiz_results', promise: adminClient.from('quiz_results').delete().eq('user_id', userId) },
        { table: 'student_activity_events', promise: adminClient.from('student_activity_events').delete().eq('user_id', userId) },
        { table: 'student_group_members', promise: adminClient.from('student_group_members').delete().eq('user_id', userId) },
        { table: 'study_goals', promise: adminClient.from('study_goals').delete().eq('user_id', userId) },
        { table: 'study_sessions', promise: adminClient.from('study_sessions').delete().eq('user_id', userId) },
        { table: 'user_badges', promise: adminClient.from('user_badges').delete().eq('user_id', userId) },
        { table: 'user_mistakes', promise: adminClient.from('user_mistakes').delete().eq('user_id', userId) },
        { table: 'user_progress', promise: adminClient.from('user_progress').delete().eq('user_id', userId) },
        { table: 'profiles', promise: adminClient.from('profiles').delete().eq('id', userId) },
      ];

      const results = await Promise.allSettled(deletions.map((d) => d.promise));
      const failures = results
        .map((result, index) => ({ result, table: deletions[index].table }))
        .filter(
          ({ result }) =>
            result.status === 'rejected' ||
            (result.status === 'fulfilled' && result.value.error),
        );

      if (failures.length > 0) {
        logger.error('Hesap verisi silinirken bazı tablolar başarısız oldu', {
          userId,
          failedTables: failures.map(({ table, result }) => ({
            table,
            error:
              result.status === 'rejected'
                ? String(result.reason)
                : result.value.error?.message,
          })),
        });
        return NextResponse.json(
          {
            error:
              'Verileriniz tam olarak silinemedi. Hesabınız güvenlik amacıyla silinmedi; lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.',
          },
          { status: 500 },
        );
      }

      // Veri temizliği tamamlandı — şimdi auth.users'dan tamamen sil.
      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteUserError) {
        logger.error('auth.admin.deleteUser hatası', { error: deleteUserError.message, userId });
        return NextResponse.json(
          {
            error:
              'Verileriniz silindi ancak hesabınız kapatılamadı. Lütfen destek ekibiyle iletişime geçin.',
          },
          { status: 500 },
        );
      }
    } else {
      // Service role key yoksa kullanıcı kendi profilini anonimleştirir/temizler
      const { error: profileError } = await userClient
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        logger.error('Kullanıcı profili silinemedi', { error: profileError.message, userId });
        return NextResponse.json(
          { error: 'Profiliniz silinemedi. Lütfen tekrar deneyin.' },
          { status: 500 },
        );
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
