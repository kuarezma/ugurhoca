import { describe, expect, it, vi } from 'vitest';
import {
  discoverWorksheetCandidatesFromSources,
  parseAllowedHosts,
  parseSourceUrls,
} from '@/lib/worksheet-candidate-discovery';

const planItem = {
  id: '8b7f3392-4905-4fdd-aa18-d1f654681c6e',
  grade: 8,
  learning_outcome: 'M.8.1.2.1. Üslü ifadelerle ilgili temel kuralları anlar.',
  subject: 'Üslü İfadeler',
  week_end: '2026-09-18',
  week_start: '2026-09-14',
};

describe('worksheet candidate discovery', () => {
  it('parses source and host allowlists', () => {
    const sources = parseSourceUrls(
      ' https://meb.gov.tr/kaynaklar , https://eba.gov.tr/testler ',
    );

    expect(sources).toEqual([
      'https://meb.gov.tr/kaynaklar',
      'https://eba.gov.tr/testler',
    ]);
    expect(parseAllowedHosts('', sources)).toEqual(['meb.gov.tr', 'eba.gov.tr']);
    expect(parseAllowedHosts('meb.gov.tr,.eba.gov.tr', sources)).toEqual([
      'meb.gov.tr',
      '.eba.gov.tr',
    ]);
  });

  it('discovers matching PDF links only from allowed hosts', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      headers: new Headers({ 'content-type': 'text/html' }),
      ok: true,
      text: async () => `
        <a href="/pdf/8-sinif-uslu-ifadeler-yaprak-test.pdf">8. Sınıf Üslü İfadeler Yaprak Test</a>
        <a href="https://evil.example/test.pdf">Konu dışı PDF</a>
        <a href="/pdf/8-sinif-geometri.pdf">Geometri</a>
      `,
    });

    const result = await discoverWorksheetCandidatesFromSources({
      allowedHosts: ['meb.gov.tr'],
      fetcher,
      planItem,
      sourceUrls: ['https://meb.gov.tr/kaynaklar'],
    });

    expect(result.searchedSources).toBe(1);
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      file_url: 'https://meb.gov.tr/pdf/8-sinif-uslu-ifadeler-yaprak-test.pdf',
      grade: 8,
      source_url: 'https://meb.gov.tr/kaynaklar',
      status: 'pending',
      subject: 'Üslü İfadeler',
    });
    expect(result.candidates[0]?.match_score).toBeGreaterThanOrEqual(20);
  });

  it('uses nearby page text when PDF link text is generic', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      headers: new Headers({ 'content-type': 'text/html' }),
      ok: true,
      text: async () => `
        <div class="card">
          <h3>8. Sınıf Matematik Üslü İfadeler Kazanım Tarama Testi</h3>
          <a href="/dosyalar/ktt-1.pdf">İndir</a>
        </div>
      `,
    });

    const result = await discoverWorksheetCandidatesFromSources({
      allowedHosts: ['meb.gov.tr'],
      fetcher,
      planItem,
      sourceUrls: ['https://meb.gov.tr/kaynaklar'],
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]?.title).toContain('Üslü İfadeler');
    expect(result.candidates[0]?.match_score).toBeGreaterThanOrEqual(20);
  });

  it('accepts broad grade-level math PDF sources as low-confidence candidates', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      headers: new Headers({ 'content-type': 'application/pdf' }),
      ok: true,
    });

    const result = await discoverWorksheetCandidatesFromSources({
      allowedHosts: ['meb.gov.tr'],
      fetcher,
      planItem: {
        ...planItem,
        grade: 5,
        learning_outcome: 'MAT.5.3.1. Temel geometrik çizimler yapar.',
        subject: 'Temel Geometrik Çizimler ve İnşalar',
      },
      sourceUrls: [
        'https://meb.gov.tr/dosyalar/5.sinifmatematikmebkazanimkavramatestleri.pdf',
      ],
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      file_url:
        'https://meb.gov.tr/dosyalar/5.sinifmatematikmebkazanimkavramatestleri.pdf',
      grade: 5,
      title: '5.sinifmatematikmebkazanimkavramatestleri',
    });
    expect(result.candidates[0]?.match_score).toBeGreaterThanOrEqual(20);
  });

  it('skips local and untrusted source URLs', async () => {
    const fetcher = vi.fn();

    const result = await discoverWorksheetCandidatesFromSources({
      allowedHosts: ['meb.gov.tr'],
      fetcher,
      planItem,
      sourceUrls: ['http://localhost/testler', 'https://example.com/testler'],
    });

    expect(result.candidates).toEqual([]);
    expect(result.searchedSources).toBe(0);
    expect(result.skippedSources).toBe(2);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
