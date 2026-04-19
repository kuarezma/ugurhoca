'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Target,
  Flame,
  Plus,
  Video,
  BookOpen,
  PenTool,
  CheckCircle2,
  Award,
  Download,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';
import { requireClientSession } from '@/lib/auth-client';
import { createLogger } from '@/lib/logger';
import { supabase } from '@/lib/supabase/client';
import type { AppUser } from '@/types';
import type { InitialProgressPageData } from '@/features/progress/server';
import type {
  ProgressRow,
  StudyGoal,
  StudySession,
  UserBadge,
} from '@/features/progress/types';
import { getTopicsForGrade } from '@/features/progress/constants';
import {
  mergeProgressRow,
  prependStudySession,
  resolveCurrentGoal,
} from '@/features/progress/utils';
import type { RadarChartPoint } from '@/features/progress/components/ProgressCharts';

const log = createLogger('progress-page');

const ProgressCharts = dynamic(
  () =>
    import('@/features/progress/components/ProgressCharts').then(
      (m) => m.ProgressCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" aria-hidden>
        <div className="h-80 min-h-[16rem] animate-pulse rounded-3xl border border-slate-700/40 bg-slate-800/25" />
        <div className="h-80 min-h-[16rem] animate-pulse rounded-3xl border border-slate-700/40 bg-slate-800/25" />
      </div>
    ),
  },
);

type ProgressPageProps = {
  initialData?: InitialProgressPageData;
};

