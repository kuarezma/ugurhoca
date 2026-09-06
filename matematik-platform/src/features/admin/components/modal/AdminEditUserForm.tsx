import { useId, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import type {
  AdminFormState,
  AdminUser,
} from "@/features/admin/types";
import {
  PRIVATE_STUDENT_GRADES,
  type AdminFormUpdate,
  type AdminModalSubmitHandler,
} from "@/features/admin/components/modal/shared";

type AdminEditUserFormProps = {
  editingUser: AdminUser | null;
  formData: AdminFormState;
  isSubmitting: boolean;
  onSubmit: AdminModalSubmitHandler;
  updateFormData: AdminFormUpdate;
};

export default function AdminEditUserForm({
  editingUser,
  formData,
  isSubmitting,
  onSubmit,
  updateFormData,
}: AdminEditUserFormProps) {
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const gradeId = `${baseId}-grade`;

  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<"idle" | "success" | "error">("idle");
  const [resetMessage, setResetMessage] = useState("");

  const handleGenerateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let generated = "";
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setResetStatus("idle");
    setResetMessage("");
  };

  const handleResetPassword = async () => {
    if (!editingUser || newPassword.length < 6) return;

    setIsResetting(true);
    setResetStatus("idle");
    setResetMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setResetStatus("error");
        setResetMessage("Oturum süresi dolmuş. Lütfen sayfayı yenileyin.");
        return;
      }

      const response = await fetch("/api/admin-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          student_id: editingUser.id,
          new_password: newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setResetStatus("error");
        setResetMessage(result.error || "Şifre güncellenemedi.");
      } else {
        setResetStatus("success");
        setResetMessage(`✅ Şifre başarıyla güncellendi: ${newPassword} (Öğrenciye bu şifreyi iletebilirsiniz)`);
      }
    } catch {
      setResetStatus("error");
      setResetMessage("İstek gönderilirken bir hata oluştu.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor={nameId} className="block text-slate-300 mb-2 text-sm">
          Ad Soyad
        </label>
        <input
          id={nameId}
          type="text"
          required
          value={formData.name || ""}
          onChange={(event) => updateFormData({ name: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-green-500 transition-colors"
          placeholder="Adını girin..."
        />
      </div>
      <div>
        <label htmlFor={gradeId} className="block text-slate-300 mb-2 text-sm">
          Sınıf
        </label>
        <select
          id={gradeId}
          value={formData.grade || ""}
          onChange={(event) =>
            updateFormData({
              grade:
                event.target.value === "Mezun"
                  ? "Mezun"
                  : parseInt(event.target.value),
            })
          }
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-green-500 transition-colors"
        >
          <option value="">Sınıf seçin</option>
          {PRIVATE_STUDENT_GRADES.map((grade) => (
            <option key={grade} value={grade}>
              {grade}. Sınıf
            </option>
          ))}
          <option value="Mezun">Mezun</option>
        </select>
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting || !editingUser}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
      </motion.button>

      {editingUser && (
        <div className="mt-8 pt-6 border-t border-slate-700/80">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
              <span>🔑</span> Şifre Sıfırlama (Öğrenci Kilit Çözümü)
            </h4>
            <button
              type="button"
              onClick={handleGenerateRandomPassword}
              className="text-xs text-amber-400/90 hover:text-amber-300 underline font-medium"
            >
              Rastgele Şifre Üret
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Sahte e-posta (@ugurhoca.local) kullanan veya şifresini unutan öğrencilerin şifresini doğrudan buradan sıfırlayabilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Yeni şifre (en az 6 karakter)"
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={isResetting || newPassword.length < 6}
              className="px-4 py-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 hover:text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {isResetting ? "Sıfırlanıyor..." : "Şifreyi Güncelle"}
            </button>
          </div>
          {resetMessage && (
            <div
              className={`mt-3 p-3 rounded-xl text-xs font-medium ${
                resetStatus === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border border-red-500/30 text-red-300"
              }`}
            >
              {resetMessage}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
