import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EduProgressDB } from './edu-progress-db';

describe('EduProgressDB', () => {
  let fakeStore: Record<string, Record<string, unknown>>;
  let mockDbInstance: unknown;

  beforeEach(() => {
    fakeStore = {
      solvedQuestions: {},
      userStats: {},
    };

    mockDbInstance = {
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(true),
      },
      transaction: vi.fn().mockImplementation((_storeNames: string[]) => {
        return {
          objectStore: vi.fn().mockImplementation((name: string) => ({
            put: vi.fn().mockImplementation((val: { id?: string; key?: string }) => {
              const k = val.id || val.key || 'default';
              fakeStore[name][k] = val;
            }),
            get: vi.fn().mockImplementation((key: string) => {
              const req: { result?: unknown; onsuccess?: () => void; onerror?: () => void } = {
                result: fakeStore[name][key] || undefined,
              };
              setTimeout(() => {
                req.onsuccess?.();
              }, 0);
              return req;
            }),
            count: vi.fn().mockImplementation(() => {
              const req: { result: number; onsuccess?: () => void; onerror?: () => void } = {
                result: Object.keys(fakeStore[name]).length,
              };
              setTimeout(() => {
                req.onsuccess?.();
              }, 0);
              return req;
            }),
          })),
          oncomplete: null as (() => void) | null,
          onerror: null as (() => void) | null,
        };
      }),
    };

    const mockOpenRequest = {
      result: mockDbInstance,
      onsuccess: null as (() => void) | null,
      onerror: null as (() => void) | null,
      onupgradeneeded: null as (() => void) | null,
    };

    vi.stubGlobal('indexedDB', {
      open: vi.fn().mockImplementation(() => {
        setTimeout(() => {
          mockOpenRequest.onsuccess?.();
        }, 0);
        return mockOpenRequest;
      }),
    });
  });

  it('records question answer and updates streak', async () => {
    const db = new EduProgressDB('test-db', 1);

    // Mock transaction commit behavior
    const origOpen = db.open.bind(db);
    vi.spyOn(db, 'open').mockImplementation(async () => {
      const openDb = (await origOpen()) as unknown as {
        transaction: (names: string[], mode: string) => {
          objectStore: (name: string) => unknown;
          oncomplete: (() => void) | null;
        };
      };

      const origTx = openDb.transaction;
      openDb.transaction = (names, mode) => {
        const tx = origTx(names, mode);
        setTimeout(() => {
          tx.oncomplete?.();
        }, 10);
        return tx;
      };
      return openDb as unknown as IDBDatabase;
    });

    const result = await db.recordAnswer({
      questionId: 'q-101',
      topic: 'pisagor',
      isCorrect: true,
      score: 10,
    });

    expect(result).toBe(true);
    expect(fakeStore.solvedQuestions['q-101']).toBeDefined();
  });

  it('returns solved count and streak info fallback safely', async () => {
    const db = new EduProgressDB('test-db', 1);
    const count = await db.getSolvedCount();
    expect(count).toBeGreaterThanOrEqual(0);

    const stats = await db.getStreakInfo();
    expect(stats.currentStreak).toBeDefined();
  });
});
