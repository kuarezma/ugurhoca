"use client";

import { useId, useState } from "react";
import { Key, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type ChangePasswordFormProps = {
  isLight?: boolean;
};

export default function ChangePasswordForm({
  isLight = false,
}: ChangePasswordFormProps) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const baseId = useId();
  const currentPasswordId = `${baseId}-current`;
  const newPasswordId = `${baseId}-new`;
  const confirmPasswordId = `${baseId}-confirm`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!currentPassword) {
      setError("Mevcut şifrenizi girin.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Yeni şifre en az 6 karakter olmalı.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("Yeni şifre mevcut şifreden farklı olmalı.");
      return;
    }

    setSending(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Kullanıcı bulunamadı.");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        throw new Error("Mevcut şifre yanlış.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError)
        throw new Error(updateError.message || "Şifre güncellenemedi.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Şifre güncellenemedi. Lütfen tekrar dene.";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const inputClass = `w-full rounded-xl border px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-indigo-500 transition-colors ${
    isLight
      ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
      : "bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-400"
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? "bg-indigo-100" : "bg-indigo-500/20"}`}
        >
          <Key
            className={`w-5 h-5 ${isLight ? "text-indigo-600" : "text-indigo-400"}`}
          />
        </div>
        <h3
          className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}
        >
          Şifre Değiştir
        </h3>
      </div>

      {success && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Şifren başarıyla güncellendi.
        </div>
      )}

      {error && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${isLight ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-rose-500/10 border-rose-500/30 text-rose-300"}`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor={currentPasswordId}
          className={`block mb-1.5 text-sm font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}
        >
          Mevcut Şifre
        </label>
        <input
          id={currentPasswordId}
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Mevcut şifreniz"
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor={newPasswordId}
          className={`block mb-1.5 text-sm font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}
        >
          Yeni Şifre
        </label>
        <div className="relative">
          <input
            id={newPasswordId}
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="En az 6 karakter"
            autoComplete="new-password"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-slate-400"}`}
          >
            {showNew ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor={confirmPasswordId}
          className={`block mb-1.5 text-sm font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}
        >
          Yeni Şifre Tekrar
        </label>
        <div className="relative">
          <input
            id={confirmPasswordId}
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Yeni şifreyi tekrar gir"
            autoComplete="new-password"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-slate-400"}`}
          >
            {showConfirm ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={
          sending || !currentPassword || !newPassword || !confirmPassword
        }
        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all ${
          sending || !currentPassword || !newPassword || !confirmPassword
            ? "bg-slate-500/40 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 shadow-lg"
        }`}
      >
        {sending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}
