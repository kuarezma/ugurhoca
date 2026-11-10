import React, { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toDisplayGrade } from '@/lib/grade';
import type { LiveLesson } from '@/features/live-lessons/types';
import type { AppUser } from '@/types';
import { GRADE_PLAN_OPTIONS, toLocalInputValue } from './helpers';

interface LiveLessonPlanFormProps {
  userGrade: string | number | null | undefined;
  students: AppUser[];
  onClose: () => void;
  onLessonsCreated: (lessons: LiveLesson[]) => void;
}

export function LiveLessonPlanForm({
  userGrade,
  students,
  onClose,
  onLessonsCreated,
}: LiveLessonPlanFormProps) {
  const [title, setTitle] = useState('Canlı Matematik Dersi');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [targetGrade, setTargetGrade] = useState(
    String(toDisplayGrade(userGrade)),
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeklyUntil, setRepeatWeeklyUntil] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)),
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
          targetStudentIds:
            targetGrade === 'selected' ? selectedStudentIds : [],
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
      onLessonsCreated(created);
      onClose();
      setSelectedStudentIds([]);
      setDescription('');
    } catch {
      setFormError('Ders planlanırken bağlantı hatası oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-6 rounded-3xl border border-brand-primary/30 bg-card p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-ink" />
          <h2 className="text-lg font-bold text-foreground">
            Yeni Canlı Ders Planla
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
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
            <label
              htmlFor="plan-title"
              className="block text-xs font-semibold text-foreground/80"
            >
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
            <label
              htmlFor="plan-grade"
              className="block text-xs font-semibold text-foreground/80"
            >
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
              <span className="text-xs font-semibold text-foreground/90">
                Öğrencileri Seç
              </span>
              <span className="text-xs text-brand-ink font-bold">
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
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-ink font-semibold'
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
            <label
              htmlFor="plan-starts-at"
              className="block text-xs font-semibold text-foreground/80"
            >
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
            <label
              htmlFor="plan-duration"
              className="block text-xs font-semibold text-foreground/80"
            >
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
              <label
                htmlFor="plan-repeat-until"
                className="block text-xs font-semibold text-foreground/80"
              >
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
          <label
            htmlFor="plan-description"
            className="block text-xs font-semibold text-foreground/80"
          >
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
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground/80 hover:bg-foreground/5"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={
              saving ||
              (targetGrade === 'selected' && selectedStudentIds.length === 0)
            }
            className="rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold disabled:opacity-50 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
          >
            {saving ? 'Planlanıyor...' : 'Dersi Takvime Ekle'}
          </button>
        </div>
      </form>
    </section>
  );
}
