import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createLogger } from '@/lib/logger';
import { forgotPasswordSchema } from '@/lib/route-schemas';
import { enforceRateLimit } from '@/lib/rate-limit';
import { normalizeFullNameForMatch } from '@/lib/student-identity';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getResendApiKey } from '@/lib/env.server';

const log = createLogger('api:auth:forgot-password');

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
    const rateLimited = await enforceRateLimit('forgot-password', ip, {
      limit: 5,
      windowSeconds: 60,
    });
    if (rateLimited) return rateLimited;

    const body = await request.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Geçersiz istek.' },
        { status: 400 },
      );
    }

    const { identifier } = parsed.data;
    const isEmailInput = identifier.includes('@');

    let adminClient: ReturnType<typeof createServiceRoleClient>;
    try {
      adminClient = createServiceRoleClient();
    } catch (e) {
      log.error('Supabase admin client error', e);
      return NextResponse.json(
        { error: 'Sunucu yapılandırması eksik.' },
        { status: 500 },
      );
    }

    let targetEmail = '';
    let studentName = '';
    let studentId = '';

    if (isEmailInput) {
      targetEmail = identifier.toLowerCase().trim();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id, name, email')
        .eq('email', targetEmail)
        .maybeSingle();

      if (profile) {
        studentName = profile.name || '';
        studentId = profile.id;
      }
    } else {
      const displayName = identifier.trim();
      studentName = displayName;
      const nameNormalized = normalizeFullNameForMatch(displayName);

      const { data: rpcMatches, error: rpcError } = await adminClient.rpc(
        'find_login_email',
        {
          p_name_normalized: nameNormalized,
          p_display_name: displayName,
        },
      );

      if (rpcError) {
        log.error('find_login_email RPC error', rpcError);
      }

      const matches = (rpcMatches ?? []) as Array<{ email: string; id?: string }>;
      if (matches.length > 0) {
        targetEmail = matches[0].email;
      } else {
        const { data: profileMatch } = await adminClient
          .from('profiles')
          .select('id, name, email')
          .ilike('name', `%${displayName}%`)
          .limit(1)
          .maybeSingle();

        if (profileMatch) {
          targetEmail = profileMatch.email || '';
          studentName = profileMatch.name || displayName;
          studentId = profileMatch.id;
        }
      }
    }

    if (!targetEmail) {
      return NextResponse.json({
        success: true,
        mode: 'not_found',
        message:
          'Kayıtlı bir hesap bulunamadı. Lütfen adınızı ve soyadınızı tam olarak girdiğinizden emin olun veya öğretmeninize danışın.',
      });
    }

    const isLocalStudentEmail = targetEmail.endsWith('@ugurhoca.local');

    if (isLocalStudentEmail) {
      const resendApiKey = getResendApiKey();
      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          const adminEmail = process.env.ADMIN_EMAIL || 'ugur@ugurhoca.com';
          await resend.emails.send({
            from: 'Uğur Hoca Platformu <noreply@resend.dev>',
            to: adminEmail,
            subject: `🔑 Şifre Sıfırlama Talebi: ${studentName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #4f46e5; margin-top: 0;">Şifre Sıfırlama Talebi</h2>
                <p><strong>Öğrenci:</strong> ${studentName}</p>
                <p><strong>Sistem E-postası:</strong> ${targetEmail}</p>
                ${studentId ? `<p><strong>Öğrenci ID:</strong> ${studentId}</p>` : ''}
                <p>Öğrenciniz giriş şifresini unuttuğunu bildirdi. Admin panelinden tek tıkla öğrencinin şifresini sıfırlayabilirsiniz.</p>
                <div style="margin-top: 24px;">
                  <a href="https://ugurhoca.com/admin" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Admin Paneline Git</a>
                </div>
              </div>
            `,
          });
          log.info('Admin notified via Resend for password reset', { studentName, targetEmail });
        } catch (mailErr) {
          log.warn('Resend notification failed', { error: String(mailErr) });
        }
      }

      return NextResponse.json({
        success: true,
        mode: 'admin_notified',
        message:
          'Şifre sıfırlama talebiniz Uğur Hoca\'ya başarıyla iletildi. Öğretmeniniz şifrenizi güncellediğinde giriş yapabilirsiniz.',
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ugurhoca.com';
    const { error: resetError } = await adminClient.auth.resetPasswordForEmail(
      targetEmail,
      {
        redirectTo: `${siteUrl}/sifre-sifirla`,
      },
    );

    if (resetError) {
      log.error('resetPasswordForEmail error', resetError);
      return NextResponse.json(
        { error: 'Şifre sıfırlama bağlantısı gönderilemedi: ' + resetError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      mode: 'email_sent',
      message:
        'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.',
    });
  } catch (error) {
    log.error('Unexpected error in forgot-password', error);
    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu.' },
      { status: 500 },
    );
  }
}
