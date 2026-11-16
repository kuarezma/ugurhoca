import { act, renderHook, waitFor } from '@testing-library/react';
import { StrictMode, useRef, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContentDocument } from '@/types';
import {
  loadDocumentById,
  loadWorksheetDocumentsByGrade,
  updateDocumentMetric,
} from '@/features/content/queries';
import { useWorksheetNavigation } from './useWorksheetNavigation';
import { useContentPreview } from './useContentPreview';
import type { WorksheetGradeSelection } from './helpers';

vi.mock('@/features/content/queries', () => ({
  loadDocumentById: vi.fn(),
  loadWorksheetDocumentsByGrade: vi.fn(),
  updateDocumentMetric: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/features/analytics/trackActivity', () => ({
  trackStudentActivityEvent: vi.fn(),
}));
const documentA: ContentDocument = {
  id: 'a',
  title: 'Belge A',
  type: 'yaprak-test',
  grade: [5],
};
const documentB: ContentDocument = { ...documentA, id: 'b', title: 'Belge B' };
const ensureCatalog = async () => ({});
const patch = vi.fn();
const noDocuments: ContentDocument[] = [];

function useWorksheetHarness({
  grade,
  outcome = null,
}: {
  grade: string | null;
  outcome?: string | null;
}) {
  const request = useRef(0);
  const applied = useRef<string | null>(null);
  const [selectedGrade, setGrade] = useState<WorksheetGradeSelection | null>(
    null,
  );
  const [selectedOutcome, setOutcome] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ContentDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [, setType] = useState('yaprak-test');
  useWorksheetNavigation({
    worksheetRequestIdRef: request,
    appliedWorksheetLinkRef: applied,
    setSelectedWorksheetGrade: setGrade,
    setSelectedWorksheetOutcome: setOutcome,
    setWorksheetDocuments: setDocuments,
    setWorksheetLoading: setLoading,
    setContentLoadError: setError,
    setSelectedType: setType,
    setSelectedGrade: vi.fn(),
    isWorksheetBrowser: true,
    ensureWorksheetOutcomeCatalog: ensureCatalog,
    selectedWorksheetGrade: selectedGrade,
    worksheetGradeFromUrl: grade,
    worksheetOutcomeFromUrl: outcome,
    worksheetLoading: loading,
  });
  return { selectedGrade, selectedOutcome, documents, loading };
}

function usePreviewHarness({
  id,
  available = noDocuments,
}: {
  id: string | null;
  available?: ContentDocument[];
}) {
  const [preview, setPreview] = useState<ContentDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setAnswerKey] = useState(false);
  const handlers = useContentPreview({
    previewDoc: preview,
    previewDocRef: useRef<ContentDocument | null>(null),
    handledRequestedDocIdRef: useRef<string | null>(null),
    previewHistoryRef: useRef<string | null>(null),
    previewUrlSyncedRef: useRef(false),
    setPreviewDoc: setPreview,
    setShowAnswerKey: setAnswerKey,
    setContentLoadError: setError,
    applyDocumentPatch: patch,
    user: null,
    searchParams: new URLSearchParams(id ? { id } : {}),
    documents: available,
    worksheetDocuments: noDocuments,
  });
  return { preview, error, ...handlers };
}

