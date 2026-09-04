'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Plus,
  Radio,
  Search,
  Sparkles,
  Video,
  Zap,
  ChevronDown,
  ChevronUp,
  History,
  GraduationCap,
} from 'lucide-react';
import { HomeNavbar } from '@/features/home/components/HomeNavbar';
import { useTheme } from '@/components/ThemeProvider';
import { signOutClient } from '@/lib/auth-client';
import type { AuthSnapshot } from '@/lib/auth-snapshot';
import type { LiveLesson } from '@/features/live-lessons/types';
import type { AppUser } from '@/types';
import { LiveLessonCard } from '@/features/live-lessons/components/LiveLessonCard';
import { LiveLessonEditModal } from '@/features/live-lessons/components/LiveLessonEditModal';

type Props = {
  initialLessons: LiveLesson[];
  students: AppUser[];
  user: AuthSnapshot;
};

const GRADE_FILTERS = [
  { label: 'Tümü', value: 'all_filter' },
  { label: '5. Sınıf', value: '5' },
  { label: '6. Sınıf', value: '6' },
  { label: '7. Sınıf', value: '7' },
  { label: '8. Sınıf', value: '8' },
  { label: 'YKS / Mezun', value: 'Mezun' },
  { label: 'Herkese Açık', value: 'all' },
];

const GRADE_PLAN_OPTIONS = [
  { label: '5. Sınıf', value: '5' },
  { label: '6. Sınıf', value: '6' },
  { label: '7. Sınıf', value: '7' },
  { label: '8. Sınıf', value: '8' },
  { label: 'YKS / Mezun', value: 'Mezun' },
  { label: 'Herkese Açık', value: 'all' },
  { label: 'Seçili Öğrenciler', value: 'selected' },
];

