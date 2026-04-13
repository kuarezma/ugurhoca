import { motion } from "framer-motion";
import type { AdminFormState } from "@/features/admin/types";
import {
  PRIVATE_STUDENT_GRADES,
  type AdminFormUpdate,
  type AdminModalSubmitHandler,
} from "@/features/admin/components/modal/shared";

type AdminStudentFormProps = {
  formData: AdminFormState;
  isSubmitting: boolean;
  onSubmit: AdminModalSubmitHandler;
  updateFormData: AdminFormUpdate;
};

export default function AdminStudentForm({
  formData,
  isSubmitting,
  onSubmit,
  updateFormData,
}: AdminStudentFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-slate-300 mb-2 text-sm">Öğrenci Adı</label>
        <input
          type="text"
          required
          value={formData.name || ""}
          onChange={(event) => updateFormData({ name: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-amber-500 transition-colors"
          placeholder="Ad Soyad"
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">E-posta</label>
        <input
          type="email"
          required
          value={formData.email || ""}
          onChange={(event) => updateFormData({ email: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-amber-500 transition-colors"
          placeholder="ogrenci@email.com"
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">Sınıf</label>
        <select
          required
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
                   focus:outline-none focus:border-amber-500 transition-colors"
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
        disabled={isSubmitting}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
      >
        {isSubmitting ? "Ekleniyor..." : "Öğrenci Ekle"}
      </motion.button>
    </form>
  );
}
