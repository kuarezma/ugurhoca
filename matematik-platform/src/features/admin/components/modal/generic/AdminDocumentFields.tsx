import type { ChangeEvent } from "react";
import { Upload } from "lucide-react";
import type { AdminFormState } from "@/features/admin/types";
import {
  PRIVATE_STUDENT_GRADES,
  type AdminFormUpdate,
} from "@/features/admin/components/modal/shared";
import {
  isWorksheetType,
  WORKSHEET_GRADE_OPTIONS,
} from "@/features/content/worksheet";

type AdminDocumentFieldsProps = {
  formData: AdminFormState;
  onDocumentUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onToggleDocumentGrade: (grade: number | "Mezun", checked: boolean) => void;
  updateFormData: AdminFormUpdate;
};

export default function AdminDocumentFields({
  formData,
  onDocumentUpload,
  onToggleDocumentGrade,
  updateFormData,
}: AdminDocumentFieldsProps) {
  const isWorksheet = isWorksheetType(formData.type);

  return (
    <>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Dosya Yükle (PDF, EXE, MP4 vb.)
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.exe,.mp4,.avi,.mov"
            onChange={onDocumentUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 w-full bg-slate-800/50 border border-slate-700 border-dashed rounded-xl px-4 py-6 text-slate-400 cursor-pointer hover:bg-slate-800 hover:border-purple-500 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>
              {formData.file_name ||
                "Dosya seç (PDF, EXE, MP4...) veya buraya sürükle"}
            </span>
          </label>
        </div>
      </div>
      <div className="text-center text-slate-500 text-sm">veya</div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Link (Google Drive, vb.)
        </label>
        <input
          type="url"
          value={formData.file_url || ""}
          onChange={(event) =>
            updateFormData({
              file_name: "",
              file_url: event.target.value,
            })
          }
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="https://drive.google.com/..."
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          YouTube Video URL
        </label>
        <input
          type="url"
          value={formData.video_url || ""}
          onChange={(event) => updateFormData({ video_url: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="https://www.youtube.com/watch?v=..."
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
          onChange={(event) =>
            updateFormData({ solution_url: event.target.value })
          }
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
      <div>
        {isWorksheet ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-3 text-sm text-purple-100">
              Yaprak testler otomatik olarak sıradaki isimle kaydedilir.
            </div>
            <div>
              <label className="block text-slate-300 mb-2 text-sm">
                Sınıf Düzeyi
              </label>
              <select
                required
                value={formData.grades?.[0] || ""}
                onChange={(event) =>
                  updateFormData({
                    grades: event.target.value
                      ? [
                          event.target.value === "Mezun"
                            ? "Mezun"
                            : Number(event.target.value),
                        ]
                      : [],
                  })
                }
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="">Sınıf düzeyi seçin</option>
                {WORKSHEET_GRADE_OPTIONS.map((grade) => (
                  <option key={String(grade)} value={grade}>
                    {grade === "Mezun" ? grade : `${grade}. Sınıf`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-2 text-sm">
                Kazanım
              </label>
              <input
                type="text"
                required
                value={formData.learning_outcome || ""}
                onChange={(event) =>
                  updateFormData({ learning_outcome: event.target.value })
                }
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Örn. Cebirsel ifadelerle işlemler"
              />
            </div>
          </div>
        ) : (
          <>
            <label className="block text-slate-300 mb-2 text-sm">
              Hedef Sınıflar
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIVATE_STUDENT_GRADES.map((grade) => (
                <label
                  key={grade}
                  className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10 min-w-[calc(50%-0.25rem)] sm:min-w-0"
                >
                  <input
                    type="checkbox"
                    checked={formData.grades?.includes(grade) || false}
                    onChange={(event) =>
                      onToggleDocumentGrade(grade, event.target.checked)
                    }
                    className="w-4 h-4 accent-purple-500"
                  />
                  <span className="text-white text-sm">{grade}. Sınıf</span>
                </label>
              ))}
              <label className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10 min-w-[calc(50%-0.25rem)] sm:min-w-0">
                <input
                  type="checkbox"
                  checked={formData.grades?.includes("Mezun") || false}
                  onChange={(event) =>
                    onToggleDocumentGrade("Mezun", event.target.checked)
                  }
                  className="w-4 h-4 accent-purple-500"
                />
                <span className="text-white text-sm">Mezun</span>
              </label>
            </div>
          </>
        )}
      </div>
    </>
  );
}
