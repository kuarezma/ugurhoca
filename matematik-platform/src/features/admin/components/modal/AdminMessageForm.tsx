/* eslint-disable @next/next/no-img-element -- admin preview uses temporary object URLs from local uploads */

import { motion } from "framer-motion";
import type { ChangeEvent } from "react";
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
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {adminMsgRecipient && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-lg font-bold text-white">
            {adminMsgRecipient.name?.[0] || "?"}
          </div>
          <div>
            <p className="text-white font-semibold">
              {adminMsgRecipient.name || "İsimsiz"}
            </p>
            <p className="text-slate-400 text-xs">{adminMsgRecipient.email}</p>
          </div>
        </div>
      )}
      <div>
        <label className="block text-slate-300 mb-2 text-sm">Başlık</label>
        <input
          type="text"
          value={adminMsgTitle}
          onChange={(event) => setAdminMsgTitle(event.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="Mesaj başlığı..."
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Resim (Opsiyonel)
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            id="admin-msg-image"
          />
          <label
            htmlFor="admin-msg-image"
            className="flex items-center justify-center gap-2 w-full bg-slate-800/50 border border-slate-700 border-dashed rounded-xl px-4 py-4 text-slate-400 cursor-pointer hover:bg-slate-800 hover:border-purple-500 transition-colors"
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
              className="max-h-32 rounded-lg border border-white/10"
            />
            <button
              type="button"
              onClick={onClearImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">Mesaj</label>
        <textarea
          required
          value={adminMsgText}
          onChange={(event) => setAdminMsgText(event.target.value)}
          rows={5}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors resize-none"
          placeholder="Öğrenciye mesajınızı yazın..."
        />
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting || !adminMsgText.trim() || !adminMsgRecipient}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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
