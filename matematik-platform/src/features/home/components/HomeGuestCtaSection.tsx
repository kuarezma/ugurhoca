'use client';

import Link from 'next/link';
import { Brain, LockKeyhole, Play, ShieldCheck } from 'lucide-react';

type HomeGuestCtaSectionProps = {
  isLight: boolean;
};

export function HomeGuestCtaSection({ isLight }: HomeGuestCtaSectionProps) {
  return (
    <section className="defer-section px-4 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <div
          className={`border rounded-3xl p-6 sm:p-8 text-center ${
            isLight
              ? 'light-soft-panel shadow-[0_18px_42px_rgba(99,102,241,0.14)]'
              : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/20'
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h2
            className={`text-xl sm:text-2xl font-bold mb-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Hemen Başla, Ücretsiz!
          </h2>
          <p
            className={`mb-6 max-w-md mx-auto ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Platform öğrencilerin faydalanması için tamamen ücretsizdir.
            Çalışmaların ve mesajların başka öğrencilerle paylaşılmaz.
          </p>
          <div className="mx-auto mb-6 grid max-w-2xl gap-3 sm:grid-cols-2">
            <div
              className={`rounded-2xl border p-4 text-left ${
                isLight
                  ? 'border-slate-200 bg-white text-slate-700'
                  : 'border-white/10 bg-white/5 text-slate-300'
              }`}
            >
              <ShieldCheck className="mb-2 h-5 w-5 text-emerald-400" />
              <p className="text-sm font-semibold">Öğrenci gizliliği</p>
              <p className="mt-1 text-xs opacity-80">
                Her öğrenci yalnızca kendi profilini, planını, ödevini,
                mesajını ve ilerlemesini görür.
              </p>
            </div>
            <div
              className={`rounded-2xl border p-4 text-left ${
                isLight
                  ? 'border-slate-200 bg-white text-slate-700'
                  : 'border-white/10 bg-white/5 text-slate-300'
              }`}
            >
              <LockKeyhole className="mb-2 h-5 w-5 text-cyan-400" />
              <p className="text-sm font-semibold">Nasıl çalışır?</p>
              <p className="mt-1 text-xs opacity-80">
                Kayıt ol, çalış, test çöz, ödevlerini takip et ve Uğur
                Hoca’dan geri bildirim al.
              </p>
            </div>
          </div>
          <Link
            href="/kayit"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
          >
            <Play className="w-5 h-5" />
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </div>
    </section>
  );
}
