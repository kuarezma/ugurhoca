import type {
  AdminFormState,
  AdminModalType
} from "@/features/admin/types";
import {
  getDescriptionLabel,
  getDescriptionPlaceholder,
  type AdminFormUpdate,
} from "@/features/admin/components/modal/shared";

type AdminDescriptionFieldProps = {
  formData: AdminFormState;
  modalType: AdminModalType;
  updateFormData: AdminFormUpdate;
};

export default function AdminDescriptionField({
  formData,
  modalType,
  updateFormData,
}: AdminDescriptionFieldProps) {
  return (
    <div>
      <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-2 text-sm">
        {getDescriptionLabel(modalType)}
      </label>
      <textarea
        required={modalType !== "quiz" && modalType !== "editQuiz"}
        rows={
          modalType === "document" ||
          modalType === "assignment" ||
          modalType === "quiz" ||
          modalType === "editQuiz"
            ? 3
            : 6
        }
        value={formData.description || ""}
        onChange={(event) => updateFormData({ description: event.target.value })}
        className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs resize-none"
        placeholder={getDescriptionPlaceholder(modalType)}
      />
    </div>
  );
}
