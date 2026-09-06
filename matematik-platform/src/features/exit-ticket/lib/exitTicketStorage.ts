import type {
  ExitTicketSession,
  ExitTicketResponse,
  QuestionDistribution,
  ExitTicketQuestion,
} from '../types';
import { EXIT_TICKET_TEMPLATES } from './exitTicketTemplates';

const SESSIONS_STORAGE_KEY = 'ugurhoca_exit_ticket_sessions_v1';

export const generateTicketCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getSavedSessions = (): ExitTicketSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveSession = (session: ExitTicketSession): void => {
  if (typeof window === 'undefined') return;
  try {
    const sessions = getSavedSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions.slice(0, 50)));
  } catch {
    // ignore
  }
};

export const getSessionByCode = (code: string): ExitTicketSession | null => {
  const normalized = code.trim();
  const sessions = getSavedSessions();
  const found = sessions.find((s) => s.code === normalized);
  if (found) return found;

  // Eğer localde yoksa şablonlardan örnek oturum fallback'i sağla (Demo ve test için)
  const template = EXIT_TICKET_TEMPLATES[0];
  if (normalized === '123456' || normalized === '888888') {
    const demoSession: ExitTicketSession = {
      id: `session_demo_${normalized}`,
      code: normalized,
      title: template.title,
      grade: template.grade,
      status: 'in_progress',
      currentQuestionIndex: 0,
      showDistribution: false,
      questions: template.questions,
      responses: [],
      createdAt: new Date().toISOString(),
    };
    saveSession(demoSession);
    return demoSession;
  }

  return null;
};

export const createExitTicketSession = (
  title: string,
  grade: number,
  questions: ExitTicketQuestion[],
): ExitTicketSession => {
  const session: ExitTicketSession = {
    id: `et_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    code: generateTicketCode(),
    title,
    grade,
    status: 'lobby',
    currentQuestionIndex: 0,
    showDistribution: false,
    questions,
    responses: [],
    createdAt: new Date().toISOString(),
  };

  saveSession(session);
  return session;
};

export const submitExitTicketResponse = (
  sessionId: string,
  questionIndex: number,
  studentName: string,
  selectedIndex: number,
): ExitTicketSession | null => {
  const sessions = getSavedSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  // Aynı öğrencinin bu soruya daha önceki cevabını güncelle veya yenisini ekle
  const existingIdx = session.responses.findIndex(
    (r) => r.questionIndex === questionIndex && r.studentName.toLowerCase() === studentName.trim().toLowerCase(),
  );

  const response: ExitTicketResponse = {
    id: `resp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sessionId,
    questionIndex,
    studentName: studentName.trim(),
    selectedIndex,
    submittedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    session.responses[existingIdx] = response;
  } else {
    session.responses.push(response);
  }

  saveSession(session);
  return session;
};

export const calculateDistribution = (
  session: ExitTicketSession,
  questionIndex: number,
): QuestionDistribution => {
  const currentQ = session.questions[questionIndex];
  const responsesForQ = session.responses.filter((r) => r.questionIndex === questionIndex);

  const counts: [number, number, number, number] = [0, 0, 0, 0];
  let correctCount = 0;

  for (const r of responsesForQ) {
    if (r.selectedIndex >= 0 && r.selectedIndex <= 3) {
      counts[r.selectedIndex]++;
      if (currentQ && r.selectedIndex === currentQ.correctIndex) {
        correctCount++;
      }
    }
  }

  const total = responsesForQ.length;
  const percentages: [number, number, number, number] = [
    total > 0 ? Math.round((counts[0] / total) * 100) : 0,
    total > 0 ? Math.round((counts[1] / total) * 100) : 0,
    total > 0 ? Math.round((counts[2] / total) * 100) : 0,
    total > 0 ? Math.round((counts[3] / total) * 100) : 0,
  ];

  return {
    counts,
    percentages,
    totalResponses: total,
    correctCount,
    correctPercentage: total > 0 ? Math.round((correctCount / total) * 100) : 0,
  };
};
