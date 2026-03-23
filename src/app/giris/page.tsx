'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calculator, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('matematiklab_user');
    if (user) {
      router.push('/profil');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    const users = JSON.parse(localStorage.getItem('matematiklab_users') || '[]');
    const user = users.find(
      (u: any) => u.email === formData.email && u.password === formData.password
    );

    if (!user) {
      setError('E-posta veya şifre hatalı');
      return;
    }

    localStorage.setItem('matematiklab_user', JSON.stringify(user));
    router.push('/profil');
  };

  return (
    <main className="min-h-screen gradient-bg flex items-center justify-center p-6">
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
              <label className="block text-slate-300 mb-2 text-sm">E-posta</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                         focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="ornek@email.com"
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
