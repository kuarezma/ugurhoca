import type {
  AdminFormState,
  AdminModalType,
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
  return (
    <>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">Sınıf</label>
        <select
          required
          value={formData.grade || ""}
          onChange={(event) =>
            updateFormData({ grade: parseInt(event.target.value) })
          }
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-violet-500 transition-colors"
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
        <label className="block text-slate-300 mb-2 text-sm">Süre (Dakika)</label>
        <input
          type="number"
          required
          min="1"
          value={formData.time_limit || ""}
          onChange={(event) =>
            updateFormData({ time_limit: parseInt(event.target.value) })
          }
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-violet-500 transition-colors"
          placeholder="Örn: 15"
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Zorluk Seviyesi
        </label>
        <select
          required
          value={formData.difficulty || ""}
          onChange={(event) =>
            updateFormData({ difficulty: event.target.value })
          }
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-violet-500 transition-colors"
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
          <label className="flex items-center gap-2 text-slate-300 mb-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active || false}
              onChange={(event) =>
                updateFormData({ is_active: event.target.checked })
              }
              className="w-4 h-4 rounded border-slate-600"
            />
            Aktif
          </label>
        </div>
      )}
    </>
  );
}
