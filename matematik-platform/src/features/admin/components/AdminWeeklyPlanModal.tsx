'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type {
  AdminAssignment,
  AdminDocument,
  AdminQuiz,
  AdminUser,
  AdminWeeklyPlanItemDraft,
  StudentWeeklyPlan,
} from '@/features/admin/types';
import { AdminWeeklyPlanResourcePicker } from '@/features/admin/components/AdminWeeklyPlanResourcePicker';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

export type WeeklyPlanSavePayload = {
  title: string;
  targetMinutes: number;
  items: AdminWeeklyPlanItemDraft[];
  studentIds: string[];
};

type AdminWeeklyPlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  students: AdminUser[];
  existingPlan?: StudentWeeklyPlan | null;
  quizzes: AdminQuiz[];
  assignments: AdminAssignment[];
  documents: AdminDocument[];
  onSave: (payload: WeeklyPlanSavePayload) => Promise<void>;
};

const MAX_PLAN_ITEMS = 12;
const TARGET_MINUTE_PRESETS = [300, 450, 600, 900];

const getKindMeta = (kind?: string | null) => {
  switch (kind) {
    case 'quiz':
      return {
        label: 'Test',
        badgeClass: 'border-tone-info-border bg-tone-info-bg text-tone-info-fg',
      };
    case 'assignment':
      return {
        label: 'Ödev',
        badgeClass: 'border-tone-warn-border bg-tone-warn-bg text-tone-warn-fg',
      };
    case 'content':
      return {
        label: 'İçerik',
        badgeClass:
          'border-tone-success-border bg-tone-success-bg text-tone-success-fg',
      };
    default:
      return {
        label: 'Görev',
        badgeClass: 'border-border-default bg-surface-1 text-secondary',
      };
  }
};

const toDefaultItems = (
  existingPlan?: StudentWeeklyPlan | null,
): AdminWeeklyPlanItemDraft[] => {
  const existingItems = existingPlan?.student_weekly_plan_items || [];
  if (existingItems.length > 0) {
    return [...existingItems]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .slice(0, MAX_PLAN_ITEMS)
      .map((item) => ({
        title: item.title,
        kind:
          item.kind === 'quiz' ||
          item.kind === 'assignment' ||
          item.kind === 'content'
            ? item.kind
            : 'custom',
        linked_id: item.linked_id ?? null,
        href: item.href ?? null,
        due_at: item.due_at ?? null,
      }));
  }

  return [
    { kind: 'custom', title: 'Eksik konuyu tekrar et' },
    { kind: 'custom', title: '1 konu tarama testi çöz' },
    { kind: 'custom', title: 'Ödevleri kontrol et' },
  ];
};

