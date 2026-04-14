import {
  type DashboardBadge,
  type DashboardDocument,
  type DashboardGoalDay,
  type DashboardGoalSnapshot,
  type DashboardNotification,
  type DashboardQuizResult,
  type DashboardQuizSummary,
  type DashboardSubmission,
  type DashboardTask,
  type DashboardUpdateItem,
  type StudentProfile,
  type DashboardAssignment,
} from '@/types/dashboard';
import type {
  ProfileProgressRow,
  ProfileStudySessionRow,
} from '@/features/profile/types';
import type { StudyGoal } from '@/features/progress/types';
import {
  getCurrentWeekStart,
  resolveCurrentGoal,
} from '@/features/progress/utils';

export type DashboardBadgeRow = {
  id: string;
  badge_name?: string | null;
  earned_at?: string | null;
  icon_name?: string | null;
  icon?: string | null;
  name?: string | null;
};

type BuildProfileDashboardViewModelInput = {
  assignments: DashboardAssignment[];
  availableQuizzes: DashboardQuizSummary[];
  badges: DashboardBadge[];
  goal: StudyGoal | null;
  notifications: DashboardNotification[];
  progressRows: ProfileProgressRow[];
  quizResults: DashboardQuizResult[];
  referenceDate?: Date;
  sharedDocs: DashboardDocument[];
  studySessions: ProfileStudySessionRow[];
  submissions: DashboardSubmission[];
  user: StudentProfile | null;
};

export type ProfileDashboardViewModel = {
  focusTopic: string | null;
  goalSnapshot: DashboardGoalSnapshot;
  latestQuizScore: number | null;
  motivationMessage: string;
  pendingAssignments: DashboardAssignment[];
  primaryTask: DashboardTask | null;
  recentBadges: DashboardBadge[];
  strongTopic: string | null;
  tasks: DashboardTask[];
  updates: DashboardUpdateItem[];
};

const TURKISH_WEEKDAY_LABELS = [
  'Pzt',
  'Sal',
  'Çar',
  'Per',
  'Cum',
  'Cmt',
  'Paz',
];

const normalizeDate = (value?: string | null) => {
  if (!value) {
    return '';
  }

  return value.split('T')[0] || '';
};

const sortByCreatedAtDesc = <T extends { created_at?: string | null }>(
  items: T[],
) =>
  [...items].sort(
    (left, right) =>
      new Date(right.created_at || 0).getTime() -
      new Date(left.created_at || 0).getTime(),
  );

const sortNotificationsDesc = (items: DashboardNotification[]) =>
  [...items].sort(
    (left, right) =>
      new Date(right.created_at).getTime() -
      new Date(left.created_at).getTime(),
  );

const sortSubmissionsDesc = (items: DashboardSubmission[]) =>
  [...items].sort(
    (left, right) =>
      new Date(right.submitted_at || 0).getTime() -
      new Date(left.submitted_at || 0).getTime(),
  );

const getAssignmentDuePriority = (assignment: DashboardAssignment) => {
  if (!assignment.due_date) {
    return Number.MAX_SAFE_INTEGER;
  }

  return new Date(assignment.due_date).getTime();
};

const sortPendingAssignments = (items: DashboardAssignment[]) =>
  [...items].sort((left, right) => {
    const dueDifference =
      getAssignmentDuePriority(left) - getAssignmentDuePriority(right);

    if (dueDifference !== 0) {
      return dueDifference;
    }

    return (
      new Date(right.created_at || 0).getTime() -
      new Date(left.created_at || 0).getTime()
    );
  });

const getRelativeDueLabel = (
  dueDate?: string | null,
  referenceDate = new Date(),
) => {
  if (!dueDate) {
    return 'Teslime açık';
  }

  const startOfToday = new Date(referenceDate);
  startOfToday.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) {
    return diffDays === 0 ? 'Bugün teslim' : 'Süresi geçti';
  }

  if (diffDays === 1) {
    return 'Yarın teslim';
  }

  if (diffDays <= 3) {
    return `${diffDays} gün kaldı`;
  }

  return new Date(dueDate).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
};

const buildWeeklyGoalDays = (
  studySessions: ProfileStudySessionRow[],
  weekStart: string,
  referenceDate = new Date(),
): DashboardGoalDay[] => {
  const start = new Date(`${weekStart}T00:00:00`);

  return TURKISH_WEEKDAY_LABELS.map((label, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const currentDate = normalizeDate(current.toISOString());
    const minutes = studySessions.reduce((total, session) => {
      return normalizeDate(session.date) === currentDate
        ? total + Number(session.duration || 0)
        : total;
    }, 0);

    return {
      isToday: normalizeDate(referenceDate.toISOString()) === currentDate,
      label,
      minutes,
    };
  });
};

