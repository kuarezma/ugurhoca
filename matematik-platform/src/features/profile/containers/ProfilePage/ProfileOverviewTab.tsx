'use client';

import type { ComponentProps } from 'react';
import dynamic from 'next/dynamic';
import { BookOpen } from 'lucide-react';
import { SafeLink as Link } from '@/components/SafeLink';
import { Skeleton } from '@/components/ui/Skeleton';
import MessageSummaryCard from '@/components/dashboard/MessageSummaryCard';
import MotivationPanel from '@/components/dashboard/MotivationPanel';
import ProgressOverview from '@/components/dashboard/ProgressOverview';
import QuickActionGrid from '@/components/dashboard/QuickActionGrid';
import QuickUpdatesPanel from '@/components/dashboard/QuickUpdatesPanel';
import RecentDocuments from '@/components/dashboard/RecentDocuments';
import RecentResults from '@/components/dashboard/RecentResults';
import TodayPlanCard from '@/components/dashboard/TodayPlanCard';
import { StudyPrescriptionCard } from '@/features/quizzes/components/StudyPrescriptionCard';
import type {
  ProfileWeeklyPlan,
  ProfileWeeklyPlanItem,
} from '@/features/profile/types';
import type {
  DashboardBadge,
  DashboardDocument,
  DashboardGoalSnapshot,
  DashboardNotification,
  DashboardQuizResult,
  DashboardTask,
  DashboardUpdateItem,
  StudentProfile,
} from '@/types/dashboard';
import { WeeklyPlanCard } from './WeeklyPlanCard';

const DeferredDashboardCard = () => <Skeleton className="h-72 rounded-3xl" />;

const StudyActivityHeatmap = dynamic(
  () => import('@/features/profile/components/StudyActivityHeatmap'),
  { loading: DeferredDashboardCard, ssr: false },
);
const ExamTrendChart = dynamic(
  () => import('@/features/profile/components/ExamTrendChart'),
  { loading: DeferredDashboardCard, ssr: false },
);
const TargetSchoolGapCard = dynamic(
  () => import('@/features/profile/components/TargetSchoolGapCard'),
  { loading: DeferredDashboardCard, ssr: false },
);
const ExamCountdownCard = dynamic(
  () =>
    import('@/features/profile/components/ExamCountdownCard').then(
      (module) => ({ default: module.ExamCountdownCard }),
    ),
  { loading: DeferredDashboardCard, ssr: false },
);

export type ProfileOverviewTabProps = {
  isLightNav: boolean;
  user: StudentProfile;
  quickActionItems: ComponentProps<typeof QuickActionGrid>['items'];
  pendingMistakesCount: number;
  activeWeeklyPlan: ProfileWeeklyPlan | null;
  onWeeklyPlanItemToggle: (item: ProfileWeeklyPlanItem) => Promise<void> | void;
  tasks: DashboardTask[];
  onSelectTask: (action: DashboardTask['action']) => void;
  focusTopic: string | null;
  strongTopic: string | null;
  goalSnapshot: DashboardGoalSnapshot;
  latestQuizScore: number | null;
  recentBadges: DashboardBadge[];
  motivationMessage: string;
  notifications: DashboardNotification[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onOpenNotification: (notification: DashboardNotification) => void;
  onOpenPanel: () => void;
  updates: DashboardUpdateItem[];
  onSelectUpdate: (item: DashboardUpdateItem) => void;
  quizResults: DashboardQuizResult[];
  sharedDocs: DashboardDocument[];
  onStartPrescriptionQuiz: (topic: string) => void;
};

export function ProfileOverviewTab({
  isLightNav,
  user,
  quickActionItems,
  pendingMistakesCount,
  activeWeeklyPlan,
  onWeeklyPlanItemToggle,
  tasks,
  onSelectTask,
  focusTopic,
  strongTopic,
  goalSnapshot,
  latestQuizScore,
  recentBadges,
  motivationMessage,
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onOpenNotification,
  onOpenPanel,
  updates,
  onSelectUpdate,
  quizResults,
  sharedDocs,
  onStartPrescriptionQuiz,
}: ProfileOverviewTabProps) {
  return (
    <>
      <div className="mx-auto w-full max-w-full">
        <QuickActionGrid items={quickActionItems} />
      </div>

      {pendingMistakesCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-tone-warn-border bg-tone-warn-bg p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white dark:text-white shadow-lg shadow-amber-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-primary">
                Akıllı Hata Defteri: {pendingMistakesCount} Soru Pekiştirilmeyi
                Bekliyor
              </h3>
              <p className="text-xs text-secondary">
                Geçmiş testlerde yanlış yaptığın soruları telafi ederek eksik
                kazanımlarını kapat.
              </p>
            </div>
          </div>
          <Link
            href="/testler?mode=mistakes"
            className="shrink-0 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all hover:brightness-110 active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
          >
            Hataları Tekrar Çöz ➔
          </Link>
        </div>
      )}

      <StudyPrescriptionCard
        isLight={isLightNav}
        onStartQuiz={(_questions, topic) => {
          onStartPrescriptionQuiz(topic);
        }}
      />

      <WeeklyPlanCard
        plan={activeWeeklyPlan}
        onToggleItem={onWeeklyPlanItemToggle}
      />

      <div className="mx-auto w-full max-w-full space-y-6">
        <StudyActivityHeatmap isLight={isLightNav} />
        <ExamTrendChart isLight={isLightNav} />
        <TargetSchoolGapCard isLight={isLightNav} />
        <ExamCountdownCard userGrade={user?.grade} isLight={isLightNav} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TodayPlanCard
          tasks={tasks}
          onSelectTask={(task) => onSelectTask(task.action)}
        />
        <ProgressOverview
          detailHref="/ilerleme"
          focusTopic={focusTopic}
          goalSnapshot={goalSnapshot}
          latestScore={latestQuizScore ?? 0}
          strongTopic={strongTopic}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MotivationPanel
          badges={recentBadges}
          latestScore={latestQuizScore ?? 0}
          message={motivationMessage}
          streak={user.current_streak || 0}
        />
        <MessageSummaryCard
          notifications={notifications}
          onMarkAllAsRead={onMarkAllAsRead}
          onOpenNotification={onOpenNotification}
          onOpenPanel={onOpenPanel}
          unreadCount={unreadCount}
        />
      </div>

      <QuickUpdatesPanel updates={updates} onSelectUpdate={onSelectUpdate} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentResults results={quizResults} />
        <RecentDocuments documents={sharedDocs} />
      </div>
    </>
  );
}
