import { describe, expect, it } from 'vitest';
import { selectWorksheetPlanItemsForScan } from '@/lib/worksheet-candidate-scan';
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
});
