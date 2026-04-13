"use client";

import { motion } from "framer-motion";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  parseExcelFile,
} from "@/lib/question-import";
import AdminEditDocumentForm from "@/features/admin/components/modal/AdminEditDocumentForm";
import AdminEditUserForm from "@/features/admin/components/modal/AdminEditUserForm";
import AdminGenericContentForm from "@/features/admin/components/modal/AdminGenericContentForm";
import AdminMessageForm from "@/features/admin/components/modal/AdminMessageForm";
import AdminModalSuccessState from "@/features/admin/components/modal/AdminModalSuccessState";
import AdminSendDocumentForm from "@/features/admin/components/modal/AdminSendDocumentForm";
import AdminStudentForm from "@/features/admin/components/modal/AdminStudentForm";
import {
  getModalTitle,
  type AdminFormUpdate,
  type AdminModalSubmitHandler,
} from "@/features/admin/components/modal/shared";
import type {
  AdminDocument as Document,
  AdminFormState,
  AdminModalType,
  AdminUser,
} from "@/features/admin/types";

type AdminMainModalProps = {
  adminMsgImagePreview: string | null;
  adminMsgRecipient: AdminUser | null;
  adminMsgText: string;
  adminMsgTitle: string;
  documents: Document[];
  editingDoc: Document | null;
  editingUser: AdminUser | null;
  formData: AdminFormState;
  isSubmitting: boolean;
  modalType: AdminModalType;
  onAdminMessageSubmit: AdminModalSubmitHandler;
  onClose: () => void;
  onEditDocumentSubmit: AdminModalSubmitHandler;
  onEditUserSubmit: AdminModalSubmitHandler;
  onGenericSubmit: AdminModalSubmitHandler;
  onSendDocSubmit: AdminModalSubmitHandler;
  onStudentSubmit: AdminModalSubmitHandler;
  privateStudents: AdminUser[];
  selectedDoc: Document | null;
  selectedStudent: string;
  setAdminMsgImagePreview: Dispatch<SetStateAction<string | null>>;
  setAdminMsgImageUrl: Dispatch<SetStateAction<string>>;
  setAdminMsgText: Dispatch<SetStateAction<string>>;
  setAdminMsgTitle: Dispatch<SetStateAction<string>>;
  setFormData: Dispatch<SetStateAction<AdminFormState>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setSelectedDoc: Dispatch<SetStateAction<Document | null>>;
  setSelectedStudent: Dispatch<SetStateAction<string>>;
  studentUsers: AdminUser[];
  success: boolean;
};

export default function AdminMainModal({
  adminMsgImagePreview,
  adminMsgRecipient,
  adminMsgText,
  adminMsgTitle,
  documents,
  editingDoc,
  editingUser,
  formData,
  isSubmitting,
  modalType,
  onAdminMessageSubmit,
  onClose,
  onEditDocumentSubmit,
  onEditUserSubmit,
  onGenericSubmit,
  onSendDocSubmit,
  onStudentSubmit,
  privateStudents,
  selectedDoc,
  selectedStudent,
  setAdminMsgImagePreview,
  setAdminMsgImageUrl,
  setAdminMsgText,
  setAdminMsgTitle,
  setFormData,
  setIsSubmitting,
  setSelectedDoc,
  setSelectedStudent,
  studentUsers,
  success,
}: AdminMainModalProps) {
  const updateFormData: AdminFormUpdate = (nextValue) => {
    setFormData((current) => ({ ...current, ...nextValue }));
  };

  const handleDocumentSelect = (documentId: string) => {
    const nextDocument =
      documents.find((document) => document.id === documentId) ?? null;
    updateFormData({ document_id: documentId });
    setSelectedDoc(nextDocument);
  };

  const clearAdminMessageImage = () => {
    setAdminMsgImageUrl("");
    setAdminMsgImagePreview(null);
  };

  const handleAdminMessageImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = `admin_msg_${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(fileName, file);

    if (error || !data) {
      alert("Resim yüklenemedi.");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(fileName);
    setAdminMsgImageUrl(urlData.publicUrl);
    setAdminMsgImagePreview(URL.createObjectURL(file));
  };

  const handleQuestionImportUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer);
      updateFormData({ importResult: result });
    } catch (error) {
      alert(
        "Excel dosyası okunamadı: " +
          (error instanceof Error ? error.message : "Bilinmeyen hata"),
      );
    }
  };

  const handleDocumentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("documents")
      .upload(fileName, file);

    if (error) {
      alert("Dosya yüklenemedi: " + error.message);
      setIsSubmitting(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(fileName);
    updateFormData({
      file_name: file.name,
      file_url: urlData.publicUrl,
    });
    setIsSubmitting(false);
  };

  const toggleDocumentGrade = (grade: number | "Mezun", checked: boolean) => {
    const grades = formData.grades || [];

    if (checked) {
      updateFormData({ grades: [...grades, grade] });
      return;
    }

    updateFormData({
      grades: grades.filter((currentGrade) => currentGrade !== grade),
    });
  };

  const renderBody = () => {
    if (success) {
      return <AdminModalSuccessState modalType={modalType} />;
    }

    switch (modalType) {
      case "editUser":
        return (
          <AdminEditUserForm
            editingUser={editingUser}
            formData={formData}
            isSubmitting={isSubmitting}
            onSubmit={onEditUserSubmit}
            updateFormData={updateFormData}
          />
        );
      case "sendDoc":
        return (
          <AdminSendDocumentForm
            documents={documents}
            formData={formData}
            isSubmitting={isSubmitting}
            onDocumentSelect={handleDocumentSelect}
            onSubmit={onSendDocSubmit}
            selectedDoc={selectedDoc}
            studentUsers={studentUsers}
            updateFormData={updateFormData}
          />
        );
      case "adminMessage":
        return (
          <AdminMessageForm
            adminMsgImagePreview={adminMsgImagePreview}
            adminMsgRecipient={adminMsgRecipient}
            adminMsgText={adminMsgText}
            adminMsgTitle={adminMsgTitle}
            isSubmitting={isSubmitting}
            onClearImage={clearAdminMessageImage}
            onImageUpload={handleAdminMessageImageUpload}
            onSubmit={onAdminMessageSubmit}
            setAdminMsgText={setAdminMsgText}
            setAdminMsgTitle={setAdminMsgTitle}
          />
        );
      case "editDocument":
        return (
          <AdminEditDocumentForm
            editingDoc={editingDoc}
            formData={formData}
            isSubmitting={isSubmitting}
            onSubmit={onEditDocumentSubmit}
            updateFormData={updateFormData}
          />
        );
      case "student":
        return (
          <AdminStudentForm
            formData={formData}
            isSubmitting={isSubmitting}
            onSubmit={onStudentSubmit}
            updateFormData={updateFormData}
          />
        );
      default:
        return (
          <AdminGenericContentForm
            formData={formData}
            isSubmitting={isSubmitting}
            modalType={modalType}
            onDocumentUpload={handleDocumentUpload}
            onQuestionImportUpload={handleQuestionImportUpload}
            onSubmit={onGenericSubmit}
            onSelectedStudentChange={setSelectedStudent}
            onToggleDocumentGrade={toggleDocumentGrade}
            privateStudents={privateStudents}
            selectedStudent={selectedStudent}
            updateFormData={updateFormData}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
        className="glass rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {getModalTitle(modalType)}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {renderBody()}
      </motion.div>
    </motion.div>
  );
}
