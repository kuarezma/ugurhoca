import { describe, expect, it } from 'vitest';
import { buildAnnualPlanSampleCsv } from '@/features/admin/annual-plan-template';

describe('annual plan template', () => {
  it('builds a CSV template with required columns and sample rows', () => {
    const csv = buildAnnualPlanSampleCsv();
    const lines = csv.split('\n');

    expect(lines[0]).toBe(
      'sinif,hafta_baslangic,hafta_bitis,konu,kazanim,aciklama',
    );
    expect(lines).toHaveLength(3);
    expect(csv).toContain('Çarpanlar ve Katlar');
    expect(csv).toContain('Tam Sayılar');
  });

  it('escapes comma-containing values for spreadsheet compatibility', () => {
    const csv = buildAnnualPlanSampleCsv();

    expect(csv).toContain('"İlk hafta, tekrar"');
  });
});
