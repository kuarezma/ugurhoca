import { describe, expect, it, vi } from 'vitest';
import {
  discoverWorksheetCandidatesFromSources,
  isPublicWorksheetSourceUrl,
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
      ' https://meb.gov.tr/kaynaklar ,\n https://eba.gov.tr/testler ',
    );

    expect(sources).toEqual([
      'https://meb.gov.tr/kaynaklar',
      'https://eba.gov.tr/testler',
    ]);
    expect(parseAllowedHosts('', sources)).toEqual(['meb.gov.tr', 'eba.gov.tr']);
    expect(parseAllowedHosts('meb.gov.tr,\n.eba.gov.tr', sources)).toEqual([
      'meb.gov.tr',
      '.eba.gov.tr',
    ]);
  });

  it('detects public worksheet source URLs', () => {
    expect(isPublicWorksheetSourceUrl('https://meb.gov.tr/testler')).toBe(true);
    expect(isPublicWorksheetSourceUrl('ftp://meb.gov.tr/testler')).toBe(false);
    expect(isPublicWorksheetSourceUrl('http://localhost/testler')).toBe(false);
    expect(isPublicWorksheetSourceUrl('http://192.168.1.10/testler')).toBe(false);
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
      match_reason:
        '8. sınıf bulundu · konu eşleşti: uslu, ifadeler · test bağlantısı · PDF dosyası',
      source_url: 'https://meb.gov.tr/kaynaklar',
      status: 'pending',
      subject: 'Üslü İfadeler',
      title: '8. Sınıf Matematik - Üslü İfadeler - Yaprak Test',
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
    expect(result.candidates[0]?.title).toBe(
      '8. Sınıf Matematik - Üslü İfadeler - Yaprak Test',
    );
    expect(result.candidates[0]?.match_score).toBeGreaterThanOrEqual(20);
  });

  it('uses the PDF file name when link text is generic', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      headers: new Headers({ 'content-type': 'text/html' }),
      ok: true,
      text: async () => `
        <a href="/dosyalar/8-sinif-uslu-ifadeler-yaprak-test.pdf">İndir</a>
      `,
    });

    const result = await discoverWorksheetCandidatesFromSources({
      allowedHosts: ['meb.gov.tr'],
      fetcher,
      planItem,
      sourceUrls: ['https://meb.gov.tr/kaynaklar'],
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]?.title).toBe(
      '8. Sınıf Matematik - Üslü İfadeler - Yaprak Test',
    );
  });

  it('matches flexible grade spellings', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      headers: new Headers({ 'content-type': 'text/html' }),
      ok: true,
      text: async () => `
        <a href="/pdf/8_sinif_uslu_ifadeler_test.pdf">8. sınıf üslü ifadeler testi</a>
        <a href="/pdf/8sinif-uslu-ifadeler-yaprak-test.pdf">8sinif üslü ifadeler yaprak test</a>
      `,
    });

    const result = await discoverWorksheetCandidatesFromSources({
      allowedHosts: ['meb.gov.tr'],
      fetcher,
      planItem,
      sourceUrls: ['https://meb.gov.tr/kaynaklar'],
    });

    expect(result.candidates).toHaveLength(2);
    expect(result.candidates.every((candidate) => candidate.match_score >= 20)).toBe(
      true,
    );
  });

  it('rejects PDFs that mention a different grade only', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      headers: new Headers({ 'content-type': 'text/html' }),
      ok: true,
      text: async () => `
        <a href="/pdf/7-sinif-uslu-ifadeler-yaprak-test.pdf">7. Sınıf Üslü İfadeler Yaprak Test</a>
      `,
    });

    const result = await discoverWorksheetCandidatesFromSources({
      allowedHosts: ['meb.gov.tr'],
      fetcher,
      planItem,
      sourceUrls: ['https://meb.gov.tr/kaynaklar'],
    });

    expect(result.candidates).toEqual([]);
  });

  it('rejects EBA grade-folder PDFs for another grade', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      headers: new Headers({ 'content-type': 'text/html' }),
      ok: true,
      text: async () => `
        <a href="https://cdn.eba.gov.tr/yardimcikaynaklar/2022/11/kt/7kt/mat/31.pdf">Geometrik Cisimler</a>
        <a href="https://cdn.eba.gov.tr/yardimcikaynaklar/2022/11/kt/8kt/mat/6.pdf">Dönüşüm Geometrisi / Geometrik Cisimler</a>
      `,
    });

    const result = await discoverWorksheetCandidatesFromSources({
      allowedHosts: ['odsgm.meb.gov.tr', 'cdn.eba.gov.tr'],
      fetcher,
      planItem: {
        ...planItem,
        learning_outcome:
          'M.8.3.4.1. Dik prizmaları tanır, temel elemanlarını belirler.',
        subject: 'Geometrik Cisimler',
      },
      sourceUrls: ['https://odsgm.meb.gov.tr/testler'],
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]?.file_url).toBe(
      'https://cdn.eba.gov.tr/yardimcikaynaklar/2022/11/kt/8kt/mat/6.pdf',
    );
  });

  it('discovers matching Google Drive file links and keeps the best two', async () => {
    const navigationLinks = Array.from({ length: 100 }, (_, index) => {
      return `<a href="/menu-${index}">Menü ${index}</a>`;
    }).join('');
    const fetcher = vi.fn().mockResolvedValue({
      headers: new Headers({ 'content-type': 'text/html' }),
      ok: true,
      text: async () => `
        ${navigationLinks}
        <a href="https://drive.google.com/file/d/alan-1/view">Test 25 - Alan Ölçme-1</a>
        <a href="https://drive.google.com/file/d/alan-2/view">Test 26 - Alan Ölçme-2</a>
        <a href="https://drive.google.com/file/d/cember/view">Test 27 - Çember-1</a>
      `,
    });

    const result = await discoverWorksheetCandidatesFromSources({
      allowedHosts: ['ortaokul-matematik.com', 'drive.google.com'],
      fetcher,
      planItem: {
        ...planItem,
        grade: 6,
        learning_outcome:
          'MAT.6.4.3. Geometrik şekillerin alanları ile ilgili problemleri çözer.',
        subject: 'MAT.6.4.GEOMETRİK NİCELİKLER',
      },
      sourceUrls: [
        'https://www.ortaokul-matematik.com/6-sinif-matematik-meb-kazanim-testileri/',
      ],
    });

    expect(result.candidates).toHaveLength(2);
    expect(result.candidates.map((candidate) => candidate.file_url)).toEqual([
      'https://drive.google.com/file/d/alan-1/view',
      'https://drive.google.com/file/d/alan-2/view',
    ]);
    expect(result.candidates.every((candidate) => candidate.grade === 6)).toBe(true);
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
      title: '5. Sınıf Matematik - Temel Geometrik Çizimler ve İnşalar - Yaprak Test',
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