export const buildDashboardGoalSnapshot = ({
  goal,
  referenceDate,
  studySessions,
}: {
  goal: StudyGoal | null | undefined;
  referenceDate?: Date;
  studySessions: ProfileStudySessionRow[];
}): DashboardGoalSnapshot => {
  const activeGoal = goal ?? resolveCurrentGoal([], referenceDate);
  const weekStart =
    activeGoal?.week_start || getCurrentWeekStart(referenceDate || new Date());
  const days = buildWeeklyGoalDays(studySessions, weekStart, referenceDate);
  const completedMinutes = days.reduce((total, day) => total + day.minutes, 0);
  const targetMinutes = Math.max(1, activeGoal?.target_duration || 600);

  return {
    activeDays: days.filter((day) => day.minutes > 0).length,
    completedMinutes,
    days,
    progressPercent: Math.min(
      100,
      Math.round((completedMinutes / targetMinutes) * 100),
    ),
    remainingMinutes: Math.max(targetMinutes - completedMinutes, 0),
    targetMinutes,
    weekStart,
  };
};

export const normalizeDashboardBadges = (
  badges: DashboardBadgeRow[] | null | undefined,
): DashboardBadge[] =>
  [...(badges || [])]
    .map((badge) => ({
      earnedAt: badge.earned_at || null,
      icon: badge.icon || badge.icon_name || 'Award',
      id: badge.id,
      name: badge.name || badge.badge_name || 'Rozet',
    }))
    .sort(
      (left, right) =>
        new Date(right.earnedAt || 0).getTime() -
        new Date(left.earnedAt || 0).getTime(),
    );

const buildMotivationMessage = ({
  focusTopic,
  goalSnapshot,
  latestQuizScore,
  streak,
}: {
  focusTopic: string | null;
  goalSnapshot: DashboardGoalSnapshot;
  latestQuizScore: number | null;
  streak: number;
}) => {
  if (streak >= 7 && goalSnapshot.progressPercent >= 70) {
    return 'Ritmin güçlü. Bu hafta aynı tempoyu korursan hedefini rahat kapatırsın.';
  }

  if (latestQuizScore !== null && latestQuizScore >= 80) {
    return 'Son test sonucunda güçlü görünüyorsun. Bir test daha çözüp seriyi büyütebilirsin.';
  }

  if (focusTopic) {
    return `${focusTopic} konusu kısa bir tekrar isterse tablo hızlıca toparlanır.`;
  }

  if (goalSnapshot.remainingMinutes > 0) {
    return `Haftalık hedef için ${goalSnapshot.remainingMinutes} dakika daha ayırman yeterli.`;
  }

  return 'Bugün için temel çizgiyi korudun. Düzeni bozmayıp küçük bir tekrar daha ekleyebilirsin.';
};

