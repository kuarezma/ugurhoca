import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Download, Upload } from "lucide-react";
import type { AdminFormState } from "@/features/admin/types";
import { OPTION_LETTERS } from "@/features/admin/components/modal/shared";

type AdminQuestionImportFieldsProps = {
  formData: AdminFormState;
  isSubmitting: boolean;
  onQuestionImportUpload: (
    event: ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
};

export default function AdminQuestionImportFields({
  formData,
  isSubmitting,
  onQuestionImportUpload,
}: AdminQuestionImportFieldsProps) {
  const handleDownloadTemplate = async () => {
    const { downloadExcelTemplate } = await import("@/lib/question-import");
    downloadExcelTemplate();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <Download className="w-5 h-5 text-emerald-400" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">
              Excel Şablonu İndir
            </h3>
            <p className="text-slate-400 text-sm">
              Test bilgileri ve sorular için şablon dosyası
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            İndir
          </button>
        </div>

        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors">
          <input
            type="file"
            accept=".xlsx"
            onChange={onQuestionImportUpload}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto text-slate-500 mb-3" />
            <p className="text-slate-300 font-medium mb-1">
              Excel dosyasını buraya sürükleyin
            </p>
            <p className="text-slate-500 text-sm">
              veya dosya seçmek için tıklayın (.xlsx)
            </p>
          </label>
        </div>

        {formData.importResult && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">
                  {formData.importResult.meta.title}
                </p>
                <p className="text-slate-400 text-sm">
                  {formData.importResult.meta.grade}. Sınıf •{" "}
                  {formData.importResult.meta.difficulty} •{" "}
                  {formData.importResult.meta.time_limit} dk
                </p>
              </div>
              <span className="text-emerald-400 font-bold">
                {formData.importResult.valid.length} soru
              </span>
            </div>

            {formData.importResult.errors.length > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm font-medium mb-2">
                  {formData.importResult.errors.length} hata bulundu:
                </p>
                <ul className="text-red-300 text-xs space-y-1">
                  {formData.importResult.errors.map((error, index) => (
                    <li key={index}>
                      Satır {error.row}: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="max-h-40 overflow-y-auto space-y-1">
              {formData.importResult.valid.slice(0, 10).map((question, index) => (
                <div key={index} className="p-2 bg-slate-800/30 rounded text-xs">
                  <p className="text-slate-300 truncate">{question.question}</p>
                  <p className="text-emerald-400 text-xs mt-1">
                    Doğru: {OPTION_LETTERS[question.correct_index]}
                  </p>
                </div>
              ))}
              {formData.importResult.valid.length > 10 && (
                <p className="text-slate-500 text-xs text-center">
                  ... ve {formData.importResult.valid.length - 10} soru daha
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {formData.importResult && (
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSubmitting
            ? "Kaydediliyor..."
            : `${formData.importResult.valid.length} Soruyu Kaydet`}
        </motion.button>
      )}
    </>
  );
}
