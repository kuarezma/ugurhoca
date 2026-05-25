import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import { createLogger } from '@/lib/logger';
import {
  downloadPdfForDriveUpload,
  getGoogleDriveOAuthConfig,
  getGoogleTokenExpiry,
  refreshGoogleDriveAccessToken,
  uploadWorksheetPdfToDrive,
} from '@/lib/google-drive-oauth';
import {
  buildWorksheetDescription,
  buildWorksheetStandardTitle,
  getNextWorksheetOrder,
  getWorksheetGradeValue,
  getWorksheetOutcomeLabel,
  getWorksheetTitleTopic,
} from '@/features/content/worksheet';
import type { ContentDocument } from '@/types';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';

const log = createLogger('worksheet-candidates-approve');

const approveSchema = z.object({
  candidate_id: z.string().uuid('Aday test kaydı geçersiz.'),
});

const buildWorksheetContentHref = (grade: number, learningOutcome: string) => {
  const params = new URLSearchParams({
    grade: String(grade),
    outcome: learningOutcome,
    type: 'yaprak-test',
  });

  return `/icerikler?${params.toString()}`;
};

const getAccessToken = async (request: Request) => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return (await getServerAccessToken()) ?? '';
  }

  return authHeader.slice(7).trim();
};

const requireAdmin = async (request: Request) => {
  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    return {
      error: apiError('Oturum açmanız gerekiyor.', 401, 'missing_access_token'),
    };
  }

  const supabase = createServerSupabaseClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user?.id) {
    return { error: apiError('Oturum açmanız gerekiyor.', 401, 'invalid_session') };
  }

  if (!isAdminEmail(user.email)) {
    return { error: apiError('Bu işlem için yetkiniz yok.', 403, 'not_admin') };
  }

  return { serviceRole: createServiceRoleClient(), user };
};

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = approveSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message || 'Geçersiz aday onaylama isteği.',
      400,
      'invalid_worksheet_candidate_approve',
    );
  }

  try {
    const { data: candidate, error: candidateError } = await auth.serviceRole
      .from('worksheet_candidates')
      .select('*')
      .eq('id', parsed.data.candidate_id)
      .single();

    if (candidateError || !candidate) {
      return apiError('Aday test bulunamadı.', 404, 'worksheet_candidate_not_found');
    }

    if (candidate.status === 'approved') {
      return apiError('Bu aday test zaten onaylanmış.', 409, 'worksheet_candidate_already_approved');
    }

    const { data: driveConnection, error: driveConnectionError } =
      await auth.serviceRole
        .from('google_drive_connections')
        .select('refresh_token')
        .eq('admin_user_id', auth.user.id)
        .single();

    if (driveConnectionError || !driveConnection?.refresh_token) {
      return apiError(
        'Yayınlamadan önce Google Drive hesabınızı bağlamalısınız.',
        400,
        'google_drive_not_connected',
      );
    }

    const { data: duplicateDocuments, error: duplicateError } = await auth.serviceRole
      .from('documents')
      .select('*')
      .eq('type', 'yaprak-test')
      .in(
        'file_url',
        [candidate.file_url, candidate.drive_file_url].filter(Boolean),
      );

    if (duplicateError) {
      throw duplicateError;
    }

    if ((duplicateDocuments || []).length > 0) {
      return apiError('Bu PDF zaten yaprak test olarak yayınlanmış.', 409, 'worksheet_document_duplicate');
    }

    const { data: worksheetDocuments, error: documentsError } = await auth.serviceRole
      .from('documents')
      .select('grade, title, description')
      .eq('type', 'yaprak-test');

    if (documentsError) {
      throw documentsError;
    }

    const sameOutcomeDocuments = ((worksheetDocuments || []) as ContentDocument[]).filter(
      (document) =>
        String(getWorksheetGradeValue(document.grade)) === String(candidate.grade) &&
        getWorksheetOutcomeLabel(document) === candidate.learning_outcome,
    );
    const worksheetOrder = getNextWorksheetOrder(sameOutcomeDocuments);
    const visibleDescription = candidate.subject || candidate.learning_outcome;
    const worksheetTitle = buildWorksheetStandardTitle({
      grade: candidate.grade,
      order: worksheetOrder,
      outcome: candidate.learning_outcome,
      subject: candidate.subject,
    });
    const token = await refreshGoogleDriveAccessToken({
      config: getGoogleDriveOAuthConfig(),
      refreshToken: driveConnection.refresh_token,
    });
    const pdfBytes = await downloadPdfForDriveUpload(candidate.file_url);
    const driveUpload = await uploadWorksheetPdfToDrive({
      accessToken: token.access_token,
      input: {
        candidateTitle: worksheetTitle,
        grade: candidate.grade,
        learningOutcome: candidate.learning_outcome,
        pdfBytes,
        sourceFileUrl: candidate.file_url,
        subject: candidate.subject,
      },
    });

    await auth.serviceRole
      .from('google_drive_connections')
      .update({
        expires_at: getGoogleTokenExpiry(token.expires_in),
        updated_at: new Date().toISOString(),
      })
      .eq('admin_user_id', auth.user.id);

    const documentPayload = {
      description: buildWorksheetDescription({
        description: visibleDescription,
        order: worksheetOrder,
        outcome: candidate.learning_outcome,
      }),
      downloads: 0,
      file_url: driveUpload.fileUrl,
      grade: [candidate.grade],
      is_new: true,
      title: worksheetTitle,
      type: 'yaprak-test',
    };

    const { data: document, error: documentError } = await auth.serviceRole
      .from('documents')
      .insert([documentPayload])
      .select('*')
      .single();

    if (documentError) {
      throw documentError;
    }

    const { data: gradeStudents, error: gradeStudentsError } = await auth.serviceRole
      .from('profiles')
      .select('id, name, email, grade')
      .eq('grade', candidate.grade);

    if (gradeStudentsError) {
      throw gradeStudentsError;
    }

    const recipientStudents = (gradeStudents || []).filter(
      (student) => student.id && !isAdminEmail(student.email),
    );
    const worksheetHref = buildWorksheetContentHref(
      candidate.grade,
      candidate.learning_outcome,
    );
    const notificationTopic = getWorksheetTitleTopic({
      outcome: candidate.learning_outcome,
      subject: candidate.subject,
    });
    let notifiedStudents = 0;
    let sharedDocuments = 0;
    let notificationWarning: string | null = null;

    if (recipientStudents.length > 0) {
      const createdAt = new Date().toISOString();

      try {
        const { error: sharedDocumentError } = await auth.serviceRole
          .from('shared_documents')
          .insert(
            recipientStudents.map((student) => ({
              created_at: createdAt,
              document_id: document.id,
              document_title: document.title,
              document_type: document.type,
              file_url: document.file_url,
              is_read: false,
              student_email: student.email || null,
              student_id: student.id,
              student_name: student.name || null,
            })),
          );

        if (sharedDocumentError) {
          throw sharedDocumentError;
        }

        sharedDocuments = recipientStudents.length;

        const { error: notificationError } = await auth.serviceRole
          .from('notifications')
          .insert(
            recipientStudents.map((student) => ({
              created_at: createdAt,
              is_read: false,
              message: `${notificationTopic} konusu için yeni yaprak test yayınlandı.`,
              metadata: {
                document_id: document.id,
                file_url: document.file_url,
                href: worksheetHref,
                learning_outcome: candidate.learning_outcome,
              },
              title: document.title,
              type: 'document',
              user_id: student.id,
            })),
          );

        if (notificationError) {
          throw notificationError;
        }

        notifiedStudents = recipientStudents.length;
      } catch (notificationError) {
        notificationWarning =
          'Yaprak test yayınlandı ancak öğrenci bildirimi/paylaşımı tamamlanamadı.';
        log.error('Worksheet notification failed after publish', {
          candidateId: candidate.id,
          documentId: document.id,
          error: notificationError,
        });
      }
    }

    const { data: updatedCandidate, error: updateError } = await auth.serviceRole
      .from('worksheet_candidates')
      .update({
        rejection_reason: null,
        drive_file_id: driveUpload.fileId,
        drive_file_url: driveUpload.fileUrl,
        reviewed_at: new Date().toISOString(),
        reviewed_by: auth.user.id,
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', candidate.id)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    return apiOk({
      candidate: updatedCandidate,
      document,
      notificationWarning,
      notifiedStudents,
      sharedDocuments,
    });
  } catch (error) {
    log.error('Worksheet candidate approve failed', error);
    return apiError(
      'Aday test yayınlanırken sunucu hatası oluştu.',
      500,
      'worksheet_candidate_approve_failed',
    );
  }
}
