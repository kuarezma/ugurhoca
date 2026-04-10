"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FloatingShapes from "@/components/FloatingShapes";
import NotesSection from "@/components/NotesSection";
import DashboardHero from "@/components/dashboard/DashboardHero";
import QuickActionGrid, {
  quickActionIcons,
} from "@/components/dashboard/QuickActionGrid";
import ProgressOverview from "@/components/dashboard/ProgressOverview";
import MessageSummaryCard from "@/components/dashboard/MessageSummaryCard";
import RecentResults from "@/components/dashboard/RecentResults";
import RecentDocuments from "@/components/dashboard/RecentDocuments";
import DashboardSettings from "@/components/dashboard/DashboardSettings";
import AvatarSelectionModal from "@/components/dashboard/AvatarSelectionModal";
import type {
  ContinueState,
  DashboardAssignment,
  DashboardDocument,
  DashboardNotification,
  DashboardQuizResult,
  DashboardQuizSummary,
  DashboardSubmission,
  StudentProfile,
} from "@/types/dashboard";

type ProgressRow = {
  id: string;
  topic: string;
  mastery_level: number;
};

type StudySessionRow = {
  id: string;
  duration: number;
  date: string;
};

type NotificationStyle = {
  wrapper: string;
  icon: typeof Clock3;
  iconWrap: string;
  badge: string;
  status: string;
};

const formatGradeLabel = (grade: number | string) =>
  grade === "Mezun" ? "Mezun" : `${grade}. Sınıf`;

