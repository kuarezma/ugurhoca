/* eslint-disable @next/next/no-img-element -- admin preview uses temporary object URLs from local uploads */

import { motion } from "framer-motion";
import { useId, type ChangeEvent } from "react";
import { Image as ImageIcon, Send, X } from "lucide-react";
import type { AdminUser } from "@/features/admin/types";
import { type AdminModalSubmitHandler } from "@/features/admin/components/modal/shared";

type AdminMessageFormProps = {
  adminMsgImagePreview: string | null;
  adminMsgRecipient: AdminUser | null;
  adminMsgText: string;
  adminMsgTitle: string;
  isSubmitting: boolean;
  onClearImage: () => void;
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSubmit: AdminModalSubmitHandler;
  setAdminMsgText: (value: string) => void;
  setAdminMsgTitle: (value: string) => void;
};

export default function AdminMessageForm({
  adminMsgImagePreview,
  adminMsgRecipient,
  adminMsgText,
  adminMsgTitle,
  isSubmitting,
  onClearImage,
  onImageUpload,
  onSubmit,
  setAdminMsgText,
  setAdminMsgTitle,
}: AdminMessageFormProps) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const imageId = `${baseId}-image`;
  const messageId = `${baseId}-message`;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {adminMsgRecipient && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-lg font-bold text-slate-950 dark:text-slate-950">
            {adminMsgRecipient.name?.[0] || "?"}
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-semibold">
              {adminMsgRecipient.name || "İsimsiz"}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{adminMsgRecipient.email}</p>
          </div>
        </div>
      )}
      <div>
        <label htmlFor={titleId} className="block text-slate-700 dark:text-slate-200 font-semibold mb-2 text-sm">
          Başlık
        </label>
        <input
          id={titleId}
          type="text"
          value={adminMsgTitle}
          onChange={(event) => setAdminMsgTitle(event.target.value)}
          className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          placeholder="Mesaj başlığı..."
        />
      </div>
      <div>
        <label htmlFor={imageId} className="block text-slate-700 dark:text-slate-200 font-semibold mb-2 text-sm">
          Resim (Opsiyonel)
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onImageUpload}
            className="hidden"
            id={imageId}
          />
          <label
            htmlFor={imageId}
            className="flex items-center justify-center gap-2 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 border-dashed rounded-xl px-4 py-4 text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-purple-500 transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
            <span>Resim seç veya sürükle</span>
          </label>
        </div>
        {adminMsgImagePreview && (
          <div className="mt-3 relative inline-block">
            <img
              src={adminMsgImagePreview}
              alt="Önizleme"
              className="max-h-32 rounded-lg border border-slate-200 dark:border-white/10"
            />
            <button
              type="button"
              onClick={onClearImage}
              aria-label="Önizleme resmini kaldır"
              className="absolute -top-2.5 -right-2.5 min-w-[32px] min-h-[32px] p-1.5 bg-red-500 rounded-full flex items-center justify-center text-white dark:text-white hover:bg-red-600 shadow-md transition-transform hover:scale-110 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div>
        <label htmlFor={messageId} className="block text-slate-700 dark:text-slate-200 font-semibold mb-2 text-sm">
          Mesaj
        </label>
        <textarea
          id={messageId}
          value={adminMsgText}
          onChange={(event) => setAdminMsgText(event.target.value)}
          rows={5}
          className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
          placeholder="Öğrenciye mesajınızı yazın..."
        />
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={
          isSubmitting ||
          (!adminMsgText.trim() && !adminMsgImagePreview) ||
          !adminMsgRecipient
        }
        className="w-full py-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
      >
        {isSubmitting ? (
          "Gönderiliyor..."
        ) : (
          <>
            <Send className="w-5 h-5" />
            Gönder
          </>
        )}
      </motion.button>
    </form>
  );
}
