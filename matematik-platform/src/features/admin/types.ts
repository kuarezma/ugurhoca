import type { ImportResult } from '@/lib/question-import';
import type {
  Announcement,
  AppUser,
  Assignment,
  ChatMessage,
  ChatRoom,
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
  | 'writings'
  | 'users'
  | 'messages'
  | 'gradeUpdate'
  | 'assignments'
  | 'quizzes';

export type AdminModalType =
  | 'announcement'
  | 'editAnnouncement'
  | 'document'
  | 'writing'
  | 'assignment'
  | 'editUser'
  | 'student'
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
export type AdminChatRoom = ChatRoom;
export type AdminChatMessage = ChatMessage;
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
  chatRooms: AdminChatRoom[];
  documents: AdminDocument[];
  notifications: AdminNotification[];
  privateStudents: AdminUser[];
  quizzes: AdminQuiz[];
  sharedDocs: AdminSharedDocument[];
};

export type AdminSelection =
  | AdminAnnouncement
  | AdminDocument
  | AdminSharedDocument
  | AdminUser;

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
  email?: string | null;
  explanation?: string | null;
  file_name?: string;
  file_url?: string | null;
  grade?: GradeValue | null;
  grades?: GradeValue[];
  image_url?: string | null;
  image_urls?: string;
  importResult?: ImportResult | null;
  is_active?: boolean;
  is_admin_only?: boolean;
  learning_outcome?: string | null;
  link_url?: string | null;
  name?: string | null;
  options?: string[];
  question?: string | null;
  solution_url?: string | null;
  student_email?: string | null;
  student_id?: string | null;
  student_name?: string | null;
  time_limit?: number;
  title?: string | null;
  type?: string | null;
  video_url?: string | null;
  worksheet_order?: number | null;
};
