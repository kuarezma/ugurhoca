import { motion } from "framer-motion";
import type { ChangeEvent } from "react";
import { Upload } from "lucide-react";
import AdminAnnouncementFields from "@/features/admin/components/modal/generic/AdminAnnouncementFields";
import AdminAssignmentFields from "@/features/admin/components/modal/generic/AdminAssignmentFields";
import AdminDescriptionField from "@/features/admin/components/modal/generic/AdminDescriptionField";
import AdminDocumentFields from "@/features/admin/components/modal/generic/AdminDocumentFields";
import AdminQuestionFields from "@/features/admin/components/modal/generic/AdminQuestionFields";
import AdminQuestionImportFields from "@/features/admin/components/modal/generic/AdminQuestionImportFields";
import AdminQuizSettingsFields from "@/features/admin/components/modal/generic/AdminQuizSettingsFields";
import type {
  AdminFormState,
  AdminModalType,
  AdminUser,
} from "@/features/admin/types";
import {
  DOCUMENT_CATEGORY_OPTIONS,
  type AdminFormUpdate,
  type AdminModalSubmitHandler,
} from "@/features/admin/components/modal/shared";

type AdminGenericContentFormProps = {
  formData: AdminFormState;
  isSubmitting: boolean;
  modalType: AdminModalType;
  onDocumentUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onQuestionImportUpload: (
    event: ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  onSubmit: AdminModalSubmitHandler;
  onToggleDocumentGrade: (grade: number | "Mezun", checked: boolean) => void;
  onSelectedStudentChange: (studentId: string) => void;
  privateStudents: AdminUser[];
  selectedStudent: string;
  updateFormData: AdminFormUpdate;
};

export default function AdminGenericContentForm({
  formData,
  isSubmitting,
  modalType,
  onDocumentUpload,
  onQuestionImportUpload,
  onSubmit,
  onSelectedStudentChange,
  onToggleDocumentGrade,
  privateStudents,
  selectedStudent,
  updateFormData,
}: AdminGenericContentFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {modalType === "assignment" && (
        <AdminAssignmentFields
          formData={formData}
          onSelectedStudentChange={onSelectedStudentChange}
          privateStudents={privateStudents}
          selectedStudent={selectedStudent}
          updateFormData={updateFormData}
        />
      )}

      <div>
        <label className="block text-slate-300 mb-2 text-sm">Başlık</label>
        <input
          type="text"
          required
          value={formData.title || ""}
          onChange={(event) => updateFormData({ title: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="Başlık girin..."
        />
      </div>

      {(modalType === "announcement" || modalType === "editAnnouncement") && (
        <AdminAnnouncementFields
          formData={formData}
          updateFormData={updateFormData}
        />
      )}

      {modalType === "document" && (
        <div>
          <label className="block text-slate-300 mb-2 text-sm">Kategori</label>
          <select
            required
            value={formData.type || ""}
            onChange={(event) => updateFormData({ type: event.target.value })}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                     focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="">Kategori seçin</option>
            {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <AdminDescriptionField
        formData={formData}
        modalType={modalType}
        updateFormData={updateFormData}
      />

      {(modalType === "quiz" || modalType === "editQuiz") && (
        <AdminQuizSettingsFields
          formData={formData}
          modalType={modalType}
          updateFormData={updateFormData}
        />
      )}

      {modalType === "addQuestion" && (
        <AdminQuestionFields
          formData={formData}
          updateFormData={updateFormData}
        />
      )}

      {modalType === "importQuestions" && (
        <AdminQuestionImportFields
          formData={formData}
          isSubmitting={isSubmitting}
          onQuestionImportUpload={onQuestionImportUpload}
        />
      )}

      {modalType === "document" && (
        <AdminDocumentFields
          formData={formData}
          onDocumentUpload={onDocumentUpload}
          onToggleDocumentGrade={onToggleDocumentGrade}
          updateFormData={updateFormData}
        />
      )}

      {modalType !== "importQuestions" || !formData.importResult ? (
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all glow-button flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Ekleniyor...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Yayınla
            </>
          )}
        </motion.button>
      ) : null}
    </form>
  );
}
