"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calculator, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getClientSession } from "@/lib/auth-client";
import { normalizeFullNameForMatch } from "@/lib/student-identity";
import FloatingShapes from "@/components/FloatingShapes";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getClientSession();
      if (session) {
        router.push("/profil");
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.password) {
      setError("Lütfen tüm alanları doldurun");
      return;
    }

    const displayName = formData.fullName.trim();
    if (displayName.split(/\s+/).length < 2) {
      setError("Lütfen ad ve soyad girin (örn: Ahmet Yılmaz)");
      return;
    }

    const nameNormalized = normalizeFullNameForMatch(displayName);

    try {
      const { data: byNorm, error: normError } = await supabase
        .from("profiles")
        .select("email")
        .eq("name_normalized", nameNormalized);

      if (normError) throw normError;

      let profileMatches = byNorm ?? [];

      if (profileMatches.length === 0) {
        const { data: legacy, error: legacyError } = await supabase
          .from("profiles")
          .select("email")
          .ilike("name", displayName);

        if (legacyError) throw legacyError;
        profileMatches = legacy ?? [];
      }

      if (!profileMatches || profileMatches.length === 0) {
        setError("Bu ad soyad ile kayıtlı hesap bulunamadı.");
        return;
      }

      if (profileMatches.length > 1) {
        setError(
          "Bu ad soyad birden fazla hesapta görünüyor. Lütfen yönetici ile iletişime geçin.",
        );
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profileMatches[0].email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      router.push("/profil");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "Invalid login credentials") {
        setError("Ad soyad veya şifre hatalı");
      } else if (msg === "Email not confirmed") {
        setError("E-posta onayı bekleniyor.");
      } else {
        setError("Giriş başarısız: " + msg);
      }
    }
  };

  return (
    <main className="giris-page min-h-screen gradient-bg flex items-center justify-center p-6">
      <FloatingShapes count={12} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Ana Sayfa
        </Link>

        <div className="glass rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
              <p className="text-slate-400 text-sm">Hesabına eriş</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 mb-2 text-sm">
                Ad Soyad
              </label>
              <input
                type="text"
                autoComplete="name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                         focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Örn: Ahmet Yılmaz"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Kayıt olurken yazdığınız ad soyad ile aynı olmalı. Büyük/küçük
                harf fark etmez.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                           focus:outline-none focus:border-purple-500 transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4
                       rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all glow-button"
            >
              Giriş Yap
            </motion.button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Hesabın yok mu?{" "}
            <Link
              href="/kayit"
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              Kayıt ol
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
