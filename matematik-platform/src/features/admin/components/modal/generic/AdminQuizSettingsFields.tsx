import { useId } from "react";
import type {
  AdminFormState,
  AdminModalType
} from "@/features/admin/types";
import {
  QUIZ_DIFFICULTY_OPTIONS,
  QUIZ_GRADES,
  type AdminFormUpdate,
} from "@/features/admin/components/modal/shared";

type AdminQuizSettingsFieldsProps = {
  formData: AdminFormState;
  modalType: AdminModalType;
  updateFormData: AdminFormUpdate;
};

export default function AdminQuizSettingsFields({
  formData,
  modalType,
  updateFormData,
}: AdminQuizSettingsFieldsProps) {
  const baseId = useId();
  const gradeId = `${baseId}-grade`;
  const timeLimitId = `${baseId}-time-limit`;
  const difficultyId = `${baseId}-difficulty`;

  return (
    <>
      <div>
        <label htmlFor={gradeId} className="block text-slate-700 dark:text-slate-200 font-semibold mb-2 text-sm">
          Sınıf
        </label>
        <select
          id={gradeId}
          required
          value={formData.grade || ""}
          onChange={(event) =>
            updateFormData({ grade: parseInt(event.target.value) })
          }
          className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-xs"
        >
          <option value="">Sınıf seçin</option>
          {QUIZ_GRADES.map((grade) => (
            <option key={grade} value={grade}>
              {grade}. Sınıf
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor={timeLimitId}
          className="block text-slate-700 dark:text-slate-200 font-semibold mb-2 text-sm"
        >
          Süre (Dakika)
        </label>
        <input
          id={timeLimitId}
          type="number"
          required
          min="1"
          value={formData.time_limit || ""}
          onChange={(event) =>
            updateFormData({ time_limit: parseInt(event.target.value) })
          }
          className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-xs"
          placeholder="Örn: 15"
        />
      </div>
      <div>
        <label
          htmlFor={difficultyId}
          className="block text-slate-700 dark:text-slate-200 font-semibold mb-2 text-sm"
        >
          Zorluk Seviyesi
        </label>
        <select
          id={difficultyId}
          required
          value={formData.difficulty || ""}
          onChange={(event) =>
            updateFormData({ difficulty: event.target.value })
          }
          className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-xs"
        >
          <option value="">Zorluk seçin</option>
          {QUIZ_DIFFICULTY_OPTIONS.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
      </div>
      {modalType === "editQuiz" && (
        <div>
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold mb-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active || false}
              onChange={(event) =>
                updateFormData({ is_active: event.target.checked })
              }
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500"
            />
            Aktif
          </label>
        </div>
      )}
    </>
  );
}
