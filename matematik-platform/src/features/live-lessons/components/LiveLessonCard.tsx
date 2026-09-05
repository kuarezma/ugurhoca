'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Copy,
  Check,
  Edit2,
  Trash2,
  Users,
  Video,
  Radio,
  ExternalLink,
  ChevronDown,
  PlayCircle,
  FileText,
} from 'lucide-react';
import type { LiveLesson } from '@/features/live-lessons/types';
import type { AppUser } from '@/types';
import {
  buildGoogleCalendarUrl,
  downloadIcsFile,
  formatTimeRemaining,
} from '@/features/live-lessons/lib/calendar-helpers';

type Props = {
  isAdmin: boolean;
  lesson: LiveLesson;
  students: AppUser[];
  onCancel?: (lesson: LiveLesson) => void;
  onEdit?: (lesson: LiveLesson) => void;
  onEnd?: (lesson: LiveLesson) => void;
};

const MONTH_NAMES = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
];

function formatAudienceLabel(lesson: LiveLesson, students: AppUser[]) {
  if (lesson.target_grade === 'all') return 'Herkese Açık';
  if (lesson.target_grade === 'Mezun') return 'YKS / Mezun';
  if (lesson.target_grade !== 'selected') return `${lesson.target_grade}. Sınıf`;

  const selectedCount = lesson.target_student_ids?.length || 0;
  if (selectedCount === 0) return 'Öğrenci Seçilmedi';

  const first = students.find((s) => s.id === lesson.target_student_ids?.[0]);
  const firstName = first?.name || first?.email || '1 Öğrenci';
  return selectedCount === 1 ? firstName : `${firstName} +${selectedCount - 1}`;
}

