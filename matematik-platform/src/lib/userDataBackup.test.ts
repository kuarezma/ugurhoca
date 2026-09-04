import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateUserDataBackup,
  exportUserDataBackupJson,
  validateUserDataBackup,
  importUserDataBackup,
  BACKUP_APP_IDENTIFIER,
  BACKUP_SCHEMA_VERSION,
} from './userDataBackup';

describe('userDataBackup lib', () => {
  beforeEach(() => {
    localStorage.clear();
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
});
