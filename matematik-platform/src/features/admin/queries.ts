import type { Session } from '@supabase/supabase-js';
import { ADMIN_EMAIL, isAdminEmail } from '@/lib/admin';
import { normalizeFullNameForMatch } from '@/lib/student-identity';
import { getClientSession } from '@/lib/auth-client';
import { supabase } from '@/lib/supabase/client';
import {
  buildWorksheetDescription,
  DEFAULT_WORKSHEET_OUTCOME,
  getWorksheetGradeValue,
  getWorksheetOrder,
  getWorksheetOutcomeLabel,
  getWorksheetVisibleDescription,
  isWorksheetType,
  prepareWorksheetDocumentPayload,
} from '@/features/content/worksheet';
import type {
  AdminAnnouncement,
  AdminAssignment,
  AdminChatRoom,
  AdminChatMessage,
  AdminDashboardData,
  AdminDocument,
  AdminNotification,
  AdminQuiz,
  AdminQuizQuestion,
  AdminSharedDocument,
  AdminSubmission,
  AdminUser,
  ModerationPayload,
} from '@/features/admin/types';

type ResolveAdminAuthResult =
  | { status: 'ok'; session: Session; user: AdminUser }
  | { status: 'unauthenticated' | 'unauthorized' };

type RouteErrorLike = {
  message: string;
};

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

  const payload = (await response.json().catch(() => null)) as
    | { data?: TResult; error?: { message?: string } }
    | null;

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

export const resolveAdminAuth = async (): Promise<ResolveAdminAuthResult> => {
  const session = await getClientSession();

  if (!session?.user) {
    return { status: 'unauthenticated' };
  }

  if (!isAdminEmail(session.user.email)) {
    return { status: 'unauthorized' };
  }

  return {
    session,
    status: 'ok',
    user: {
      id: session.user.id,
      name: 'Uğur Hoca',
      email: session.user.email ?? ADMIN_EMAIL,
      grade: 5,
      isAdmin: true,
    },
  };
};

export const refreshAdminUsers = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (data || []) as AdminUser[];
};

