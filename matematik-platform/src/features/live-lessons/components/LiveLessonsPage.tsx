'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, History, Plus } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { HomeNavbar } from '@/features/home/components/HomeNavbar';
import { LessonReplayArchiveModal } from '@/features/live-lessons/components/LessonReplayArchiveModal';
import { LiveLessonCard } from '@/features/live-lessons/components/LiveLessonCard';
import { LiveLessonEditModal } from '@/features/live-lessons/components/LiveLessonEditModal';
import { SubmitQuestionModal } from '@/features/live-lessons/components/SubmitQuestionModal';
import { TeacherQuestionPoolModal } from '@/features/live-lessons/components/TeacherQuestionPoolModal';
import type { LiveLesson } from '@/features/live-lessons/types';
import { signOutClient } from '@/lib/auth-client';
import type { AuthSnapshot } from '@/lib/auth-snapshot';
import type { AppUser } from '@/types';
import { LiveLessonPlanForm } from './LiveLessonsPage/LiveLessonPlanForm';
import { LiveLessonsFilterTabs } from './LiveLessonsPage/LiveLessonsFilterTabs';
import { LiveLessonsHero } from './LiveLessonsPage/LiveLessonsHero';

type Props = {
  initialLessons: LiveLesson[];
  students: AppUser[];
  user: AuthSnapshot;
};

