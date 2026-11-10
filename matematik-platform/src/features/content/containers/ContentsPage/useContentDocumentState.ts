import type { ContentDocument } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';

import { type WorksheetCatalogItem } from '@/features/content/worksheet-catalog';

import { log } from './helpers';

type UseContentDocumentStateProps = {
  worksheetOutcomeCatalog: Record<number, WorksheetCatalogItem[]>;
  setWorksheetCatalogLoading: Dispatch<SetStateAction<boolean>>;
  setWorksheetOutcomeCatalog: Dispatch<
    SetStateAction<Record<number, WorksheetCatalogItem[]>>
  >;
  setDocuments: Dispatch<SetStateAction<ContentDocument[]>>;
  setWorksheetDocuments: Dispatch<SetStateAction<ContentDocument[]>>;
  setPreviewDoc: Dispatch<SetStateAction<ContentDocument | null>>;
  setEditDoc: Dispatch<SetStateAction<ContentDocument | null>>;
};

export function useContentDocumentState({
  worksheetOutcomeCatalog,
  setWorksheetCatalogLoading,
  setWorksheetOutcomeCatalog,
  setDocuments,
  setWorksheetDocuments,
  setPreviewDoc,
  setEditDoc,
}: UseContentDocumentStateProps) {
  const ensureWorksheetOutcomeCatalog = useCallback(async () => {
    if (Object.keys(worksheetOutcomeCatalog).length > 0) {
      return worksheetOutcomeCatalog;
    }

    setWorksheetCatalogLoading(true);
    try {
      const { WORKSHEET_OUTCOME_CATALOG } =
        await import('@/features/content/worksheet-catalog');
      setWorksheetOutcomeCatalog(WORKSHEET_OUTCOME_CATALOG);
      return WORKSHEET_OUTCOME_CATALOG;
    } catch (error) {
      // Katalog yüklenemezse (chunk hatası) sessiz unhandled rejection yerine
      // logla ve mevcut (boş olabilir) kataloğu döndür; fonksiyon asla reject etmez.
      log.error('Kazanım kataloğu yüklenemedi', error);
      return worksheetOutcomeCatalog;
    } finally {
      setWorksheetCatalogLoading(false);
    }
  }, [
    setWorksheetCatalogLoading,
    setWorksheetOutcomeCatalog,
    worksheetOutcomeCatalog,
  ]);

  const applyDocumentPatch = useCallback(
    (documentId: string, patch: Partial<ContentDocument>) => {
      setDocuments((current) =>
        current.map((document) =>
          document.id === documentId ? { ...document, ...patch } : document,
        ),
      );
      setWorksheetDocuments((current) =>
        current.map((document) =>
          document.id === documentId ? { ...document, ...patch } : document,
        ),
      );
      setPreviewDoc((current) =>
        current?.id === documentId ? { ...current, ...patch } : current,
      );
    },
    [setDocuments, setPreviewDoc, setWorksheetDocuments],
  );

  const removeDocumentFromState = useCallback(
    (documentId: string) => {
      setDocuments((current) =>
        current.filter((document) => document.id !== documentId),
      );
      setWorksheetDocuments((current) =>
        current.filter((document) => document.id !== documentId),
      );
      setPreviewDoc((current) => (current?.id === documentId ? null : current));
      setEditDoc((current) => (current?.id === documentId ? null : current));
    },
    [setDocuments, setEditDoc, setPreviewDoc, setWorksheetDocuments],
  );
  return {
    ensureWorksheetOutcomeCatalog,
    applyDocumentPatch,
    removeDocumentFromState,
  };
}
