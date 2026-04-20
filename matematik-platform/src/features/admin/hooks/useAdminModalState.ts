"use client";

import { useState } from "react";
import type {
  AdminAnnouncement,
  AdminAssignment,
  AdminDocument,
  AdminFormState,
  AdminModalType,
  AdminQuiz,
  AdminUser,
} from "@/features/admin/types";

type OpenableAdminModalType =
  | "announcement"
  | "editAnnouncement"
  | "document"
  | "assignment"
  | "sendDoc"
  | "quiz"
  | "editQuiz"
  | "addQuestion"
  | "importQuestions";

export function useAdminModalState() {
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [activeAssignment, setActiveAssignment] =
    useState<AdminAssignment | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<AdminQuiz | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<AdminModalType>("announcement");
  const [formData, setFormData] = useState<AdminFormState>({});
  const [selectedDoc, setSelectedDoc] = useState<AdminDocument | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AdminAnnouncement | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editingDoc, setEditingDoc] = useState<AdminDocument | null>(null);
  const [adminMsgRecipient, setAdminMsgRecipient] =
    useState<AdminUser | null>(null);
  const [adminMsgTitle, setAdminMsgTitle] = useState("");
  const [adminMsgText, setAdminMsgText] = useState("");
  const [adminMsgImageUrl, setAdminMsgImageUrl] = useState("");
  const [adminMsgImagePreview, setAdminMsgImagePreview] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const openModal = (
    type: OpenableAdminModalType,
    doc?: AdminDocument,
  ) => {
    setModalType(type);
    if (doc) {
      setSelectedDoc(doc);
    }
    setFormData(
      type === 'importQuestions'
        ? {
            importBundleFile: null,
            importMode: 'excel',
            importResult: null,
          }
        : {},
    );
    setShowModal(true);
  };

  const openEditAnnouncement = (
    announcement: AdminAnnouncement,
    nextFormData: AdminFormState,
  ) => {
    setEditingAnnouncement(announcement);
    setFormData(nextFormData);
    setModalType("editAnnouncement");
    setShowModal(true);
  };

  const openEditDocument = (
    document: AdminDocument,
    nextFormData: AdminFormState,
  ) => {
    setEditingDoc(document);
    setFormData(nextFormData);
    setModalType("editDocument");
    setShowModal(true);
  };

  const openEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      grade: user.grade || 5,
      name: user.name || "",
    });
    setModalType("editUser");
    setShowModal(true);
  };

  const openAdminMessage = (recipient: AdminUser) => {
    setAdminMsgRecipient(recipient);
    setAdminMsgTitle("");
    setAdminMsgText("");
    setModalType("adminMessage");
    setShowModal(true);
  };

  const openEditQuiz = (quiz: AdminQuiz, nextFormData: AdminFormState) => {
    setSelectedQuiz(quiz);
    setFormData(nextFormData);
    setModalType("editQuiz");
    setShowModal(true);
  };

  const openSubmissionsModal = (assignment: AdminAssignment) => {
    setActiveAssignment(assignment);
    setShowSubmissionsModal(true);
  };

  const closeSubmissionsModal = () => {
    setShowSubmissionsModal(false);
  };

  const resetModalState = () => {
    setShowModal(false);
    setSuccess(false);
    setFormData({
      importBundleFile: null,
      importMode: 'excel',
      importResult: null,
    });
    setSelectedDoc(null);
    setEditingAnnouncement(null);
    setEditingUser(null);
    setEditingDoc(null);
    setSelectedQuiz(null);
    setAdminMsgRecipient(null);
    setAdminMsgTitle("");
    setAdminMsgText("");
    setAdminMsgImageUrl("");
    setAdminMsgImagePreview(null);
  };

  return {
    activeAssignment,
    adminMsgImagePreview,
    adminMsgImageUrl,
    adminMsgRecipient,
    adminMsgText,
    adminMsgTitle,
    closeSubmissionsModal,
    editingAnnouncement,
    editingDoc,
    editingUser,
    formData,
    isSubmitting,
    modalType,
    openAdminMessage,
    openEditAnnouncement,
    openEditDocument,
    openEditQuiz,
    openEditUser,
    openModal,
    openSubmissionsModal,
    resetModalState,
    selectedDoc,
    selectedQuiz,
    setAdminMsgImagePreview,
    setAdminMsgImageUrl,
    setAdminMsgText,
    setAdminMsgTitle,
    setEditingAnnouncement,
    setFormData,
    setIsSubmitting,
    setSelectedDoc,
    setSelectedQuiz,
    setSuccess,
    showModal,
    showSubmissionsModal,
    success,
  };
}
