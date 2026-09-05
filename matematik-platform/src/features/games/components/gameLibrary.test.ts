import { describe, expect, it } from 'vitest';
import { games } from './gameLibrary';

describe('gameLibrary', () => {
  it('contains 19 registered games with unique ids', () => {
    expect(games.length).toBe(19);
    const ids = games.map((g) => g.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(19);
    expect(ids).toEqual(Array.from({ length: 19 }, (_, i) => i + 1));
  });

  it('ensures all games have valid metadata and components', () => {
    games.forEach((game) => {
      expect(game.title).toBeTruthy();
      expect(game.description).toBeTruthy();
      expect(game.grade).toBeTruthy();
      expect(game.difficulty).toBeTruthy();
      expect(game.color).toBeTruthy();
      expect(game.icon).toBeDefined();
      expect(game.component).toBeDefined();
    });
  });

  it('includes the newly added games with correct identifiers', () => {
    const expectedTitles = [
      'Pizza Ustası',
      'Matematik Ninja',
      'Köstebek Avı',
      'Hızlı Şoför',
      'Koordinat Korsanı',
      'Sayı Kulesi',
      'Matematik Düellosu',
    ];

    expectedTitles.forEach((title) => {
      const found = games.find((g) => g.title === title);
      expect(found).toBeDefined();
      expect(found?.id).toBeGreaterThanOrEqual(13);
      expect(found?.id).toBeLessThanOrEqual(19);
    });
  });
});
