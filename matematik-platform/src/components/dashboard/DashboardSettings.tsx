"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Database, ArrowRight, Trash2, AlertTriangle } from "lucide-react";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { ThemeSelector } from "@/components/ThemeSelector";
import { UserDataBackupModal } from "@/features/profile/components/UserDataBackupModal";
import { DeleteAccountModal } from "@/features/profile/components/DeleteAccountModal";

export default function DashboardSettings() {
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. Tema & Görünüm Seçici */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <ThemeSelector />
      </motion.section>

      {/* 2. Veri Yedekleme & Taşıma */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Çalışma Verilerini Yedekle & Taşı</h2>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                Günlük seri (streak), çözülen soru sayıları ve hata defterini tek tıkla dışa aktar veya yeni cihaza yükle.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white dark:text-white transition hover:bg-indigo-700 shadow-xs shrink-0"
          >
            <span>Yedekle / Yükle</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.section>

      {/* 3. Şifre ve Hesap Ayarları */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Settings className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Şifre Değişikliği</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Hesap şifreni buradan güvenle güncelleyebilirsin.
            </p>
          </div>
        </div>

        <ChangePasswordForm />
      </motion.section>

      {/* 4. KVKK / Hesap Kapatma (Tehlikeli Bölge) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="rounded-3xl border border-rose-300/80 bg-rose-50/60 p-6 shadow-xs dark:border-rose-900/50 dark:bg-rose-950/20 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hesap ve Verileri Sil (KVKK)</h2>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                Tüm sınav geçmişin, çözülen sorular, rozetler ve kişisel verilerin kalıcı olarak silinir.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-bold text-white dark:text-white transition shadow-xs shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hesabımı Sil</span>
          </button>
        </div>
      </motion.section>

      {/* Modallar */}
      <UserDataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
