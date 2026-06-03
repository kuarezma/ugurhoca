import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { ContentDocument } from '@/types';

type ContentDeleteConfirmModalProps = {
  deleting: boolean;
  deleteCandidate: ContentDocument;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function ContentDeleteConfirmModal({
  deleting,
  deleteCandidate,
  onCancel,
  onConfirm,
}: ContentDeleteConfirmModalProps) {
  return (
    <Modal
      open
      onClose={() => (deleting ? undefined : onCancel())}
      title="İçeriği silmek istediğine emin misin?"
      description={deleteCandidate.title}
      size="sm"
      disableBackdropClose={deleting}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={deleting}>
            Vazgeç
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={deleting}
          >
            Sil
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Bu işlem geri alınamaz. İçerik kalıcı olarak kaldırılacak.
      </p>
    </Modal>
  );
}
