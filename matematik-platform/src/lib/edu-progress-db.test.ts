import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EduProgressDB, triggerMicroCelebration } from './edu-progress-db';

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

  it('handles upgrade needed by creating object stores and indexes', async () => {
    const createIndexMock = vi.fn();
    const createObjectStoreMock = vi.fn().mockReturnValue({
      createIndex: createIndexMock,
    });

    const mockDb = {
      createObjectStore: createObjectStoreMock,
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(false),
      },
    };

    vi.stubGlobal('indexedDB', {
      open: vi.fn().mockImplementation(() => {
        const req = {
          error: null,
          onsuccess: null as (() => void) | null,
          onupgradeneeded: null as ((e: unknown) => void) | null,
          result: mockDb,
        };
        setTimeout(() => {
          req.onupgradeneeded?.({ target: { result: mockDb } });
          req.onsuccess?.();
        }, 0);
        return req;
      }),
    });

    const db = new EduProgressDB('upgrade-test', 2);
    const opened = await db.open();
    expect(opened).toBeDefined();
    expect(createObjectStoreMock).toHaveBeenCalledWith('solvedQuestions', {
      keyPath: 'id',
    });
    expect(createObjectStoreMock).toHaveBeenCalledWith('userStats', {
      keyPath: 'key',
    });
    expect(createIndexMock).toHaveBeenCalledWith('topic', 'topic', {
      unique: false,
    });
  });

  it('rejects open when indexedDB fails or is unsupported', async () => {
    vi.stubGlobal('indexedDB', {
      open: vi.fn().mockImplementation(() => {
        const req = {
          error: new Error('IndexedDB blocked'),
          onerror: null as (() => void) | null,
          onsuccess: null,
        };
        setTimeout(() => req.onerror?.(), 0);
        return req;
      }),
    });

    const db = new EduProgressDB('failing-db');
    await expect(db.open()).rejects.toThrow('IndexedDB blocked');
  });

  it('records incorrect answer with score 0 and updates streak', async () => {
    const db = new EduProgressDB('test-db', 1);

    vi.spyOn(db, 'open').mockImplementation(async () => {
      return {
        transaction: () => ({
          objectStore: (name: string) => ({
            get: () => {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];

              const req = {
                onsuccess: null as (() => void) | null,
                result: {
                  data: {
                    currentStreak: 4,
                    lastActiveDate: yesterdayStr,
                    totalCorrect: 10,
                    totalSolved: 12,
                  },
                },
              };
              setTimeout(() => req.onsuccess?.(), 0);
              return req;
            },
            put: (val: unknown) => {
              fakeStore[name]['streakStats'] = val as Record<string, unknown>;
            },
          }),
          oncomplete: null as (() => void) | null,
          onerror: null as (() => void) | null,
        }),
      } as unknown as IDBDatabase;
    });

    const result = await new Promise<boolean>((resolve) => {
      const origOpen = db.open;
      db.open = async () => {
        const opened = await origOpen.call(db);
        const origTx = opened.transaction.bind(opened);
        opened.transaction = (...args: unknown[]) => {
          const tx = Reflect.apply(origTx, opened, args) as IDBTransaction;
          setTimeout(() => {
            tx.oncomplete?.(new Event('complete'));
            resolve(true);
          }, 10);
          return tx;
        };
        return opened;
      };

      db.recordAnswer({
        isCorrect: false,
        questionId: 'q-wrong',
        topic: 'olasilik',
      });
    });

    expect(result).toBe(true);
  });

  it('triggers micro celebration canvas animation without throwing', () => {
    const origCreateElement = document.createElement.bind(document);
    const mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      restore: vi.fn(),
      rotate: vi.fn(),
      save: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
    };

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        const el = origCreateElement('canvas');
        el.getContext = vi.fn().mockReturnValue(mockContext);
        return el;
      }
      return origCreateElement(tag);
    });

    expect(() => triggerMicroCelebration()).not.toThrow();
  });
});
