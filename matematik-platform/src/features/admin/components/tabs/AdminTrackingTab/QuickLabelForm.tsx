import { useState } from 'react';
import { appendUniqueStudentLabel } from '@/features/admin/utils/tracking-insights';

export function QuickLabelForm({
  labels,
  onSave,
  studentName,
}: {
  labels: string[];
  onSave: (labels: string[]) => Promise<void> | void;
  studentName: string;
}) {
  const [draftLabel, setDraftLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  return (
    <form
      className="mt-3 space-y-2"
      aria-label={`${studentName} etiket ekleme`}
      onSubmit={async (event) => {
        event.preventDefault();
        if (saving || !draftLabel.trim()) return;
        const nextLabels = appendUniqueStudentLabel(labels, draftLabel);
        if (
          nextLabels.length === labels.length &&
          nextLabels.every((label, index) => label === labels[index])
        ) {
          setFeedback('Bu etiket zaten var veya 12 etiket sınırına ulaşıldı.');
          return;
        }
        setSaving(true);
        setFeedback('');
        try {
          await onSave(nextLabels);
          setDraftLabel('');
          setFeedback('Etiket eklendi.');
        } catch {
          setFeedback('Etiket eklenemedi. Lütfen tekrar dene.');
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="flex flex-wrap gap-2">
        <input
          aria-label={`${studentName} için yeni etiket`}
          value={draftLabel}
          disabled={saving}
          onChange={(event) => {
            setDraftLabel(event.target.value);
            setFeedback('');
          }}
          placeholder="Yeni etiket"
          className="min-w-0 flex-1 rounded-xl border border-subtle bg-surface-1 px-3 py-2 text-sm text-primary"
        />
        <button
          type="submit"
          disabled={saving || !draftLabel.trim()}
          className="rounded-xl border border-subtle bg-surface-2 px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50"
        >
          {saving ? 'Ekleniyor…' : 'Etiket ekle'}
        </button>
      </div>
      {feedback && (
        <p role="status" className="text-xs text-secondary">
          {feedback}
        </p>
      )}
    </form>
  );
}
