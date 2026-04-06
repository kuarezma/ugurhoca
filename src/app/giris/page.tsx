'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calculator, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/profil');
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (formData.username.trim().split(' ').length < 2) {
      setError('Lütfen ad ve soyad girin (örn: Ahmet Yılmaz)');
      return;
    }

    try {
      const { data: profileMatches, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .ilike('name', formData.username.trim());

      if (profileError) throw profileError;

      if (!profileMatches || profileMatches.length === 0) {
        setError('Kullanıcı adı bulunamadı');
        return;
      }

      if (profileMatches.length > 1) {
        setError('Bu kullanıcı adı birden fazla hesapta var. Admin ile iletişime geçin.');
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: profileMatches[0].email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      router.push('/profil');
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
          setError('Kullanıcı adı veya şifre hatalı');
      } else if (err.message === 'Email not confirmed') {
        setError('E-posta onayı bekleniyor.');
      } else {
        setError('Giriş başarısız: ' + err.message);
      }
    }
  };

  return (
    <main className="giris-page min-h-screen gradient-bg flex items-center justify-center p-6">
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
              <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
              <p className="text-slate-400 text-sm">Hesabına eriş</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Kullanıcı Adı</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                         focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="kullaniciadi"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                           focus:outline-none focus:border-purple-500 transition-colors pr-12"
                  placeholder="••••••••"
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
            Hesabın yok mu?{' '}
            <Link href="/kayit" className="text-purple-400 hover:text-purple-300 font-semibold">
              Kayıt ol
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
