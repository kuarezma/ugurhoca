'use client';

import { useMemo } from 'react';
import type { AppUser } from '@/types';

type StudentPickerProps<
  TStudent extends Pick<AppUser, 'id' | 'name' | 'email' | 'grade'>,
> = {
  emptyMessage?: string;
  listClassName?: string;
  onSearchChange: (value: string) => void;
  onSelectedStudentIdsChange: (studentIds: string[]) => void;
  searchQuery: string;
  selectedStudentIds: string[];
  students: TStudent[];
};

function normalizeSearchText(value: string) {
  return value.toLocaleLowerCase('tr-TR').trim();
}

function formatGrade(value: AppUser['grade']) {
  return value === 'Mezun' ? 'Mezun' : `${value}. sınıf`;
}

export function StudentPicker<
  TStudent extends Pick<AppUser, 'id' | 'name' | 'email' | 'grade'>,
>({
  emptyMessage = 'Kayıtlı öğrenci bulunamadı.',
  listClassName = 'bg-slate-950',
  onSearchChange,
  onSelectedStudentIdsChange,
  searchQuery,
  selectedStudentIds,
  students,
}: StudentPickerProps<TStudent>) {
  const filteredStudents = useMemo(() => {
    const query = normalizeSearchText(searchQuery);
    if (!query) return students;

    return students.filter((student) =>
      normalizeSearchText(
        `${student.name || ''} ${student.email || ''}`,
      ).includes(query),
    );
  }, [searchQuery, students]);

  const selectedSet = useMemo(
    () => new Set(selectedStudentIds),
    [selectedStudentIds],
  );
  const visibleStudentIds = filteredStudents.map((student) => student.id);
  const allVisibleSelected =
    visibleStudentIds.length > 0 &&
    visibleStudentIds.every((studentId) => selectedSet.has(studentId));

  const toggleStudent = (studentId: string) => {
    onSelectedStudentIdsChange(
      selectedSet.has(studentId)
        ? selectedStudentIds.filter((id) => id !== studentId)
        : [...selectedStudentIds, studentId],
    );
  };

  const selectVisibleStudents = () => {
    onSelectedStudentIdsChange([
      ...new Set([...selectedStudentIds, ...visibleStudentIds]),
    ]);
  };

  return (
    <div className="space-y-2 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-slate-300">Öğrenci seç</span>
        <span className="text-xs text-slate-400">
          {selectedStudentIds.length} öğrenci seçildi
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Öğrenci adı veya e-posta ara"
          className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectVisibleStudents}
            disabled={visibleStudentIds.length === 0 || allVisibleSelected}
            className="min-h-11 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Görünenleri seç
          </button>
          <button
            type="button"
            onClick={() => onSelectedStudentIdsChange([])}
            disabled={selectedStudentIds.length === 0}
            className="min-h-11 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tümünü temizle
          </button>
        </div>
      </div>

      <div
        className={`max-h-64 overflow-y-auto rounded-xl border border-white/10 p-2 ${listClassName}`}
      >
        {students.length === 0 ? (
          <p className="px-2 py-3 text-sm text-slate-400">{emptyMessage}</p>
        ) : filteredStudents.length === 0 ? (
          <p className="px-2 py-3 text-sm text-slate-400">
            Aramaya uygun öğrenci bulunamadı.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredStudents.map((student) => {
              const checked = selectedSet.has(student.id);

              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => toggleStudent(student.id)}
                  className={`flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition hover:bg-white/5 ${
                    checked
                      ? 'border-brand-primary/60 bg-brand-primary/15'
                      : 'border-white/10 bg-transparent'
                  }`}
                  aria-pressed={checked}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${
                      checked
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-white/30 text-transparent'
                    }`}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-white">
                      {student.name || student.email}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {formatGrade(student.grade)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
