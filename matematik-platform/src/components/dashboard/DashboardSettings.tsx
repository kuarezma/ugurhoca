"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default function DashboardSettings() {
  return (
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
          <h2 className="text-xl font-bold text-white">Ayarlar</h2>
          <p className="mt-1 text-sm text-slate-400">
            Şifre değişikliği ve temel hesap ayarları burada kalsın.
          </p>
        </div>
      </div>

      <ChangePasswordForm />
    </motion.section>
  );
}
