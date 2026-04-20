"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useToast } from "@/components/Toast";
import { ADMIN_EMAIL } from "@/lib/admin";
import { getClientSession } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/error-utils";
import {
  createAdminAnnouncement,
  createAdminAssignment,
  createAdminDocument,
  createAdminQuiz,
  createAdminQuizQuestion,
  createAdminSharedDocument,
  updateAdminAnnouncement,
  updateAdminDocument,
  updateAdminQuiz,
  updateAdminUser,
} from "@/features/admin/queries";
import type {
  AdminAnnouncement,
  AdminAssignment,
  AdminDocument,
  AdminFormState,
  AdminModalType,
  AdminQuiz,
  AdminQuizQuestion,
  AdminSharedDocument,
  AdminUser,
} from "@/features/admin/types";

type UseAdminModalSubmitHandlersOptions = {
  adminMsgImageUrl: string;
  adminMsgRecipient: AdminUser | null;
  adminMsgText: string;
  adminMsgTitle: string;
  allUsers: AdminUser[];
  announcements: AdminAnnouncement[];
  assignments: AdminAssignment[];
  documents: AdminDocument[];
  editingAnnouncement: AdminAnnouncement | null;
  editingDoc: AdminDocument | null;
  editingUser: AdminUser | null;
  formData: AdminFormState;
  loadData: (adminUserId?: string | null) => Promise<void>;
  modalType: AdminModalType;
  quizQuestions: AdminQuizQuestion[];
  quizzes: AdminQuiz[];
  resetModalState: () => void;
  selectedDoc: AdminDocument | null;
  selectedQuiz: AdminQuiz | null;
  setAnnouncements: Dispatch<SetStateAction<AdminAnnouncement[]>>;
  setAssignments: Dispatch<SetStateAction<AdminAssignment[]>>;
  setDocuments: Dispatch<SetStateAction<AdminDocument[]>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setQuizQuestions: Dispatch<SetStateAction<AdminQuizQuestion[]>>;
  setQuizzes: Dispatch<SetStateAction<AdminQuiz[]>>;
  setSharedDocs: Dispatch<SetStateAction<AdminSharedDocument[]>>;
  setSuccess: Dispatch<SetStateAction<boolean>>;
  sharedDocs: AdminSharedDocument[];
  studentUsers: AdminUser[];
};

