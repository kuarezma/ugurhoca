import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin';
import { createLogger } from '@/lib/logger';
import { adminResetPasswordSchema } from '@/lib/route-schemas';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/rate-limit';

const log = createLogger('admin-reset-password');

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor.' },
        { status: 401 },
      );
    }

    const authSupabase = createServerSupabaseClient(accessToken);
    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser(accessToken);

    if (userError || !user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor.' },
        { status: 401 },
      );
    }

    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Yetkiniz yok.' }, { status: 403 });
    }

    const limited = await enforceRateLimit('admin-reset-password', user.id, {
      limit: 10,
      windowSeconds: 60,
    });
    if (limited) {
      return limited;
    }

    const body = await request.json().catch(() => null);
    const parsed = adminResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message || 'Geçersiz şifre sıfırlama isteği.',
        },
        { status: 400 },
      );
    }

    const { student_id, new_password } = parsed.data;

    let adminClient: ReturnType<typeof createServiceRoleClient>;
    try {
      adminClient = createServiceRoleClient();
    } catch (serviceError) {
      log.error('Service role client oluşturulamadı', serviceError);
      return NextResponse.json(
        {
          error: 'Sunucu yapılandırması eksik (SUPABASE_SERVICE_ROLE_KEY).',
        },
        { status: 500 },
      );
    }

    const { data: updatedUser, error: updateError } =
      await adminClient.auth.admin.updateUserById(student_id, {
        password: new_password,
      });

    if (updateError) {
      log.error('Admin password update error', {
        student_id,
        error: updateError.message,
      });
      return NextResponse.json(
        { error: updateError.message || 'Şifre güncellenemedi.' },
        { status: 500 },
      );
    }

    log.info('Admin successfully reset student password', {
      admin_email: user.email,
      student_id,
      updated_user_id: updatedUser?.user?.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Öğrenci şifresi başarıyla güncellendi.',
    });
  } catch (err) {
    log.error('Admin reset password unexpected error', err);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
