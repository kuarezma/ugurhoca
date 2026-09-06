import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFeynmanRecordings,
  saveFeynmanRecording,
  toggleLikeFeynmanRecording,
  FeynmanRecording,
} from './feynmanStorage';

describe('feynmanStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('varsayılan Feynman sesli anlatımlarını listeler', () => {
    const list = getFeynmanRecordings();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].conceptSummary).toBeDefined();
    expect(list[0].durationSeconds).toBeLessThanOrEqual(60);
  });

  it('yeni bir Feynman anlatımı kaydeder', () => {
    const newRecord: FeynmanRecording = {
      id: 'feyn-test',
      studentId: 'std-3',
      studentName: 'Mert Ak',
      grade: '8',
      topic: 'Üçgen Eşitsizliği',
      conceptSummary: 'İki kenarın toplamı üçüncü kenardan kısa olursa iki çubuk havada kalır ve üçgen kapanamaz!',
      durationSeconds: 38,
      createdAt: '2026-09-06T12:00:00.000Z',
      likesCount: 5,
      badge: 'Yalın Anlatıcı',
    };

    const ok = saveFeynmanRecording(newRecord);
    expect(ok).toBe(true);

    const all = getFeynmanRecordings();
    expect(all[0].id).toBe('feyn-test');
    expect(all[0].topic).toBe('Üçgen Eşitsizliği');
  });

  it('anlatım beğeni sayısını artırır', () => {
    const list = getFeynmanRecordings();
    const firstId = list[0].id;
    const initialLikes = list[0].likesCount;

    const newLikes = toggleLikeFeynmanRecording(firstId);
    expect(newLikes).toBe(initialLikes + 1);
  });
});
