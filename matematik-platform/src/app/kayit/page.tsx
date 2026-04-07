'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Calculator, Eye, EyeOff, ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  formatSignupError,
  normalizeFullNameForMatch,
  studentLoginEmail,
} from '@/lib/student-identity';

const FloatingShapes = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full opacity-10"
        style={{
          width: Math.random() * 150 + 100,
          height: Math.random() * 150 + 100,
          background: ['#8b5cf6', '#ec4899', '#06b6d4'][i % 3],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -50, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: Math.random() * 5 + 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    grade: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Lütfen adınızı ve soyadınızı girin');
      return;
    }

    if (formData.name.trim().split(' ').length < 2) {
      setError('Lütfen hem adınızı hem soyadınızı girin');
      return;
    }

    if (!formData.grade) {
      setError('Lütfen sınıf düzeyinizi seçin');
      return;
    }

    if (!formData.password) {
      setError('Lütfen şifre girin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }

    try {
      const displayName = formData.name.trim();
      const nameNormalized = normalizeFullNameForMatch(displayName);
      let fakeEmail: string;
      try {
        fakeEmail = studentLoginEmail(displayName);
      } catch {
        setError('Ad soyadı geçerli değil.');
        return;
      }

      const userGrade =
        formData.grade === 'Mezun'
          ? 0
          : Number.parseInt(formData.grade, 10);
      const gradeValue = Number.isNaN(userGrade) ? 0 : userGrade;
      const isPrivate =
        formData.password.toLowerCase() === 'ozelders' ||
        formData.password.toLowerCase() === 'özelders';

      const { data: existingByEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', fakeEmail)
        .maybeSingle();

      if (existingByEmail) {
        setError(
          'Bu ad soyad ile zaten hesap var. Giriş sayfasından deneyin.'
        );
        return;
      }

      const { data: existingByNorm, error: normErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('name_normalized', nameNormalized)
        .maybeSingle();

      if (normErr) throw normErr;
      if (existingByNorm) {
        setError(
          'Bu ad soyad ile zaten hesap var. Giriş sayfasından deneyin.'
        );
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: formData.password,
        options: {
          data: {
            name: displayName,
            grade: gradeValue,
            is_private_student: isPrivate,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: profileErr } = await supabase.from('profiles').upsert({
          id: data.user.id,
          name: displayName,
          name_normalized: nameNormalized,
          email: fakeEmail,
          grade: gradeValue,
          is_private_student: isPrivate,
          created_at: new Date().toISOString(),
        });
        if (profileErr) throw profileErr;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/profil');
      }, 2000);
    } catch (err: unknown) {
      setError(formatSignupError(err));
    }
  };

  if (success) {
    return (
      <main className="kayit-page min-h-screen gradient-bg flex items-center justify-center p-6">
        <FloatingShapes />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-3xl p-12 text-center max-w-md w-full relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Başarılı!</h2>
          <p className="text-slate-300 mb-8">Hesabınız oluşturuldu. Yönlendiriliyorsunuz...</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="kayit-page min-h-screen gradient-bg flex items-center justify-center p-6">
      <FloatingShapes />
      
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
              <h1 className="text-2xl font-bold text-white">Kayıt Ol</h1>
              <p className="text-slate-400 text-sm">Hesap oluşturun</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Ad Soyad</label>
              <input
                type="text"
                required
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                         focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Adınız Soyadınız"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Büyük/küçük harf fark etmez; girişte aynı ad soyadı kullanın.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-medium">Sınıf Düzeyi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white 
                           focus:outline-none focus:border-purple-500 focus:bg-slate-800 transition-all appearance-none"
                >
                  <option value="" disabled>Seçiniz</option>
                  {[5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                    <option key={grade} value={grade}>{grade}. Sınıf</option>
                  ))}
                  <option value="Mezun">Mezun</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                           focus:outline-none focus:border-purple-500 transition-colors pr-12"
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">Şifre Tekrar</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                         focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Şifrenizi tekrar girin"
              />
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
              Kayıt Ol
            </motion.button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Zaten hesabın var mı?{' '}
            <Link href="/giris" className="text-purple-400 hover:text-purple-300 font-semibold">
              Giriş yap
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
