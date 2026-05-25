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
import type { LiveLessonDashboardData } from '@/features/live-lessons/types';

export type AdminActiveTab =
  | 'statistics'
  | 'tracking'
  | 'announcements'
  | 'documents'
  | 'annualPlan'
  | 'worksheetCandidates'
  | 'users'
  | 'gradeUpdate'
  | 'assignments'
  | 'quizzes'
  | 'liveLessons';

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
  adminNotes: StudentAdminNote[];
  adminStatus: StudentAdminStatus | null;
  assignments: DashboardAssignment[];
  badges: DashboardBadge[];
  goal: StudyGoal | null;
  progressRows: ProgressRow[];
  quizResults: DashboardQuizResult[];
  student: StudentProfile;
  studySessions: StudySession[];
  submissions: DashboardSubmission[];
  weeklyPlans: StudentWeeklyPlan[];
};

export type StudentAdminStatus = {
  student_id: string;
  status: 'normal' | 'watch' | 'risk' | string;
  labels: string[];
  follow_up_at?: string | null;
  last_contacted_at?: string | null;
  updated_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type StudentAdminNote = {
  id: string;
  student_id: string;
  author_id?: string | null;
  body: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type StudentWeeklyPlanItem = {
  id: string;
  plan_id: string;
  kind: 'assignment' | 'quiz' | 'content' | 'custom' | string;
  title: string;
  linked_id?: string | null;
  href?: string | null;
  due_at?: string | null;
  sort_order?: number | null;
  completed_at?: string | null;
  completed_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type StudentWeeklyPlan = {
  id: string;
  student_id: string;
  author_id?: string | null;
  week_start: string;
  title: string;
  target_minutes: number;
  status: 'active' | 'archived' | string;
  created_at?: string | null;
  updated_at?: string | null;
  student_weekly_plan_items?: StudentWeeklyPlanItem[];
};

export type AnnualPlanItem = {
  id: string;
  grade: number;
  week_start: string;
  week_end: string;
  subject: string;
  learning_outcome: string;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AnnualPlanImportResult = {
  inserted: number;
  items: AnnualPlanItem[];
  skipped: number;
  total: number;
};

export type WorksheetCandidateDiscoveryResult = {
  inserted: number;
  items: WorksheetCandidate[];
  searchedSources: number;
  skipped: number;
  total: number;
};

export type WorksheetCandidateWeekScanResult = {
  failures: Array<{ plan_item_id: string; message: string }>;
  inserted: number;
  ok: boolean;
  planItems: number;
  searchedSources: number;
  skipped: number;
  today: string;
  total: number;
};

export type WorksheetCandidateApprovalResult = {
  candidate: WorksheetCandidate;
  document: AdminDocument;
  notificationWarning?: string | null;
  notifiedStudents: number;
  sharedDocuments: number;
};

export type GoogleDriveConnectionStatus = {
  configured?: boolean;
  connected: boolean;
  connected_at?: string | null;
  google_email?: string | null;
  missingKeys?: string[];
  updated_at?: string | null;
};

export type WorksheetCandidateSourceStatus = {
  allowedHosts: string[];
  configured: boolean;
  invalidAllowedHosts?: string[];
  invalidSourceUrls?: string[];
  sourceUrls: string[];
};

export type WorksheetCandidateStatus = 'pending' | 'approved' | 'rejected';

export type WorksheetCandidate = {
  id: string;
  annual_plan_item_id?: string | null;
  grade: number;
  week_start?: string | null;
  week_end?: string | null;
  subject: string;
  learning_outcome: string;
  title: string;
  source_name?: string | null;
  source_url: string;
  file_url: string;
  match_score: number;
  status: WorksheetCandidateStatus | string;
  rejection_reason?: string | null;
  drive_file_id?: string | null;
  drive_file_url?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AdminQuizResultRow = DashboardQuizResult & {
  user_id: string;
  quiz_id?: string | null;
};

export type AdminStudySessionRow = StudySession & {
  user_id: string;
};

export type AdminStudyGoalRow = StudyGoal & {
  user_id: string;
};

export type StudentActivityEvent = {
  id: string;
  user_id: string;
  event_type: string;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
};

export type AdminDashboardData = {
  activityEvents: StudentActivityEvent[];
  allUsers: AdminUser[];
  announcements: AdminAnnouncement[];
  annualPlanItems: AnnualPlanItem[];
  adminStatuses: StudentAdminStatus[];
  assignments: AdminAssignment[];
  documents: AdminDocument[];
  notifications: AdminNotification[];
  quizResults: AdminQuizResultRow[];
  quizzes: AdminQuiz[];
  sharedDocs: AdminSharedDocument[];
  studyGoals: AdminStudyGoalRow[];
  studySessions: AdminStudySessionRow[];
  submissions: AdminSubmission[];
  worksheetCandidates: WorksheetCandidate[];
  weeklyPlans: StudentWeeklyPlan[];
  liveLessons: LiveLessonDashboardData;
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
  importBundleUrl?: string;
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