export default function IlerlemePage({ initialData }: ProgressPageProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const isLight = theme === 'light';
  
  const [user, setUser] = useState<AppUser | null>(initialData?.user ?? null);
  const [loading, setLoading] = useState(!(initialData?.isHydrated ?? false));
  const [sessions, setSessions] = useState<StudySession[]>(
    initialData?.sessions ?? [],
  );
  const [progressData, setProgressData] = useState<ProgressRow[]>(
    initialData?.progressData ?? [],
  );
  const [goal, setGoal] = useState<StudyGoal | null>(initialData?.goal ?? null);
  const [badges, setBadges] = useState<UserBadge[]>(initialData?.badges ?? []);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [activityType, setActivityType] = useState('test');
  const [duration, setDuration] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [addingSession, setAddingSession] = useState(false);
  const [addSessionError, setAddSessionError] = useState<string | null>(null);
  const initialUserKey = useMemo(
    () =>
      initialData?.user
        ? `${initialData.user.id}:${String(initialData.user.grade)}`
        : null,
    [initialData?.user],
  );
  const availableTopics = useMemo(
    () => getTopicsForGrade(user?.grade),
    [user?.grade],
  );

  const resolvedTopic = useMemo(() => {
    const custom = customTopic.trim();
    if (custom.length > 0) {
      return custom.slice(0, 200);
    }
    return selectedTopic.trim();
  }, [customTopic, selectedTopic]);

  const loadDashboardData = useCallback(async () => {
    const session = await requireClientSession({ router });
    if (!session) {
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const resolvedUser =
      profile || {
        id: session.user.id,
        name: 'Öğrenci',
        email: session.user.email,
        current_streak: 0,
      };

    setUser(resolvedUser);

    if (
      (initialData?.isHydrated ?? false) &&
      `${resolvedUser.id}:${String(resolvedUser.grade)}` === initialUserKey
    ) {
      setLoading(false);
      return;
    }

    const [sessionsRes, progressRes, goalRes, badgesRes] = await Promise.all([
      supabase.from('study_sessions').select('*').eq('user_id', session.user.id).order('date', { ascending: false }),
      supabase.from('user_progress').select('*').eq('user_id', session.user.id).order('mastery_level', { ascending: false }),
      supabase.from('study_goals').select('*').eq('user_id', session.user.id),
      supabase.from('user_badges').select('*').eq('user_id', session.user.id).order('earned_at', { ascending: false })
    ]);

    setSessions(sessionsRes.data || []);
    setProgressData(progressRes.data || []);
    setBadges(badgesRes.data || []);
    setGoal(resolveCurrentGoal(goalRes.data || []));
    
    setLoading(false);
  }, [initialData?.isHydrated, initialUserKey, router]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (!selectedTopic) {
      return;
    }

    if (!availableTopics.includes(selectedTopic)) {
      setSelectedTopic('');
    }
  }, [availableTopics, selectedTopic]);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) return;
    if (!resolvedTopic) return;
    if (!user) return;
    
    setAddingSession(true);
    setAddSessionError(null);
    
    try {
      const durationNum = parseInt(duration);
      const sessionDate = new Date().toISOString().split('T')[0] || '';
      const sessionPayload = {
        user_id: user.id,
        activity_type: activityType,
        duration: durationNum,
        topics: [resolvedTopic],
        date: sessionDate,
      };

      const { data: insertedSession, error: sessionError } = await supabase
        .from('study_sessions')
        .insert([sessionPayload])
        .select()
        .single();

      if (sessionError) throw sessionError;

      const existingProgress = progressData.find(p => p.topic === resolvedTopic);
      const masteryIncrement = Math.min(100, Math.floor(durationNum / 5));
      const newMastery = Math.min(100, (existingProgress?.mastery_level || 0) + masteryIncrement);

      const nextProgressRow = {
        user_id: user.id,
        topic: resolvedTopic,
        mastery_level: newMastery,
        practice_count: (existingProgress?.practice_count || 0) + 1,
        last_practiced: new Date().toISOString(),
      };

      const { data: upsertedProgress, error: progressError } = await supabase
        .from('user_progress')
        .upsert([nextProgressRow], { onConflict: 'user_id,topic' })
        .select()
        .single();

      if (progressError) throw progressError;

      setSessions((current) =>
        prependStudySession(
          current,
          (insertedSession || sessionPayload) as StudySession,
        ),
      );
      setProgressData((current) =>
        mergeProgressRow(
          current,
          (upsertedProgress || nextProgressRow) as ProgressRow,
        ),
      );
      setShowAddModal(false);
      setDuration('');
      setSelectedTopic('');
      setCustomTopic('');
      
    } catch (error) {
      log.error('Ders saati kayıt hatası', error);
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' &&
              error &&
              'message' in error &&
              typeof error.message === 'string'
            ? error.message
            : 'Bilinmeyen bir hata oluştu.';

      setAddSessionError(`Kayıt eklenemedi: ${message}`);
    } finally {
      setAddingSession(false);
    }
  };

  if (loading) {
    return (
      <main className={`min-h-screen pb-20 ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
        <div
          className="max-w-6xl mx-auto px-4 py-10 space-y-6"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-10 w-36" rounded="lg" />
          </div>
          <Skeleton className="h-4 w-80" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="col-span-1 md:col-span-2 h-40" rounded="lg" />
            <Skeleton className="h-40" rounded="lg" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-80" rounded="lg" />
            <Skeleton className="h-80" rounded="lg" />
          </div>
        </div>
      </main>
    );
  }

  const getWeeklyChartData = () => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const data = days.map(d => ({ name: d, duration: 0 }));
    
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1; 
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0,0,0,0);

    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= startOfWeek) {
        const index = sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1;
        if (index >= 0 && index < 7) {
          data[index].duration += session.duration;
        }
      }
    });

    return data;
  };

  const chartData = getWeeklyChartData();
  const currentWeekTotal = chartData.reduce((acc, curr) => acc + curr.duration, 0);
  const goalPercentage = Math.min(
    100,
    Math.round((currentWeekTotal / (goal?.target_duration || 1)) * 100),
  );
  
  // Radar data hazırlama: Sadece bir kez veya daha fazla çalışılmış top 6 konu
  const radarData = [...progressData].slice(0, 6).map(p => ({
    subject: p.topic.split(' ')[0], // İlk kelimesini al ekrana sığsın
    A: p.mastery_level,
    fullMark: 100,
  }));
  
  // Eğre yetersiz veri varsa Dummy radar
  const displayRadarData: RadarChartPoint[] =
    radarData.length > 2
      ? radarData
      : [
          { subject: 'Çarpanlar', A: 20, fullMark: 100 },
          { subject: 'Üslü', A: 40, fullMark: 100 },
          { subject: 'Köklü', A: 10, fullMark: 100 },
          { subject: 'Olasılık', A: 0, fullMark: 100 },
        ];

  const handleDownloadProgressPdf = async () => {
    setPdfLoading(true);

    try {
      const { downloadProgressPDF } = await import('@/lib/pdf-export');
      await downloadProgressPDF();
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <main className={`min-h-screen pb-20 ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
      <header className={`sticky top-0 z-40 backdrop-blur-lg border-b ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/profil" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 font-medium">
            <ArrowLeft className="w-5 h-5" /> Geri Dön
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{user?.current_streak || 0} Gün</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => void handleDownloadProgressPdf()}
              disabled={pdfLoading}
              title="Gelişim Raporunu PDF İndir"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-semibold text-sm transition-all disabled:opacity-50 ${
                isLight
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {pdfLoading
                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Download className="w-4 h-4" />
              }
              <span className="hidden sm:inline">{pdfLoading ? 'Hazırlanıyor...' : 'PDF'}</span>
            </motion.button>
            <ThemeToggle compact />
          </div>
        </div>
      </header>

      <div id="ilerleme-pdf-content" className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Başlık ve Çalışma Ekle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>Gelişim Ekranı</h1>
            <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>Çalışmalarını takip et, hedeflerine ulaş.</p>
          </div>
          <button 
            onClick={() => {
              setAddSessionError(null);
              setCustomTopic('');
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Plus className="w-5 h-5" /> Çalışma Ekle
          </button>
        </div>

        {/* Üst Paneller */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Haftalık Hedef */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`col-span-1 md:col-span-2 rounded-3xl p-6 sm:p-8 relative overflow-hidden border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br blur-3xl opacity-20 pointer-events-none ${isLight ? 'from-orange-500 to-red-500' : 'from-orange-500 to-red-500'}`} />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 w-full relative">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className={`w-5 h-5 ${isLight ? 'text-orange-500' : 'text-orange-400'}`} />
                      <h3 className={`font-bold uppercase tracking-wider text-xs ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>Haftalık Hedef</h3>
                    </div>
                    <p className={`text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {currentWeekTotal} <span className={`text-lg font-medium ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>/ {goal?.target_duration || 0} dk</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-4xl font-black flex items-center gap-2 ${goalPercentage >= 100 ? 'text-emerald-500' : isLight ? 'text-orange-500' : 'text-orange-400'}`}>
                      %{goalPercentage}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className={`h-4 w-full rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goalPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${goalPercentage >= 100 ? 'from-emerald-400 to-green-500' : 'from-orange-400 to-red-500'}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stat (Rozetler Paneli Olarak Değiştirildi) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`rounded-3xl p-6 sm:p-8 flex flex-col border ${isLight ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100' : 'bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border-indigo-500/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  <Award className="w-4 h-4" />
                </div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-indigo-900/70' : 'text-indigo-200/70'}`}>Rozetlerim</h3>
              </div>
              <span className={`text-xl font-black ${isLight ? 'text-indigo-900' : 'text-white'}`}>{badges.length}</span>
            </div>
            
            {badges.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Target className={`w-8 h-8 mb-2 ${isLight ? 'text-indigo-900/50' : 'text-indigo-200/50'}`} />
                <p className={`text-xs font-semibold ${isLight ? 'text-indigo-900/60' : 'text-indigo-200/60'}`}>Test çöz rozet kazan!</p>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-2 gap-2 mt-2">
                {badges.slice(0, 4).map((badge) => (
                  <div key={badge.id} className="relative group cursor-pointer">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 shadow-lg shadow-orange-500/25 animate-wiggle-hover">
                      <div className="flex h-full w-full items-center justify-center">
                        <Award className="h-6 w-6 text-white drop-shadow" aria-hidden="true" />
                      </div>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        style={{ backgroundSize: '200% 100%' }}
                      />
                    </div>
                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] whitespace-nowrap rounded font-medium transition-opacity pointer-events-none z-10">
                      {badge.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <ProgressCharts
          isLight={isLight}
          chartData={chartData}
          displayRadarData={displayRadarData}
        />

        {/* Mevcut Geleneksel Konu Çubuğu Barı (Optional, Alta alındı detay için) */}
        {progressData.length > 0 && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`rounded-3xl p-6 border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
            <h2 className={`font-bold text-lg mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>Detaylı Konu İlerlemesi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {progressData.map(prog => (
                <div key={prog.id} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{prog.topic}</span>
                    <span className={`font-bold ${prog.mastery_level > 80 ? 'text-emerald-500' : prog.mastery_level < 40 ? 'text-red-500' : 'text-amber-500'}`}>%{prog.mastery_level}</span>
                  </div>
                  <div className={`h-2.5 w-full rounded-full ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
                    <div 
                      className={`h-full rounded-full ${prog.mastery_level > 80 ? 'bg-emerald-500' : prog.mastery_level < 40 ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${prog.mastery_level}%` }}
                    />
                  </div>
                </div>
              ))}
             </div>
           </motion.div>
        )}
      </div>

      <Modal
        open={showAddModal}
        onClose={() => {
          setAddSessionError(null);
          setCustomTopic('');
          setShowAddModal(false);
        }}
        title="Çalışma Ekle"
        description="Bugün çalıştığın konuyu ve süreni kaydet."
        size="md"
      >
        <form onSubmit={handleAddSession} className="space-y-5">
          {addSessionError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-500 dark:text-rose-300"
            >
              {addSessionError}
            </div>
          )}
          <div>
            <div
              id="activity-type-label"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400"
            >
              Aktivite Tipi
            </div>
            <div role="radiogroup" aria-labelledby="activity-type-label" className="grid grid-cols-3 gap-2">
              {[
                { id: 'test', label: 'Test Çözümü', icon: PenTool },
                { id: 'video', label: 'Video İzleme', icon: Video },
                { id: 'kitap', label: 'Kitap Okuma', icon: BookOpen },
              ].map((type) => {
                const active = activityType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setAddSessionError(null);
                      setActivityType(type.id);
                    }}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                      active
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-slate-200 text-slate-400 hover:border-slate-300 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5'
                    }`}
                  >
                    <type.icon className="h-5 w-5" aria-hidden="true" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Select
            label="Konu (listeden)"
            value={selectedTopic}
            onChange={(e) => {
              setAddSessionError(null);
              setSelectedTopic(e.target.value);
            }}
          >
            <option value="">Seç veya aşağıya kendi konunu yaz...</option>
            {availableTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </Select>

          <Input
            label="Kendi konun"
            type="text"
            maxLength={200}
            placeholder="Örn: Parabol tekrarı, deneme analizi..."
            value={customTopic}
            onChange={(e) => {
              setAddSessionError(null);
              setCustomTopic(e.target.value);
            }}
            hint="Doldurursan bu ad geçerli olur; liste seçimini geçersiz kılar."
          />

          <Input
            label="Süre (dakika)"
            type="number"
            required
            min={1}
            max={600}
            placeholder="Örn: 45"
            value={duration}
            onChange={(e) => {
              setAddSessionError(null);
              setDuration(e.target.value);
            }}
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={addingSession}
            disabled={
              addingSession ||
              !duration.trim() ||
              Number.isNaN(Number(duration)) ||
              Number(duration) <= 0 ||
              !resolvedTopic
            }
            leadingIcon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
          >
            {addingSession ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </form>
      </Modal>
    </main>
  );
}
