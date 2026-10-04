import type { SupabaseClient } from '@supabase/supabase-js';
import {
  scanCurrentWeekWorksheetCandidates,
  selectWorksheetPlanItemsForScan,
} from '@/lib/worksheet-candidate-scan';
import type { WorksheetCandidatePlanItem } from '@/lib/worksheet-candidate-discovery';

const createPlanItem = (
  grade: number,
  weekStart: string,
  weekEnd: string,
  subject: string,
): WorksheetCandidatePlanItem => ({
  grade,
  id: `${grade}-${weekStart}`,
  learning_outcome: `${subject} kazanımı`,
  subject,
  week_end: weekEnd,
  week_start: weekStart,
});

describe('worksheet candidate scan plan selection', () => {
  it('selects current week items and falls back to the nearest item per grade', () => {
    const selected = selectWorksheetPlanItemsForScan(
      [
        createPlanItem(5, '2026-05-18', '2026-05-22', 'Örüntüler'),
        createPlanItem(5, '2026-06-01', '2026-06-05', 'Aritmetik'),
        createPlanItem(6, '2026-05-18', '2026-05-22', 'Alan Ölçme'),
        createPlanItem(6, '2026-06-01', '2026-06-05', 'Çember'),
        createPlanItem(7, '2026-05-25', '2026-05-29', 'Veri Analizi'),
        createPlanItem(8, '2026-05-25', '2026-05-29', 'Geometrik Cisimler'),
      ],
      '2026-05-25',
    );

    expect(selected.map((item) => `${item.grade}:${item.subject}`)).toEqual([
      '5:Örüntüler',
      '6:Alan Ölçme',
      '7:Veri Analizi',
      '8:Geometrik Cisimler',
    ]);
  });

  it('keeps multiple current items for the same grade', () => {
    const selected = selectWorksheetPlanItemsForScan(
      [
        createPlanItem(7, '2026-05-25', '2026-05-29', 'Veri Analizi'),
        createPlanItem(7, '2026-05-25', '2026-05-29', 'Grafikler'),
        createPlanItem(8, '2026-06-01', '2026-06-05', 'Geometrik Cisimler'),
      ],
      '2026-05-25',
    );

    expect(selected.map((item) => `${item.grade}:${item.subject}`)).toEqual([
      '7:Veri Analizi',
      '7:Grafikler',
      '8:Geometrik Cisimler',
    ]);
  });

  describe('scanCurrentWeekWorksheetCandidates', () => {
    it('throws error when source urls are not configured', async () => {
      const origUrls = process.env.WORKSHEET_CANDIDATE_SOURCE_URLS;
      delete process.env.WORKSHEET_CANDIDATE_SOURCE_URLS;

      const mockSupabase = {} as unknown as SupabaseClient;
      try {
        await expect(
          scanCurrentWeekWorksheetCandidates(mockSupabase),
        ).rejects.toThrow('İzinli kaynak listesi boş.');
      } finally {
        process.env.WORKSHEET_CANDIDATE_SOURCE_URLS = origUrls;
      }
    });

    it('throws error when annual plan query fails', async () => {
      process.env.WORKSHEET_CANDIDATE_SOURCE_URLS = 'https://example.com/plan';
      process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS = 'example.com';

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Database connection failed'),
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      await expect(
        scanCurrentWeekWorksheetCandidates(mockSupabase),
      ).rejects.toThrow('Yıllık plan satırları alınamadı.');
    });
  });
});
