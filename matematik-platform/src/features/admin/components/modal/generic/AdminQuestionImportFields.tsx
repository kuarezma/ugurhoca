/* eslint-disable @next/next/no-img-element -- admin import preview renders local blob URLs */
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileArchive, FileSpreadsheet, Image as ImageIcon, Upload } from 'lucide-react';
import type { AdminFormState } from '@/features/admin/types';
import { OPTION_LETTERS } from '@/features/admin/components/modal/shared';

type AdminQuestionImportFieldsProps = {
  formData: AdminFormState;
  isSubmitting: boolean;
  onQuestionImportUpload: (
    event: ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  onQuestionImportFromUrl: (bundleUrl: string) => Promise<void>;
};

export default function AdminQuestionImportFields({
  formData,
  isSubmitting,
  onQuestionImportFromUrl,
  onQuestionImportUpload,
}: AdminQuestionImportFieldsProps) {
  const [bundleUrl, setBundleUrl] = useState(formData.importBundleUrl || '');

  const handleDownloadTemplate = async () => {
    const { downloadExcelTemplate } = await import('@/lib/question-import');
    downloadExcelTemplate();
  };

  const importResult = formData.importResult;
  const isBundle = importResult?.source === 'bundle';

  return (
    <>
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-xl bg-cyan-400/15 p-3">
                <FileArchive className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white">PDF/Drive ZIP yükle</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  1. Converter app ile PDF&apos;yi işle
                  <br />
                  2. Oluşan ZIP&apos;i burada yükle
                  <br />
                  3. Önizle ve kaydet
                </p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-cyan-400/30 bg-slate-900/20 p-6 text-center transition-colors hover:border-cyan-300/50">
              <input
                type="file"
                accept=".zip"
                onChange={onQuestionImportUpload}
                className="hidden"
                id="quiz-bundle-upload"
              />
              <label htmlFor="quiz-bundle-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-3 h-10 w-10 text-cyan-300" />
                <p className="font-medium text-slate-100">ZIP bundle seç</p>
                <p className="mt-1 text-sm text-slate-500">
                  quiz.json + images/ içeren converter çıktısı
                </p>
              </label>
            </div>
            <div className="mt-4 rounded-2xl border border-cyan-400/25 bg-slate-900/30 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                veya Drive ZIP linki
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="url"
                  value={bundleUrl}
                  onChange={(event) => setBundleUrl(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                />
                <button
                  type="button"
                  disabled={isSubmitting || !bundleUrl.trim()}
                  onClick={() => onQuestionImportFromUrl(bundleUrl)}
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  URL&apos;den yükle
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Link herkese açık olmalı ve ZIP bundle (quiz.json + images/) içermeli.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-xl bg-emerald-400/15 p-3">
                <FileSpreadsheet className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Excel fallback</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Mevcut .xlsx akışı korunur. Hazır şablon indirip manuel yükleme
                  yapabilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                İndir
              </button>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-emerald-400/30 bg-slate-900/20 p-6 text-center transition-colors hover:border-emerald-300/50">
              <input
                type="file"
                accept=".xlsx"
                onChange={onQuestionImportUpload}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-3 h-10 w-10 text-emerald-300" />
                <p className="font-medium text-slate-100">Excel dosyası yükle</p>
                <p className="mt-1 text-sm text-slate-500">
                  Test Bilgileri + Sorular sekmeli .xlsx
                </p>
              </label>
            </div>
          </section>
        </div>

        {importResult && (
          <div className="space-y-4 rounded-2xl border border-slate-700/70 bg-slate-900/30 p-4">
            <div className="flex flex-col justify-between gap-3 rounded-xl bg-slate-800/50 p-4 lg:flex-row lg:items-center">
              <div>
                <p className="font-medium text-white">{importResult.meta.title}</p>
                <p className="text-sm text-slate-400">
                  {importResult.meta.grade}. Sınıf • {importResult.meta.difficulty} •{' '}
                  {importResult.meta.time_limit} dk
                </p>
                {importResult.file_name ? (
                  <p className="mt-1 text-xs text-slate-500">{importResult.file_name}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isBundle
                      ? 'bg-cyan-500/15 text-cyan-300'
                      : 'bg-emerald-500/15 text-emerald-300'
                  }`}
                >
                  {isBundle ? 'ZIP bundle' : 'Excel'}
                </span>
                <span className="rounded-full bg-slate-700/60 px-3 py-1 text-xs font-semibold text-slate-200">
                  {importResult.valid.length} soru
                </span>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="mb-2 text-sm font-medium text-red-400">
                  {importResult.errors.length} hata bulundu:
                </p>
                <ul className="space-y-1 text-xs text-red-300">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>
                      Satır {error.row}: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {importResult.valid.slice(0, 10).map((question, index) => {
                const questionPreview = question.question_image_files?.[0]
                  ? importResult.assetPreviewUrls[question.question_image_files[0]]
                  : null;
                const optionPreviewCount =
                  question.option_image_files?.filter((entry) => entry.length > 0).length || 0;

                return (
                  <div
                    key={`${question.question}-${index}`}
                    className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-100">
                          {index + 1}. {question.question}
                        </p>
                        <p className="mt-2 text-xs text-emerald-400">
                          Doğru: {OPTION_LETTERS[question.correct_index]}
                        </p>
                      </div>
                      {(questionPreview || optionPreviewCount > 0) && (
                        <div className="flex shrink-0 items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300">
                          <ImageIcon className="h-3.5 w-3.5 text-cyan-300" />
                          {questionPreview ? 'Soru görseli' : `${optionPreviewCount} şık görseli`}
                        </div>
                      )}
                    </div>

                    {questionPreview ? (
                      <img
                        src={questionPreview}
                        alt={`Soru ${index + 1} görseli`}
                        className="mt-3 max-h-40 w-full rounded-lg object-contain bg-slate-950/60"
                      />
                    ) : null}

                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {question.options.map((option, optionIndex) => {
                        const optionPreview =
                          question.option_image_files?.[optionIndex]?.[0]
                            ? importResult.assetPreviewUrls[
                                question.option_image_files[optionIndex][0]
                              ]
                            : null;

                        return (
                          <div
                            key={`${index}-${optionIndex}`}
                            className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-2"
                          >
                            <div className="text-xs font-semibold text-slate-300">
                              {OPTION_LETTERS[optionIndex]}
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                              {option}
                            </p>
                            {optionPreview ? (
                              <img
                                src={optionPreview}
                                alt={`Şık ${OPTION_LETTERS[optionIndex]} görseli`}
                                className="mt-2 max-h-24 w-full rounded-md object-contain bg-slate-950/60"
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {importResult.valid.length > 10 && (
                <p className="text-center text-xs text-slate-500">
                  ... ve {importResult.valid.length - 10} soru daha
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
          disabled={isSubmitting || formData.importResult.valid.length === 0}
          className={`w-full rounded-xl py-4 font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
            isBundle
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
          }`}
        >
          {isSubmitting
            ? 'Kaydediliyor...'
            : isBundle
              ? `${formData.importResult.valid.length} Soruyu Bundle ile Kaydet`
              : `${formData.importResult.valid.length} Soruyu Kaydet`}
        </motion.button>
      )}
    </>
  );
}
