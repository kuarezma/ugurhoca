'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import DeferredFloatingShapes from '@/components/DeferredFloatingShapes';

export default function NotFound() {
  return (
    <>
      <DeferredFloatingShapes count={6} />
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-white mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">Sayfa Bulunamadı</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-colors"
            >
              <Home className="w-5 h-5" />
              Ana Sayfaya Dön
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
