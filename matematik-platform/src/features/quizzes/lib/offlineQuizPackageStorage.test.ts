import { describe, expect, it, beforeEach } from 'vitest';
import {
  getOfflinePackages,
  saveOfflinePackage,
  removeOfflinePackage,
  isQuizDownloadedOffline,
  clearAllOfflinePackages,
  type OfflineQuizPackage,
} from './offlineQuizPackageStorage';

describe('offlineQuizPackageStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockPackage: OfflineQuizPackage = {
    id: 'test-pkg-1',
    title: 'Çarpanlara Ayırma Çevrimdışı Paketi',
    topic: 'CarpanlaraAyirma',
    grade: '8',
    questionsCount: 10,
    downloadedAt: '2026-09-06T12:00:00.000Z',
    sizeKb: 145,
    questions: [
      {
        id: 'q1',
        quiz_id: 'test-pkg-1',
        question: '2x + 4 = 10 ise x kaçtır?',
        options: ['2', '3', '4', '5'],
        correct_index: 1,
        question_order: 1,
        created_at: '2026-09-06T12:00:00.000Z',
        explanation: '2x = 6 ise x = 3 bulunur.',
      },
    ],
  };

  it('saves and retrieves offline packages', () => {
    expect(getOfflinePackages()).toEqual([]);

    const saved = saveOfflinePackage(mockPackage);
    expect(saved).toBe(true);

    const packages = getOfflinePackages();
    expect(packages.length).toBe(1);
    expect(packages[0].title).toBe('Çarpanlara Ayırma Çevrimdışı Paketi');
    expect(isQuizDownloadedOffline('test-pkg-1')).toBe(true);
    expect(isQuizDownloadedOffline('non-existent')).toBe(false);
  });

  it('updates package if already exists with same id', () => {
    saveOfflinePackage(mockPackage);

    const updatedPackage = {
      ...mockPackage,
      title: 'Güncellenmiş Paket',
    };
    saveOfflinePackage(updatedPackage);

    const packages = getOfflinePackages();
    expect(packages.length).toBe(1);
    expect(packages[0].title).toBe('Güncellenmiş Paket');
  });

  it('removes offline package by id', () => {
    saveOfflinePackage(mockPackage);
    expect(getOfflinePackages().length).toBe(1);

    const removed = removeOfflinePackage('test-pkg-1');
    expect(removed).toBe(true);
    expect(getOfflinePackages().length).toBe(0);
    expect(isQuizDownloadedOffline('test-pkg-1')).toBe(false);
  });

  it('clears all offline packages', () => {
    saveOfflinePackage(mockPackage);
    saveOfflinePackage({ ...mockPackage, id: 'test-pkg-2' });
    expect(getOfflinePackages().length).toBe(2);

    clearAllOfflinePackages();
    expect(getOfflinePackages().length).toBe(0);
  });
});
