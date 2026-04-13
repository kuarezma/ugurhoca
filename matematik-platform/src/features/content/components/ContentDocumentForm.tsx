import { motion } from 'framer-motion';
import type { ChangeEvent, FormEvent } from 'react';
import { Check, Upload } from 'lucide-react';
import { CONTENT_TYPE_OPTIONS } from '@/features/content/constants';
import type { ContentFormState } from '@/features/content/types';

type Accent = 'purple' | 'blue';

type ContentDocumentFormProps = {
  accent: Accent;
  fileInputId: string;
  formData: ContentFormState;
  isSubmitting: boolean;
  onChange: (nextValue: Partial<ContentFormState>) => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  submitLabel: string;
  submittingLabel: string;
};

const FIELD_FOCUS_CLASS: Record<Accent, string> = {
  blue: 'focus:border-blue-500',
  purple: 'focus:border-purple-500',
};

const UPLOAD_HOVER_CLASS: Record<Accent, string> = {
  blue: 'hover:border-blue-500',
  purple: 'hover:border-purple-500',
};

const CHECKBOX_ACCENT_CLASS: Record<Accent, string> = {
  blue: 'accent-blue-500',
  purple: 'accent-purple-500',
};

const BUTTON_CLASS: Record<Accent, string> = {
  blue: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/25',
  purple:
    'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-500/25',
};

const GRADES = [5, 6, 7, 8, 9, 10, 11, 12] as const;

export default function ContentDocumentForm({
  accent,
  fileInputId,
  formData,
  isSubmitting,
  onChange,
  onFileUpload,
  onSubmit,
  submitLabel,
  submittingLabel,
}: ContentDocumentFormProps) {
  const updateGrades = (grade: number | 'Mezun', checked: boolean) => {
    const nextGrades = formData.grade || [];

    if (checked) {
      onChange({ grade: [...nextGrades, grade] });
      return;
    }

    onChange({
      grade: nextGrades.filter((currentGrade) => currentGrade !== grade),
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-slate-300 mb-2 text-sm">Başlık</label>
        <input
          type="text"
          required
          value={formData.title || ''}
          onChange={(event) => onChange({ title: event.target.value })}
          className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white transition-colors ${FIELD_FOCUS_CLASS[accent]} focus:outline-none`}
          placeholder="Başlık girin..."
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2 text-sm">Kategori</label>
        <select
          required
          value={formData.type || ''}
          onChange={(event) => onChange({ type: event.target.value })}
          className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white transition-colors ${FIELD_FOCUS_CLASS[accent]} focus:outline-none`}
        >
          <option value="">Kategori seçin</option>
          {CONTENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-slate-300 mb-2 text-sm">Açıklama</label>
        <textarea
          required
          rows={3}
          value={formData.description || ''}
          onChange={(event) => onChange({ description: event.target.value })}
          className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white resize-none transition-colors ${FIELD_FOCUS_CLASS[accent]} focus:outline-none`}
          placeholder="İçerik hakkında bilgi..."
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Dosya Yükle (Tüm dosya türleri)
        </label>
        <div className="relative">
          <input
            type="file"
            onChange={onFileUpload}
            className="hidden"
            id={fileInputId}
          />
          <label
            htmlFor={fileInputId}
            className={`flex items-center justify-center gap-2 w-full bg-slate-800/50 border border-slate-700 border-dashed rounded-xl px-4 py-6 text-slate-400 cursor-pointer hover:bg-slate-800 transition-colors ${UPLOAD_HOVER_CLASS[accent]}`}
          >
            <Upload className="w-5 h-5" />
            <span>
              {formData.file_name ||
                'Dosya seç (PDF, EXE, MP4...) veya buraya sürükle'}
            </span>
          </label>
        </div>
      </div>

      <div className="text-center text-slate-500 text-sm">veya</div>

      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Tıkla/İndir Linki (Google Drive vb.)
        </label>
        <input
          type="url"
          value={formData.file_url || ''}
          onChange={(event) =>
            onChange({ file_name: '', file_url: event.target.value })
          }
          className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white transition-colors ${FIELD_FOCUS_CLASS[accent]} focus:outline-none`}
          placeholder="https://drive.google.com/..."
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          YouTube Video URL
        </label>
        <input
          type="url"
          value={formData.video_url || ''}
          onChange={(event) => onChange({ video_url: event.target.value })}
          className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white transition-colors ${FIELD_FOCUS_CLASS[accent]} focus:outline-none`}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Cevap Anahtarı (Metin)
        </label>
        <textarea
          value={formData.answer_key_text || ''}
          onChange={(event) => onChange({ answer_key_text: event.target.value })}
          rows={3}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors resize-none"
          placeholder="Cevap anahtarını buraya yazın... (opsiyonel)"
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Çözüm PDF (Drive Link)
        </label>
        <input
          type="url"
          value={formData.solution_url || ''}
          onChange={(event) => onChange({ solution_url: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
          placeholder="https://drive.google.com/... (çözümlü PDF varsa)"
        />
        {formData.solution_url && (
          <p className="text-green-400 text-xs mt-1">
            ÇÖZÜMLÜ badge&apos;i otomatik eklenecek
          </p>
        )}
      </div>

      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Hedef Sınıflar
        </label>
        <div className="flex flex-wrap gap-2">
          {GRADES.map((grade) => (
            <label
              key={grade}
              className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10"
            >
              <input
                type="checkbox"
                checked={formData.grade?.includes(grade) || false}
                onChange={(event) => updateGrades(grade, event.target.checked)}
                className={`w-4 h-4 ${CHECKBOX_ACCENT_CLASS[accent]}`}
              />
              <span className="text-white text-sm">{grade}. Sınıf</span>
            </label>
          ))}
          <label className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10">
            <input
              type="checkbox"
              checked={formData.grade?.includes('Mezun') || false}
              onChange={(event) => updateGrades('Mezun', event.target.checked)}
              className={`w-4 h-4 ${CHECKBOX_ACCENT_CLASS[accent]}`}
            />
            <span className="text-white text-sm">Mezun</span>
          </label>
        </div>
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting}
        className={`w-full py-4 bg-gradient-to-r text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${BUTTON_CLASS[accent]}`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {submittingLabel}
          </>
        ) : (
          <>
            {accent === 'blue' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {submitLabel}
          </>
        )}
      </motion.button>
    </form>
  );
}