export default function ProfilePage() {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<DashboardNotification[]>(
    [],
  );
  const [sharedDocs, setSharedDocs] = useState<DashboardDocument[]>([]);
  const [assignments, setAssignments] = useState<DashboardAssignment[]>([]);
  const [submissions, setSubmissions] = useState<DashboardSubmission[]>([]);
  const [quizResults, setQuizResults] = useState<DashboardQuizResult[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<
    DashboardQuizSummary[]
  >([]);
  const [studySessions, setStudySessions] = useState<StudySessionRow[]>([]);
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<DashboardAssignment | null>(null);
  const [selectedMessage, setSelectedMessage] =
    useState<DashboardNotification | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/giris");
        return;
      }

      const isAdmin = session.user.email === "admin@ugurhoca.com";

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      const nextUser: StudentProfile = profile
        ? { ...profile, email: session.user.email, isAdmin }
        : {
            id: session.user.id,
            name: session.user.user_metadata?.name || "Öğrenci",
            email: session.user.email || "",
            grade: session.user.user_metadata?.grade ?? 5,
            isAdmin,
            current_streak: 0,
          };

      setUser(nextUser);

      if (isAdmin) {
        setLoading(false);
        return;
      }

      const gradeValue =
        typeof nextUser.grade === "number" || typeof nextUser.grade === "string"
          ? nextUser.grade
          : 5;

      const gradeClause =
        typeof gradeValue === "string"
          ? `grade.eq.${gradeValue},student_id.eq.${nextUser.id}`
          : `grade.eq.${Number(gradeValue)},student_id.eq.${nextUser.id}`;

      const numericGrade = Number(gradeValue);

      const assignmentsQuery = supabase
        .from("assignments")
        .select("*")
        .or(gradeClause)
        .order("created_at", { ascending: false });

      const availableQuizzesQuery = Number.isFinite(numericGrade)
        ? supabase
            .from("quizzes")
            .select("id, title, difficulty, grade, time_limit")
            .eq("is_active", true)
            .eq("grade", numericGrade)
            .order("created_at", { ascending: false })
        : supabase
            .from("quizzes")
            .select("id, title, difficulty, grade, time_limit")
            .eq("is_active", true)
            .order("created_at", { ascending: false });

      const [
        notifRes,
        sharedDocsRes,
        assignmentsRes,
        submissionsRes,
        quizResultsRes,
        availableQuizzesRes,
        studySessionsRes,
        progressRes,
      ] = await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("shared_documents")
          .select("*")
          .eq("student_id", session.user.id)
          .order("created_at", { ascending: false }),
        assignmentsQuery,
        supabase
          .from("assignment_submissions")
          .select("*")
          .eq("student_id", session.user.id),
        supabase
          .from("quiz_results")
          .select("*, quizzes(title, difficulty, grade)")
          .eq("user_id", session.user.id)
          .order("completed_at", { ascending: false }),
        availableQuizzesQuery,
        supabase
          .from("study_sessions")
          .select("id, duration, date")
          .eq("user_id", session.user.id)
          .order("date", { ascending: false })
          .limit(30),
        supabase
          .from("user_progress")
          .select("id, topic, mastery_level")
          .eq("user_id", session.user.id)
          .order("mastery_level", { ascending: false }),
      ]);

      setNotifications((notifRes.data || []) as DashboardNotification[]);
      setSharedDocs((sharedDocsRes.data || []) as DashboardDocument[]);
      setAssignments((assignmentsRes.data || []) as DashboardAssignment[]);
      setSubmissions((submissionsRes.data || []) as DashboardSubmission[]);
      setQuizResults((quizResultsRes.data || []) as DashboardQuizResult[]);
      setAvailableQuizzes(
        (availableQuizzesRes.data || []) as DashboardQuizSummary[],
      );
      setStudySessions((studySessionsRes.data || []) as StudySessionRow[]);
      setProgressRows((progressRes.data || []) as ProgressRow[]);
      setLoading(false);
    };

    loadData();
  }, [router]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification,
      ),
    );
  };

  const handleNotificationClick = async (notification: DashboardNotification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    setShowNotifications(false);

    if (notification.type === "document") {
      const doc = sharedDocs[0];
      if (doc?.file_url) {
        window.open(doc.file_url, "_blank", "noopener,noreferrer");
        return;
      }
      router.push("/icerikler");
      return;
    }

    if (notification.type === "assignment") {
      const pendingAssignment = pendingAssignments[0] || assignments[0];
      if (pendingAssignment) {
        setSelectedAssignment(pendingAssignment);
        return;
      }
      router.push("/odevler");
      return;
    }

    if (
      notification.type === "message" ||
      notification.type === "admin-message"
    ) {
      setSelectedMessage(notification);
    }
  };

  const getNotificationStyle = (
    notification: DashboardNotification,
  ): NotificationStyle => {
    if (notification.is_read) {
      return {
        wrapper: "border-slate-700/60 bg-slate-700/20 hover:bg-slate-700/35",
        icon: CheckCircle2,
        iconWrap: "bg-emerald-500/15 text-emerald-400",
        badge: "bg-emerald-500/15 text-emerald-300",
        status: "Görüldü",
      };
    }

    if (notification.type === "assignment") {
      return {
        wrapper: "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15",
        icon: Clock3,
        iconWrap: "bg-amber-500/15 text-amber-300",
        badge: "bg-amber-500/15 text-amber-200",
        status: "Ödev",
      };
    }

    if (notification.type === "document") {
      return {
        wrapper: "border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/15",
        icon: Clock3,
        iconWrap: "bg-sky-500/15 text-sky-300",
        badge: "bg-sky-500/15 text-sky-200",
        status: "Belge",
      };
    }

    if (notification.type === "admin-message") {
      return {
        wrapper: "border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15",
        icon: Bell,
        iconWrap: "bg-violet-500/15 text-violet-300",
        badge: "bg-violet-500/15 text-violet-200",
        status: "Uğur Hoca",
      };
    }

    if (notification.type === "message-read") {
      return {
        wrapper:
          "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10",
        icon: CheckCircle2,
        iconWrap: "bg-emerald-500/10 text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-300",
        status: "Okundu",
      };
    }

    return {
      wrapper: "border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15",
      icon: Clock3,
      iconWrap: "bg-indigo-500/15 text-indigo-300",
      badge: "bg-indigo-500/15 text-indigo-200",
      status: "Mesaj",
    };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;
  const pendingAssignments = useMemo(() => {
    const submittedAssignmentIds = new Set(
      submissions.map((submission) => submission.assignment_id),
    );
    return assignments.filter(
      (assignment) => !submittedAssignmentIds.has(assignment.id),
    );
  }, [assignments, submissions]);

  const weeklyMinutes = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    cutoff.setHours(0, 0, 0, 0);

    return studySessions.reduce((total, session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= cutoff ? total + Number(session.duration || 0) : total;
    }, 0);
  }, [studySessions]);

  const latestQuizScore = quizResults[0]?.score ?? null;
  const strongTopic = progressRows[0]?.topic ?? null;
  const focusTopic =
    [...progressRows]
      .reverse()
      .find((row) => row.mastery_level < 60)?.topic ?? null;
  const latestNotification = notifications[0] || null;
  const unreadMessageNotification =
    notifications.find(
      (notification) =>
        !notification.is_read &&
        (notification.type === "message" ||
          notification.type === "admin-message"),
    ) || null;

  const continueState: ContinueState = useMemo(() => {
    if (pendingAssignments.length > 0) {
      return {
        kind: "assignment",
        title: "Bekleyen ödevin var",
        description: `${
          pendingAssignments[0].title
        } ödevini tamamlayıp teslim etmeyi unutma.`,
        actionLabel: "Ödeve Git",
        onAction: () => router.push("/odevler"),
        accentClass: "from-purple-500/20 via-fuchsia-500/15 to-pink-500/15",
      };
    }

    if (availableQuizzes.length > 0) {
      return {
        kind: "quiz",
        title: "Yeni test seni bekliyor",
        description: `${
          availableQuizzes[0].title
        } testiyle çalışmana hemen devam edebilirsin.`,
        actionLabel: "Teste Başla",
        onAction: () => router.push("/testler"),
        accentClass: "from-emerald-500/20 via-teal-500/15 to-cyan-500/15",
      };
    }

    if (unreadMessageNotification) {
      return {
        kind: "message",
        title: "Yeni bir mesajın var",
        description:
          unreadMessageNotification.title ||
          "Dashboard’dan mesajlarını ve bildirimlerini kontrol et.",
        actionLabel: "Mesajı Aç",
        onAction: () => handleNotificationClick(unreadMessageNotification),
        accentClass: "from-indigo-500/20 via-violet-500/15 to-fuchsia-500/15",
      };
    }

    return {
      kind: "progress",
      title: "İlerlemeni güncel tut",
      description:
        "Çalışma ekleyerek gelişim ekranındaki haftalık özetini daha anlamlı hale getir.",
      actionLabel: "İlerlemeye Git",
      onAction: () => router.push("/ilerleme"),
      accentClass: "from-blue-500/20 via-cyan-500/15 to-teal-500/15",
    };
  }, [availableQuizzes, pendingAssignments, router, unreadMessageNotification]);

  const quickActionItems = useMemo(
    () => [
      {
        title: "Testler",
        description:
          availableQuizzes[0]?.title ||
          "Sınıfına uygun testleri çözerek kendini dene.",
        stat: `${availableQuizzes.length}`,
        accentClass:
          "from-emerald-500/20 via-teal-500/15 to-cyan-500/10",
        iconClass: "bg-emerald-500/30",
        actionLabel: "Testlere Git",
        onAction: () => router.push("/testler"),
        badge: availableQuizzes.length > 0 ? "Uygun" : undefined,
        icon: quickActionIcons.tests,
      },
      {
        title: "Ödevler",
        description:
          pendingAssignments[0]?.title ||
          "Teslim edilmesi gereken ödevlerini buradan takip et.",
        stat: `${pendingAssignments.length}`,
        accentClass:
          "from-purple-500/20 via-fuchsia-500/15 to-pink-500/10",
        iconClass: "bg-purple-500/30",
        actionLabel: "Ödevlere Git",
        onAction: () => router.push("/odevler"),
        badge: pendingAssignments.length > 0 ? "Bekliyor" : undefined,
        icon: quickActionIcons.assignments,
      },
      {
        title: "İlerleme",
        description:
          strongTopic || focusTopic
            ? `Konu durumunu gözden geçir: ${strongTopic || focusTopic}`
            : "Haftalık çalışma ve konu gelişimini tek bakışta incele.",
        stat: `${user?.current_streak || 0} gün`,
        accentClass: "from-blue-500/20 via-cyan-500/15 to-sky-500/10",
        iconClass: "bg-blue-500/30",
        actionLabel: "İlerlemeyi Aç",
        onAction: () => router.push("/ilerleme"),
        badge: "Seri",
        icon: quickActionIcons.progress,
      },
      {
        title: "Mesajlar",
        description:
          latestNotification?.title ||
          "Uğur Hoca’dan gelen mesaj ve bildirimlerini buradan kontrol et.",
        stat: `${unreadCount}`,
        accentClass:
          "from-indigo-500/20 via-violet-500/15 to-fuchsia-500/10",
        iconClass: "bg-indigo-500/30",
        actionLabel: "Bildirimi Aç",
        onAction: () => {
          if (unreadMessageNotification) {
            handleNotificationClick(unreadMessageNotification);
            return;
          }
          setShowNotifications(true);
        },
        badge: unreadCount > 0 ? "Yeni" : undefined,
        icon: quickActionIcons.messages,
      },
    ],
    [
      availableQuizzes,
      focusTopic,
      handleNotificationClick,
      latestNotification?.title,
      pendingAssignments,
      router,
      strongTopic,
      unreadCount,
      unreadMessageNotification,
      user?.current_streak,
    ],
  );

  const openLatestMessage = () => {
    if (unreadMessageNotification) {
      handleNotificationClick(unreadMessageNotification);
      return;
    }

    if (latestNotification) {
      handleNotificationClick(latestNotification);
      return;
    }

    setShowNotifications(true);
  };

  const handleAvatarSelect = async (avatar: string) => {
    if (!user) return;
    
    // Optimistic UI update
    setUser({ ...user, avatar_id: avatar });
    
    // Save to DB
    await supabase
      .from("profiles")
      .update({ avatar_id: avatar })
      .eq("id", user.id);
  };

  if (loading) {
    return (
      <main className="profil-page min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 rounded-full border-4 border-orange-500 border-t-transparent"
        />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="profil-page min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <FloatingShapes count={6} />

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-800/50 bg-slate-900/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/ugur.jpeg"
              alt="Uğur Hoca"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="text-lg font-bold text-white">Uğur Hoca</span>
          </Link>

          <div className="flex items-center gap-4">
            {!user.isAdmin && (
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative text-slate-400 transition-colors hover:text-white"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfa
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-400 transition-colors hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {showNotifications && !user.isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed left-4 right-4 top-14 z-50 max-h-96 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl sm:left-auto sm:right-4 sm:w-80"
        >
          <div className="flex items-center justify-between border-b border-slate-700 p-4">
            <h3 className="font-bold text-white">Bildirimler</h3>
            <span className="text-xs text-slate-400">
              {unreadCount} okunmamış
            </span>
          </div>
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-slate-400">
              Henüz bildirim yok
            </p>
          ) : (
            <div className="divide-y divide-slate-700">
              {notifications.map((notification) => {
                const style = getNotificationStyle(notification);
                const Icon = style.icon;

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full border-l-4 p-4 text-left transition-colors ${style.wrapper}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>
                          <span
                            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.badge}`}
                          >
                            {style.status}
                          </span>
                        </div>
                        {notification.type !== "message-read" &&
                        notification.message ? (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                            {notification.message}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(notification.created_at).toLocaleDateString(
                            "tr-TR",
                          )}
                        </p>
                      </div>
                      <ChevronRight
                        className={`mt-1 h-4 w-4 ${
                          notification.is_read
                            ? "text-emerald-400"
                            : "text-amber-300"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      <div className="px-4 pb-12 pt-20">
        <div className="mx-auto max-w-6xl">
          {user.isAdmin ? (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-3xl font-bold text-white">
                    {user.name?.[0] || "?"}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {user.name}
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-1.5">
                      <Shield className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-semibold text-orange-300">
                        Yönetici
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <Settings className="h-5 w-5" />
                  Admin Paneline Git
                </Link>
              </div>
            </motion.section>
          ) : (
            <div className="space-y-8 w-full max-w-full overflow-hidden">
              <DashboardHero
                user={user}
                continueState={continueState}
                onAvatarClick={() => setIsAvatarModalOpen(true)}
              />

              <div className="mx-auto w-full max-w-full">
                <QuickActionGrid items={quickActionItems} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <ProgressOverview
                  streak={user.current_streak || 0}
                  weeklyMinutes={weeklyMinutes}
                  latestScore={latestQuizScore}
                  strongTopic={strongTopic}
                  focusTopic={focusTopic}
                  detailHref="/ilerleme"
                />
                <MessageSummaryCard
                  unreadCount={unreadCount}
                  latestTitle={latestNotification?.title || null}
                  latestMessage={
                    latestNotification?.message ||
                    latestNotification?.metadata?.sender_name ||
                    null
                  }
                  notifications={notifications}
                  onOpenPanel={() => setShowNotifications(true)}
                  onOpenLatest={openLatestMessage}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <RecentResults results={quizResults} />
                <RecentDocuments documents={sharedDocs} />
              </div>

              <NotesSection userId={user.id} />

              <DashboardSettings />

              <AvatarSelectionModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSelect={handleAvatarSelect}
                currentAvatar={user.avatar_id}
              />
            </div>
          )}
        </div>
      </div>

      {selectedAssignment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedAssignment(null)}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-purple-300">
                  Ödev
                </p>
                <h3 className="text-2xl font-bold text-white">
                  {selectedAssignment.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <p className="whitespace-pre-line leading-relaxed text-slate-300">
              {selectedAssignment.description || "Ayrıntı bulunmuyor."}
            </p>
            <div className="mt-6 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => router.push("/odevler")}
                className="rounded-xl bg-purple-500 px-4 py-2 text-white transition-colors hover:bg-purple-600"
              >
                Ödev Sayfasına Git
              </button>
              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="rounded-xl bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/15"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {selectedMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedMessage(null)}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-indigo-300">
                  Mesaj
                </p>
                <h3 className="text-2xl font-bold text-white">
                  {selectedMessage.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-6 w-6 rotate-45" />
              </button>
            </div>

            {selectedMessage.metadata?.image_url ? (
              <div className="mb-4">
                <img
                  src={selectedMessage.metadata.image_url}
                  alt="Mesaj resmi"
                  className="max-h-64 rounded-lg border border-white/10"
                />
              </div>
            ) : null}

            <p className="whitespace-pre-line leading-relaxed text-slate-300">
              {selectedMessage.message || "Bu bildirim için ek içerik yok."}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-xl bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/15"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
