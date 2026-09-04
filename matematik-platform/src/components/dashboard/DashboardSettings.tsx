"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Database, ArrowRight } from "lucide-react";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { UserDataBackupModal } from "@/features/profile/components/UserDataBackupModal";

export default function DashboardSettings() {
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Veri Yedekleme & Taşıma */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Çalışma Verilerini Yedekle & Taşı</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Günlük seri (streak), çözülen soru sayıları ve hata defterini tek tıkla dışa aktar veya yeni cihaza yükle.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-500 shadow-md shrink-0"
          >
            <span>Yedekle / Yükle</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.section>

      {/* Şifre ve Hesap Ayarları */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Settings className="h-5 w-5 text-slate-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Şifre Değişikliği</h2>
            <p className="mt-1 text-sm text-slate-400">
              Hesap şifreni buradan güvenle güncelleyebilirsin.
            </p>
          </div>
        </div>

        <ChangePasswordForm />
      </motion.section>

      {/* Yedekleme Modalı */}
      <UserDataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
}