export const loadAdminDashboardData = async (
  retentionDays: number,
  adminUserId?: string | null,
): Promise<AdminDashboardData> => {
  const retentionCutoff = new Date(
    Date.now() - retentionDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  await supabase
    .from('notifications')
    .delete()
    .in('type', ['message', 'moderation', 'report'])
    .lt('created_at', retentionCutoff);

  const [
    announcementsRes,
    documentsRes,
    allUsersRes,
    privateStudentsRes,
    assignmentsRes,
    sharedDocsRes,
    quizzesRes,
    chatRoomsRes,
    notificationsRes,
  ] = await Promise.all([
    supabase.from('announcements').select('*').order('created_at', { ascending: false }),
    supabase.from('documents').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('is_private_student', true),
    supabase.from('assignments').select('*').order('created_at', { ascending: false }),
    supabase.from('shared_documents').select('*').order('created_at', { ascending: false }),
    supabase.from('quizzes').select('*').order('created_at', { ascending: false }),
    supabase.from('chat_rooms').select('*').order('created_at', { ascending: false }),
    adminUserId
      ? supabase
          .from('notifications')
          .select('*')
          .eq('user_id', adminUserId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  const chatRooms =
    chatRoomsRes.error &&
    chatRoomsRes.error.message.includes("Could not find the table 'public.chat_rooms'")
      ? []
      : (chatRoomsRes.data || []);

  return {
    allUsers: (allUsersRes.data || []) as AdminUser[],
    announcements: ((announcementsRes.data || []) as AdminDashboardData['announcements']).sort(
      (left, right) =>
        new Date(right.created_at || 0).getTime() -
        new Date(left.created_at || 0).getTime(),
    ),
    assignments: (assignmentsRes.data || []) as AdminDashboardData['assignments'],
    chatRooms: chatRooms as AdminDashboardData['chatRooms'],
    documents: (documentsRes.data || []) as AdminDashboardData['documents'],
    notifications: (notificationsRes.data || []) as AdminDashboardData['notifications'],
    privateStudents: (privateStudentsRes.data || []) as AdminDashboardData['privateStudents'],
    quizzes: (quizzesRes.data || []) as AdminDashboardData['quizzes'],
    sharedDocs: (sharedDocsRes.data || []) as AdminDashboardData['sharedDocs'],
  };
};

export const loadAdminAssignmentSubmissions = async (assignmentId: string) => {
  const { data } = await supabase
    .from('assignment_submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false });

  return (data || []) as AdminSubmission[];
};

export const updateAdminSubmissionReview = async (
  submissionId: string,
  grade: number,
  feedback: string,
) => {
  return supabase
    .from('assignment_submissions')
    .update({
      feedback,
      grade,
      status: 'reviewed',
    })
    .eq('id', submissionId);
};

export const loadAdminChatMessages = async (roomId: string) => {
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('room_id', roomId)
    .order('ts', { ascending: true });

  return (data || []) as AdminChatMessage[];
};

export const sendAdminChatMessage = async (roomId: string, text: string) => {
  return supabase.from('chat_messages').insert([
    {
      room_id: roomId,
      sender_tc: 'admin',
      display_name: 'Uğur Hoca',
      text: text.trim(),
      ts: Date.now(),
    },
  ]);
};

export const markAdminNotificationAsRead = async (
  notification: AdminNotification,
  senderId?: string,
) => {
  if (!notification.is_read) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification.id);
  }

  if (notification.type === 'message' && senderId) {
    await supabase.from('notifications').insert([
      {
        user_id: senderId,
        title: 'Uğur Hoca mesajını gördü',
        message: '',
        type: 'message-read',
      },
    ]);
  }
};

type AdminModerationAction = 'block' | 'mute' | 'report';

export const applyAdminModerationAction = async ({
  action,
  adminUserId,
  reason,
  selectedNotificationId,
  senderEmail,
  senderId,
  senderName,
}: {
  action: AdminModerationAction;
  adminUserId: string;
  reason: string;
  selectedNotificationId: string;
  senderEmail?: string;
  senderId: string;
  senderName?: string;
}) => {
  const moderationPayload: ModerationPayload = {
    action,
    created_at: new Date().toISOString(),
    expires_at:
      action === 'mute'
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    reason,
    sender_email: senderEmail || '',
    sender_id: senderId,
    sender_name: senderName || '',
    source_notification_id: selectedNotificationId,
  };

  await supabase.from('notifications').insert([
    {
      user_id: adminUserId,
      title:
        action === 'report'
          ? 'Mesaj raporlandı'
          : action === 'mute'
            ? 'Öğrenci sessize alındı'
            : 'Öğrenci engellendi',
      message: JSON.stringify(moderationPayload),
      type: action === 'report' ? 'report' : 'moderation',
    },
  ]);

  if (action !== 'report') {
    await supabase.from('notifications').insert([
      {
        user_id: senderId,
        title:
          action === 'mute'
            ? 'Mesaj gönderimi geçici kapatıldı'
            : 'Mesaj gönderiminiz engellendi',
        message:
          action === 'mute'
            ? "7 gün boyunca Uğur Hoca'ya mesaj gönderemezsiniz."
            : 'Mesaj gönderim hakkınız kaldırıldı.',
        type: 'message',
      },
    ]);
  }
};

export const sendAdminNotificationReply = async (
  recipientId: string,
  text: string,
) => {
  return supabase.from('notifications').insert([
    {
      user_id: recipientId,
      title: "Uğur Hoca yazdı",
      message: text.trim(),
      type: 'admin-message',
    },
  ]);
};

export const deleteAdminNotification = async (notificationId: string) => {
  return supabase.from('notifications').delete().eq('id', notificationId);
};

export const deleteAdminChatRoom = async (roomId: AdminChatRoom['id']) => {
  return supabase.from('chat_rooms').delete().eq('id', roomId);
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
        grade: grade || null,
        student_id: student_id || null,
        title,
      },
    ])
    .select()
    .single();

  if (!error && student_id) {
    await supabase.from('notifications').insert([
      {
        user_id: student_id,
        title: 'Yeni Ödev',
        message: `"${title}" başlıklı yeni bir ödeviniz var.`,
        type: 'assignment',
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
  } =
    nextDocument;
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
          outcome: updates.learning_outcome?.trim() || DEFAULT_WORKSHEET_OUTCOME,
        }),
      }
    : updates;
  const {
    learning_outcome: _learning_outcome,
    worksheet_order: _worksheet_order,
    ...persistedUpdates
  } = nextUpdates;

  return supabase.from('documents').update(persistedUpdates).eq('id', documentId);
};

const gradesAreEqual = (
  left?: AdminDocument['grade'],
  right?: AdminDocument['grade'],
) => JSON.stringify(left ?? []) === JSON.stringify(right ?? []);

