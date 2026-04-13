import { motion } from "framer-motion";
import type {
  AdminDocument as Document,
  AdminFormState,
} from "@/features/admin/types";
import {
  DOCUMENT_CATEGORY_OPTIONS,
  type AdminFormUpdate,
  type AdminModalSubmitHandler,
} from "@/features/admin/components/modal/shared";

type AdminEditDocumentFormProps = {
  editingDoc: Document | null;
  formData: AdminFormState;
  isSubmitting: boolean;
  onSubmit: AdminModalSubmitHandler;
  updateFormData: AdminFormUpdate;
};

export default function AdminEditDocumentForm({
  editingDoc,
  formData,
  isSubmitting,
  onSubmit,
  updateFormData,
}: AdminEditDocumentFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-slate-300 mb-2 text-sm">Başlık</label>
        <input
          type="text"
          required
          value={formData.title || ""}
          onChange={(event) => updateFormData({ title: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">Açıklama</label>
        <textarea
          rows={3}
          value={formData.description || ""}
          onChange={(event) => updateFormData({ description: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">Kategori</label>
        <select
          value={formData.type || ""}
          onChange={(event) => updateFormData({ type: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">Kategori seçin</option>
          {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">Dosya Linki</label>
        <input
          type="url"
          value={formData.file_url || ""}
          onChange={(event) => updateFormData({ file_url: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">YouTube URL</label>
        <input
          type="url"
          value={formData.video_url || ""}
          onChange={(event) => updateFormData({ video_url: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Cevap Anahtarı (Metin)
        </label>
        <textarea
          value={formData.answer_key_text || ""}
          onChange={(event) =>
            updateFormData({ answer_key_text: event.target.value })
          }
          rows={3}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-green-500 transition-colors resize-none"
          placeholder="Cevap anahtarını buraya yazın... (opsiyonel)"
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Çözüm PDF (Drive Link)
        </label>
        <input
          type="url"
          value={formData.solution_url || ""}
          onChange={(event) => updateFormData({ solution_url: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-green-500 transition-colors"
          placeholder="https://drive.google.com/... (çözümlü PDF varsa)"
        />
        {formData.solution_url && (
          <p className="text-green-400 text-xs mt-1">
            ÇÖZÜMLÜ badge&apos;i otomatik eklenecek
          </p>
        )}
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting || !editingDoc}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
      </motion.button>
    </form>
  );
}