describe('content navigation request regressions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/icerikler');
    vi.mocked(loadWorksheetDocumentsByGrade).mockResolvedValue([documentA]);
    vi.mocked(updateDocumentMetric).mockResolvedValue(undefined);
  });

  it('restores all grades on back and the selected grade on forward', async () => {
    const { result, rerender } = renderHook(useWorksheetHarness, {
      initialProps: { grade: '5' as string | null },
    });
    await waitFor(() => expect(result.current.documents).toEqual([documentA]));
    rerender({ grade: null });
    expect(result.current.selectedGrade).toBeNull();
    expect(result.current.documents).toEqual([]);
    rerender({ grade: '5' });
    await waitFor(() => expect(result.current.documents).toEqual([documentA]));
    expect(result.current.selectedGrade).toBe(5);
  });

  it('does not restore an old class or outcome after back while its request is pending', async () => {
    let resolve!: (docs: ContentDocument[]) => void;
    vi.mocked(loadWorksheetDocumentsByGrade).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const { result, rerender } = renderHook(useWorksheetHarness, {
      initialProps: {
        grade: '5' as string | null,
        outcome: 'MAT.5.1.1' as string | null,
      },
    });
    rerender({ grade: null, outcome: null });
    await act(async () => resolve([documentA]));
    expect(result.current.selectedGrade).toBeNull();
    expect(result.current.selectedOutcome).toBeNull();
    expect(result.current.documents).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('changes only the outcome without fetching the same class again', async () => {
    const { result, rerender } = renderHook(useWorksheetHarness, {
      initialProps: { grade: '5', outcome: 'first' },
    });
    await waitFor(() => expect(result.current.selectedOutcome).toBe('first'));
    rerender({ grade: '5', outcome: 'second' });
    expect(result.current.selectedOutcome).toBe('second');
    expect(loadWorksheetDocumentsByGrade).toHaveBeenCalledOnce();
  });

  it('keeps the newest outcome when it changes during the class request', async () => {
    let resolve!: (docs: ContentDocument[]) => void;
    vi.mocked(loadWorksheetDocumentsByGrade).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const { result, rerender } = renderHook(useWorksheetHarness, {
      initialProps: { grade: '5', outcome: 'first' },
    });
    rerender({ grade: '5', outcome: 'second' });
    await act(async () => resolve([documentA]));
    expect(result.current.selectedOutcome).toBe('second');
    expect(loadWorksheetDocumentsByGrade).toHaveBeenCalledOnce();
  });

  it('does not reopen a pending preview after the URL id is removed', async () => {
    let resolve!: (doc: ContentDocument) => void;
    vi.mocked(loadDocumentById).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    window.history.replaceState({}, '', '/icerikler?id=a');
    const { result, rerender } = renderHook(usePreviewHarness, {
      initialProps: { id: 'a' as string | null },
    });
    window.history.replaceState({}, '', '/icerikler');
    rerender({ id: null });
    await act(async () => resolve(documentA));
    expect(result.current.preview).toBeNull();
    expect(updateDocumentMetric).not.toHaveBeenCalled();
    expect(window.location.search).toBe('');
  });

  it('ignores a late A response after B opens', async () => {
    let resolveA!: (doc: ContentDocument) => void;
    vi.mocked(loadDocumentById).mockImplementation((id) =>
      id === 'a'
        ? new Promise((r) => {
            resolveA = r;
          })
        : Promise.resolve(documentB),
    );
    window.history.replaceState({}, '', '/icerikler?id=a');
    const { result, rerender } = renderHook(usePreviewHarness, {
      initialProps: { id: 'a' },
    });
    window.history.replaceState({}, '', '/icerikler?id=b');
    rerender({ id: 'b' });
    await waitFor(() => expect(result.current.preview?.id).toBe('b'));
    await act(async () => resolveA(documentA));
    expect(result.current.preview?.id).toBe('b');
    expect(updateDocumentMetric).toHaveBeenCalledOnce();
    expect(window.location.search).toBe('?id=b');
  });

  it('reports a preview failure without an unhandled rejection', async () => {
    vi.mocked(loadDocumentById).mockRejectedValue(new Error('offline'));
    window.history.replaceState({}, '', '/icerikler?id=a');
    const { result } = renderHook(usePreviewHarness, {
      initialProps: { id: 'a' },
    });
    await waitFor(() =>
      expect(result.current.error).toContain('Önizleme yüklenemedi'),
    );
    expect(result.current.preview).toBeNull();
  });

  it('retries the same deep-linked document after a failed request', async () => {
    vi.mocked(loadDocumentById)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(documentA);
    window.history.replaceState({}, '', '/icerikler?id=a');
    const { result } = renderHook(usePreviewHarness, {
      initialProps: { id: 'a' },
    });
    await waitFor(() =>
      expect(result.current.error).toContain('Önizleme yüklenemedi'),
    );
    act(() => result.current.retryPreview());
    await waitFor(() => expect(result.current.preview?.id).toBe('a'));
    expect(loadDocumentById).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
    expect(updateDocumentMetric).toHaveBeenCalledOnce();
  });

  it.each([false, true])(
    'counts one preview in StrictMode (seed=%s)',
    async (seed) => {
      vi.mocked(loadDocumentById).mockResolvedValue(documentA);
      window.history.replaceState({}, '', '/icerikler?id=a');
      const { result } = renderHook(
        () =>
          usePreviewHarness({
            id: 'a',
            available: seed ? [documentA] : noDocuments,
          }),
        { wrapper: StrictMode },
      );
      await waitFor(() => expect(result.current.preview?.id).toBe('a'));
      expect(updateDocumentMetric).toHaveBeenCalledOnce();
    },
  );

  it('closes on back and opens once again on forward', async () => {
    vi.mocked(loadDocumentById).mockResolvedValue(documentA);
    window.history.replaceState({}, '', '/icerikler?id=a');
    const { result, rerender } = renderHook(usePreviewHarness, {
      initialProps: { id: 'a' as string | null },
    });
    await waitFor(() => expect(result.current.preview?.id).toBe('a'));
    window.history.replaceState({}, '', '/icerikler');
    rerender({ id: null });
    expect(result.current.preview).toBeNull();
    window.history.replaceState({}, '', '/icerikler?id=a');
    rerender({ id: 'a' });
    await waitFor(() => expect(result.current.preview?.id).toBe('a'));
    expect(updateDocumentMetric).toHaveBeenCalledTimes(2);
  });
});
