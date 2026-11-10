import { getClientSession } from '@/lib/auth-client';
import { supabase } from '@/lib/supabase/client';
import { toStoredGrade } from '@/lib/grade';
import {
  buildWorksheetDescription,
  DEFAULT_WORKSHEET_OUTCOME,
  getWorksheetOrder,
  isWorksheetType,
  prepareWorksheetDocumentPayload,
} from '@/features/content/worksheet';
import type {
  AdminAnnouncement,
  AdminAssignment,
  AdminDocument,
  AdminSharedDocument,
  AdminUser,
} from '@/features/admin/types';
import type { RouteErrorLike } from './shared';

const requestAdminAnnouncementRoute = async <TResult>(
  method: 'POST' | 'PATCH' | 'DELETE',
  body: Record<string, unknown>,
) => {
  const session = await getClientSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch('/api/admin-announcements', {
    body: JSON.stringify(body),
    credentials: 'same-origin',
    headers,
    method,
  });

  const payload = (await response.json().catch(() => null)) as {
    data?: TResult;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    return {
      data: null as TResult | null,
      error: {
        message:
          payload?.error?.message || 'Duyuru işlemi sırasında bir hata oluştu.',
      } as RouteErrorLike,
    };
  }

  return {
    data: (payload?.data as TResult | undefined) ?? null,
    error: null,
  };
};

export const createAdminAssignment = async ({
  description,
  due_date,
  grade,
  student_id,
  title,
}: {
  description?: string | null;
  due_date?: string | null;
  grade?: AdminUser['grade'] | null;
  student_id?: string | null;
  title?: string | null;
}) => {
  const { data, error } = await supabase
    .from('assignments')
    .insert([
      {
        description,
        due_date: due_date || null,
        grade: grade == null ? null : toStoredGrade(grade),
        student_id: student_id || null,
        title,
      },
    ])
    .select()
    .single();

  if (!error && student_id) {
    await supabase.from('notifications').insert([
      {
        message: `"${title}" başlıklı yeni bir ödeviniz var.`,
        title: 'Yeni Ödev',
        type: 'assignment',
        user_id: student_id,
      },
    ]);
  }

  return { data: (data as AdminAssignment | null) ?? null, error };
};

export const createAdminAnnouncement = async ({
  announcement,
  recipientUserIds,
}: {
  announcement: {
    content?: string | null;
    image_url?: string;
    image_urls?: string[];
    link_url?: string;
    title?: string | null;
  };
  recipientUserIds: string[];
}) => {
  return requestAdminAnnouncementRoute<AdminAnnouncement>('POST', {
    announcement,
    recipient_user_ids: recipientUserIds,
  });
};

export const updateAdminAnnouncement = async (
  announcementId: string,
  updates: {
    content?: string | null;
    image_url?: string;
    image_urls?: string[];
    link_url?: string;
    title?: string | null;
  },
) => {
  return requestAdminAnnouncementRoute<AdminAnnouncement>('PATCH', {
    announcement_id: announcementId,
    updates,
  });
};

export const createAdminDocument = async (
  document: Record<string, unknown> & {
    answer_key_text?: string | null;
    description?: string | null;
    downloads?: number;
    file_url?: string | null;
    grade?: AdminDocument['grade'];
    learning_outcome?: string | null;
    solution_url?: string | null;
    title?: string | null;
    type?: string | null;
    video_url?: string | null;
    worksheet_order?: number | null;
  },
) => {
  const nextDocument = await prepareWorksheetDocumentPayload(document);
  const {
    learning_outcome: _learning_outcome,
    worksheet_order: _worksheet_order,
    ...persistedDocument
  } = nextDocument;
  const { data, error } = await supabase
    .from('documents')
    .insert([persistedDocument])
    .select()
    .single();

  return { data: (data as AdminDocument | null) ?? null, error };
};

export const updateAdminDocument = async (
  documentId: string,
  updates: {
    answer_key_text?: string | null;
    description?: string | null;
    file_url?: string | null;
    grade?: AdminDocument['grade'];
    learning_outcome?: string | null;
    solution_url?: string | null;
    title?: string | null;
    type?: string | null;
    video_url?: string | null;
    worksheet_order?: number | null;
  },
) => {
  const nextUpdates = isWorksheetType(updates.type)
    ? {
        ...updates,
        description: buildWorksheetDescription({
          description: updates.description,
          order: getWorksheetOrder({
            description: updates.description || null,
            title: updates.title || '',
          }),
          outcome:
            updates.learning_outcome?.trim() || DEFAULT_WORKSHEET_OUTCOME,
        }),
      }
    : updates;
  const {
    learning_outcome: _learning_outcome,
    worksheet_order: _worksheet_order,
    ...persistedUpdates
  } = nextUpdates;

  return supabase
    .from('documents')
    .update(persistedUpdates)
    .eq('id', documentId);
};

export const deleteAdminEntity = async (
  type: 'assignment' | 'shared_document' | 'announcement' | 'quiz' | 'document',
  id: string,
) => {
  if (type === 'assignment') {
    return supabase.from('assignments').delete().eq('id', id);
  }

  if (type === 'shared_document') {
    return supabase.from('shared_documents').delete().eq('id', id);
  }

  if (type === 'announcement') {
    return requestAdminAnnouncementRoute<{ ok: true }>('DELETE', {
      announcement_id: id,
    });
  }

  if (type === 'quiz') {
    return supabase.from('quizzes').delete().eq('id', id);
  }

  return supabase.from('documents').delete().eq('id', id);
};

export const updateAdminAssignment = async (
  assignmentId: string,
  updates: {
    description?: string | null;
    title?: string | null;
  },
) => {
  return supabase.from('assignments').update(updates).eq('id', assignmentId);
};

export const updateAdminSharedDocument = async (
  sharedDocumentId: string,
  updates: {
    document_title?: string | null;
    file_url?: string | null;
  },
) => {
  return supabase
    .from('shared_documents')
    .update(updates)
    .eq('id', sharedDocumentId);
};

export const createAdminSharedDocument = async ({
  document_id,
  document_title,
  document_type,
  file_url,
  student_email,
  student_id,
  student_name,
}: {
  document_id?: string | null;
  document_title?: string | null;
  document_type?: string | null;
  file_url?: string | null;
  student_email?: string | null;
  student_id?: string | null;
  student_name?: string | null;
}) => {
  const { data, error } = await supabase
    .from('shared_documents')
    .insert([
      {
        document_id,
        document_title,
        document_type,
        file_url,
        student_email,
        student_id,
        student_name,
      },
    ])
    .select()
    .single();

  if (!error && student_id) {
    await supabase.from('notifications').insert([
      {
        message: `"${document_title}" başlıklı bir belge gönderildi.`,
        title: 'Yeni Belge',
        type: 'document',
        user_id: student_id,
      },
    ]);
  }

  return { data: (data as AdminSharedDocument | null) ?? null, error };
};
