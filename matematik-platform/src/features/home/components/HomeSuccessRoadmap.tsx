'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  FileCheck,
  Sparkles,
  Video,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

type HomeSuccessRoadmapProps = {
  isLight: boolean;
  onOpenFlashcards: () => void;
};

export function HomeSuccessRoadmap({
  isLight,
  onOpenFlashcards,
}: HomeSuccessRoadmapProps) {
  const steps = [
    {
      step: '01',
      title: 'Konuyu Keşfet',
      desc: 'Müfredatla %100 uyumlu özet ders notları ve video anlatımlarla temeli sağlam at.',
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-400',
      actionLabel: 'Notları İncele',
      href: '/icerikler?type=ders-notu',
    },
    {
      step: '02',
      title: 'Soru ve Test Çöz',
      desc: 'Yaprak testler ve interaktif denemeleri çöz, karalama tahtasında işlemlerini yap.',
      icon: FileCheck,
      gradient: 'from-purple-500 to-pink-500',
      actionLabel: 'Testlere Başla',
      href: '/testler',
    },
    {
      step: '03',
      title: 'Formülleri Pekiştir',
      desc: '3D çevrilebilir bilgi kartlarıyla LGS ve YKS kurallarını hızla hafızana kazı.',
      icon: Sparkles,
      gradient: 'from-amber-400 to-orange-500',
      actionLabel: 'Formül Kartları',
      onClick: onOpenFlashcards,
    },
    {
      step: '04',
      title: 'Canlı Ders & Destek',
      desc: 'Uğur Hoca ile canlı derslere katıl, takıldığın soruları mesajla anında sor.',
      icon: Video,
      gradient: 'from-emerald-400 to-teal-500',
      actionLabel: 'Canlı Dersler',
      href: '/canli-ders',
    },
  ];

  return (
    <section className="relative px-4 py-8 sm:py-10">
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 text-xs font-bold text-brand-primary-soft">
            <GraduationCap className="h-4 w-4" />
            2026-2027 Başarı Yol Haritası
          </div>
          <h2
            className={`font-display text-2xl font-black sm:text-4xl ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            4 Adımda Matematik Başarını Zirveye Taşı
          </h2>
          <p
            className={`mx-auto mt-2 max-w-xl text-xs sm:text-base ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Yeni eğitim yılında düzenli çalış, eksiklerini anında kapat ve hedeflerine adım adım ulaş.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition-all duration-300 ${
                isLight
                  ? 'border-slate-200 bg-white shadow-lg'
                  : 'border-white/10 bg-slate-900/60 backdrop-blur-md'
              }`}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`font-display text-2xl font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}
                  >
                    {item.step}
                  </span>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-md`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>

                <h3
                  className={`font-display text-lg font-bold mb-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                {item.href ? (
                  <Link
                    href={item.href}
                    prefetch={false}
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98] ${
                      isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{item.actionLabel}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98] ${
                      isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{item.actionLabel}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