export const migrateLegacyWorksheetDocuments = async (
  documents: AdminDocument[],
) => {
  const worksheetDocuments = documents.filter((document) =>
    isWorksheetType(document.type),
  );

  let updated = 0;

  for (const document of worksheetDocuments) {
    const grade = getWorksheetGradeValue(document.grade);
    const outcome = getWorksheetOutcomeLabel(document);
    const nextDescription = buildWorksheetDescription({
      description: getWorksheetVisibleDescription(document),
      order: getWorksheetOrder(document),
      outcome,
    });
    const nextGrade = grade ? [grade] : document.grade;

    if (
      nextDescription === (document.description || '') &&
      gradesAreEqual(nextGrade, document.grade)
    ) {
      continue;
    }

    const { error } = await supabase
      .from('documents')
      .update({
        description: nextDescription,
        grade: nextGrade,
      })
      .eq('id', document.id);

    if (!error) {
      updated += 1;
    }
  }

  return updated;
};

export const createAdminQuiz = async (quiz: {
  description?: string | null;
  difficulty?: string | null;
  grade?: number | null;
  is_active?: boolean;
  time_limit?: number | null;
  title?: string | null;
}) => {
  const { data, error } = await supabase
    .from('quizzes')
    .insert([
      {
        ...quiz,
        is_active: quiz.is_active ?? true,
      },
    ])
    .select()
    .single();

  return { data: (data as AdminQuiz | null) ?? null, error };
};

export const updateAdminQuiz = async (
  quizId: string,
  updates: {
    description?: string | null;
    difficulty?: string | null;
    grade?: number;
    is_active?: boolean;
    time_limit?: number | null;
    title?: string | null;
  },
) => {
  return supabase.from('quizzes').update(updates).eq('id', quizId);
};

export const createAdminQuizQuestion = async (question: {
  correct_index?: number;
  explanation?: string | null;
  options?: string[];
  question?: string | null;
  question_order: number;
  quiz_id: string;
}) => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert([question])
    .select()
    .single();

  return { data: (data as AdminQuizQuestion | null) ?? null, error };
};

export const toggleAdminPrivateStudent = async (
  userId: string,
  isCurrentlyPrivate: boolean,
) => {
  return supabase
    .from('profiles')
    .update({ is_private_student: !isCurrentlyPrivate })
    .eq('id', userId);
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

export const updateAdminUser = async (
  userId: string,
  updates: {
    grade?: AdminUser['grade'] | null;
    name?: string | null;
  },
) => {
  return supabase.from('profiles').update(updates).eq('id', userId);
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
        user_id: student_id,
        title: 'Yeni Belge',
        message: `"${document_title}" başlıklı bir belge gönderildi.`,
        type: 'document',
      },
    ]);
  }

  return { data: (data as AdminSharedDocument | null) ?? null, error };
};

export const createAdminPrivateStudent = async ({
  email,
  grade,
  name,
}: {
  email?: string | null;
  grade?: AdminUser['grade'] | null;
  name?: string | null;
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        email,
        grade,
        is_private_student: true,
        name,
        name_normalized: normalizeFullNameForMatch(String(name ?? '')),
      },
    ])
    .select()
    .single();

  return { data: (data as AdminUser | null) ?? null, error };
};

export const refreshAdminDocumentCategories = async () => {
  const updates = [
    { old: 'worksheet', next: 'yaprak-test' },
    { old: 'document', next: 'yaprak-test' },
    { old: 'test', next: 'sinav' },
    { old: 'game', next: 'oyunlar' },
    { old: 'writing', next: 'ders-notlari' },
    { old: 'ders-notuari-kitaplar', next: 'ders-notlari' },
  ];

  let updated = 0;

  for (const update of updates) {
    const { error } = await supabase
      .from('documents')
      .update({ type: update.next })
      .eq('type', update.old);

    if (!error) {
      updated++;
    }
  }

  return updated;
};

const getNextAdminGrade = (grade: AdminUser['grade']): AdminUser['grade'] => {
  if (grade === 'Mezun') {
    return 'Mezun';
  }

  return grade >= 12 ? 12 : ((grade + 1) as AdminUser['grade']);
};

export const advanceAdminUserGrades = async (users: AdminUser[]) => {
  let updated = 0;

  for (const user of users) {
    if (
      user.isAdmin ||
      user.grade === 'Mezun' ||
      getNextAdminGrade(user.grade) === user.grade
    ) {
      continue;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ grade: getNextAdminGrade(user.grade) })
      .eq('id', user.id);

    if (!error) {
      updated++;
    }
  }

  return updated;
};

export const loadAdminQuizQuestions = async (quizId: string) => {
  const { data } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('question_order', { ascending: true });

  return (data || []) as AdminQuizQuestion[];
};
