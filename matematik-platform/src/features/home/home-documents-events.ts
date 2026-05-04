/** Dispatched after a content document is created/updated from the client so the home “Son Eklenenler” list can refetch immediately. */
export const HOME_DOCUMENTS_UPDATED_EVENT = 'ugurhoca:home-documents-updated';

export function broadcastHomeDocumentsUpdated(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(HOME_DOCUMENTS_UPDATED_EVENT));
}
