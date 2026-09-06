export interface ExitTicketQuestion {
  id: string;
  orderIndex: number; // 0, 1, 2 (3 soru)
  prompt: string;
  options: string[]; // 4 seçenek: A, B, C, D
  correctIndex: number;
  explanation?: string;
  distractorExplanations?: Record<number, string>; // Yanlış şıklara özel kavram yanılgısı açıklaması
}

export type ExitTicketStatus = 'lobby' | 'in_progress' | 'completed';

export interface ExitTicketResponse {
  id: string;
  sessionId: string;
  questionIndex: number;
  studentName: string;
  selectedIndex: number;
  submittedAt: string;
}

export interface ExitTicketSession {
  id: string;
  code: string; // 6 haneli katılım kodu, örn: "582914"
  title: string;
  grade: number;
  status: ExitTicketStatus;
  currentQuestionIndex: number;
  showDistribution: boolean;
  questions: ExitTicketQuestion[];
  responses: ExitTicketResponse[];
  createdAt: string;
}

export interface QuestionDistribution {
  counts: [number, number, number, number]; // A, B, C, D adetleri
  percentages: [number, number, number, number]; // A, B, C, D yüzdeleri
  totalResponses: number;
  correctCount: number;
  correctPercentage: number;
}
