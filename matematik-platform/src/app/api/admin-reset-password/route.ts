import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { createLogger } from '@/lib/logger';
import { adminResetPasswordSchema } from '@/lib/route-schemas';
import { enforceRateLimit } from '@/lib/rate-limit';

const log = createLogger('admin-reset-password');

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const { user, serviceRole: adminClient } = auth;

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

    const { data: updatedUser, error: updateError } =
      await adminClient.auth.admin.updateUserById(student_id, {
        password: new_password,
      });

    if (updateError) {
      log.error('Admin password update error', updateError, {
        student_id,
      });
      return NextResponse.json(
        { error: 'Şifre güncellenemedi. Lütfen daha sonra tekrar deneyin.' },
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
    return NextResponse.json(
      { error: 'İşlem şu anda tamamlanamadı. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 },
    );
  }
}