export const buildProfileDashboardViewModel = ({
  assignments,
  availableQuizzes,
  badges,
  goal,
  notifications,
  progressRows,
  quizResults,
  referenceDate,
  sharedDocs,
  studySessions,
  submissions,
  user,
}: BuildProfileDashboardViewModelInput): ProfileDashboardViewModel => {
  const goalSnapshot = buildDashboardGoalSnapshot({
    goal,
    referenceDate,
    studySessions,
  });
  const strongTopic = progressRows[0]?.topic ?? null;
  const focusTopic =
    [...progressRows]
      .sort((left, right) => left.mastery_level - right.mastery_level)
      .find((row) => row.mastery_level < 60)?.topic ?? null;
  const latestQuizScore = quizResults[0]?.score ?? null;
  const recentBadges = badges.slice(0, 3);
  const notificationList = sortNotificationsDesc(notifications);

  const submittedAssignmentIds = new Set(
    submissions.map((submission) => submission.assignment_id),
  );
  const pendingAssignments = sortPendingAssignments(
    assignments.filter(
      (assignment) => !submittedAssignmentIds.has(assignment.id),
    ),
  );

  const unreadImportantNotification =
    notificationList.find(
      (notification) =>
        !notification.is_read && notification.type !== 'message-read',
    ) || null;

  const weakTopicRow =
    [...progressRows]
      .sort((left, right) => left.mastery_level - right.mastery_level)
      .find((row) => row.mastery_level < 60) || null;

  const tasks: DashboardTask[] = [];
  const nearestAssignment = pendingAssignments[0] || null;

  if (nearestAssignment) {
    tasks.push({
      accentClass: 'from-orange-500/20 via-amber-500/15 to-yellow-500/10',
      action: {
        assignmentId: nearestAssignment.id,
        type: 'open-assignment',
      },
      actionLabel: 'Ödevi Aç',
      badge: 'Öncelik',
      description: `${
        nearestAssignment.title
      } ödevini teslim etmeyi unutmadan kısa bir çalışma bloğu ayır.`,
      id: `assignment:${nearestAssignment.id}`,
      meta: getRelativeDueLabel(nearestAssignment.due_date),
      title: 'Yaklaşan ödevini tamamla',
    });
  }

  if (weakTopicRow) {
    tasks.push({
      accentClass: 'from-rose-500/20 via-orange-500/15 to-amber-500/10',
      action: { type: 'go-progress' },
      actionLabel: 'Tekrar Planı Aç',
      badge: 'Odak',
      description: `${weakTopicRow.topic} konusu şu an en çok tekrar isteyen alanın.`,
      id: `topic:${weakTopicRow.topic}`,
      meta: `%${weakTopicRow.mastery_level} hakimiyet`,
      title: 'Zayıf konuna kısa tekrar ekle',
    });
  }

  if (availableQuizzes[0]) {
    tasks.push({
      accentClass: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/10',
      action: { type: 'go-tests' },
      actionLabel: 'Teste Git',
      badge: 'Test',
      description: `${availableQuizzes[0].title} ile bugünkü ritmini sıcak tutabilirsin.`,
      id: `quiz:${availableQuizzes[0].id}`,
      meta: `${availableQuizzes[0].time_limit || 0} dk`,
      title: 'Yeni bir test çöz',
    });
  }

  if (goalSnapshot.remainingMinutes > 0) {
    tasks.push({
      accentClass: 'from-sky-500/20 via-blue-500/15 to-indigo-500/10',
      action: { type: 'go-progress' },
      actionLabel: 'Hedefe Dön',
      badge: 'Hedef',
      description: `Haftalık hedefin için ${goalSnapshot.remainingMinutes} dakika daha ayırman yeterli.`,
      id: `goal:${goalSnapshot.weekStart}`,
      meta: `${goalSnapshot.completedMinutes}/${goalSnapshot.targetMinutes} dk`,
      title: 'Haftalık hedefini kapat',
    });
  }

  if (unreadImportantNotification) {
    tasks.push({
      accentClass: 'from-violet-500/20 via-fuchsia-500/15 to-pink-500/10',
      action: {
        notificationId: unreadImportantNotification.id,
        type: 'open-notification',
      },
      actionLabel: 'Güncellemeyi Aç',
      badge: 'Yeni',
      description:
        unreadImportantNotification.message ||
        'Dashboard içindeki güncellemeleri gözden geçir.',
      id: `notification:${unreadImportantNotification.id}`,
      meta: new Date(unreadImportantNotification.created_at).toLocaleDateString(
        'tr-TR',
      ),
      title: unreadImportantNotification.title,
    });
  }

  const latestAdminMessage =
    notificationList.find(
      (notification) => notification.type === 'admin-message',
    ) || null;
  const latestReviewedSubmission =
    sortSubmissionsDesc(
      submissions.filter((submission) => submission.status === 'reviewed'),
    )[0] || null;
  const latestUnreadDocument =
    sortByCreatedAtDesc(
      sharedDocs.filter((document) => !document.is_read),
    )[0] || null;

  const updates: DashboardUpdateItem[] = [];

  if (latestAdminMessage) {
    updates.push({
      action: {
        notificationId: latestAdminMessage.id,
        type: 'open-notification',
      },
      actionLabel: 'Mesajı Aç',
      badge: 'Mesaj',
      createdAt: latestAdminMessage.created_at,
      description:
        latestAdminMessage.message ||
        latestAdminMessage.metadata?.sender_name ||
        'Yeni bir mesajın var.',
      id: `message:${latestAdminMessage.id}`,
      title: latestAdminMessage.title,
      type: 'message',
    });
  }

  if (latestReviewedSubmission) {
    const reviewedAssignment =
      assignments.find(
        (assignment) =>
          assignment.id === latestReviewedSubmission.assignment_id,
      ) || null;

    updates.push({
      action: {
        assignmentId: latestReviewedSubmission.assignment_id,
        type: 'open-assignment',
      },
      actionLabel: 'Geri Bildirimi Gör',
      badge: latestReviewedSubmission.grade
        ? `Puan ${latestReviewedSubmission.grade}`
        : 'İncelendi',
      createdAt: latestReviewedSubmission.submitted_at || '',
      description:
        latestReviewedSubmission.feedback ||
        'Ödevin için yeni değerlendirme notu eklendi.',
      id: `feedback:${latestReviewedSubmission.id}`,
      title: reviewedAssignment
        ? `${reviewedAssignment.title} için geri bildirim`
        : 'Ödevin değerlendirildi',
      type: 'feedback',
    });
  }

  if (latestUnreadDocument) {
    updates.push({
      action: {
        type: 'open-document',
        url: latestUnreadDocument.file_url,
      },
      actionLabel: 'Belgeyi Aç',
      badge: 'Belge',
      createdAt: latestUnreadDocument.created_at,
      description:
        'Yeni paylaşılan belgeyi inceleyip notlarına ekleyebilirsin.',
      id: `document:${latestUnreadDocument.id}`,
      title: latestUnreadDocument.document_title,
      type: 'document',
    });
  }

  return {
    focusTopic,
    goalSnapshot,
    latestQuizScore,
    motivationMessage: buildMotivationMessage({
      focusTopic,
      goalSnapshot,
      latestQuizScore,
      streak: user?.current_streak || 0,
    }),
    pendingAssignments,
    primaryTask: tasks[0] || null,
    recentBadges,
    strongTopic,
    tasks: tasks.slice(0, 3),
    updates: updates
      .sort(
        (left, right) =>
          new Date(right.createdAt || 0).getTime() -
          new Date(left.createdAt || 0).getTime(),
      )
      .slice(0, 3),
  };
};
