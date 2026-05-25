import type { Clock3 } from 'lucide-react';
import type {
  DashboardAssignment,
  DashboardBadge,
  DashboardDocument,
  DashboardNotification,
  DashboardQuizResult,
  DashboardQuizSummary,
  DashboardSubmission,
  StudentProfile,
} from '@/types/dashboard';
import type { StudyGoal } from '@/features/progress/types';
import type { WeeklyWorksheetSuggestion } from '@/features/profile/weekly-worksheet';

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

export type ProfileWeeklyPlanItem = {
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
};

export type ProfileWeeklyPlan = {
  id: string;
  student_id: string;
  week_start: string;
  title: string;
  target_minutes: number;
  status: string;
  student_weekly_plan_items?: ProfileWeeklyPlanItem[];
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
  badges: DashboardBadge[];
  goal: StudyGoal | null;
  isHydrated: boolean;
  notifications: DashboardNotification[];
  progressRows: ProfileProgressRow[];
  quizResults: DashboardQuizResult[];
  sharedDocs: DashboardDocument[];
  studySessions: ProfileStudySessionRow[];
  submissions: DashboardSubmission[];
  user: StudentProfile | null;
  weeklyPlans: ProfileWeeklyPlan[];
  weeklyWorksheet: WeeklyWorksheetSuggestion | null;
};

export type InitialProfileDashboardData = ProfileDashboardData;
