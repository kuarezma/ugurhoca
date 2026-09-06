import type { QuizQuestion } from '@/types/quiz';

export interface OfflineQuizPackage {
  id: string;
  title: string;
  topic: string;
  grade: string;
  questionsCount: number;
  downloadedAt: string;
  sizeKb: number;
  questions: QuizQuestion[];
}

export const OFFLINE_PACKAGES_STORAGE_KEY = 'ugurhoca_offline_quiz_packages';

export function getOfflinePackages(): OfflineQuizPackage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_PACKAGES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineQuizPackage[];
  } catch (error) {
    console.error('Failed to load offline quiz packages:', error);
    return [];
  }
}

export function saveOfflinePackage(pkg: OfflineQuizPackage): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const packages = getOfflinePackages();
    const existingIndex = packages.findIndex((p) => p.id === pkg.id);
    if (existingIndex >= 0) {
      packages[existingIndex] = pkg;
    } else {
      packages.push(pkg);
    }
    localStorage.setItem(OFFLINE_PACKAGES_STORAGE_KEY, JSON.stringify(packages));
    return true;
  } catch (error) {
    console.error('Failed to save offline quiz package:', error);
    return false;
  }
}

export function removeOfflinePackage(packageId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const packages = getOfflinePackages().filter((p) => p.id !== packageId);
    localStorage.setItem(OFFLINE_PACKAGES_STORAGE_KEY, JSON.stringify(packages));
    return true;
  } catch (error) {
    console.error('Failed to remove offline quiz package:', error);
    return false;
  }
}

export function isQuizDownloadedOffline(quizId: string): boolean {
  const packages = getOfflinePackages();
  return packages.some((p) => p.id === quizId);
}

export function clearAllOfflinePackages(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(OFFLINE_PACKAGES_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
