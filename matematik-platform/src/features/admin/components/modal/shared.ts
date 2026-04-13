import type { FormEvent } from "react";
import type {
  AdminFormState,
  AdminModalType,
} from "@/features/admin/types";

export type AdminModalSubmitHandler = (
  event: FormEvent<HTMLFormElement>,
) => void | Promise<void>;

export type AdminFormUpdate = (nextValue: Partial<AdminFormState>) => void;

export const DOCUMENT_CATEGORY_OPTIONS = [
  { label: "Ders Notları", value: "ders-notlari" },
  { label: "Kitaplar", value: "kitaplar" },
  { label: "Yaprak Test", value: "yaprak-test" },
  { label: "Ders Videoları", value: "ders-videolari" },
  { label: "Deneme", value: "deneme" },
  { label: "Sınav", value: "sinav" },
  { label: "Programlar", value: "programlar" },
] as const;

export const QUIZ_DIFFICULTY_OPTIONS = ["Kolay", "Orta", "Zor"] as const;
export const PRIVATE_STUDENT_GRADES = [5, 6, 7, 8, 9, 10, 11, 12] as const;
export const QUIZ_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

export const getModalTitle = (modalType: AdminModalType) => {
  switch (modalType) {
    case "announcement":
      return "Yeni Duyuru";
    case "editAnnouncement":
      return "Duyuru Düzenle";
    case "document":
      return "Yeni Belge";
    case "editDocument":
      return "Belge Düzenle";
    case "assignment":
      return "Yeni Ödev";
    case "student":
      return "Yeni Öğrenci";
    case "editUser":
      return "Kullanıcı Düzenle";
    case "sendDoc":
      return "Belge Gönder";
    case "adminMessage":
      return "Öğrenciye Mesaj Yaz";
    case "quiz":
      return "Yeni Test";
    case "editQuiz":
      return "Test Düzenle";
    case "addQuestion":
      return "Soru Ekle";
    case "importQuestions":
      return "Toplu Soru İçe Aktar";
    case "writing":
      return "Yeni Yazı";
    default:
      return "Yeni İçerik";
  }
};

export const getDescriptionLabel = (modalType: AdminModalType) => {
  if (modalType === "announcement" || modalType === "editAnnouncement") {
    return "Duyuru İçeriği";
  }
  if (modalType === "document") {
    return "Belge Açıklaması";
  }
  if (modalType === "assignment") {
    return "Ödev Detayları";
  }
  if (modalType === "quiz" || modalType === "editQuiz") {
    return "Test Açıklaması";
  }
  return "Yazı İçeriği";
};

export const getDescriptionPlaceholder = (modalType: AdminModalType) => {
  if (modalType === "document") {
    return "Belge hakkında bilgi...";
  }
  if (modalType === "assignment") {
    return "Hangi sayfalar / kaynaklar yapılacak?";
  }
  if (modalType === "quiz" || modalType === "editQuiz") {
    return "Test hakkında bilgi...";
  }
  return "İçeriği buraya yazın...";
};
