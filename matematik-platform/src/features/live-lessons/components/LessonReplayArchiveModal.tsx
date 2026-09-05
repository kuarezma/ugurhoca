'use client';

import { useState } from 'react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  X,
  Play,
  Pause,
  Clock,
  Calendar,
  FileText,
  Search,
  Video,
  Download,
  Users,
  FastForward,
  Bookmark,
} from 'lucide-react';

export type ReplayChapter = {
  timeSeconds: number;
  timeFormatted: string;
  title: string;
  topicTag: string;
};

export type RecordedLesson = {
  id: string;
  title: string;
  grade: string;
  teacherName: string;
  dateStr: string;
  durationMinutes: number;
  attendeesCount: number;
  videoUrl?: string;
  boardNotesUrl?: string;
  description: string;
  chapters: ReplayChapter[];
};

export const SAMPLE_RECORDED_LESSONS: RecordedLesson[] = [
  {
    id: 'rec-1',
    title: 'LGS Çarpanlara Ayırma & Yeni Nesil Soru Kampı',
    grade: '8',
    teacherName: 'Uğur Hoca',
    dateStr: '4 Eylül 2026',
    durationMinutes: 60,
    attendeesCount: 32,
    description: 'Özdeşlik modelleri, iki kare farkı, ortak çarpan parantezi ve çıkmış LGS soru kalıplarının derinlemesine analizi.',
    chapters: [
      { timeSeconds: 0, timeFormatted: '00:00', title: 'Giriş & Günün Hedefleri', topicTag: 'Isınma' },
      { timeSeconds: 750, timeFormatted: '12:30', title: 'Tam Kare Özdeşlikleri ve Geometrik İspat', topicTag: 'Kavram' },
      { timeSeconds: 1600, timeFormatted: '26:40', title: 'İki Kare Farkı & Çıkmış Soru Çözümü', topicTag: 'Yeni Nesil' },
      { timeSeconds: 2520, timeFormatted: '42:00', title: 'Tahtada Öğrenci Sorusu İncelemesi', topicTag: 'Soru Havuzu' },
      { timeSeconds: 3180, timeFormatted: '53:00', title: 'Ödev Açıklaması & Kapanış', topicTag: 'Kapanış' },
    ],
  },
  {
    id: 'rec-2',
    title: 'LGS Üçgenler, Pisagor & Kenarortay Bağıntıları',
    grade: '8',
    teacherName: 'Uğur Hoca',
    dateStr: '2 Eylül 2026',
    durationMinutes: 55,
    attendeesCount: 29,
    description: 'Özel dik üçgenler (3-4-5, 5-12-13), üçgen eşitsizliği ve katlama sorularında pratik çözüm teknikleri.',
    chapters: [
      { timeSeconds: 0, timeFormatted: '00:00', title: 'Üçgen Eşitsizliği Hatırlatma', topicTag: 'Giriş' },
      { timeSeconds: 840, timeFormatted: '14:00', title: 'Pisagor Bağıntısı & Özel Dik Üçgenler', topicTag: 'Formül' },
      { timeSeconds: 1800, timeFormatted: '30:00', title: 'LGS Katlama ve Şekil Analiz Soruları', topicTag: 'Geometri' },
      { timeSeconds: 2700, timeFormatted: '45:00', title: 'Zor Soru Turlama Tekniği', topicTag: 'Taktik' },
    ],
  },
  {
    id: 'rec-3',
    title: 'YKS / TYT Temel Matematik: Fonksiyon Grafikleri',
    grade: 'Mezun',
    teacherName: 'Uğur Hoca',
    dateStr: '28 Ağustos 2026',
    durationMinutes: 70,
    attendeesCount: 45,
    description: 'Fonksiyonlarda öteleme, simetri, tanım ve görüntü kümesi belirleme.',
    chapters: [
      { timeSeconds: 0, timeFormatted: '00:00', title: 'Fonksiyon Tanım Aralığı', topicTag: 'TYT' },
      { timeSeconds: 1200, timeFormatted: '20:00', title: 'Grafik Okuma & Öteleme Kuralları', topicTag: 'Grafik' },
      { timeSeconds: 2400, timeFormatted: '40:00', title: 'Bileşke ve Ters Fonksiyon Soruları', topicTag: 'AYT' },
      { timeSeconds: 3600, timeFormatted: '60:00', title: 'ÖSYM Tarzı Çıkmış Sorular', topicTag: 'Analiz' },
    ],
  },
];

type LessonReplayArchiveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  gradeFilter?: string;
};

