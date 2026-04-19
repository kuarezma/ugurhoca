import { useId } from "react";
import type { AdminFormState } from "@/features/admin/types";
import {
  PRIVATE_STUDENT_GRADES,
  type AdminFormUpdate,
} from "@/features/admin/components/modal/shared";

type AdminAssignmentFieldsProps = {
  formData: AdminFormState;
  updateFormData: AdminFormUpdate;
};

export default function AdminAssignmentFields({
  formData,
  updateFormData,
}: AdminAssignmentFieldsProps) {
  const baseId = useId();
  const gradeId = `${baseId}-grade`;
  const dueDateId = `${baseId}-due-date`;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label htmlFor={gradeId} className="block text-slate-300 mb-2 text-sm">
          Sınıf
        </label>
        <select
          id={gradeId}
          value={formData.grade || ""}
          onChange={(event) =>
            updateFormData({
              grade: event.target.value ? parseInt(event.target.value) : null,
            })
          }
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">Sınıf seçin</option>
          {PRIVATE_STUDENT_GRADES.map((grade) => (
            <option key={grade} value={grade}>
              {grade}. Sınıf
            </option>
          ))}
          <option value="Mezun">Mezun</option>
        </select>
      </div>
      <div>
        <label
          htmlFor={dueDateId}
          className="block text-slate-300 mb-2 text-sm"
        >
          Teslim Tarihi
        </label>
        <input
          id={dueDateId}
          type="datetime-local"
          value={formData.due_date || ""}
          onChange={(event) => updateFormData({ due_date: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>
    </div>
  );
}
