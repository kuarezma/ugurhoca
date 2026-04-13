import type { Clock3 } from 'lucide-react';
import type {
  DashboardAssignment,
  DashboardDocument,
  DashboardNotification,
  DashboardQuizResult,
  DashboardQuizSummary,
  DashboardSubmission,
  StudentProfile,
} from '@/types/dashboard';

export type ProfileProgressRow = {
  id: string;
  mastery_level: number;
  topic: string;
};

export type ProfileStudySessionRow = {
  id: string;
  date: string;
  duration: number;
};

export type ProfileNotificationStyle = {
  badge: string;
  icon: typeof Clock3;
  iconWrap: string;
  status: string;
  wrapper: string;
};

export type ProfileDashboardData = {
  assignments: DashboardAssignment[];
  availableQuizzes: DashboardQuizSummary[];
  isHydrated: boolean;
  notifications: DashboardNotification[];
  progressRows: ProfileProgressRow[];
  quizResults: DashboardQuizResult[];
  sharedDocs: DashboardDocument[];
  studySessions: ProfileStudySessionRow[];
  submissions: DashboardSubmission[];
  user: StudentProfile | null;
};

export type InitialProfileDashboardData = ProfileDashboardData;
