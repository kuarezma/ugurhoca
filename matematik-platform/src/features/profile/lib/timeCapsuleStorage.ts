export interface TimeCapsuleGoal {
  id: string;
  studentId: string;
  studentName: string;
  targetNetScore: number; // örn: 18 (20 üzerinden)
  targetGoalText: string; // "Yeni nesil soruları sakince okuyup panik yapmamak"
  fearToOvercome: string; // "Geometri ve karekök sorularında önyargılı olmak"
  personalPledge: string; // "Haftada 3 gün düzenli pratik yapacağım"
  letterToFutureSelf: string; // "Sevgili gelecekteki ben..."
  unlockDate: string; // YYYY-MM-DD
  createdAt: string;
  isUnlocked: boolean;
  reflectionNotes?: string;
}

export const TIME_CAPSULE_STORAGE_KEY = 'ugurhoca_time_capsules';

export const DEFAULT_TIME_CAPSULE: TimeCapsuleGoal = {
  id: 'capsule-initial',
  studentId: 'std-1',
  studentName: 'Öğrenci',
  targetNetScore: 18,
  targetGoalText: 'LGS Matematikte 18+ nete ulaşıp hayalimdeki fen lisesini kazanmak.',
  fearToOvercome: 'Uzun paragraflı cebir ve geometri sorularından korkmamak.',
  personalPledge: 'Haftada en az 100 soru çözmek ve yanlış yaptığım her sorunun videosunu izlemek.',
  letterToFutureSelf: 'Selam gelecekteki ben! Sene başında bazen zorlandın ama pes etmedin. Şimdi bu mektubu okurken hedefine ne kadar yaklaştığını gör ve kendinle gurur duy!',
  unlockDate: '2026-06-01',
  createdAt: '2026-09-01T08:00:00.000Z',
  isUnlocked: false,
};

export function getTimeCapsule(): TimeCapsuleGoal | null {
  if (typeof window === 'undefined') return DEFAULT_TIME_CAPSULE;
  try {
    const raw = localStorage.getItem(TIME_CAPSULE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TIME_CAPSULE_STORAGE_KEY, JSON.stringify(DEFAULT_TIME_CAPSULE));
      return DEFAULT_TIME_CAPSULE;
    }
    return JSON.parse(raw) as TimeCapsuleGoal;
  } catch {
    return DEFAULT_TIME_CAPSULE;
  }
}

export function saveTimeCapsule(capsule: TimeCapsuleGoal): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(TIME_CAPSULE_STORAGE_KEY, JSON.stringify(capsule));
    return true;
  } catch (error) {
    console.error('Failed to save time capsule:', error);
    return false;
  }
}

export function unlockTimeCapsule(reflectionNotes?: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const capsule = getTimeCapsule();
    if (!capsule) return false;
    capsule.isUnlocked = true;
    if (reflectionNotes) capsule.reflectionNotes = reflectionNotes;
    localStorage.setItem(TIME_CAPSULE_STORAGE_KEY, JSON.stringify(capsule));
    return true;
  } catch {
    return false;
  }
}
