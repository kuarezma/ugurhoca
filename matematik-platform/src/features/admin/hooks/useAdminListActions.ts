"use client";

import type { Dispatch, SetStateAction } from "react";
import { ADMIN_EMAIL } from "@/lib/admin";
import {
  advanceAdminUserGrades,
  deleteAdminChatRoom,
  deleteAdminEntity,
  migrateLegacyWorksheetDocuments,
  refreshAdminDocumentCategories,
  toggleAdminPrivateStudent,
  updateAdminAssignment,
  updateAdminSharedDocument,
} from "@/features/admin/queries";
import type {
  AdminAnnouncement,
  AdminAssignment,
  AdminChatRoom,
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
  setActiveChatRoom: Dispatch<SetStateAction<AdminChatRoom | null>>;
  setAnnouncements: Dispatch<SetStateAction<AdminAnnouncement[]>>;
  setAssignments: Dispatch<SetStateAction<AdminAssignment[]>>;
  setDocuments: Dispatch<SetStateAction<AdminDocument[]>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
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
  setActiveChatRoom,
  setAnnouncements,
  setAssignments,
  setDocuments,
  setIsSubmitting,
  setPdfStudentsLoading,
  setQuizzes,
  setSharedDocs,
  sharedDocs,
  quizzes,
}: UseAdminListActionsOptions) {
  const studentUsers = allUsers.filter((user) => user.email !== ADMIN_EMAIL);
  const writingDocuments = documents.filter(
    (document) => document.type === "writing",
  );

  const handleDownloadStudentsPdf = async () => {
    setPdfStudentsLoading(true);
    try {
      const { downloadStudentListPDF } = await import("@/lib/pdf-export");
      await downloadStudentListPDF();
    } finally {
      setPdfStudentsLoading(false);
    }
  };

  const togglePrivateStudent = async (
    userId: string,
    isCurrentlyPrivate: boolean,
  ) => {
    const { error } = await toggleAdminPrivateStudent(userId, isCurrentlyPrivate);

    if (!error) {
      alert(
        `Öğrenci "Özel Ders" listesinden ${isCurrentlyPrivate ? "çıkarıldı" : "eklendi"}.`,
      );
      await loadData();
    } else {
      alert("İşlem başarısız: " + error.message);
    }
  };

  const deleteItem = async (type: string, id: string) => {
    if (!confirm("Bu içeriği silmek istediğinizden emin misiniz?")) {
      return;
    }

    if (type === "assignment") {
      await deleteAdminEntity("assignment", id);
      setAssignments(assignments.filter((assignment) => assignment.id !== id));
      return;
    }

    if (type === "shared_document") {
      await deleteAdminEntity("shared_document", id);
      setSharedDocs(
        sharedDocs.filter((sharedDocument) => sharedDocument.id !== id),
      );
      return;
    }

    if (type === "announcement") {
      await deleteAdminEntity("announcement", id);
      setAnnouncements(
        announcements.filter((announcement) => announcement.id !== id),
      );
      return;
    }

    if (type === "quiz") {
      await deleteAdminEntity("quiz", id);
      setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
      return;
    }

    await deleteAdminEntity("document", id);
    setDocuments(documents.filter((document) => document.id !== id));
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
        "Eski içeriklerin kategori türlerini güncellemek istediğinize emin misiniz?\n\n• worksheet → Yaprak Test\n• test → Sınav\n• game → Oyunlar\n• document → Yaprak Test\n• writing → Ders Notları\n• ders-notuari-kitaplar → Ders Notları\n• deneme → Deneme",
      )
    ) {
      return;
    }

    const updated = await refreshAdminDocumentCategories();
    alert(`${updated} kategori güncellendi!`);
    await loadData();
  };

  const handleMigrateWorksheetDocuments = async () => {
    if (
      !confirm(
        "Eski yaprak test kayıtları kazanım klasörlerine göre düzenlensin mi?\n\nBu işlem mevcut yaprak test açıklamalarına gizli kazanım bilgisi ekler ve sınıf alanındaki hatalı 0 değerlerini temizler.",
      )
    ) {
      return;
    }

    const updated = await migrateLegacyWorksheetDocuments(documents);
    alert(`${updated} yaprak test kaydı geçiş aracından geçirildi.`);
    await loadData();
  };

  const handleDeleteChatRoom = async (room: AdminChatRoom) => {
    if (!confirm("Bu odayı silmek istediğinizden emin misiniz?")) {
      return;
    }

    await deleteAdminChatRoom(room.id);
    setActiveChatRoom(null);
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
    alert("Sınıflar başarıyla güncellendi!");
  };

  return {
    deleteItem,
    editAssignment,
    editSharedDocument,
    handleDeleteChatRoom,
    handleDownloadStudentsPdf,
    handleMigrateWorksheetDocuments,
    handleRefreshDocumentCategories,
    handleUpdateGrades,
    studentUsers,
    togglePrivateStudent,
    writingDocuments,
  };
}
