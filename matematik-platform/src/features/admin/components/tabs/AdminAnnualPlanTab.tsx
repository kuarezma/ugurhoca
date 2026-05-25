"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarDays,
  X,
  Download,
  FileSearch,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { buildAnnualPlanSampleCsv } from "@/features/admin/annual-plan-template";
import type {
  AnnualPlanImportResult,
  AnnualPlanItem,
  WorksheetCandidateDiscoveryResult,
  WorksheetCandidateSourceStatus,
} from "@/features/admin/types";

type AdminAnnualPlanTabProps = {
  items: AnnualPlanItem[];
  onDiscoverCandidates: (
    item: AnnualPlanItem,
  ) => Promise<WorksheetCandidateDiscoveryResult>;
  onImport: (file: File) => Promise<AnnualPlanImportResult>;
  sourceStatus: WorksheetCandidateSourceStatus | null;
};

const formatShortDate = (value: string) => {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
};

const isSupportedAnnualPlanFile = (file: File) =>
  /\.(csv|docx|xlsx)$/i.test(file.name);

const getUnsupportedFileMessage = (fileName: string) =>
  /\.doc$/i.test(fileName)
    ? "Eski DOC dosyası desteklenmez. Word'de DOCX olarak kaydedip yükleyin."
    : "Yalnızca CSV, XLSX veya DOCX dosyası yükleyebilirsiniz.";

const getSourceWarningMessage = (
  sourceStatus: WorksheetCandidateSourceStatus | null,
) => {
  if ((sourceStatus?.invalidSourceUrls?.length ?? 0) > 0) {
    return `${sourceStatus?.health?.validSources ?? 0} geçerli, ${sourceStatus?.invalidSourceUrls?.length} geçersiz kaynak var. Yaprak Test Adayları bölümünde kaynak bağlantılarını kontrol edin.`;
  }

  if ((sourceStatus?.invalidAllowedHosts?.length ?? 0) > 0) {
    return `${sourceStatus?.invalidAllowedHosts?.length} izinli alan adı geçersiz. Alan adlarını protokolsüz yazın.`;
  }

  if ((sourceStatus?.unreachableSourceUrls?.length ?? 0) > 0) {
    return `${sourceStatus?.unreachableSourceUrls?.length} kaynak şu an erişilemiyor. Yaprak Test Adayları bölümünde kaynak sağlığını kontrol edin.`;
  }

  if ((sourceStatus?.health?.totalSources ?? 0) === 0) {
    return "Aday arama için önce Yaprak Test Adayları bölümünde kaynak bağlantısı ekleyin.";
  }

  return "Aday arama için önce Yaprak Test Adayları bölümünde kaynak ayarlarını tamamlayın.";
};