export function LiveLessonCard({
  isAdmin,
  lesson,
  students,
  onCancel,
  onEdit,
  onEnd,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeInfo, setTimeInfo] = useState(() =>
    formatTimeRemaining(lesson.starts_at, lesson.duration_minutes),
  );

  useEffect(() => {
    const update = () => {
      setTimeInfo(formatTimeRemaining(lesson.starts_at, lesson.duration_minutes));
    };
    update();
    const interval = window.setInterval(update, 30000);
    return () => window.clearInterval(interval);
  }, [lesson.duration_minutes, lesson.starts_at]);

  const startDate = new Date(lesson.starts_at);
  const isValidDate = Number.isFinite(startDate.getTime());
  const day = isValidDate ? startDate.getDate() : '-';
  const month = isValidDate ? MONTH_NAMES[startDate.getMonth()] : '';
  const time = isValidDate
    ? new Intl.DateTimeFormat('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Istanbul',
      }).format(startDate)
    : '--:--';

  const isActuallyLive = lesson.status === 'active' || timeInfo.isLiveNow;
  const isEnded = lesson.status === 'ended' || (timeInfo.isPast && lesson.status !== 'active');
  const isCancelled = lesson.status === 'cancelled';

  const copyRoomLink = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/canli-ders/d/${lesson.room_id}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [lesson.room_id]);

  const googleCalUrl = buildGoogleCalendarUrl(lesson);

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        isActuallyLive
          ? 'border-rose-500/60 bg-gradient-to-br from-rose-500/10 via-card to-card shadow-[0_8px_30px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40'
          : isEnded || isCancelled
            ? 'border-border/60 bg-card/60 opacity-80 shadow-sm hover:opacity-100'
            : 'border-border/90 bg-card shadow-md hover:border-brand-primary/40 hover:shadow-xl dark:shadow-black/20'
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Üst Kısım: Tarih Kutusu ve Temel Bilgiler */}
        <div className="flex items-start gap-4">
          {/* Tarih Rozeti */}
          <div
            className={`flex flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition-transform group-hover:scale-105 ${
              isActuallyLive
                ? 'border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-400'
                : 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary dark:text-brand-primary-light'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider">{month}</span>
            <span className="text-2xl font-black leading-none">{day}</span>
            <span className="mt-1 font-mono text-[11px] font-semibold">{time}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {isActuallyLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm animate-pulse">
                  <Radio className="h-3 w-3" /> CANLI YAYIN
                </span>
              ) : isCancelled ? (
                <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                  İptal Edildi
                </span>
              ) : isEnded ? (
                <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/70">
                  Tamamlandı
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Clock className="h-3 w-3" /> {timeInfo.label}
                </span>
              )}

              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-foreground/5 px-2.5 py-0.5 text-xs font-medium text-foreground/80">
                <Users className="h-3 w-3" /> {formatAudienceLabel(lesson, students)}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-foreground/5 px-2.5 py-0.5 text-xs font-medium text-foreground/70">
                <Clock className="h-3 w-3" /> {lesson.duration_minutes} dk
              </span>
            </div>

            <h3 className="mt-2 text-lg font-bold text-foreground transition-colors group-hover:text-brand-primary">
              {lesson.title}
            </h3>

            {lesson.description && (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground/70 sm:text-sm">
                {lesson.description}
              </p>
            )}
          </div>
        </div>

        {/* Oda ID ve Hızlı Paylaşım */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-foreground/[0.02] px-3 py-2 text-xs text-foreground/70">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-medium text-foreground/50">Oda No:</span>
            <span className="font-mono font-semibold text-foreground/90">{lesson.room_id}</span>
          </div>

          <button
            type="button"
            onClick={copyRoomLink}
            aria-label="Ders linkini panoya kopyala"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Linki Kopyala</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alt İşlem Butonları */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/80 bg-foreground/[0.015] px-5 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {!isEnded && !isCancelled ? (
            <Link
              href={`/canli-ders/d/${lesson.room_id}`}
              className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-95 ${
                isActuallyLive
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30 ring-2 ring-rose-500/50'
                  : 'bg-brand-primary hover:bg-brand-primary-deep shadow-brand-primary/20'
              }`}
            >
              <Video className="h-4 w-4" />
              <span>{isActuallyLive ? 'Canlı Derse Katıl' : 'Derse Giriş Yap'}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground/50">
              Bu ders tamamlanmıştır.
            </span>
          )}

          {lesson.recording_url && (
            <a
              href={lesson.recording_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-600 transition hover:bg-purple-500/20 dark:text-purple-300"
              title="Ders kaydını izle"
            >
              <PlayCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Kayıt İzle</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          )}

          {lesson.materials_url && (
            <a
              href={lesson.materials_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-500/20 dark:text-blue-300"
              title="Ders materyallerini aç"
            >
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Ders Notu</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          )}

          {/* Takvime Ekle Açılır Menüsü */}
          {!isEnded && !isCancelled && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setCalendarOpen((v) => !v)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground/80 transition hover:bg-foreground/5 hover:text-foreground"
                aria-expanded={calendarOpen}
              >
                <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                <span>Takvime Ekle</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {calendarOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Menüyü kapat"
                    tabIndex={-1}
                    className="fixed inset-0 z-10 cursor-default bg-transparent"
                    onClick={() => setCalendarOpen(false)}
                  />
                  <div
                    role="menu"
                    aria-orientation="vertical"
                    className="absolute bottom-full left-0 z-20 mb-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95"
                  >
                  <a
                    href={googleCalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setCalendarOpen(false)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-foreground/90 hover:bg-foreground/10"
                  >
                    <span>Google Takvim</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      downloadIcsFile(lesson);
                      setCalendarOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-foreground/90 hover:bg-foreground/10"
                  >
                    <span>Apple / Outlook (.ics)</span>
                    <Calendar className="h-3 w-3 opacity-60" />
                  </button>
                </div>
              </>
            )}
            </div>
          )}
        </div>

        {/* Öğretmen / Admin Kontrolleri */}
        {isAdmin && (
          <div className="flex items-center gap-1">
            {onEdit && !isCancelled && (
              <button
                type="button"
                onClick={() => onEdit(lesson)}
                className="rounded-lg border border-border bg-card p-2 text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground"
                title="Dersi Düzenle"
                aria-label="Dersi Düzenle"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}

            {isActuallyLive && onEnd && (
              <button
                type="button"
                onClick={() => onEnd(lesson)}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-600 transition hover:bg-amber-500/20 dark:text-amber-400"
                title="Dersi Tamamla"
              >
                Dersi Bitir
              </button>
            )}

            {onCancel && !isCancelled && !isEnded && (
              <button
                type="button"
                onClick={() => onCancel(lesson)}
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-600 transition hover:bg-red-500/20 dark:text-red-400"
                title="Dersi İptal Et"
                aria-label="Dersi İptal Et"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
