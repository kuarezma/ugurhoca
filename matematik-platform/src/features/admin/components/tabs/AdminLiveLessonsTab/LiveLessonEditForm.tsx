import type { Dispatch, SetStateAction } from 'react';
import type { AdminUser } from '@/features/admin/types';
import { formatGrade, gradeOptions, type EditFormState } from './helpers';

type Props = {
  editError: string | null;
  editForm: EditFormState;
  editStudentSearchQuery: string;
  filteredEditStudents: AdminUser[];
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  setEditForm: Dispatch<SetStateAction<EditFormState | null>>;
  setEditStudentSearchQuery: (query: string) => void;
  students: AdminUser[];
  toggleEditStudent: (studentId: string) => void;
};

export function LiveLessonEditForm({
  editError,
  editForm,
  editStudentSearchQuery,
  filteredEditStudents,
  isSaving,
  onCancel,
  onSave,
  setEditForm,
  setEditStudentSearchQuery,
  students,
  toggleEditStudent,
}: Props) {
  return (
    <div className="mt-4 rounded-xl border border-brand-primary/40 bg-slate-50/80 dark:bg-slate-950 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Başlık
          </span>
          <input
            value={editForm.title}
            onChange={(event) =>
              setEditForm({
                ...editForm,
                title: event.target.value,
              })
            }
            className="min-h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Ders hedefi
          </span>
          <select
            value={editForm.targetGrade}
            onChange={(event) =>
              setEditForm({
                ...editForm,
                targetGrade: event.target.value,
              })
            }
            className="min-h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {gradeOptions.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </label>
        {editForm.targetGrade === 'selected' ? (
          <div className="space-y-2 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Öğrenci seç
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {editForm.targetStudentIds.length} öğrenci seçildi
              </span>
            </div>
            <input
              type="search"
              value={editStudentSearchQuery}
              onChange={(event) =>
                setEditStudentSearchQuery(event.target.value)
              }
              placeholder="Öğrenci adı veya e-posta ara"
              className="min-h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-2">
              {students.length === 0 ? (
                <p className="px-2 py-3 text-sm text-slate-500 dark:text-slate-400">
                  Seçilecek öğrenci kaydı bulunamadı.
                </p>
              ) : filteredEditStudents.length === 0 ? (
                <p className="px-2 py-3 text-sm text-slate-500 dark:text-slate-400">
                  Aramaya uygun öğrenci bulunamadı.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {filteredEditStudents.map((student) => (
                    <label
                      key={student.id}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        aria-label={`${student.name || student.email} öğrencisini seç`}
                        checked={editForm.targetStudentIds.includes(student.id)}
                        onChange={() => toggleEditStudent(student.id)}
                        className="h-4 w-4 accent-brand-primary"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {student.name || student.email}
                        </span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                          {formatGrade(student.grade)}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
        <label className="space-y-1">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Tarih ve saat
          </span>
          <input
            type="datetime-local"
            value={editForm.startsAt}
            onChange={(event) =>
              setEditForm({
                ...editForm,
                startsAt: event.target.value,
              })
            }
            className="min-h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Süre
          </span>
          <input
            type="number"
            min={15}
            max={240}
            value={editForm.durationMinutes}
            onChange={(event) =>
              setEditForm({
                ...editForm,
                durationMinutes: Number(event.target.value),
              })
            }
            className="min-h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Açıklama
          </span>
          <textarea
            value={editForm.description}
            onChange={(event) =>
              setEditForm({
                ...editForm,
                description: event.target.value,
              })
            }
            className="min-h-20 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Ders Kayıt Linki (YouTube / Drive)
          </span>
          <input
            type="url"
            placeholder="https://youtube.com/... veya video linki"
            value={editForm.recordingUrl}
            onChange={(event) =>
              setEditForm({
                ...editForm,
                recordingUrl: event.target.value,
              })
            }
            className="min-h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Ders Notu / PDF Materyal Linki
          </span>
          <input
            type="url"
            placeholder="https://... PDF veya doküman linki"
            value={editForm.materialsUrl}
            onChange={(event) =>
              setEditForm({
                ...editForm,
                materialsUrl: event.target.value,
              })
            }
            className="min-h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </label>
      </div>
      {editError ? (
        <p className="mt-3 text-sm text-red-500 dark:text-red-300">
          {editError}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
        >
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}
