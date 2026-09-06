import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAhaMoments,
  saveAhaMoment,
  deleteAhaMoment,
  AhaMomentItem,
} from './ahaMomentsStorage';

describe('ahaMomentsStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('varsayılan Aha anlarını getirir', () => {
    const list = getAhaMoments();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].momentText).toBeDefined();
    expect(list[0].category).toBeDefined();
  });

  it('yeni bir keşif / aydınlanma anı ekler', () => {
    const newMoment: AhaMomentItem = {
      id: 'aha-custom-1',
      studentId: 'std-test',
      category: 'Geometri',
      momentText: 'Dairenin çevresi 2*pi*r iken alanı pi*r^2... Çünkü integralde dilimler toplanıyor!',
      reaction: 'mindblown',
      topic: 'Daire ve Çember',
      date: '2026-09-06',
      createdAt: '2026-09-06T12:00:00.000Z',
    };

    const ok = saveAhaMoment(newMoment);
    expect(ok).toBe(true);

    const all = getAhaMoments();
    expect(all[0].id).toBe('aha-custom-1');
  });

  it('bir aydınlanma anını siler', () => {
    const all = getAhaMoments();
    const idToDelete = all[0].id;

    const ok = deleteAhaMoment(idToDelete);
    expect(ok).toBe(true);

    const remaining = getAhaMoments();
    expect(remaining.find((m) => m.id === idToDelete)).toBeUndefined();
  });
});
