import type { AppUser, ContentDocument } from '@/types';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { useEffect, useCallback } from 'react';

import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';

import {
  loadDocumentById,
  updateDocumentMetric,
} from '@/features/content/queries';

type UseContentPreviewProps = {
  previewDocRef: RefObject<ContentDocument | null>;
  previewDoc: ContentDocument | null;
  setShowAnswerKey: Dispatch<SetStateAction<boolean>>;
  handledRequestedDocIdRef: RefObject<string | null>;
  setPreviewDoc: Dispatch<SetStateAction<ContentDocument | null>>;
  applyDocumentPatch: (
    documentId: string,
    patch: Partial<ContentDocument>,
  ) => void;
  user: AppUser | null;
  previewHistoryRef: RefObject<string | null>;
  previewUrlSyncedRef: RefObject<boolean>;
  searchParams: URLSearchParams;
  documents: ContentDocument[];
  worksheetDocuments: ContentDocument[];
};

export function useContentPreview({
  previewDocRef,
  previewDoc,
  setShowAnswerKey,
  handledRequestedDocIdRef,
  setPreviewDoc,
  applyDocumentPatch,
  user,
  previewHistoryRef,
  previewUrlSyncedRef,
  searchParams,
  documents,
  worksheetDocuments,
}: UseContentPreviewProps) {
  useEffect(() => {
    previewDocRef.current = previewDoc;
  }, [previewDoc, previewDocRef]);

  const handleOpenPreview = useCallback(
    (content: ContentDocument) => {
      setShowAnswerKey(false);
      handledRequestedDocIdRef.current = content.id;
      const nextViews = (content.views || 0) + 1;
      const updatedDoc = { ...content, views: nextViews };
      setPreviewDoc(updatedDoc);
      applyDocumentPatch(content.id, { views: nextViews });
      void updateDocumentMetric(content.id, { views: nextViews }).catch(
        () => undefined,
      );
      void trackStudentActivityEvent({
        entityId: content.id,
        entityType: 'document',
        eventType: 'content_viewed',
        metadata: {
          grade: content.grade,
          title: content.title,
          type: content.type,
        },
        userId: user?.id,
      });

      try {
        const url = new URL(window.location.href);
        // Derin bağlantıyla gelindiyse kayıt zaten mevcut; yenisini eklemeyiz.
        const alreadyOnDoc = url.searchParams.get('id') === content.id;
        url.searchParams.set('id', content.id);

        if (alreadyOnDoc) {
          window.history.replaceState({}, '', url.toString());
          previewHistoryRef.current = null;
          previewUrlSyncedRef.current = true;
        } else {
          // Yeni geçmiş kaydı: geri tuşu bu kayıttan çıkıp önizlemeyi kapatır.
          window.history.pushState({}, '', url.toString());
          previewHistoryRef.current = content.id;
          previewUrlSyncedRef.current = false;
        }
      } catch {
        previewHistoryRef.current = null;
        previewUrlSyncedRef.current = false;
      }
    },
    [
      applyDocumentPatch,
      handledRequestedDocIdRef,
      previewHistoryRef,
      previewUrlSyncedRef,
      setPreviewDoc,
      setShowAnswerKey,
      user?.id,
    ],
  );

  const handleClosePreview = useCallback(() => {
    const closingId =
      previewDocRef.current?.id ||
      searchParams.get('id') ||
      searchParams.get('doc') ||
      null;

    setPreviewDoc(null);
    setShowAnswerKey(false);
    handledRequestedDocIdRef.current = closingId;
    previewUrlSyncedRef.current = false;

    let currentUrlId: string | null = null;
    try {
      currentUrlId = new URL(window.location.href).searchParams.get('id');
    } catch {
      currentUrlId = null;
    }

    // Açılışta kaydı biz eklediysek ve hâlâ o kayıttaysak, kaydı geri alarak
    // kapatırız: geçmişte ölü kayıt birikmez ve geri tuşu önizlemeden önceki
    // duruma döner. URL temizliğini popstate'in kendisi yapar.
    if (
      previewHistoryRef.current &&
      previewHistoryRef.current === closingId &&
      currentUrlId === closingId
    ) {
      previewHistoryRef.current = null;
      window.history.back();
      return;
    }

    previewHistoryRef.current = null;

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      url.searchParams.delete('doc');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, [
    handledRequestedDocIdRef,
    previewDocRef,
    previewHistoryRef,
    previewUrlSyncedRef,
    searchParams,
    setPreviewDoc,
    setShowAnswerKey,
  ]);

  const requestedDocId = searchParams.get('id') || searchParams.get('doc');
  useEffect(() => {
    if (!requestedDocId) {
      // Geri tuşu veya harici gezinme `?id=` parametresini düşürdüyse önizlemeyi
      // de kapat. `previewUrlSyncedRef` koşulu şart: açılış ile router'ın
      // useSearchParams güncellemesi arasındaki boşlukta burası "id yok" görür ve
      // modalı daha görünmeden kapatırdı.
      if (previewUrlSyncedRef.current && previewDocRef.current) {
        previewUrlSyncedRef.current = false;
        previewHistoryRef.current = null;
        handledRequestedDocIdRef.current = null;
        setPreviewDoc(null);
        setShowAnswerKey(false);
      } else if (!previewDocRef.current) {
        handledRequestedDocIdRef.current = null;
      }
      // Önizleme açık ama URL henüz senkron değilse `handledRequestedDocIdRef`e
      // dokunulmaz: sıfırlanırsa, `?id=` nihayet geldiğinde efekt aynı belgeyi
      // ikinci kez açar (görüntülenme sayısı iki artar ve geçmiş kaydımız
      // `replaceState` ile ezilir).
      return;
    }

    if (previewDocRef.current?.id === requestedDocId) {
      previewUrlSyncedRef.current = true;
    }

    if (handledRequestedDocIdRef.current === requestedDocId) {
      return;
    }
    handledRequestedDocIdRef.current = requestedDocId;

    const found =
      documents.find((d) => d.id === requestedDocId) ||
      worksheetDocuments.find((d) => d.id === requestedDocId);

    if (found) {
      handleOpenPreview(found);
      return;
    }

    void loadDocumentById(requestedDocId).then((doc) => {
      if (doc) {
        handleOpenPreview(doc);
      }
    });
  }, [
    requestedDocId,
    documents,
    worksheetDocuments,
    handleOpenPreview,
    previewDocRef,
    handledRequestedDocIdRef,
    previewUrlSyncedRef,
    previewHistoryRef,
    setPreviewDoc,
    setShowAnswerKey,
  ]);
  return { handleOpenPreview, handleClosePreview };
}
