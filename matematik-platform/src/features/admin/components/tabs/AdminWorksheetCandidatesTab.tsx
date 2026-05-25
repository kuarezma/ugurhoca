"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Ban,
  CheckCircle2,
  Clock3,
  Cloud,
  AlertTriangle,
  ExternalLink,
  FileSearch,
  RotateCcw,
  Search,
  RefreshCw,
} from "lucide-react";
import type {
  GoogleDriveConnectionStatus,
  WorksheetCandidate,
  WorksheetCandidateSourceStatus,
  WorksheetCandidateStatus,
  WorksheetCandidateWeekScanResult,
} from "@/features/admin/types";

type AdminWorksheetCandidatesTabProps = {
  candidates: WorksheetCandidate[];
  driveConnection: GoogleDriveConnectionStatus | null;
  isDriveBusy: boolean;
  isWeekScanRunning: boolean;
  lastWeekScanResult: WorksheetCandidateWeekScanResult | null;
  sourceStatus: WorksheetCandidateSourceStatus | null;
  onApprove: (candidate: WorksheetCandidate) => Promise<void> | void;
  onConnectDrive: () => Promise<void> | void;
  onDisconnectDrive: () => Promise<void> | void;
  onRefreshSourceStatus: () => Promise<void> | void;
  onScanCurrentWeek: () => Promise<void> | void;
  onUpdateStatus: (
    candidate: WorksheetCandidate,
    status: Extract<WorksheetCandidateStatus, "pending" | "rejected">,
    rejectionReason?: string | null,
  ) => Promise<void> | void;
};

const FILTERS: Array<{
  label: string;
  status: "all" | WorksheetCandidateStatus;
}> = [
  { label: "Tümü", status: "all" },
  { label: "Bekleyen", status: "pending" },
  { label: "Onaylanan", status: "approved" },
  { label: "Reddedilen", status: "rejected" },
];

const STATUS_STYLE: Record<string, string> = {
  approved: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  pending: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  rejected: "border-red-400/30 bg-red-500/10 text-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  approved: "Onaylandı",
  pending: "Bekliyor",
  rejected: "Reddedildi",
};

const formatShortDate = (value?: string | null) => {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
};

const getWorksheetContentHref = (candidate: WorksheetCandidate) => {
  const params = new URLSearchParams({
    grade: String(candidate.grade),
    outcome: candidate.learning_outcome,
    type: "yaprak-test",
  });

  return `/icerikler?${params.toString()}`;
};