function toLocalInputValue(date: Date) {
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

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

  // Ders Planlama Form Durumu
  const [title, setTitle] = useState('Canlı Matematik Dersi');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [targetGrade, setTargetGrade] = useState(String(user.grade || 'all'));
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeklyUntil, setRepeatWeeklyUntil] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)),
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOutClient();
    window.location.href = '/giris';
  };

  // Öğrenci arama listesi
  const filteredStudents = useMemo(() => {
    const q = studentSearchQuery.toLocaleLowerCase('tr-TR').trim();
    if (!q) return students;
    return students.filter((s) =>
      `${s.name || ''} ${s.email || ''}`.toLocaleLowerCase('tr-TR').includes(q),
    );
  }, [studentSearchQuery, students]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  // Hızlı Ders Başlat (Quick Launch)
  const handleQuickLaunch = async () => {
    setQuickStarting(true);
    try {
      const now = new Date();
      const defaultTitle = `Hemen Canlı Ders (${new Intl.DateTimeFormat('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(now)})`;

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
        alert(data?.error || 'Ders başlatılamadı.');
        return;
      }

      setLessons((prev) => [data.lesson!, ...prev]);
      router.push(`/canli-ders/d/${data.lesson.room_id}`);
    } catch {
      alert('Ağ hatası oluştu.');
    } finally {
      setQuickStarting(false);
    }
  };

  // Standart Ders Planlama
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Ders başlığı gerekli.');
      return;
    }

    const startDate = new Date(startsAt);
    if (!Number.isFinite(startDate.getTime())) {
      setFormError('Geçerli bir ders tarihi ve saati seçin.');
      return;
    }

    const repeatEnd = repeatWeekly ? new Date(repeatWeeklyUntil) : null;
    if (repeatWeekly && (!repeatEnd || !Number.isFinite(repeatEnd.getTime()))) {
      setFormError('Tekrar bitişi için geçerli bir tarih seçin.');
      return;
    }

    if (targetGrade === 'selected' && selectedStudentIds.length === 0) {
      setFormError('Lütfen en az bir öğrenci seçin.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const response = await fetch('/api/live-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          description: description.trim() || null,
          durationMinutes: Number(durationMinutes),
          repeatWeeklyUntil: repeatEnd ? repeatEnd.toISOString() : null,
          startsAt: startDate.toISOString(),
          targetGrade,
          targetStudentIds: targetGrade === 'selected' ? selectedStudentIds : [],
          title: title.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        lesson?: LiveLesson;
        lessons?: LiveLesson[];
      } | null;

      if (!response.ok || !payload?.lesson) {
        setFormError(payload?.error || 'Ders planlanamadı.');
        return;
      }

      const created = payload.lessons || [payload.lesson];
      setLessons((prev) => [...created, ...prev]);
      setIsPlanFormOpen(false);
      setSelectedStudentIds([]);
      setDescription('');
    } catch {
      setFormError('Ders planlanırken bağlantı hatası oluştu.');
    } finally {
      setSaving(false);
    }
  };

  // Dersi İptal Et
  const handleCancelLesson = async (lesson: LiveLesson) => {
    if (!confirm(`"${lesson.title}" dersini iptal etmek istediğinize emin misiniz?`)) {
      return;
    }

    const res = await fetch(`/api/live-lessons/${lesson.id}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ status: 'cancelled' }),
    });

    const payload = (await res.json().catch(() => null)) as { lesson?: LiveLesson } | null;
    if (res.ok && payload?.lesson) {
      setLessons((prev) => prev.map((l) => (l.id === lesson.id ? payload.lesson! : l)));
    }
  };

  // Dersi Bitir (Tamamla)
  const handleEndLesson = async (lesson: LiveLesson) => {
    if (!confirm(`"${lesson.title}" dersini tamamlandı olarak sonlandırmak istiyor musunuz?`)) {
      return;
    }

    const res = await fetch(`/api/live-lessons/${lesson.id}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ status: 'ended' }),
    });

    const payload = (await res.json().catch(() => null)) as { lesson?: LiveLesson } | null;
    if (res.ok && payload?.lesson) {
      setLessons((prev) => prev.map((l) => (l.id === lesson.id ? payload.lesson! : l)));
    }
  };

  // Düzenleme Sonucu Güncelleme
  const handleLessonUpdated = (updated: LiveLesson) => {
    setLessons((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
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
    past.sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

    return { upcomingLessons: upcoming, pastLessons: past, activeLesson: active };
  }, [lessons]);

  // Arama ve Sınıf Filtresi Uygulama
  const displayedLessons = useMemo(() => {
    const sourceList = activeTab === 'upcoming' ? upcomingLessons : pastLessons;
    const q = searchQuery.toLocaleLowerCase('tr-TR').trim();

    return sourceList.filter((lesson) => {
      // Sınıf Filtresi
      if (selectedGrade !== 'all_filter') {
        if (lesson.target_grade !== selectedGrade && lesson.target_grade !== 'all') {
          return false;
        }
      }

      // Arama Filtresi
      if (q) {
        const text = `${lesson.title} ${lesson.description || ''}`.toLocaleLowerCase('tr-TR');
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [activeTab, pastLessons, searchQuery, selectedGrade, upcomingLessons]);

  // İstatistikler
  const totalUpcomingMinutes = upcomingLessons.reduce((acc, l) => acc + (l.duration_minutes || 60), 0);
  const totalHoursFormatted = `${Math.round((totalUpcomingMinutes / 60) * 10) / 10} saat`;

  const appUser = user as unknown as AppUser;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
      }`}
    >
      <HomeNavbar user={appUser} onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl px-4 pt-20 pb-28 sm:px-6 md:pt-24 md:pb-16">
        {/* Üst Hero Başlık */}
        <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary dark:text-brand-primary-light">
                <Video className="h-3.5 w-3.5" />
                <span>Uğur Hoca Canlı Matematik Sınıfı</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                Canlı Dersler
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-foreground/70 sm:text-base">
                İnteraktif ekran paylaşımı, soru çözümleri, anlık quiz ve birebir rehberlikle matematik derslerini kaçırma.
              </p>
            </div>

            {/* Öğretmen / Admin Hızlı Aksiyon Butonları */}
            {user.isAdmin && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleQuickLaunch}
                  disabled={quickStarting}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  <Zap className="h-4 w-4 fill-white" />
                  <span>{quickStarting ? 'Başlatılıyor...' : 'Hızlı Ders Başlat'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlanFormOpen((v) => !v)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-primary/25 transition-all duration-200 hover:bg-brand-primary-deep active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ders Planla</span>
                  {isPlanFormOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>

          {/* İstatistik Şeridi */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t border-border/80 pt-6">
            {/* 1. Canlı Durumu */}
            <div className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-4 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60">
                <Radio className={`h-4 w-4 ${activeLesson ? 'text-rose-500 animate-pulse' : 'text-foreground/40'}`} />
                <span>Canlı Durumu</span>
              </div>
              <p className="mt-2 text-lg font-black tracking-tight text-foreground sm:text-xl">
                {activeLesson ? (
                  <span className="text-rose-600 dark:text-rose-400">Şu An Canlıda!</span>
                ) : (
                  'Beklemede'
                )}
              </p>
              {activeLesson && (
                <Link
                  href={`/canli-ders/d/${activeLesson.room_id}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline"
                >
                  <span>Derse Gir</span> &rarr;
                </Link>
              )}
            </div>

            {/* 2. Planlanan Ders Sayısı */}
            <div className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-4 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60">
                <Calendar className="h-4 w-4 text-brand-primary" />
                <span>Yaklaşan Ders</span>
              </div>
              <p className="mt-2 text-xl font-black text-foreground sm:text-2xl">
                {upcomingLessons.length}
              </p>
              <span className="text-[11px] text-foreground/50">Planlanmış oturum</span>
            </div>

            {/* 3. Toplam Süre */}
            <div className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-4 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span>Toplam Süre</span>
              </div>
              <p className="mt-2 text-xl font-black text-foreground sm:text-2xl">
                {totalHoursFormatted}
              </p>
              <span className="text-[11px] text-foreground/50">Yaklaşan ders toplamı</span>
            </div>

            {/* 4. Öğrenci Seviyesi */}
            <div className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-4 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60">
                <GraduationCap className="h-4 w-4 text-violet-500" />
                <span>Sınıf / Rol</span>
              </div>
              <p className="mt-2 text-lg font-black text-foreground sm:text-xl truncate">
                {user.isAdmin ? 'Öğretmen' : user.grade ? `${user.grade}. Sınıf` : 'Öğrenci'}
              </p>
              <span className="text-[11px] text-foreground/50">{user.name}</span>
            </div>
          </div>
        </section>

        {/* Öğretmen İçin Açılır Katlanabilir Ders Planlama Formu */}
        {user.isAdmin && isPlanFormOpen && (
          <section className="mt-6 rounded-3xl border border-brand-primary/30 bg-card p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-primary" />
                <h2 className="text-lg font-bold text-foreground">Yeni Canlı Ders Planla</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPlanFormOpen(false)}
                className="text-xs text-foreground/60 hover:text-foreground"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="plan-title" className="block text-xs font-semibold text-foreground/80">
                    Ders Başlığı *
                  </label>
                  <input
                    id="plan-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: 8. Sınıf LGS Çarpanlar ve Katlar"
                    required
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label htmlFor="plan-grade" className="block text-xs font-semibold text-foreground/80">
                    Ders Hedef Kitlesi *
                  </label>
                  <select
                    id="plan-grade"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    {GRADE_PLAN_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seçili Öğrenci Arama ve İşaretleme */}
              {targetGrade === 'selected' && (
                <div className="rounded-2xl border border-border p-4 bg-foreground/[0.02] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground/90">Öğrencileri Seç</span>
                    <span className="text-xs text-brand-primary font-bold">
                      {selectedStudentIds.length} öğrenci seçildi
                    </span>
                  </div>

                  <input
                    type="search"
                    placeholder="Öğrenci adı veya e-posta ile ara..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-primary"
                  />

                  <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
                    {filteredStudents.map((s) => {
                      const isChecked = selectedStudentIds.includes(s.id);
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => toggleStudent(s.id)}
                          className={`flex items-center justify-between rounded-xl border p-2 text-left text-xs transition ${
                            isChecked
                              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold'
                              : 'border-border/70 hover:bg-foreground/5 text-foreground/80'
                          }`}
                        >
                          <span className="truncate">{s.name || s.email}</span>
                          <span className="text-[10px] opacity-60">
                            {s.grade === 'Mezun' ? 'Mezun' : `${s.grade}. sınıf`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="plan-starts-at" className="block text-xs font-semibold text-foreground/80">
                    Başlangıç Tarihi ve Saati *
                  </label>
                  <input
                    id="plan-starts-at"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label htmlFor="plan-duration" className="block text-xs font-semibold text-foreground/80">
                    Planlanan Süre (Dakika) *
                  </label>
                  <input
                    id="plan-duration"
                    type="number"
                    min={15}
                    max={240}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    required
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Tekrar Seçeneği */}
              <div className="space-y-3 rounded-2xl border border-border p-4 bg-foreground/[0.01]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={repeatWeekly}
                    onChange={(e) => setRepeatWeekly(e.target.checked)}
                    className="h-4 w-4 rounded accent-brand-primary"
                  />
                  <span className="text-xs font-bold text-foreground/90">
                    Her hafta aynı gün ve saatte tekrarla
                  </span>
                </label>

                {repeatWeekly && (
                  <div className="pt-2 animate-in fade-in">
                    <label htmlFor="plan-repeat-until" className="block text-xs font-semibold text-foreground/80">
                      Tekrar Bitiş Tarihi
                    </label>
                    <input
                      id="plan-repeat-until"
                      type="datetime-local"
                      value={repeatWeeklyUntil}
                      onChange={(e) => setRepeatWeeklyUntil(e.target.value)}
                      className="mt-1 w-full sm:w-80 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <span className="mt-1 block text-[11px] text-foreground/50">
                      Sistem en fazla 16 haftalık periyodik ders oluşturur.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="plan-description" className="block text-xs font-semibold text-foreground/80">
                  Ders Açıklaması / Kazanım ve Notlar
                </label>
                <textarea
                  id="plan-description"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ders öncesi hazırlık, PDF notları veya soru kaynakları..."
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsPlanFormOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground/80 hover:bg-foreground/5"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={saving || (targetGrade === 'selected' && selectedStudentIds.length === 0)}
                  className="rounded-xl bg-brand-primary px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-brand-primary-deep disabled:opacity-50"
                >
                  {saving ? 'Planlanıyor...' : 'Dersi Takvime Ekle'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Sekmeler, Arama ve Filtre Çubuğu */}
        <section className="mt-10 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Sekme Butonları */}
            <div className="flex items-center rounded-2xl border border-border bg-card p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Yaklaşan Dersler</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    activeTab === 'upcoming'
                      ? 'bg-white/20 text-white'
                      : 'bg-foreground/10 text-foreground/70'
                  }`}
                >
                  {upcomingLessons.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'past'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                <History className="h-4 w-4" />
                <span>Geçmiş Dersler</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    activeTab === 'past'
                      ? 'bg-white/20 text-white'
                      : 'bg-foreground/10 text-foreground/70'
                  }`}
                >
                  {pastLessons.length}
                </span>
              </button>
            </div>

            {/* Arama Kutusu */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
              <input
                type="search"
                placeholder="Ders ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card pl-9 pr-4 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Sınıf Filtresi Çipleri */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {GRADE_FILTERS.map((f) => {
              const isSelected = selectedGrade === f.value;
              return (
                <button
                  type="button"
                  key={f.value}
                  onClick={() => setSelectedGrade(f.value)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-foreground text-background font-bold shadow-sm'
                      : 'border border-border bg-card text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Ders Kartları Listesi */}
        <section className="mt-6">
          {displayedLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center bg-card/40">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5 text-foreground/40">
                {activeTab === 'upcoming' ? <Calendar className="h-7 w-7" /> : <History className="h-7 w-7" />}
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                {activeTab === 'upcoming' ? 'Yaklaşan Ders Bulunmuyor' : 'Geçmiş Ders Kaydı Yok'}
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
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-primary-deep"
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
    </div>
  );
}
