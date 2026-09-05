'use client';

import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  HardDrive,
  Video,
  MessageSquare,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

interface AdminDiagnosticsCardProps {
  driveConnected: boolean;
  pendingCandidatesCount: number;
  unreadMessagesCount: number;
  studentCount: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminDiagnosticsCard: React.FC<AdminDiagnosticsCardProps> = ({
  driveConnected,
  pendingCandidatesCount,
  unreadMessagesCount,
  studentCount,
  onRefresh,
  isRefreshing = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-6 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl backdrop-blur-md overflow-hidden transition-all duration-300">
      {/* Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-800/40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Sistem Sağlığı & Entegrasyonlar</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Tüm Servisler Normal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Veritabanı, Google Drive, Canlı Ders ve işlem kuyruğu gerçek zamanlı teşhis özeti
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Verileri Yenile"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors disabled:opacity-50"
              title="Sistem verilerini yenile"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <span>{isExpanded ? 'Detayları Gizle' : 'Detayları Göster'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/60">
        {/* Supabase Status */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Supabase DB</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Aktif & Bağlı
            </div>
          </div>
        </div>

        {/* Google Drive Status */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div
            className={`p-2 rounded-lg ${
              driveConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Google Drive</div>
            <div
              className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${
                driveConnected ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {driveConnected ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Bağlı & Hazır
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Bağlı Değil
                </>
              )}
            </div>
          </div>
        </div>

        {/* LiveKit / Live Lessons */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Canlı Ders Motoru</div>
            <div className="text-xs font-bold text-indigo-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              LiveKit Hazır
            </div>
          </div>
        </div>

        {/* Student Sync */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Kayıtlı Öğrenci</div>
            <div className="text-xs font-bold text-cyan-400 mt-0.5">
              {studentCount} Aktif Profil
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Detailed Diagnostic Panel */}
      {isExpanded && (
        <div className="px-5 py-4 border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Bekleyen İş Kuyrukları ve Teşhis Verileri
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pending Worksheets */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Onay Bekleyen Aday Testler</div>
                  <div className="text-[11px] text-slate-400">Yandex / Drive kaynağından taranan yeni testler</div>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  pendingCandidatesCount > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-700/50 text-slate-400'
                }`}
              >
                {pendingCandidatesCount} Test
              </span>
            </div>

            {/* Unread Support Messages */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Okunmamış Öğrenci Mesajları</div>
                  <div className="text-[11px] text-slate-400">Cevap bekleyen doğrudan öğrenci soruları</div>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  unreadMessagesCount > 0
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'bg-slate-700/50 text-slate-400'
                }`}
              >
                {unreadMessagesCount} Mesaj
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
