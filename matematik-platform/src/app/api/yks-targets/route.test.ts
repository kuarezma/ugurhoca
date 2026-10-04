import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GET as getYks } from './route';
import { GET as getLgs } from '../lgs-targets/route';
import {
  loadYksProgramPageData,
  loadLgsSchoolPageData,
} from '@/features/programs/server';

vi.mock('@/features/programs/server', () => ({
  loadYksProgramPageData: vi.fn(),
  loadLgsSchoolPageData: vi.fn(),
}));

describe('Public program catalog caching', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(['', 'Veri okunamadı'])(
    'yalnızca başarılı katalogları paylaşır (error=%s)',
    async (error) => {
      vi.mocked(loadYksProgramPageData).mockResolvedValue({
        dataYear: 2025,
        error,
        rows: [],
      });
      vi.mocked(loadLgsSchoolPageData).mockResolvedValue({
        dataYear: 2025,
        error,
        schools: [],
        historyYears: [],
      });
      const [yks, lgs] = await Promise.all([
        getYks(new Request('http://localhost/api/yks-targets?year=2026')),
        getLgs(),
      ]);
      for (const response of [yks, lgs]) {
        expect(response.headers.get('Cache-Control')).toBe(
          error ? 'no-store' : 'public, max-age=300, s-maxage=3600',
        );
      }
      expect(loadYksProgramPageData).toHaveBeenCalledWith(2026);
      expect((await yks.json()).data.dataYear).toBe(2025);
    },
  );

  it.each(['bad', '2026.5', '1999', '2101', ''])(
    'geçersiz yılı veritabanına göndermeden reddeder: %s',
    async (year) => {
      expect(
        (
          await getYks(
            new Request(`http://localhost/api/yks-targets?year=${year}`),
          )
        ).status,
      ).toBe(400);
      expect(loadYksProgramPageData).not.toHaveBeenCalled();
    },
  );
});
