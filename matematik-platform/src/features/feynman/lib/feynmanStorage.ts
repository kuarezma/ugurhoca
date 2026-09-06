export interface FeynmanRecording {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  topic: string;
  conceptSummary: string;
  durationSeconds: number;
  audioBlobUrl?: string;
  createdAt: string;
  likesCount: number;
  badge: 'Feynman Çırağı' | 'Yalın Anlatıcı' | 'Feynman Ustası';
  teacherNote?: string;
}

export const FEYNMAN_STORAGE_KEY = 'ugurhoca_feynman_recordings';

export const DEFAULT_FEYNMAN_RECORDINGS: FeynmanRecording[] = [
  {
    id: 'feyn-1',
    studentId: 'std-1',
    studentName: 'Elif Demir',
    grade: '8',
    topic: 'Üslü Sayılarda Negatif Üs Ne Demektir?',
    conceptSummary: 'Negatif üs sayıyı negatif yapmaz, sadece pay ile paydayı takla attırır! 2^-3 = 1 / (2^3) = 1/8 dir.',
    durationSeconds: 42,
    createdAt: '2026-09-05T14:20:00.000Z',
    likesCount: 12,
    badge: 'Yalın Anlatıcı',
    teacherNote: 'Harika benzetme! "Takla attırmak" görsel olarak akılda kalıcı olmuş.',
  },
  {
    id: 'feyn-2',
    studentId: 'std-2',
    studentName: 'Can Öztürk',
    grade: '8',
    topic: 'Kareköklü Sayıların Mantığı',
    conceptSummary: 'Karekök, bir karenin alanını bildiğinde "Bu karenin bir kenarı kaç metreydi?" diye dedektiflik yapmaktır.',
    durationSeconds: 54,
    createdAt: '2026-09-06T11:15:00.000Z',
    likesCount: 18,
    badge: 'Feynman Ustası',
    teacherNote: 'Dedektiflik analojisi mükemmel bir kavramsal açıklama.',
  },
];

export function getFeynmanRecordings(): FeynmanRecording[] {
  if (typeof window === 'undefined') return DEFAULT_FEYNMAN_RECORDINGS;
  try {
    const raw = localStorage.getItem(FEYNMAN_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FEYNMAN_STORAGE_KEY, JSON.stringify(DEFAULT_FEYNMAN_RECORDINGS));
      return DEFAULT_FEYNMAN_RECORDINGS;
    }
    return JSON.parse(raw) as FeynmanRecording[];
  } catch {
    return DEFAULT_FEYNMAN_RECORDINGS;
  }
}

export function saveFeynmanRecording(recording: FeynmanRecording): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const recordings = getFeynmanRecordings();
    const existingIdx = recordings.findIndex((r) => r.id === recording.id);
    if (existingIdx >= 0) {
      recordings[existingIdx] = recording;
    } else {
      recordings.unshift(recording);
    }
    localStorage.setItem(FEYNMAN_STORAGE_KEY, JSON.stringify(recordings));
    return true;
  } catch (error) {
    console.error('Failed to save Feynman recording:', error);
    return false;
  }
}

export function toggleLikeFeynmanRecording(recordingId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const recordings = getFeynmanRecordings();
    const target = recordings.find((r) => r.id === recordingId);
    if (!target) return 0;

    target.likesCount = (target.likesCount || 0) + 1;
    localStorage.setItem(FEYNMAN_STORAGE_KEY, JSON.stringify(recordings));
    return target.likesCount;
  } catch {
    return 0;
  }
}