export function LiveLessonsPage({ initialLessons, students, user }: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [lessons, setLessons] = useState<LiveLesson[]>(initialLessons);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedGrade, setSelectedGrade] = useState('all_filter');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LiveLesson | null>(null);
  const [quickStarting, setQuickStarting] = useState(false);
  const [isSubmitQuestionOpen, setIsSubmitQuestionOpen] = useState(false);
  const [isTeacherPoolOpen, setIsTeacherPoolOpen] = useState(false);
  const [isReplayArchiveOpen, setIsReplayArchiveOpen] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingLessonAction, setPendingLessonAction] = useState<{
    lesson: LiveLesson;
    status: 'cancelled' | 'ended';
  } | null>(null);

  const handleLogout = async () => {
    await signOutClient();
    router.push('/giris');
  };

  // Hızlı Ders Başlat (Quick Launch)
  const handleQuickLaunch = async () => {
    setQuickStarting(true);
    setActionError(null);
    try {
      const now = new Date();
      const defaultTitle = `Hemen Canlı Ders (${new Intl.DateTimeFormat(
        'tr-TR',
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      ).format(now)})`;

      const res = await fetch('/api/live-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          title: defaultTitle,
          description: 'Hızlı başlatılan canlı ders oturumu.',
          durationMinutes: 60,
          startsAt: now.toISOString(),
          targetGrade: 'all',
          targetStudentIds: [],
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        lesson?: LiveLesson;
        error?: string;
      } | null;

      if (!res.ok || !data?.lesson) {
        setActionError(data?.error || 'Ders başlatılamadı.');
        return;
      }

      setLessons((prev) => [data.lesson!, ...prev]);
      router.push(`/canli-ders/d/${data.lesson.room_id}`);
    } catch {
      setActionError('Ağ hatası oluştu.');
    } finally {
      setQuickStarting(false);
    }
  };

  // Dersi İptal Et
  const handleCancelLesson = (lesson: LiveLesson) => {
    setPendingLessonAction({ lesson, status: 'cancelled' });
  };

  // Dersi Bitir (Tamamla)
  const handleEndLesson = (lesson: LiveLesson) => {
    setPendingLessonAction({ lesson, status: 'ended' });
  };

  const confirmPendingLessonAction = async () => {
    if (!pendingLessonAction) return;
    const { lesson, status } = pendingLessonAction;
    setPendingLessonAction(null);
    setActionError(null);

    try {
      const res = await fetch(`/api/live-lessons/${lesson.id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ status }),
      });

      const payload = (await res.json().catch(() => null)) as {
        lesson?: LiveLesson;
        error?: string;
      } | null;
      if (res.ok && payload?.lesson) {
        setLessons((prev) =>
          prev.map((l) => (l.id === lesson.id ? payload.lesson! : l)),
        );
      } else {
        setActionError(payload?.error || 'Ders durumu güncellenemedi.');
      }
    } catch {
      setActionError('Ağ hatası oluştu.');
    }
  };

  // Düzenleme Sonucu Güncelleme
  const handleLessonUpdated = (updated: LiveLesson) => {
    setLessons((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleLessonsCreated = (newLessons: LiveLesson[]) => {
    setLessons((prev) => [...newLessons, ...prev]);
  };

  // Dersleri Kategorilere ve Filtrelere Ayırma
  const { upcomingLessons, pastLessons, activeLesson } = useMemo(() => {
    const upcoming: LiveLesson[] = [];
    const past: LiveLesson[] = [];
    let active: LiveLesson | null = null;

    for (const l of lessons) {
      if (l.status === 'active') {
        active = l;
        upcoming.push(l);
      } else if (l.status === 'scheduled') {
        upcoming.push(l);
      } else {
        past.push(l);
      }
    }

    // Yaklaşanlar: aktif olanlar en başta, sonra en yakın tarih
    upcoming.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (b.status === 'active' && a.status !== 'active') return 1;
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    });

    // Geçmiştekiler: en son biten en başta
    past.sort(
      (a, b) =>
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime(),
    );

    return {
      upcomingLessons: upcoming,
      pastLessons: past,
      activeLesson: active,
    };
  }, [lessons]);

  // Arama ve Sınıf Filtresi Uygulama
  const displayedLessons = useMemo(() => {
    const sourceList = activeTab === 'upcoming' ? upcomingLessons : pastLessons;
    const q = searchQuery.toLocaleLowerCase('tr-TR').trim();

    return sourceList.filter((lesson) => {
      // Sınıf Filtresi
      if (selectedGrade !== 'all_filter') {
        if (
          lesson.target_grade !== selectedGrade &&
          lesson.target_grade !== 'all'
        ) {
          return false;
        }
      }

      // Arama Filtresi
      if (q) {
        const text =
          `${lesson.title} ${lesson.description || ''}`.toLocaleLowerCase(
            'tr-TR',
          );
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [activeTab, pastLessons, searchQuery, selectedGrade, upcomingLessons]);

  // İstatistikler
  const totalUpcomingMinutes = upcomingLessons.reduce(
    (acc, l) => acc + (l.duration_minutes || 60),
    0,
  );
  const totalHoursFormatted = `${Math.round((totalUpcomingMinutes / 60) * 10) / 10} saat`;

  const appUser = user as unknown as AppUser;

  return (
    <div
      className={`page-surface min-h-screen transition-colors duration-300 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'dark:bg-slate-950 text-white'
      }`}
    >
      <HomeNavbar user={appUser} onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl px-4 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-28 sm:px-6 md:pt-24 md:pb-16">
        <LiveLessonsHero
          user={user}
          upcomingLessonsCount={upcomingLessons.length}
          totalHoursFormatted={totalHoursFormatted}
          activeLesson={activeLesson}
          quickStarting={quickStarting}
          isPlanFormOpen={isPlanFormOpen}
          onTogglePlanForm={() => setIsPlanFormOpen((v) => !v)}
          onQuickLaunch={handleQuickLaunch}
          onOpenSubmitQuestion={() => setIsSubmitQuestionOpen(true)}
          onOpenReplayArchive={() => setIsReplayArchiveOpen(true)}
          onOpenTeacherPool={() => setIsTeacherPoolOpen(true)}
        />

        {actionError && (
          <div
            role="alert"
            className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400"
          >
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="rounded-lg px-2 py-1 text-xs font-bold hover:bg-red-500/15 transition-colors"
            >
              Kapat
            </button>
          </div>
        )}

        {pendingLessonAction && (
          <div
            role="alertdialog"
            aria-label="Ders durumu onayı"
            className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs sm:text-sm"
          >
            <span className="font-semibold text-amber-800 dark:text-amber-200">
              {pendingLessonAction.status === 'cancelled'
                ? `"${pendingLessonAction.lesson.title}" dersini iptal etmek istediğinize emin misiniz?`
                : `"${pendingLessonAction.lesson.title}" dersini tamamlandı olarak sonlandırmak istiyor musunuz?`}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={confirmPendingLessonAction}
                className="rounded-xl border border-red-500/30 bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-500/25 transition-colors"
              >
                {pendingLessonAction.status === 'cancelled'
                  ? 'Evet, İptal Et'
                  : 'Evet, Sonlandır'}
              </button>
              <button
                type="button"
                onClick={() => setPendingLessonAction(null)}
                className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-foreground/5 transition-colors"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}

        {/* Öğretmen İçin Açılır Katlanabilir Ders Planlama Formu */}
        {user.isAdmin && isPlanFormOpen && (
          <LiveLessonPlanForm
            userGrade={user.grade}
            students={students}
            onClose={() => setIsPlanFormOpen(false)}
            onLessonsCreated={handleLessonsCreated}
          />
        )}

        {/* Sekmeler, Arama ve Filtre Çubuğu */}
        <LiveLessonsFilterTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          upcomingCount={upcomingLessons.length}
          pastCount={pastLessons.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
        />

        {/* Ders Kartları Listesi */}
        <section className="mt-6">
          {displayedLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center bg-card/40">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5 text-foreground/40">
                {activeTab === 'upcoming' ? (
                  <Calendar className="h-7 w-7" />
                ) : (
                  <History className="h-7 w-7" />
                )}
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                {activeTab === 'upcoming'
                  ? 'Yaklaşan Ders Bulunmuyor'
                  : 'Geçmiş Ders Kaydı Yok'}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-foreground/60">
                {activeTab === 'upcoming'
                  ? 'Şu anda bu kritere uygun planlanan bir canlı ders yok. Yeni dersler eklendiğinde burada listelenecektir.'
                  : 'Daha önce tamamlanmış veya arşivlenmiş canlı ders kaydı bulunmuyor.'}
              </p>
              {user.isAdmin && activeTab === 'upcoming' && (
                <button
                  type="button"
                  onClick={() => setIsPlanFormOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>İlk Dersi Planla</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
              {displayedLessons.map((lesson) => (
                <LiveLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  students={students}
                  isAdmin={user.isAdmin}
                  onEdit={(l) => setEditingLesson(l)}
                  onCancel={handleCancelLesson}
                  onEnd={handleEndLesson}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Dersi Düzenle Modalı */}
      {editingLesson && (
        <LiveLessonEditModal
          isOpen={Boolean(editingLesson)}
          lesson={editingLesson}
          onClose={() => setEditingLesson(null)}
          onSuccess={handleLessonUpdated}
          students={students}
        />
      )}

      {/* Soru Gönder Modalı */}
      <SubmitQuestionModal
        isOpen={isSubmitQuestionOpen}
        onClose={() => setIsSubmitQuestionOpen(false)}
        lessons={upcomingLessons}
        defaultStudentName={user.name || ''}
        isLight={isLight}
      />

      {/* Öğretmen Soru Havuzu Modalı */}
      <TeacherQuestionPoolModal
        isOpen={isTeacherPoolOpen}
        onClose={() => setIsTeacherPoolOpen(false)}
        isLight={isLight}
      />

      {/* Ders Kayıtları ve Zaman Damgalı Arşiv Modalı */}
      <LessonReplayArchiveModal
        isOpen={isReplayArchiveOpen}
        onClose={() => setIsReplayArchiveOpen(false)}
        gradeFilter={selectedGrade}
      />
    </div>
  );
}
