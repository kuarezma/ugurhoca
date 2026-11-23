'use client';

import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ClipboardList, Plus } from 'lucide-react';
import type {
  AdminAssignment,
  AdminDocument,
  AdminQuiz,
  AdminWeeklyPlanItemDraft,
} from '@/features/admin/types';
import type { GradeValue } from '@/types/domain';

type ResourceTab = 'quiz' | 'assignment' | 'content';

export type GradeInput =
  | GradeValue
  | GradeValue[]
  | string
  | number
  | null
  | undefined;

export const normalizeGradeValues = (grade: GradeInput): string[] => {
  if (grade === null || grade === undefined) return [];
  const rawList = Array.isArray(grade) ? grade : [grade];
  return rawList.map((entry) => String(entry).trim()).filter(Boolean);
};

export const matchesGradeFilter = (
  itemGrade: GradeInput,
  filterValue: string,
): boolean => {
  if (filterValue === 'all') return true;
  const grades = normalizeGradeValues(itemGrade);
  if (grades.length === 0) return false;
  if (filterValue === 'Mezun') {
    return grades.includes('Mezun') || grades.includes('0');
  }
  return grades.includes(filterValue);
};

export const formatGradeLabel = (grade: GradeInput): string | null => {
  const grades = normalizeGradeValues(grade);
  if (grades.length === 0) return null;

  const numeric = grades.filter((entry) => entry !== 'Mezun' && entry !== '0');
  const hasMezun = grades.some((entry) => entry === 'Mezun' || entry === '0');
  const parts: string[] = [];

  if (numeric.length === 1) {
    parts.push(`${numeric[0]}. Sınıf`);
  } else if (numeric.length > 1) {
    parts.push(`${numeric.map((entry) => `${entry}.`).join(', ')} Sınıf`);
  }

  if (hasMezun) {
    parts.push('Mezun');
  }

  return parts.join(' · ') || null;
};

type AdminWeeklyPlanResourcePickerProps = {
  quizzes: AdminQuiz[];
  assignments: AdminAssignment[];
  documents: AdminDocument[];
  defaultGradeFilter: string;
  onAddDraftItem: (draft: AdminWeeklyPlanItemDraft) => void;
};

export function AdminWeeklyPlanResourcePicker({
  quizzes,
  assignments,
  documents,
  defaultGradeFilter,
  onAddDraftItem,
}: AdminWeeklyPlanResourcePickerProps) {
  const [resourceTab, setResourceTab] = useState<ResourceTab>('quiz');
  const [gradeFilter, setGradeFilter] = useState(defaultGradeFilter);
  const [resourceSearch, setResourceSearch] = useState('');

  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    const collectGrades = (grade: GradeInput) => {
      normalizeGradeValues(grade).forEach((entry) => {
        grades.add(entry === '0' ? 'Mezun' : entry);
      });
    };

    quizzes.forEach((quiz) => collectGrades(quiz.grade));
    assignments.forEach((assignment) => collectGrades(assignment.grade));
    documents.forEach((doc) => collectGrades(doc.grade));

    if (defaultGradeFilter !== 'all') {
      grades.add(defaultGradeFilter === '0' ? 'Mezun' : defaultGradeFilter);
    }

    return Array.from(grades).sort((a, b) => {
      if (a === 'Mezun') return 1;
      if (b === 'Mezun') return -1;
      return Number(a) - Number(b);
    });
  }, [assignments, defaultGradeFilter, documents, quizzes]);

  const filteredResources = useMemo(() => {
    const needle = resourceSearch.trim().toLocaleLowerCase('tr-TR');
    if (resourceTab === 'quiz') {
      return quizzes
        .filter(
          (quiz) =>
            matchesGradeFilter(quiz.grade, gradeFilter) &&
            (!needle || quiz.title.toLocaleLowerCase('tr-TR').includes(needle)),
        )
        .slice(0, 20)
        .map((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          gradeLabel: formatGradeLabel(quiz.grade),
          draft: {
            kind: 'quiz' as const,
            linked_id: quiz.id,
            title: quiz.title,
            href: `/testler?quizId=${encodeURIComponent(quiz.id)}`,
          },
        }));
    }

    if (resourceTab === 'assignment') {
      return assignments
        .filter(
          (assignment) =>
            matchesGradeFilter(assignment.grade, gradeFilter) &&
            (!needle ||
              assignment.title.toLocaleLowerCase('tr-TR').includes(needle)),
        )
        .slice(0, 20)
        .map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          gradeLabel: formatGradeLabel(assignment.grade),
          draft: {
            kind: 'assignment' as const,
            linked_id: assignment.id,
            title: assignment.title,
            href: '/odevler',
            due_at: assignment.due_date ?? null,
          },
        }));
    }

    return documents
      .filter(
        (doc) =>
          matchesGradeFilter(doc.grade, gradeFilter) &&
          (!needle || doc.title.toLocaleLowerCase('tr-TR').includes(needle)),
      )
      .slice(0, 20)
      .map((doc) => ({
        id: doc.id,
        title: doc.title,
        gradeLabel: formatGradeLabel(doc.grade),
        draft: {
          kind: 'content' as const,
          linked_id: doc.id,
          title: doc.title,
          href: `/icerikler?id=${encodeURIComponent(doc.id)}`,
        },
      }));
  }, [
    assignments,
    documents,
    gradeFilter,
    quizzes,
    resourceSearch,
    resourceTab,
  ]);

  return (
    <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface-2 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">
          Platform Kaynağı Bağla (İsteğe Bağlı)
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'quiz', label: 'Testler', icon: CheckCircle2 },
              { id: 'assignment', label: 'Ödevler', icon: ClipboardList },
              { id: 'content', label: 'Belgeler', icon: BookOpen },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setResourceTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                resourceTab === tab.id
                  ? 'border-tone-info-border bg-tone-info-bg text-tone-info-fg'
                  : 'border-border-subtle bg-surface-1 text-secondary hover:text-primary'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="weekly-plan-resource-search">
          Kaynak ara
        </label>
        <input
          id="weekly-plan-resource-search"
          type="text"
          value={resourceSearch}
          onChange={(event) => setResourceSearch(event.target.value)}
          placeholder="Test, ödev veya belge ara..."
          className="flex-1 rounded-xl border border-border-default bg-surface-1 px-3 py-2 text-xs text-primary placeholder:text-tertiary"
        />
        <label className="sr-only" htmlFor="weekly-plan-grade-filter">
          Sınıf filtresi
        </label>
        <select
          id="weekly-plan-grade-filter"
          value={gradeFilter}
          onChange={(event) => setGradeFilter(event.target.value)}
          className="rounded-xl border border-border-default bg-surface-1 px-3 py-2 text-xs text-primary"
        >
          <option value="all">Tüm sınıflar</option>
          {availableGrades.map((grade) => (
            <option key={grade} value={grade}>
              {grade === 'Mezun' ? 'Mezun' : `${grade}. Sınıf`}
            </option>
          ))}
        </select>
      </div>

      {filteredResources.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-default bg-surface-1 px-3 py-3 text-center text-xs text-secondary">
          Seçili filtreye uygun kaynak bulunamadı.
        </p>
      ) : (
        <div className="max-h-36 space-y-1.5 overflow-y-auto pr-1">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface-1 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-primary">
                  {resource.title}
                </p>
                {resource.gradeLabel ? (
                  <p className="text-[11px] text-tertiary">
                    {resource.gradeLabel}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onAddDraftItem(resource.draft)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-tone-success-border bg-tone-success-bg px-2.5 py-1 text-xs font-bold text-tone-success-fg transition hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ekle</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
