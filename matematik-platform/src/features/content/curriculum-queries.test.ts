import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/supabase/client';
import {
  loadCurriculumCoverageDocuments,
  loadCurriculumGradeDocuments,
} from './curriculum-queries';
import { clearContentDocumentCache, loadContentDocuments } from './queries';

vi.mock('@/lib/supabase/client', () => ({ supabase: { from: vi.fn() } }));

function createQuery() {
  const query = {
    select: vi.fn(),
    in: vi.fn(),
    contains: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
  };
  for (const method of ['select', 'in', 'contains', 'order'] as const)
    query[method].mockReturnValue(query);
  vi.mocked(supabase.from).mockReturnValue(query as never);
  return query;
}

describe('curriculum document queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearContentDocumentCache();
  });
  it('paginates metadata without truncating a full first page', async () => {
    const query = createQuery();
    const firstPage = Array.from({ length: 250 }, (_, index) => ({
      id: String(index),
      grade: [8],
      type: 'yaprak-test',
      title: 'Olasılık',
      description: null,
    }));
    query.range
      .mockResolvedValueOnce({ data: firstPage, error: null })
      .mockResolvedValueOnce({
        data: [{ ...firstPage[0], id: '250' }],
        error: null,
      });
    expect(await loadCurriculumCoverageDocuments()).toHaveLength(251);
    expect(query.select).toHaveBeenCalledWith(
      'id, grade, type, title, description',
    );
    expect(query.order).toHaveBeenCalledWith('id', { ascending: true });
    expect(query.range.mock.calls).toEqual([
      [0, 249],
      [250, 499],
    ]);
  });
  it('uses the same topic rule for note links/counts and excludes worksheets', async () => {
    const query = createQuery();
    query.range.mockResolvedValue({
      data: [
        {
          id: 'test',
          grade: [8],
          type: 'yaprak-test',
          title: 'Kareköklü İfadeler',
        },
        {
          id: 'notes',
          grade: [8],
          type: 'ders-notlari',
          title: 'Kareköklü İfadeler',
        },
        {
          id: 'other',
          grade: [8],
          type: 'ders-notlari',
          title: 'Üslü İfadeler',
        },
      ],
      error: null,
    });
    const result = await loadContentDocuments(1, 5, 8, 'ders-notlari', {
      searchTerm: 'Kareköklü İfadeler',
    });
    expect(result.count).toBe(1);
    expect(result.documents.map((doc) => doc.id)).toEqual(['notes']);
    expect(query.contains).toHaveBeenCalledWith('grade', [8]);
  });
  it('rejects errors on later pages instead of reporting partial coverage', async () => {
    const query = createQuery();
    query.range
      .mockResolvedValueOnce({
        data: Array(250).fill({ id: 'test' }),
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: { message: 'offline' } });
    await expect(loadCurriculumGradeDocuments(8)).rejects.toThrow(
      'İçerik kapsamı yüklenemedi',
    );
  });
});
