import { useId } from "react";
import { motion } from "framer-motion";
import type {
  AdminDocument as Document,
  AdminFormState,
  AdminUser,
} from "@/features/admin/types";
import {
  type AdminFormUpdate,
  type AdminModalSubmitHandler,
} from "@/features/admin/components/modal/shared";
import { Send } from "lucide-react";

type AdminSendDocumentFormProps = {
  documents: Document[];
  formData: AdminFormState;
  isSubmitting: boolean;
  onDocumentSelect: (documentId: string) => void;
  onSubmit: AdminModalSubmitHandler;
  selectedDoc: Document | null;
  studentUsers: AdminUser[];
  updateFormData: AdminFormUpdate;
};

export default function AdminSendDocumentForm({
  documents,
  formData,
  isSubmitting,
  onDocumentSelect,
  onSubmit,
  selectedDoc,
  studentUsers,
  updateFormData,
}: AdminSendDocumentFormProps) {
  const baseId = useId();
  const docId = `${baseId}-document`;
  const studentId = `${baseId}-student`;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor={docId} className="block text-slate-300 mb-2 text-sm">
          Belge Seç
        </label>
        <select
          id={docId}
          required
          value={formData.document_id || ""}
          onChange={(event) => onDocumentSelect(event.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-rose-500 transition-colors"
        >
          <option value="">Belge seçin</option>
          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={studentId} className="block text-slate-300 mb-2 text-sm">
          Öğrenci Seç
        </label>
        <select
          id={studentId}
          required
          value={formData.student_id || ""}
          onChange={(event) => updateFormData({ student_id: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-rose-500 transition-colors"
        >
          <option value="">Öğrenci seçin</option>
          {studentUsers.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name || student.email} -{" "}
              {student.grade === "Mezun" ? "Mezun" : `${student.grade}. Sınıf`}
            </option>
          ))}
        </select>
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting || !selectedDoc}
        className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSubmitting ? (
          "Gönderiliyor..."
        ) : (
          <>
            <Send className="w-5 h-5" />
            Gönder
          </>
        )}
      </motion.button>
    </form>
  );
}
