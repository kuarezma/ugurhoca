import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_SNAPSHOT_COOKIE_NAME, serializeAuthSnapshot } from './auth-snapshot';
import {
  BACKUP_APP_IDENTIFIER,
  BACKUP_SCHEMA_VERSION,
  downloadUserDataBackupFile,
  exportUserDataBackupJson,
  generateUserDataBackup,
  importUserDataBackup,
  validateUserDataBackup,
} from './userDataBackup';

describe('userDataBackup lib', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => { document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=; path=/; max-age=0`; });

  it('exports and restores only the current user’s daily goal and mistakes', () => {
    const signIn = (id: string) => { document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=${serializeAuthSnapshot({ id, email: 'student@example.com', name: 'Öğrenci', grade: 8, isAdmin: false })}; path=/`; };
    localStorage.setItem('ugurhoca_user_storage_migrated_v1', 'true');
    localStorage.setItem('ugurhoca_daily_goal_v1:user-a', '{"solved":7}');
    localStorage.setItem('ugur_hoca_mistakes_bank_v1:user-a', '[{"id":"a"}]');
    signIn('user-a');
    expect(generateUserDataBackup().data.dailyGoal).toEqual({ solved: 7 });
    expect(generateUserDataBackup().data.mistakesBank).toEqual([{ id: 'a' }]);
    signIn('user-b');
    expect(generateUserDataBackup().data.dailyGoal).toBeNull();
    const backup = { app: BACKUP_APP_IDENTIFIER, version: 1, exportedAt: '', data: { dailyGoal: { solved: 2 }, mistakesBank: [{ id: 'b' }], topicChecklist: null, liveQuestions: [] } };
    expect(importUserDataBackup(JSON.stringify(backup)).success).toBe(true);
    expect(localStorage.getItem('ugurhoca_daily_goal_v1:user-a')).toBe('{"solved":7}');
    expect(localStorage.getItem('ugurhoca_daily_goal_v1:user-b')).toBe('{"solved":2}');
    expect(localStorage.getItem('ugur_hoca_mistakes_bank_v1:user-b')).toBe('[{"id":"b"}]');
    expect(localStorage.getItem('ugurhoca_daily_goal_v1')).toBeNull();
  });

  it('generates a backup with correct metadata and empty defaults', () => {
    const backup = generateUserDataBackup();
    expect(backup.app).toBe(BACKUP_APP_IDENTIFIER);
    expect(backup.version).toBe(BACKUP_SCHEMA_VERSION);
    expect(backup.exportedAt).toBeDefined();
    expect(backup.data.mistakesBank).toEqual([]);
    expect(backup.data.dailyGoal).toBeNull();
  });

  it('collects stored items from localStorage properly', () => {
    const mockDaily = { currentStreak: 5, target: 30 };
    const mockMistakes = [{ id: 'q1', question: { question: '2+2' } }];
    localStorage.setItem('ugurhoca_daily_goal_v1', JSON.stringify(mockDaily));
    localStorage.setItem('ugur_hoca_mistakes_bank_v1', JSON.stringify(mockMistakes));

    const backup = generateUserDataBackup();
    expect(backup.data.dailyGoal).toEqual(mockDaily);
    expect(backup.data.mistakesBank).toEqual(mockMistakes);

    const json = exportUserDataBackupJson();
    expect(json).toContain('currentStreak');
    expect(json).toContain('2+2');
  });

  it('rejects invalid backup structures in validateUserDataBackup', () => {
    expect(validateUserDataBackup(null).valid).toBe(false);
    expect(validateUserDataBackup({ app: 'wrong-app' }).valid).toBe(false);
    expect(
      validateUserDataBackup({
        app: BACKUP_APP_IDENTIFIER,
        version: 999,
        data: {},
      }).valid,
    ).toBe(false);
  });

  it('imports valid backup and restores to localStorage', () => {
    const payload = {
      app: BACKUP_APP_IDENTIFIER,
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        dailyGoal: { currentStreak: 7 },
        mistakesBank: [{ id: 'm1' }, { id: 'm2' }],
        topicChecklist: { 'lgs-carpanlar': true },
        liveQuestions: [],
      },
    };

    const res = importUserDataBackup(JSON.stringify(payload));
    expect(res.success).toBe(true);
    expect(res.stats?.dailyStreak).toBe(7);
    expect(res.stats?.mistakesCount).toBe(2);
    expect(res.stats?.topicsCount).toBe(1);

    expect(localStorage.getItem('ugurhoca_daily_goal_v1')).toContain('"currentStreak":7');
    expect(localStorage.getItem('ugur_hoca_mistakes_bank_v1')).toContain('"id":"m1"');
  });

  it('handles invalid json string gracefully', () => {
    const res = importUserDataBackup('invalid json content');
    expect(res.success).toBe(false);
    expect(res.message).toContain('JSON dosyası çözümlenemedi');
  });

  it('triggers download of backup file in browser', () => {
    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    const origCreateElement = document.createElement.bind(document);
    const clickMock = vi.fn();

    URL.createObjectURL = vi.fn().mockReturnValue('blob:user-backup');
    URL.revokeObjectURL = vi.fn();

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        const el = origCreateElement('a');
        el.click = clickMock;
        return el;
      }
      return origCreateElement(tagName);
    });

    try {
      downloadUserDataBackupFile();
      expect(clickMock).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:user-backup');
    } finally {
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
    }
  });

  it('handles storage quota exceeded error gracefully during import', () => {
    const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      const error = new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      throw error;
    });

    const payload = {
      app: BACKUP_APP_IDENTIFIER,
      data: {
        dailyGoal: { currentStreak: 3 },
      },
      exportedAt: new Date().toISOString(),
      version: 1,
    };

    const res = importUserDataBackup(JSON.stringify(payload));
    expect(res.success).toBe(false);
    expect(res.message).toContain('Tarayıcı depolama alanı yetersiz');
    setItemSpy.mockRestore();
  });
});
