"use client";

import { useRef, type Dispatch, type SetStateAction } from "react";
import { useToast } from "@/components/Toast";
import { ADMIN_EMAIL } from "@/lib/admin";
import {
  advanceAdminUserGrades,
  deleteAdminEntity,
  migrateLegacyWorksheetDocuments,
  refreshAdminDocumentCategories,
  updateAdminUser,
  updateAdminAssignment,
  updateAdminSharedDocument,
} from "@/features/admin/queries";
import type {
  AdminAnnouncement,
  AdminAssignment,
  AdminDocument,
  AdminQuiz,
  AdminSharedDocument,
  AdminUser,
} from "@/features/admin/types";

type UseAdminListActionsOptions = {
  allUsers: AdminUser[];
  announcements: AdminAnnouncement[];
  assignments: AdminAssignment[];
  documents: AdminDocument[];
  loadData: (adminUserId?: string | null) => Promise<void>;
  setAnnouncements: Dispatch<SetStateAction<AdminAnnouncement[]>>;
  setAssignments: Dispatch<SetStateAction<AdminAssignment[]>>;
  setDocuments: Dispatch<SetStateAction<AdminDocument[]>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setAllUsers: Dispatch<SetStateAction<AdminUser[]>>;
  setPdfStudentsLoading: Dispatch<SetStateAction<boolean>>;
  setQuizzes: Dispatch<SetStateAction<AdminQuiz[]>>;
  setSharedDocs: Dispatch<SetStateAction<AdminSharedDocument[]>>;
  sharedDocs: AdminSharedDocument[];
  quizzes: AdminQuiz[];
};

