import { useId } from "react";
import { motion } from "framer-motion";
import type {
  AdminFormState,
  AdminUser,
} from "@/features/admin/types";
import {
  PRIVATE_STUDENT_GRADES,
  type AdminFormUpdate,
  type AdminModalSubmitHandler,
} from "@/features/admin/components/modal/shared";

type AdminEditUserFormProps = {
  editingUser: AdminUser | null;
  formData: AdminFormState;
  isSubmitting: boolean;
  onSubmit: AdminModalSubmitHandler;
  updateFormData: AdminFormUpdate;
};

export default function AdminEditUserForm({
  editingUser,
  formData,
  isSubmitting,
  onSubmit,
  updateFormData,
}: AdminEditUserFormProps) {
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const gradeId = `${baseId}-grade`;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor={nameId} className="block text-slate-300 mb-2 text-sm">
          Ad Soyad
        </label>
        <input
          id={nameId}
          type="text"
          required
          value={formData.name || ""}
          onChange={(event) => updateFormData({ name: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-green-500 transition-colors"
          placeholder="Adını girin..."
        />
      </div>
      <div>
        <label htmlFor={gradeId} className="block text-slate-300 mb-2 text-sm">
          Sınıf
        </label>
        <select
          id={gradeId}
          value={formData.grade || ""}
          onChange={(event) =>
            updateFormData({
              grade:
                event.target.value === "Mezun"
                  ? "Mezun"
                  : parseInt(event.target.value),
            })
          }
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-green-500 transition-colors"
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
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting || !editingUser}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
      </motion.button>
    </form>
  );
}