export function useAdminModalSubmitHandlers({
  adminMsgImageUrl,
  adminMsgRecipient,
  adminMsgText,
  adminMsgTitle,
  allUsers,
  announcements,
  assignments,
  documents,
  editingAnnouncement,
  editingDoc,
  editingUser,
  formData,
  loadData,
  modalType,
  quizQuestions,
  quizzes,
  resetModalState,
  selectedDoc,
  selectedQuiz,
  setAnnouncements,
  setAssignments,
  setDocuments,
  setIsSubmitting,
  setQuizQuestions,
  setQuizzes,
  setSharedDocs,
  setSuccess,
  sharedDocs,
  studentUsers,
}: UseAdminModalSubmitHandlersOptions) {
  const { showToast } = useToast();

  const scheduleModalSuccessReset = () => {
    setSuccess(true);
    setTimeout(() => {
      resetModalState();
    }, 1500);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const imageUrls =
      modalType === "announcement" || modalType === "editAnnouncement"
        ? String(formData.image_urls || "")
            .split("\n")
            .map((url: string) => url.trim())
            .filter(Boolean)
        : [];

    let completedSuccessfully = false;

    if (modalType === "assignment") {
      const { data, error } = await createAdminAssignment({
        description: formData.description,
        due_date: formData.due_date,
        grade: formData.grade,
        student_id: null,
        title: formData.title,
      });

      if (!error && data) {
        setAssignments([data, ...assignments]);
        completedSuccessfully = true;
      }
    } else if (modalType === "announcement") {
      const announcementItem = {
        content: formData.description,
        ...(imageUrls[0] ? { image_url: imageUrls[0] } : {}),
        ...(imageUrls.length ? { image_urls: imageUrls } : {}),
        ...(formData.link_url ? { link_url: formData.link_url } : {}),
        title: formData.title,
      };
      const { data, error } = await createAdminAnnouncement({
        announcement: announcementItem,
        recipientUserIds: allUsers
          .filter((currentUser) => currentUser.email !== ADMIN_EMAIL)
          .map((currentUser) => currentUser.id),
      });

      if (!error && data) {
        setAnnouncements([data, ...announcements]);
        completedSuccessfully = true;
      } else {
        showToast(
          "error",
          error?.message
            ? `Duyuru kaydedilemedi: ${error.message}`
            : "Duyuru kaydedilemedi. Lütfen tekrar deneyin.",
        );
      }

      await loadData();
    } else if (modalType === "editAnnouncement") {
      if (!editingAnnouncement) {
        setIsSubmitting(false);
        return;
      }

      const announcementUpdate = {
        content: formData.description ?? editingAnnouncement.content,
        image_url: imageUrls[0] || formData.image_url || "",
        image_urls: imageUrls.length ? imageUrls : [],
        link_url: formData.link_url || "",
        title: formData.title ?? editingAnnouncement.title,
      };
      const { error } = await updateAdminAnnouncement(
        editingAnnouncement.id,
        announcementUpdate,
      );

      if (!error) {
        setAnnouncements(
          announcements.map((announcement) =>
            announcement.id === editingAnnouncement.id
              ? { ...announcement, ...announcementUpdate }
              : announcement,
          ),
        );
        completedSuccessfully = true;
      }

      await loadData();
    } else if (modalType === "document") {
      const documentItem = {
        answer_key_text: formData.answer_key_text || null,
        description: formData.description,
        downloads: 0,
        file_url: formData.file_url,
        grade: formData.grades,
        learning_outcome: formData.learning_outcome || null,
        solution_url: formData.solution_url || null,
        title: formData.title,
        type: formData.type,
        video_url: formData.video_url,
        worksheet_order: formData.worksheet_order || null,
      };
      const { data, error } = await createAdminDocument(documentItem);

      if (!error && data) {
        setDocuments([data, ...documents]);
        completedSuccessfully = true;
      } else {
        showToast("error", "Belge kaydedilemedi. Lütfen tekrar deneyin.");
      }
    } else if (modalType === "quiz") {
      const { data, error } = await createAdminQuiz({
        description: formData.description,
        difficulty: formData.difficulty,
        grade: typeof formData.grade === "number" ? formData.grade : null,
        is_active: true,
        time_limit: formData.time_limit,
        title: formData.title,
      });

      if (!error && data) {
        setQuizzes([data, ...quizzes]);
        completedSuccessfully = true;
      } else {
        showToast("error", "Test kaydedilemedi. Lütfen tekrar deneyin.");
      }
    } else if (modalType === "editQuiz") {
      if (!selectedQuiz) {
        setIsSubmitting(false);
        return;
      }

      const nextQuiz: AdminQuiz = {
        ...selectedQuiz,
        description: formData.description ?? selectedQuiz.description ?? null,
        difficulty: formData.difficulty ?? selectedQuiz.difficulty,
        grade:
          typeof formData.grade === "number"
            ? formData.grade
            : selectedQuiz.grade,
        is_active: formData.is_active ?? selectedQuiz.is_active ?? true,
        time_limit: formData.time_limit ?? selectedQuiz.time_limit,
        title: formData.title ?? selectedQuiz.title,
      };
      const { error } = await updateAdminQuiz(selectedQuiz.id, {
        description: nextQuiz.description,
        difficulty: nextQuiz.difficulty,
        grade: nextQuiz.grade,
        is_active: nextQuiz.is_active,
        time_limit: nextQuiz.time_limit,
        title: nextQuiz.title,
      });

      if (!error) {
        setQuizzes(
          quizzes.map((quiz) =>
            quiz.id === selectedQuiz.id ? nextQuiz : quiz,
          ),
        );
        completedSuccessfully = true;
      }
    } else if (modalType === "addQuestion") {
      if (!selectedQuiz) {
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await createAdminQuizQuestion({
        correct_index: formData.correct_index,
        explanation: formData.explanation,
        options: formData.options,
        question: formData.question,
        question_order: quizQuestions.length,
        quiz_id: selectedQuiz.id,
      });

      if (!error && data) {
        setQuizQuestions([...quizQuestions, data]);
        completedSuccessfully = true;
      } else {
        showToast("error", "Soru eklenemedi. Lütfen tekrar deneyin.");
      }
    } else if (modalType === "importQuestions") {
      const importResult = formData.importResult;
      if (!importResult) {
        setIsSubmitting(false);
        showToast("warning", "Önce geçerli bir soru dosyası yükleyin.");
        return;
      }
      if (importResult.source === "bundle" && !formData.importBundleFile) {
        setIsSubmitting(false);
        showToast("warning", "ZIP bundle dosyası eksik. Lütfen yeniden yükleyin.");
        return;
      }

      const response =
        importResult.source === "bundle" && formData.importBundleFile
          ? await (() => {
              const bundleFormData = new FormData();
              bundleFormData.set("file", formData.importBundleFile as File);
              return fetch("/api/import-questions-bundle", {
                method: "POST",
                body: bundleFormData,
              });
            })()
          : await fetch("/api/import-questions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                meta: importResult.meta,
                questions: importResult.valid,
              }),
            });
      const payload = await response.json();

      if (response.ok) {
        await loadData();
        showToast("success", "Test ve sorular başarıyla kaydedildi.");
        completedSuccessfully = true;
      } else {
        showToast(
          "error",
          "Kayıt başarısız: " +
            (payload.error?.message || "Bilinmeyen bir hata oluştu."),
        );
      }
    }

    setIsSubmitting(false);

    if (!completedSuccessfully) {
      return;
    }

    scheduleModalSuccessReset();
  };

  const handleEditUserSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (editingUser) {
      const { error } = await updateAdminUser(editingUser.id, {
        grade: formData.grade,
        name: formData.name,
      });

      if (!error) {
        await loadData();
        setIsSubmitting(false);
        scheduleModalSuccessReset();
        return;
      }
    }

    setIsSubmitting(false);
  };

  const handleSendDocSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const selectedStudentUser = studentUsers.find(
      (currentUser) => currentUser.id === formData.student_id,
    );

    const { data, error } = await createAdminSharedDocument({
      document_id: selectedDoc?.id || formData.document_id,
      document_title: selectedDoc?.title || formData.document_title,
      document_type: selectedDoc?.type || "document",
      file_url: selectedDoc?.file_url || formData.file_url,
      student_email: selectedStudentUser?.email || "",
      student_id: formData.student_id,
      student_name: selectedStudentUser?.name || "Öğrenci",
    });

    if (!error && data) {
      setSharedDocs([data, ...sharedDocs]);
      setIsSubmitting(false);
      scheduleModalSuccessReset();
      return;
    }

    setIsSubmitting(false);
  };

  const handleAdminMessageSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!adminMsgRecipient) {
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await getClientSession();
      if (!session?.access_token) {
        throw new Error("Oturum açmanız gerekiyor.");
      }
      const response = await fetch("/api/admin-message", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: adminMsgImageUrl || null,
          message: adminMsgText,
          sender_id: "admin",
          sender_name: "Uğur Hoca",
          student_id: adminMsgRecipient.id,
          student_name: adminMsgRecipient.name,
          title: adminMsgTitle || "Uğur Hoca'dan Mesaj",
        }),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(body?.error || "Mesaj gönderilemedi.");
      }

      setIsSubmitting(false);
      scheduleModalSuccessReset();
    } catch (error) {
      setIsSubmitting(false);
      showToast(
        "error",
        `Mesaj gönderilemedi: ${getErrorMessage(error)}`,
      );
    }
  };

  const handleEditDocumentSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!editingDoc) {
      setIsSubmitting(false);
      return;
    }

    const { error } = await updateAdminDocument(editingDoc.id, {
      answer_key_text: formData.answer_key_text || null,
      description: formData.description,
      file_url: formData.file_url,
      grade: formData.grades,
      learning_outcome: formData.learning_outcome || null,
      solution_url: formData.solution_url || null,
      title: formData.title,
      type: formData.type,
      video_url: formData.video_url,
      worksheet_order: formData.worksheet_order || null,
    });

    if (!error) {
      setDocuments(
        documents.map((document) =>
          document.id === editingDoc.id
            ? {
                ...document,
                answer_key_text:
                  formData.answer_key_text ?? document.answer_key_text,
                description:
                  formData.description ?? document.description ?? null,
                file_url: formData.file_url ?? document.file_url ?? null,
                grade: formData.grades ?? document.grade,
                learning_outcome:
                  formData.learning_outcome ?? document.learning_outcome ?? null,
                solution_url:
                  formData.solution_url ?? document.solution_url ?? null,
                title: formData.title ?? document.title,
                type: formData.type ?? document.type,
                video_url: formData.video_url ?? document.video_url ?? null,
                worksheet_order:
                  formData.worksheet_order ?? document.worksheet_order ?? null,
              }
            : document,
        ),
      );
      setIsSubmitting(false);
      scheduleModalSuccessReset();
      return;
    }

    setIsSubmitting(false);
  };

  return {
    handleAdminMessageSubmit,
    handleEditDocumentSubmit,
    handleEditUserSubmit,
    handleSendDocSubmit,
    handleSubmit,
  };
}
