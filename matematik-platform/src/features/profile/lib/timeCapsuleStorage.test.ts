import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTimeCapsule,
  saveTimeCapsule,
  unlockTimeCapsule,
  TimeCapsuleGoal,
} from './timeCapsuleStorage';

describe('timeCapsuleStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('varsayılan zaman kapsülünü getirir', () => {
    const capsule = getTimeCapsule();
    expect(capsule).not.toBeNull();
    expect(capsule?.targetNetScore).toBeGreaterThan(0);
    expect(capsule?.letterToFutureSelf).toBeDefined();
  });

  it('yeni bir hedef zaman kapsülü kaydeder', () => {
    const customCapsule: TimeCapsuleGoal = {
      id: 'capsule-test-1',
      studentId: 'user-xyz',
      studentName: 'Ayşe',
      targetNetScore: 20,
      targetGoalText: 'Tüm soruları doğru yapmak',
      fearToOvercome: 'Süre yetiştirememe korkusu',
      personalPledge: 'Denemelerde turlama taktiğini uygulayacağım',
      letterToFutureSelf: 'Gelecekteki ben, sakin kalmayı başardın!',
      unlockDate: '2026-06-01',
      createdAt: '2026-09-06T10:00:00.000Z',
      isUnlocked: false,
    };

    const saved = saveTimeCapsule(customCapsule);
    expect(saved).toBe(true);

    const loaded = getTimeCapsule();
    expect(loaded?.id).toBe('capsule-test-1');
    expect(loaded?.targetNetScore).toBe(20);
  });

  it('kapsülün kilidini açar ve değerlendirme notu ekler', () => {
    const ok = unlockTimeCapsule('Sene sonunda hedefime ulaştım ve çok mutluyum!');
    expect(ok).toBe(true);

    const loaded = getTimeCapsule();
    expect(loaded?.isUnlocked).toBe(true);
    expect(loaded?.reflectionNotes).toBe('Sene sonunda hedefime ulaştım ve çok mutluyum!');
  });
});