export function useAdminListActions({
  allUsers,
  announcements,
  assignments,
  documents,
  loadData,
  setAnnouncements,
  setAssignments,
  setDocuments,
  setIsSubmitting,
  setAllUsers,
  setPdfStudentsLoading,
  setQuizzes,
  setSharedDocs,
  sharedDocs,
  quizzes,
}: UseAdminListActionsOptions) {
  const { showToast } = useToast();
  const deletingIds = useRef(new Set<string>());
  const studentUsers = allUsers.filter((user) => user.email !== ADMIN_EMAIL);

  const handleToggleFavoriteStudent = async (student: AdminUser) => {
    const nextFavorite = !student.is_favorite;
    setAllUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === student.id
          ? { ...currentUser, is_favorite: nextFavorite }
          : currentUser,
      ),
    );

    const { error } = await updateAdminUser(student.id, {
      is_favorite: nextFavorite,
    });

    if (error) {
      setAllUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === student.id
            ? { ...currentUser, is_favorite: student.is_favorite }
            : currentUser,
        ),
      );
      showToast("error", "Favori durumu güncellenemedi.");
      return;
    }

    showToast(
      "success",
      nextFavorite
        ? `${student.name || "Öğrenci"} favorilere eklendi.`
        : `${student.name || "Öğrenci"} favorilerden çıkarıldı.`,
    );
  };

  const handleDownloadStudentsPdf = async () => {
    setPdfStudentsLoading(true);
    try {
      const { downloadStudentListPDF } = await import("@/lib/pdf-export");
      await downloadStudentListPDF();
    } finally {
      setPdfStudentsLoading(false);
    }
  };

  const deleteItem = async (type: string, id: string) => {
    if (!confirm("Bu içeriği silmek istediğinizden emin misiniz?")) {
      return;
    }

    const entityType =
      type === "assignment" ||
      type === "shared_document" ||
      type === "announcement" ||
      type === "quiz"
        ? type
        : "document";
    const key = `${entityType}:${id}`;
    if (deletingIds.current.has(key)) return;
    deletingIds.current.add(key);

    const removeItem = async <T extends { id: string }>(
      items: T[],
      setItems: Dispatch<SetStateAction<T[]>>,
    ) => {
      const originalIndex = items.findIndex((item) => item.id === id);
      const originalItem = items[originalIndex];
      setItems((current) => current.filter((item) => item.id !== id));
      try {
        const { error } = await deleteAdminEntity(entityType, id);
        if (error) throw error;
      } catch {
        // Restore only this item; preserve changes made while deletion was pending.
        if (originalItem) {
          setItems((current) => {
            if (current.some((item) => item.id === id)) return current;
            const restored = [...current];
            restored.splice(
              Math.min(originalIndex, restored.length),
              0,
              originalItem,
            );
            return restored;
          });
        }
        showToast("error", "İçerik silinemedi. Lütfen tekrar deneyin.");
      } finally {
        deletingIds.current.delete(key);
      }
    };

    if (entityType === "assignment")
      return removeItem(assignments, setAssignments);
    if (entityType === "shared_document")
      return removeItem(sharedDocs, setSharedDocs);
    if (entityType === "announcement")
      return removeItem(announcements, setAnnouncements);
    if (entityType === "quiz") return removeItem(quizzes, setQuizzes);
    return removeItem(documents, setDocuments);
  };

  const editAssignment = async (assignment: AdminAssignment) => {
    const title = prompt("Ödev başlığı", assignment.title || "");
    if (title === null) {
      return;
    }

    const description = prompt("Ödev açıklaması", assignment.description || "");
    if (description === null) {
      return;
    }

    const { error } = await updateAdminAssignment(assignment.id, {
      description,
      title,
    });

    if (!error) {
      setAssignments(
        assignments.map((currentAssignment) =>
          currentAssignment.id === assignment.id
            ? { ...currentAssignment, description, title }
            : currentAssignment,
        ),
      );
    }
  };

  const editSharedDocument = async (sharedDocument: AdminSharedDocument) => {
    const document_title = prompt(
      "Belge başlığı",
      sharedDocument.document_title || "",
    );
    if (document_title === null) {
      return;
    }

    const file_url = prompt("Belge bağlantısı", sharedDocument.file_url || "");
    if (file_url === null) {
      return;
    }

    const { error } = await updateAdminSharedDocument(sharedDocument.id, {
      document_title,
      file_url,
    });

    if (!error) {
      setSharedDocs(
        sharedDocs.map((document) =>
          document.id === sharedDocument.id
            ? { ...document, document_title, file_url }
            : document,
        ),
      );
    }
  };

  const handleRefreshDocumentCategories = async () => {
    if (
      !confirm(
        "Eski içeriklerin kategori türlerini güncellemek istediğinize emin misiniz?\n\n• worksheet → Yaprak Test\n• test → Deneme-Sınav\n• deneme → Deneme-Sınav\n• sinav → Deneme-Sınav\n• game → Oyunlar\n• document → Yaprak Test\n• writing → Ders Notları\n• ders-notuari-kitaplar → Ders Notları",
      )
    ) {
      return;
    }

    const updated = await refreshAdminDocumentCategories();
    showToast("success", `${updated} kategori güncellendi.`);
    await loadData();
  };

  const handleMigrateWorksheetDocuments = async () => {
    if (
      !confirm(
        "Eski yaprak test kayıtları kazanım klasörlerine göre düzenlensin mi?\n\nBu işlem başlıkları standart yaprak test formatına çeker, açıklamalara gizli kazanım bilgisi ekler ve sınıf alanındaki hatalı 0 değerlerini temizler.",
      )
    ) {
      return;
    }

    const updated = await migrateLegacyWorksheetDocuments(documents);
    showToast("success", `${updated} yaprak test kaydı geçiş aracından geçirildi.`);
    await loadData();
  };

  const handleUpdateGrades = async () => {
    if (
      !confirm(
        "Tüm öğrencilerin sınıfını güncellemek istediğinizden emin misiniz?",
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    const currentYear = new Date().getFullYear();
    await advanceAdminUserGrades(allUsers);

    if (typeof window !== "undefined") {
      localStorage.setItem("lastGradeUpdate", `${currentYear} - Temmuz`);
    }

    await loadData();
    setIsSubmitting(false);
    showToast("success", "Sınıflar başarıyla güncellendi.");
  };

  return {
    deleteItem,
    editAssignment,
    editSharedDocument,
    handleDownloadStudentsPdf,
    handleMigrateWorksheetDocuments,
    handleRefreshDocumentCategories,
    handleToggleFavoriteStudent,
    handleUpdateGrades,
    studentUsers,
  };
}