export function LessonReplayArchiveModal({
  isOpen,
  onClose,
  gradeFilter = 'all',
}: LessonReplayArchiveModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [selectedLesson, setSelectedLesson] = useState<RecordedLesson>(
    SAMPLE_RECORDED_LESSONS[0]
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGradeTab, setActiveGradeTab] = useState(gradeFilter);

  if (!isOpen) return null;

  const filteredLessons = SAMPLE_RECORDED_LESSONS.filter((lesson) => {
    if (activeGradeTab !== 'all' && activeGradeTab !== 'all_filter') {
      if (lesson.grade !== activeGradeTab) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        lesson.title.toLowerCase().includes(q) ||
        lesson.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleJumpToChapter = (seconds: number) => {
    setCurrentSeconds(seconds);
    setIsPlaying(true);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Canlı Ders Kayıtları & Ders Arşivi"
        className="relative z-10 flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 text-white shadow-md">
              <Video className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm sm:text-base font-bold text-white truncate">
                Canlı Ders Kayıtları & Zaman Damgalı Arşiv
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Kaçırdığın veya tekrar etmek istediğin canlı derslerin video kayıtları ve tahta notları
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Ana Sahne & Oynatıcı Paneli */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {/* Sol / Ana Alan: Video Oynatıcı & Zaman Damgalı Bölümler (2 Kolon) */}
          <div className="lg:col-span-2 p-4 sm:p-6 space-y-5">
            {/* Simüle Edilmiş Video Oynatıcı Sahnesi */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/15 aspect-video flex flex-col justify-between p-4 shadow-inner">
              {/* Oynatıcı Üst Bar */}
              <div className="flex items-center justify-between text-xs text-white/80 z-10">
                <span className="rounded-lg bg-black/60 px-2.5 py-1 font-bold backdrop-blur-md">
                  {selectedLesson.grade}. Sınıf • {selectedLesson.title}
                </span>
                <span className="rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold">
                  Ders Kaydı (1080p HD)
                </span>
              </div>

              {/* Oynatıcı Orta Aksiyon */}
              <div className="my-auto flex flex-col items-center justify-center z-10">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? 'Dersi Duraklat' : 'Dersi Oynat'}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/90 hover:bg-rose-500 text-white shadow-2xl shadow-rose-500/50 hover:scale-110 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 fill-white" />
                  ) : (
                    <Play className="h-8 w-8 fill-white ml-1" />
                  )}
                </button>
                <div className="mt-3 text-xs font-semibold text-slate-300">
                  {isPlaying ? 'Ders Oynatılıyor' : 'İzlemek İçin Başlat'}
                </div>
              </div>

              {/* Oynatıcı Alt Kontroller */}
              <div className="z-10 space-y-2 bg-black/60 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
                {/* İlerleme Çubuğu */}
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (currentSeconds / (selectedLesson.durationMinutes * 60)) * 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-rose-400" />
                    <span>
                      {formatSeconds(currentSeconds)} / {selectedLesson.durationMinutes}:00
                    </span>
                  </div>

                  {/* Oynatma Hızı Kontrolü */}
                  <div className="flex items-center gap-1">
                    <FastForward className="h-3 w-3 text-slate-400" />
                    {[1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition ${
                          playbackSpeed === speed
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Zaman Damgalı Bölümler (Chapters) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Bookmark className="h-4 w-4 text-indigo-400" />
                  <span>Ders Zaman Damgaları & Konu Başlıkları</span>
                </h3>
                <span className="text-[11px] text-slate-400">Tıkla ve ilgili dakikaya atla</span>
              </div>

              <div className="space-y-2">
                {selectedLesson.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleJumpToChapter(ch.timeSeconds)}
                    className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-2.5 sm:p-3 text-left transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-amber-300 rounded bg-amber-500/10 px-2 py-1 border border-amber-500/20 group-hover:bg-amber-500/20">
                        {ch.timeFormatted}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        {ch.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-300 rounded bg-indigo-500/15 px-2 py-0.5 border border-indigo-500/25">
                      {ch.topicTag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tahta Notları & PDF İndirme Şeridi */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-3.5 text-xs">
              <div className="flex items-center gap-2 text-indigo-200">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>Bu derste karalama tahtasında çözülen tüm soru ve notlar</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert('Tahta notları PDF olarak indiriliyor.');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 font-bold text-white shadow-md hover:bg-indigo-500 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Tahta Notlarını İndir (PDF)</span>
              </button>
            </div>
          </div>

          {/* Sağ Kolon: Arşivdeki Tüm Dersler Listesi */}
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Video className="h-4 w-4 text-rose-400" />
                <span>Arşivdeki Kayıtlar ({filteredLessons.length})</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">İzlemek istediğin dersi seç</p>
            </div>

            {/* Sınıf Filtresi */}
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10 overflow-x-auto text-[11px]">
              {['all', '8', 'Mezun'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveGradeTab(g)}
                  className={`rounded-lg px-2.5 py-1 font-bold whitespace-nowrap transition ${
                    activeGradeTab === g
                      ? 'bg-brand-primary text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {g === 'all' ? 'Tümü' : g === '8' ? '8. Sınıf LGS' : 'YKS / TYT'}
                </button>
              ))}
            </div>

            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ders veya konu ara..."
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-primary"
              />
            </div>

            {/* Kayıt Kartları */}
            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
              {filteredLessons.map((lesson) => {
                const isSelected = selectedLesson.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setCurrentSeconds(0);
                      setIsPlaying(false);
                    }}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-rose-500/60 bg-rose-500/10 shadow-lg'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-rose-400">{lesson.grade}. Sınıf</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {lesson.dateStr}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-white leading-snug line-clamp-2">
                      {lesson.title}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.durationMinutes} dakika
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {lesson.attendeesCount} öğrenci
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
