'use client';

import { useMemo, useState } from 'react';
import { X, Search, Check, AlertCircle } from 'lucide-react';
import type { LiveLesson } from '@/features/live-lessons/types';
import type { AppUser } from '@/types';

type Props = {
  isOpen: boolean;
  lesson: LiveLesson | null;
  onClose: () => void;
  onSuccess: (updatedLesson: LiveLesson) => void;
  students: AppUser[];
};

type ContentProps = {
  lesson: LiveLesson;
  onClose: () => void;
  onSuccess: (updatedLesson: LiveLesson) => void;
  students: AppUser[];
};

const gradeOptions = [
  { label: '5. Sınıf', value: '5' },
  { label: '6. Sınıf', value: '6' },
  { label: '7. Sınıf', value: '7' },
  { label: '8. Sınıf', value: '8' },
  { label: 'YKS / Mezun', value: 'Mezun' },
  { label: 'Herkese Açık', value: 'all' },
  { label: 'Seçili Öğrenciler', value: 'selected' },
];

function toLocalInputValue(isoString: string) {
  const date = new Date(isoString);
  if (!Number.isFinite(date.getTime())) return '';
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function LiveLessonEditModalContent({
  lesson,
  onClose,
  onSuccess,
  students,
}: ContentProps) {
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || '');
  const [startsAt, setStartsAt] = useState(() => toLocalInputValue(lesson.starts_at));
  const [durationMinutes, setDurationMinutes] = useState(lesson.duration_minutes);
  const [targetGrade, setTargetGrade] = useState(lesson.target_grade);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    lesson.target_student_ids || [],
  );
  const [studentSearch, setStudentSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLocaleLowerCase('tr-TR').trim();
    if (!q) return students;
    return students.filter((s) =>
      `${s.name || ''} ${s.email || ''}`.toLocaleLowerCase('tr-TR').includes(q),
    );
  }, [studentSearch, students]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Ders başlığı boş bırakılamaz.');
      return;
    }

    const startDate = new Date(startsAt);
    if (!Number.isFinite(startDate.getTime())) {
      setError('Geçerli bir tarih ve saat girin.');
      return;
    }

    if (targetGrade === 'selected' && selectedStudentIds.length === 0) {
      setError('Lütfen en az bir öğrenci seçin.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/live-lessons/${lesson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          description: description.trim() || null,
          durationMinutes: Number(durationMinutes),
          startsAt: startDate.toISOString(),
          targetGrade,
          targetStudentIds: targetGrade === 'selected' ? selectedStudentIds : [],
          title: title.trim(),
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        lesson?: LiveLesson;
      } | null;

      if (!res.ok || !data?.lesson) {
        setError(data?.error || 'Ders güncellenemedi.');
        return;
      }

      onSuccess(data.lesson);
      onClose();
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-lesson-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 id="edit-lesson-modal-title" className="text-lg font-bold text-foreground">
            Dersi Düzenle
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Pencereyi kapat"
            className="rounded-lg p-1 text-foreground/60 hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="edit-title" className="block text-xs font-semibold text-foreground/80">
              Ders Başlığı
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-date" className="block text-xs font-semibold text-foreground/80">
                Tarih ve Saat
              </label>
              <input
                id="edit-date"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label htmlFor="edit-duration" className="block text-xs font-semibold text-foreground/80">
                Süre (Dakika)
              </label>
              <input
                id="edit-duration"
                type="number"
                min={15}
                max={240}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-grade" className="block text-xs font-semibold text-foreground/80">
              Hedef Kitle / Sınıf
            </label>
            <select
              id="edit-grade"
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {gradeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {targetGrade === 'selected' && (
            <div className="space-y-2 rounded-xl border border-border p-3 bg-foreground/[0.02]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground/80">Öğrenci Seçimi</span>
                <span className="text-[11px] text-foreground/60">
                  {selectedStudentIds.length} öğrenci seçildi
                </span>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/40" />
                <input
                  type="search"
                  placeholder="Öğrenci adı veya e-posta ara..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredStudents.map((s) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleStudent(s.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                        isChecked
                          ? 'bg-brand-primary/15 text-brand-primary font-semibold'
                          : 'hover:bg-foreground/5 text-foreground/80'
                      }`}
                    >
                      <span className="truncate">{s.name || s.email}</span>
                      {isChecked && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="edit-description" className="block text-xs font-semibold text-foreground/80">
              Ders Açıklaması / Konu Detayı
            </label>
            <textarea
              id="edit-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kazanımlar, çözülecek sorular veya hatırlatmalar..."
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground/80 hover:bg-foreground/5"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:bg-brand-primary-deep disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function LiveLessonEditModal(props: Props) {
  if (!props.isOpen || !props.lesson) return null;
  return <LiveLessonEditModalContent {...props} lesson={props.lesson} />;
}
