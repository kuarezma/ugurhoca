export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  grade: number | string;
  isAdmin: boolean;
  created_at?: string;
  current_streak?: number | null;
  avatar_id?: string | null;
}

export type DashboardNotificationType =
  | 'document'
  | 'assignment'
  | 'general'
  | 'message'
  | 'admin-message'
  | 'message-read';

export interface DashboardNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: DashboardNotificationType;
  is_read: boolean;
  created_at: string;
  metadata?: { image_url?: string; sender_name?: string } | null;
}

export interface DashboardDocument {
  id: string;
  document_title: string;
  document_type: string;
  file_url: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardAssignment {
  id: string;
  title: string;
  description: string | null;
  due_date?: string | null;
  student_id?: string | null;
  grade?: number | string | null;
  created_at?: string;
}

export interface DashboardSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at?: string | null;
  status?: string | null;
  grade?: number | null;
  feedback?: string | null;
  comment?: string | null;
  file_url?: string | null;
}

export interface DashboardQuizResult {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  quizzes?: {
    title?: string | null;
    difficulty?: string | null;
    grade?: number | null;
  } | null;
}

export interface DashboardQuizSummary {
  id: string;
  title: string;
  difficulty: string;
  grade: number;
  time_limit?: number;
}

export type DashboardActionType =
  | 'go-assignments'
  | 'go-tests'
  | 'go-progress'
  | 'open-assignment'
  | 'open-document'
  | 'open-notification';

export interface DashboardAction {
  type: DashboardActionType;
  assignmentId?: string;
  notificationId?: string;
  url?: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  badge: string;
  meta: string;
  accentClass: string;
  action: DashboardAction;
}

export interface DashboardGoalDay {
  label: string;
  minutes: number;
  isToday?: boolean;
}

export interface DashboardGoalSnapshot {
  weekStart: string;
  targetMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  progressPercent: number;
  activeDays: number;
  days: DashboardGoalDay[];
}

export interface DashboardBadge {
  id: string;
  name: string;
  icon: string;
  earnedAt?: string | null;
}

export type DashboardUpdateType = 'message' | 'feedback' | 'document';

export interface DashboardUpdateItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  createdAt: string;
  type: DashboardUpdateType;
  actionLabel: string;
  action: DashboardAction;
}

export type DashboardNotificationFilter =
  | 'all'
  | 'messages'
  | 'assignments'
  | 'documents';

export interface ProgressSummaryProps {
  streak: number;
  weeklyMinutes: number;
  latestScore: number | null;
  strongTopic: string | null;
  focusTopic: string | null;
}

export interface MessageSummaryProps {
  unreadCount: number;
  latestTitle: string | null;
  latestMessage: string | null;
}

export interface QuickActionCardProps {
  title: string;
  description: string;
  stat: string;
  accentClass: string;
  iconClass: string;
  actionLabel: string;
  onAction: () => void;
  badge?: string;
}