function AdminWeeklyPlanModalContent({
  onClose,
  students,
  existingPlan,
  quizzes,
  assignments,
  documents,
  onSave,
}: Omit<AdminWeeklyPlanModalProps, 'isOpen'>) {
  const modalRef = useAccessibleModal<HTMLDivElement>(true, onClose);
  const isBulk = students.length > 1;
  const singleStudent = students.length === 1 ? students[0] : null;

  const defaultGradeFilter = useMemo(() => {
    const distinctGrades = new Set(
      students
        .map((student) => {
          if (student.grade === null || student.grade === undefined) return '';
          const raw = String(student.grade).trim();
          return raw === '0' ? 'Mezun' : raw;
        })
        .filter(Boolean),
    );
    if (distinctGrades.size === 1) {
      return Array.from(distinctGrades)[0];
    }
    return 'all';
  }, [students]);

  const [title, setTitle] = useState(
    existingPlan?.title || 'Bu Haftaki Çalışma Planı',
  );
  const [targetMinutes, setTargetMinutes] = useState<number>(
    existingPlan?.target_minutes || 600,
  );
  const [items, setItems] = useState<AdminWeeklyPlanItemDraft[]>(() =>
    toDefaultItems(existingPlan),
  );
  const [customTitle, setCustomTitle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const addDraftItem = (draft: AdminWeeklyPlanItemDraft) => {
    setValidationError(null);
    if (items.length >= MAX_PLAN_ITEMS) {
      setValidationError(
        `En fazla ${MAX_PLAN_ITEMS} plan maddesi eklenebilir.`,
      );
      return;
    }
    setItems((prev) => [...prev, draft]);
  };

  const handleAddCustomTask = () => {
    const cleaned = customTitle.trim();
    if (!cleaned) return;
    addDraftItem({ kind: 'custom', title: cleaned });
    setCustomTitle('');
  };

  const handleMoveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setValidationError(null);
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanedTitle = title.trim();
    if (!cleanedTitle) {
      setValidationError('Plan başlığı boş bırakılamaz.');
      return;
    }
    if (items.length === 0) {
      setValidationError('En az bir plan maddesi ekleyin.');
      return;
    }

    setValidationError(null);
    setIsSaving(true);
    try {
      await onSave({
        title: cleanedTitle,
        targetMinutes: Math.min(
          4200,
          Math.max(30, Math.round(Number(targetMinutes) || 600)),
        ),
        items,
        studentIds: students.map((student) => student.id),
      });
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : 'Haftalık plan kaydedilemedi.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Plan penceresini kapat"
        onClick={onClose}
        className="absolute inset-0 bg-scrim backdrop-blur-sm"
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="weekly-plan-modal-title"
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border-default bg-surface-1 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-default bg-surface-2 px-6 py-4">
          <div className="min-w-0">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-tone-info-border bg-tone-info-bg px-2.5 py-0.5 text-[11px] font-bold text-tone-info-fg">
              {isBulk ? (
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>
                {isBulk
                  ? `Toplu Atama · ${students.length} Öğrenci`
                  : 'Bireysel Haftalık Plan'}
              </span>
            </div>
            <h2
              id="weekly-plan-modal-title"
              className="truncate font-display text-xl font-bold text-primary"
            >
              {isBulk
                ? `Toplu Haftalık Plan (${students.length} öğrenci)`
                : `${singleStudent?.name || 'Öğrenci'} — Haftalık Plan`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-xl border border-border-default bg-surface-1 p-2 text-secondary transition hover:bg-surface-3 hover:text-primary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex-1 space-y-5 overflow-y-auto p-6"
        >
          {isBulk ? (
            <div className="rounded-2xl border border-border-subtle bg-surface-2 p-3">
              <p className="mb-2 text-xs font-semibold text-secondary">
                Planın atanacağı öğrenciler ({students.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {students.slice(0, 8).map((student) => (
                  <span
                    key={student.id}
                    className="rounded-full border border-border-default bg-surface-1 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {student.name || student.email}
                  </span>
                ))}
                {students.length > 8 ? (
                  <span className="rounded-full border border-border-subtle bg-surface-1 px-2.5 py-0.5 text-xs font-semibold text-secondary">
                    +{students.length - 8} öğrenci daha
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="weekly-plan-title-input"
                className="mb-1.5 block text-xs font-bold text-secondary"
              >
                Plan Başlığı
              </label>
              <input
                id="weekly-plan-title-input"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Örn: 8. Sınıf LGS Kamp Haftası"
                className="w-full rounded-xl border border-border-default bg-surface-2 px-3.5 py-2.5 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label
                htmlFor="weekly-plan-target-minutes"
                className="mb-1.5 block text-xs font-bold text-secondary"
              >
                Haftalık Hedef Süre (dk)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="weekly-plan-target-minutes"
                  type="number"
                  min={30}
                  max={4200}
                  step={30}
                  value={targetMinutes}
                  onChange={(event) =>
                    setTargetMinutes(Number(event.target.value) || 0)
                  }
                  className="w-28 rounded-xl border border-border-default bg-surface-2 px-3 py-2.5 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_MINUTE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetMinutes(preset)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                        targetMinutes === preset
                          ? 'border-tone-info-border bg-tone-info-bg text-tone-info-fg'
                          : 'border-border-subtle bg-surface-2 text-secondary hover:text-primary'
                      }`}
                    >
                      {preset} dk
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <AdminWeeklyPlanResourcePicker
            quizzes={quizzes}
            assignments={assignments}
            documents={documents}
            defaultGradeFilter={defaultGradeFilter}
            onAddDraftItem={addDraftItem}
          />

          {/* Özel Görev Ekleme */}
          <div>
            <label
              htmlFor="weekly-plan-custom-task"
              className="mb-1.5 block text-xs font-bold text-secondary"
            >
              Özel Görev Ekle
            </label>
            <div className="flex gap-2">
              <input
                id="weekly-plan-custom-task"
                type="text"
                value={customTitle}
                onChange={(event) => setCustomTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddCustomTask();
                  }
                }}
                placeholder="Örn: 20 yeni nesil üslü ifadeler sorusu çöz"
                className="flex-1 rounded-xl border border-border-default bg-surface-2 px-3.5 py-2 text-sm text-primary placeholder:text-tertiary"
              />
              <button
                type="button"
                onClick={handleAddCustomTask}
                disabled={!customTitle.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface-2 px-4 py-2 text-xs font-bold text-primary transition hover:bg-surface-3 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Görev Ekle</span>
              </button>
            </div>
          </div>

          {/* Plan Maddeleri */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                Plan Maddeleri ({items.length}/{MAX_PLAN_ITEMS})
              </p>
            </div>
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-default bg-surface-2 px-4 py-5 text-center text-xs text-secondary">
                Henüz madde yok. Yukarıdan kaynak bağlayın veya özel görev
                ekleyin.
              </div>
            ) : (
              <ul className="space-y-2">
                {items.map((item, index) => {
                  const kindMeta = getKindMeta(item.kind);
                  return (
                    <li
                      key={`${item.kind ?? 'custom'}-${item.linked_id ?? 'x'}-${index}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface-2 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${kindMeta.badgeClass}`}
                        >
                          {kindMeta.label}
                        </span>
                        <span className="truncate text-sm font-medium text-primary">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, -1)}
                          disabled={index === 0}
                          aria-label={`${item.title} maddesini yukarı taşı`}
                          className="rounded-lg border border-border-subtle bg-surface-1 p-1.5 text-secondary hover:text-primary disabled:opacity-40"
                        >
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 1)}
                          disabled={index === items.length - 1}
                          aria-label={`${item.title} maddesini aşağı taşı`}
                          className="rounded-lg border border-border-subtle bg-surface-1 p-1.5 text-secondary hover:text-primary disabled:opacity-40"
                        >
                          <ArrowDown
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          aria-label={`${item.title} maddesini sil`}
                          className="rounded-lg border border-tone-danger-border bg-tone-danger-bg p-1.5 text-tone-danger-fg hover:opacity-90"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {validationError ? (
            <p
              role="alert"
              className="rounded-xl border border-tone-danger-border bg-tone-danger-bg px-3.5 py-2.5 text-xs font-semibold text-tone-danger-fg"
            >
              {validationError}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-border-default pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn-secondary rounded-xl px-4 py-2 text-xs font-bold"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary rounded-xl px-5 py-2 text-xs font-bold disabled:opacity-60"
            >
              {isSaving
                ? 'Kaydediliyor...'
                : isBulk
                  ? `${students.length} Öğrenciye Planı Ata`
                  : 'Planı Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminWeeklyPlanModal({
  isOpen,
  onClose,
  students,
  existingPlan,
  quizzes,
  assignments,
  documents,
  onSave,
}: AdminWeeklyPlanModalProps) {
  if (!isOpen || students.length === 0) return null;

  const modalKey = `${students.map((s) => s.id).join(',')}:${existingPlan?.id ?? 'new'}`;

  return (
    <AdminWeeklyPlanModalContent
      key={modalKey}
      onClose={onClose}
      students={students}
      existingPlan={existingPlan}
      quizzes={quizzes}
      assignments={assignments}
      documents={documents}
      onSave={onSave}
    />
  );
}
