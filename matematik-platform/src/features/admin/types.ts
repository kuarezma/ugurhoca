import type { ImportResult } from '@/lib/question-import';
import type {
  Announcement,
  AppUser,
  Assignment,
  ContentDocument,
  GradeValue,
  Notification,
  Quiz,
  QuizQuestion,
  SharedDocumentAssignment,
  Submission,
  SupportAttachment,
} from '@/types';
import type {
  DashboardAssignment,
  DashboardBadge,
  DashboardQuizResult,
  DashboardSubmission,
  StudentProfile,
} from '@/types/dashboard';
import type {
  ProgressRow,
  StudyGoal,
  StudySession,
} from '@/features/progress/types';

export type AdminActiveTab =
  | 'statistics'
  | 'announcements'
  | 'documents'
  | 'users'
  | 'gradeUpdate'
  | 'assignments'
  | 'quizzes';

export type AdminModalType =
  | 'announcement'
  | 'editAnnouncement'
  | 'document'
  | 'assignment'
  | 'editUser'
  | 'sendDoc'
  | 'editDocument'
  | 'adminMessage'
  | 'quiz'
  | 'editQuiz'
  | 'addQuestion'
  | 'importQuestions';

export type AdminAnnouncement = Announcement;
export type AdminDocument = ContentDocument;
export type AdminSharedDocument = SharedDocumentAssignment;
export type AdminNotification = Notification;
export type AdminUser = AppUser;
export type AdminAssignment = Assignment;
export type AdminQuiz = Quiz;
export type AdminSubmission = Submission;
export type AdminQuizQuestion = QuizQuestion;
export type AdminStudentProfileData = {
  assignments: DashboardAssignment[];
  badges: DashboardBadge[];
  goal: StudyGoal | null;
  progressRows: ProgressRow[];
  quizResults: DashboardQuizResult[];
  student: StudentProfile;
  studySessions: StudySession[];
  submissions: DashboardSubmission[];
};
export type AdminDashboardData = {
  allUsers: AdminUser[];
  announcements: AdminAnnouncement[];
  assignments: AdminAssignment[];
  documents: AdminDocument[];
  notifications: AdminNotification[];
  quizzes: AdminQuiz[];
  sharedDocs: AdminSharedDocument[];
};

export type ModerationPayload = {
  action?: 'block' | 'mute' | 'report';
  attachments?: SupportAttachment[];
  created_at?: string;
  expires_at?: string | null;
  metadata?: Record<string, unknown>;
  reason?: string;
  sender_email?: string;
  sender_id?: string;
  sender_name?: string;
  source_notification_id?: string;
  text?: string;
};

export type AdminFormState = {
  answer_key_text?: string | null;
  correct_index?: number;
  description?: string | null;
  difficulty?: string | null;
  document_id?: string | null;
  document_title?: string | null;
  due_date?: string | null;
  explanation?: string | null;
  file_name?: string;
  file_url?: string | null;
  grade?: GradeValue | null;
  grades?: GradeValue[];
  image_url?: string | null;
  image_urls?: string;
  importBundleFile?: File | null;
  importMode?: 'bundle' | 'excel';
  importResult?: ImportResult | null;
  is_active?: boolean;
  learning_outcome?: string | null;
  link_url?: string | null;
  name?: string | null;
  options?: string[];
  question?: string | null;
  solution_url?: string | null;
  student_id?: string | null;
  time_limit?: number;
  title?: string | null;
  type?: string | null;
  video_url?: string | null;
  worksheet_order?: number | null;
};
