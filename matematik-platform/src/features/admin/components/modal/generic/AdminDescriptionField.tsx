import type {
  AdminFormState,
  AdminModalType,
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
      <label className="block text-slate-300 mb-2 text-sm">
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
        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                 focus:outline-none focus:border-purple-500 transition-colors resize-none"
        placeholder={getDescriptionPlaceholder(modalType)}
      />
    </div>
  );
}