export default function AdminWorksheetCandidatesTab({
  candidates,
  driveConnection,
  isDriveBusy,
  isWeekScanRunning,
  lastWeekScanResult,
  sourceStatus,
  onApprove,
  onConnectDrive,
  onDisconnectDrive,
  onRefreshSourceStatus,
  onScanCurrentWeek,
  onUpdateStatus,
}: AdminWorksheetCandidatesTabProps) {
  const [activeFilter, setActiveFilter] = useState<
    "all" | WorksheetCandidateStatus
  >("pending");
  const [approvingCandidateId, setApprovingCandidateId] = useState<
    string | null
  >(null);
  const [isRefreshingSourceStatus, setIsRefreshingSourceStatus] =
    useState(false);

  const filteredCandidates = useMemo(() => {
    if (activeFilter === "all") {
      return candidates;
    }

    return candidates.filter((candidate) => candidate.status === activeFilter);
  }, [activeFilter, candidates]);

  const counts = useMemo(
    () =>
      candidates.reduce(
        (acc, candidate) => ({
          ...acc,
          [candidate.status]: (acc[candidate.status] || 0) + 1,
        }),
        { all: candidates.length } as Record<string, number>,
      ),
    [candidates],
  );

  const handleReject = async (candidate: WorksheetCandidate) => {
    const reason =
      window.prompt("Ret nedeni", candidate.rejection_reason || "")?.trim() ||
      "";

    await onUpdateStatus(candidate, "rejected", reason || null);
  };

  const handleApprove = async (candidate: WorksheetCandidate) => {
    if (approvingCandidateId) {
      return;
    }

    setApprovingCandidateId(candidate.id);

    try {
      await onApprove(candidate);
    } finally {
      setApprovingCandidateId(null);
    }
  };
  const handleRefreshSourceStatus = async () => {
    setIsRefreshingSourceStatus(true);

    try {
      await onRefreshSourceStatus();
    } finally {
      setIsRefreshingSourceStatus(false);
    }
  };
  const sourcesReady = sourceStatus?.configured === true;
  const invalidAllowedHostCount = sourceStatus?.invalidAllowedHosts?.length ?? 0;
  const invalidSourceCount = sourceStatus?.invalidSourceUrls?.length ?? 0;
  const driveConfigured = driveConnection?.configured !== false;

  return (
    <motion.div
      key="worksheet-candidates"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
              <FileSearch className="h-3.5 w-3.5" />
              Test Adayları
            </div>
            <h3 className="text-lg font-bold text-white">
              Bulunan Yaprak Test Adayları
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Bu ekran adayları kontrol etmek ve uygun olmayanları reddetmek
              için hazırlandı. Yayınlanan PDF, bağlı Google Drive hesabına
              kopyalanır ve öğrenciye Drive bağlantısı gösterilir.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isWeekScanRunning || !sourcesReady}
              onClick={onScanCurrentWeek}
              type="button"
            >
              <Search className="h-4 w-4" />
              {isWeekScanRunning
                ? "Taranıyor"
                : sourcesReady
                  ? "Bu Haftayı Tara"
                  : "Kaynak Ayarı Gerekli"}
            </button>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.status}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    activeFilter === filter.status
                      ? "border-amber-300/40 bg-amber-500/20 text-amber-100"
                      : "border-white/10 bg-slate-900/70 text-slate-300 hover:border-white/20 hover:text-white"
                  }`}
                  onClick={() => setActiveFilter(filter.status)}
                  type="button"
                >
                  {filter.label} ({counts[filter.status] || 0})
                </button>
              ))}
            </div>
          </div>
        </div>
        {lastWeekScanResult && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              lastWeekScanResult.failures.length > 0
                ? "border-red-400/20 bg-red-500/10 text-red-100"
                : "border-amber-400/20 bg-amber-500/10 text-amber-100"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {lastWeekScanResult.failures.length > 0 && (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span>
                Son tarama ({formatShortDate(lastWeekScanResult.today)}):{" "}
                {lastWeekScanResult.planItems} plan satırı,{" "}
                {lastWeekScanResult.inserted} yeni aday,{" "}
                {lastWeekScanResult.skipped} atlanan kayıt.
              </span>
            </div>
            {lastWeekScanResult.failures.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="font-semibold">
                  {lastWeekScanResult.failures.length} plan satırında hata var:
                </p>
                <ul className="space-y-1">
                  {lastWeekScanResult.failures.slice(0, 3).map((failure) => (
                    <li
                      className="rounded-lg border border-red-300/15 bg-red-950/30 px-3 py-2 text-xs"
                      key={failure.plan_item_id}
                    >
                      <span className="font-semibold">
                        {failure.plan_item_id.slice(0, 8)}
                      </span>
                      : {failure.message}
                    </li>
                  ))}
                </ul>
                {lastWeekScanResult.failures.length > 3 && (
                  <p className="text-xs text-red-100/80">
                    İlk 3 hata gösteriliyor.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`rounded-2xl border p-4 sm:p-6 ${
          sourceStatus?.configured
            ? "border-emerald-400/20 bg-emerald-500/10"
            : "border-red-400/20 bg-red-500/10"
        }`}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div
              className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                sourceStatus?.configured
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border-red-400/20 bg-red-500/10 text-red-200"
              }`}
            >
              {sourceStatus?.configured ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              Kaynak Ayarları
            </div>
            <h3 className="text-lg font-bold text-white">
              {sourceStatus?.configured
                ? "Tarama kaynakları hazır"
                : "Tarama kaynakları eksik"}
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              {invalidSourceCount > 0
                ? `${invalidSourceCount} kaynak URL geçersiz. Lütfen http/https bağlantılarını kontrol edin.`
                : invalidAllowedHostCount > 0
                  ? `${invalidAllowedHostCount} izinli alan adı geçersiz. Alan adını protokolsüz yazın.`
                : sourceStatus?.configured
                ? `${sourceStatus.sourceUrls.length} kaynak ve ${sourceStatus.allowedHosts.length} izinli alan adı tanımlı.`
                : "Bu Haftayı Tara için WORKSHEET_CANDIDATE_SOURCE_URLS ayarlanmalı."}
            </p>
            {invalidSourceCount > 0 && (
              <p className="mt-2 text-xs text-red-100/80">
                İlk hatalı kaynak: {sourceStatus?.invalidSourceUrls?.[0]}
              </p>
            )}
            {invalidAllowedHostCount > 0 && (
              <p className="mt-2 text-xs text-red-100/80">
                İlk hatalı alan adı: {sourceStatus?.invalidAllowedHosts?.[0]}
              </p>
            )}
          </div>
          {sourceStatus?.configured && (
            <div className="max-w-xl text-xs text-emerald-100/80 lg:text-right">
              {sourceStatus.allowedHosts.slice(0, 4).join(", ")}
              {sourceStatus.allowedHosts.length > 4 ? " ..." : ""}
            </div>
          )}
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRefreshingSourceStatus}
            onClick={handleRefreshSourceStatus}
            type="button"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isRefreshingSourceStatus ? "animate-spin" : ""
              }`}
            />
            {isRefreshingSourceStatus ? "Kontrol Ediliyor" : "Tekrar Kontrol Et"}
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
              <Cloud className="h-3.5 w-3.5" />
              Google Drive
            </div>
            <h3 className="text-lg font-bold text-white">
              {!driveConfigured
                ? "Drive ayarları eksik"
                : driveConnection?.connected
                  ? "Drive hesabı bağlı"
                  : "Drive hesabı bağlı değil"}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {!driveConfigured
                ? "GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET ve GOOGLE_DRIVE_REDIRECT_URI ayarlanmalı."
                : driveConnection?.connected
                  ? `${driveConnection.google_email || "Google hesabı"} bağlı. Yayınlanan PDF’ler Drive’a kopyalanacak.`
                  : "PDF’leri Drive’a kopyalama için Google hesabınızı bağlayın."}
            </p>
            {!driveConfigured && driveConnection?.missingKeys?.length ? (
              <p className="mt-2 text-xs text-red-200">
                Eksik: {driveConnection.missingKeys.join(", ")}
              </p>
            ) : null}
          </div>
          {driveConnection?.connected ? (
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isDriveBusy}
              onClick={onDisconnectDrive}
              type="button"
            >
              Bağlantıyı Kes
            </button>
          ) : (
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isDriveBusy || !driveConfigured}
              onClick={onConnectDrive}
              type="button"
            >
              {driveConfigured ? "Google Drive Bağla" : "Ayar Gerekli"}
            </button>
          )}
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <FileSearch className="mx-auto mb-4 h-16 w-16 text-slate-500" />
          <p className="text-slate-400">
            Bu filtrede gösterilecek test adayı yok.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate, index) => (
            <motion.article
              key={candidate.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="glass rounded-2xl p-4 sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                        STATUS_STYLE[candidate.status] || STATUS_STYLE.pending
                      }`}
                    >
                      {candidate.status === "approved" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : candidate.status === "rejected" ? (
                        <Ban className="h-3.5 w-3.5" />
                      ) : (
                        <Clock3 className="h-3.5 w-3.5" />
                      )}
                      {STATUS_LABEL[candidate.status] || "Bekliyor"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      {candidate.grade}. Sınıf
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      Eşleşme %{candidate.match_score}
                    </span>
                  </div>

                  <h3 className="truncate text-lg font-bold text-white">
                    {candidate.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatShortDate(candidate.week_start)} -{" "}
                    {formatShortDate(candidate.week_end)} · {candidate.subject}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                    {candidate.learning_outcome}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Kaynak: {candidate.source_name || "İzinli kaynak"}
                  </p>
                  {candidate.rejection_reason && (
                    <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                      Ret nedeni: {candidate.rejection_reason}
                    </p>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:w-96">
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:text-white"
                    href={candidate.file_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    PDF
                  </a>
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:text-white"
                    href={candidate.source_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Kaynak
                  </a>
                  {candidate.status === "rejected" ? (
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20"
                      onClick={() => onUpdateStatus(candidate, "pending")}
                      type="button"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Geri Al
                    </button>
                  ) : (
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={
                        candidate.status === "approved" ||
                        approvingCandidateId === candidate.id
                      }
                      onClick={() => handleReject(candidate)}
                      type="button"
                    >
                      <Ban className="h-4 w-4" />
                      Reddet
                    </button>
                  )}
                  {candidate.status === "pending" && (
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={
                        !driveConnection?.connected ||
                        approvingCandidateId !== null
                      }
                      onClick={() => handleApprove(candidate)}
                      type="button"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {approvingCandidateId === candidate.id
                        ? "Yayınlanıyor"
                        : "Drive’a Yayınla"}
                    </button>
                  )}
                  {candidate.status === "approved" && (
                    <>
                      {candidate.drive_file_url && (
                        <a
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
                          href={candidate.drive_file_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Drive
                        </a>
                      )}
                      <a
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
                        href={getWorksheetContentHref(candidate)}
                        target="_blank"
                      >
                        <ExternalLink className="h-4 w-4" />
                        İçerikte Aç
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </motion.div>
  );
}