export default function AdminAnnualPlanTab({
  items,
  onDiscoverCandidates,
  onImport,
  sourceStatus,
}: AdminAnnualPlanTabProps) {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [lastResult, setLastResult] = useState<AnnualPlanImportResult | null>(
    null,
  );
  const [discoveringItemId, setDiscoveringItemId] = useState<string | null>(
    null,
  );
  const sourcesReady = sourceStatus?.configured === true;

  const groupedItems = useMemo(() => {
    const groups = new Map<number, AnnualPlanItem[]>();

    for (const item of items) {
      groups.set(item.grade, [...(groups.get(item.grade) || []), item]);
    }

    return Array.from(groups.entries()).sort(([left], [right]) => left - right);
  }, [items]);

  const handleImport = async () => {
    if (!selectedFile) {
      showToast("warning", "Lütfen CSV, XLSX veya DOCX yıllık plan dosyası seçin.");
      return;
    }

    if (!isSupportedAnnualPlanFile(selectedFile)) {
      showToast("warning", getUnsupportedFileMessage(selectedFile.name));
      return;
    }

    setIsImporting(true);
    try {
      const result = await onImport(selectedFile);
      setLastResult(result);
      setSelectedFile(null);
      showToast(
        "success",
        `${result.inserted} satır eklendi, ${result.skipped} tekrar atlandı.`,
      );
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Yıllık plan içe aktarılamadı.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([`\uFEFF${buildAnnualPlanSampleCsv()}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "yillik-plan-sablonu.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDiscoverCandidates = async (item: AnnualPlanItem) => {
    setDiscoveringItemId(item.id);
    try {
      const result = await onDiscoverCandidates(item);
      showToast(
        result.inserted > 0 ? "success" : "info",
        result.inserted > 0
          ? `${result.inserted} yeni test adayı bulundu.`
          : "Bu kazanım için yeni test adayı bulunamadı.",
      );
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Test adayı araması yapılamadı.",
      );
    } finally {
      setDiscoveringItemId(null);
    }
  };

  return (
    <motion.div
      key="annual-plan"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              <CalendarDays className="h-3.5 w-3.5" />
              Yıllık Plan
            </div>
            <h3 className="text-lg font-bold text-white">
              Plan Dosyası Yükle
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              CSV/XLSX için sinif, hafta_baslangic, hafta_bitis, konu ve
              kazanim kolonları gerekir. DOCX tablolarında Tarih, Öğrenme Alanı
              ve Kazanımlar başlıkları da okunur.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:w-[34rem]">
            <div className="flex min-h-12 items-center overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 text-sm text-slate-300 transition focus-within:border-emerald-400/40 hover:border-emerald-400/40">
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-emerald-300" />
                <span className="min-w-0 flex-1 truncate">
                  {selectedFile?.name || "Dosya seç"}
                </span>
                <input
                  accept=".csv,.docx,.xlsx"
                  className="sr-only"
                  disabled={isImporting}
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;

                    if (file && !isSupportedAnnualPlanFile(file)) {
                      showToast(
                        "warning",
                        getUnsupportedFileMessage(file.name),
                      );
                      event.target.value = "";
                      setSelectedFile(null);
                      return;
                    }

                    setSelectedFile(file);
                  }}
                />
              </label>
              {selectedFile && (
                <button
                  aria-label="Seçilen dosyayı temizle"
                  className="flex h-12 w-12 shrink-0 items-center justify-center border-l border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isImporting}
                  onClick={() => setSelectedFile(null)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isImporting}
              onClick={handleImport}
              type="button"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? "Yükleniyor" : "İçe Aktar"}
            </button>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20 sm:col-span-2"
              onClick={handleDownloadSample}
              type="button"
            >
              <Download className="h-4 w-4" />
              Örnek CSV İndir
            </button>
          </div>
        </div>

        {!sourcesReady && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{getSourceWarningMessage(sourceStatus)}</p>
          </div>
        )}

        {lastResult && (
          <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Son işlem: {lastResult.inserted} yeni satır eklendi,{" "}
            {lastResult.skipped} tekrar atlandı.
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <FileSpreadsheet className="mx-auto mb-4 h-16 w-16 text-slate-500" />
          <p className="text-slate-400">Henüz yıllık plan yüklenmedi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedItems.map(([grade, gradeItems]) => (
            <section key={grade} className="glass rounded-2xl p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-white">
                  {grade}. Sınıf
                </h3>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                  {gradeItems.length} kayıt
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[860px] w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr className="border-b border-white/10">
                      <th className="px-3 py-3 font-semibold">Hafta</th>
                      <th className="px-3 py-3 font-semibold">Konu</th>
                      <th className="px-3 py-3 font-semibold">Kazanım</th>
                      <th className="px-3 py-3 font-semibold">Açıklama</th>
                      <th className="px-3 py-3 font-semibold">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-white/5 text-slate-300 last:border-0"
                      >
                        <td className="whitespace-nowrap px-3 py-3 text-slate-400">
                          {formatShortDate(item.week_start)} -{" "}
                          {formatShortDate(item.week_end)}
                        </td>
                        <td className="px-3 py-3 font-medium text-white">
                          {item.subject}
                        </td>
                        <td className="px-3 py-3">{item.learning_outcome}</td>
                        <td className="px-3 py-3 text-slate-400">
                          {item.description || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <button
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={discoveringItemId !== null || !sourcesReady}
                            onClick={() => handleDiscoverCandidates(item)}
                            type="button"
                          >
                            <FileSearch className="h-4 w-4" />
                            {discoveringItemId === item.id
                              ? "Aranıyor"
                              : sourcesReady
                                ? "Aday Ara"
                                : "Kaynak Gerekli"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </motion.div>
  );
}
