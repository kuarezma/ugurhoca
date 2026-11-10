'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  GraduationCap,
  Gamepad2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { GUEST_QUESTIONS } from '../data/guestQuestions';
import { GuestQuestionCard } from './GuestQuestionCard';
import { GuestSpeedMathDuel } from './GuestSpeedMathDuel';

export function GuestTrialLobby() {
  const [selectedGrade, setSelectedGrade] = useState<number>(5);

  const currentQuestions = GUEST_QUESTIONS[selectedGrade] || [];

  return (
    <div className="space-y-10">
      {/* Başlık ve Karşılama Kartı */}
      <section className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-bg border border-accent-fg/20 text-accent-fg text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Üye Olmadan Deneme Salonu</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight font-display">
          Uğur Hoca Matematik Dünyasını Keşfet
        </h1>
        <p className="text-sm sm:text-base text-secondary leading-relaxed">
          Giriş yapmadan sınıf düzeyini seç, MEB Türkiye Yüzyılı Maarif Modeli
          ve Ortak Yazılı uyumlu özgün soruları anında çöz. LaTeX çözümlerini ve
          puanlama anahtarlarını incele!
        </p>
      </section>

      {/* Sınıf Seçici Tablar */}
      <section className="space-y-6">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[5, 6, 7, 8].map((grade) => {
            const isSelected = selectedGrade === grade;
            return (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-xs flex items-center gap-2 ${
                  isSelected
                    ? 'bg-accent-bg text-accent-fg ring-2 ring-accent-fg/30 scale-105'
                    : 'bg-surface-1 hover:bg-surface-2 text-secondary border border-border-default'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{grade}. Sınıf Örnekleri</span>
              </button>
            );
          })}
        </div>

        {/* Sorular Listesi */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-tertiary px-1">
            <span>{selectedGrade}. SINIF MEB KAZANIMLI 3 ÖZEL ÖRNEK</span>
            <span>2 Çoktan Seçmeli + 1 MEB Ortak Yazılı Tipi</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestions.map((q, idx) => (
              <GuestQuestionCard key={q.id} question={q} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Hızlı Zihin Matematiği Mini Oyunu */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold text-sm px-1">
          <Gamepad2 className="w-4 h-4 text-accent-fg" />
          <span>Etkileşimli Zihin Matematiği Laboratuvarı</span>
        </div>
        <GuestSpeedMathDuel />
      </section>

      {/* Sıcak Kağıt (Warm Paper) Samimi Çağrı Kartı */}
      <section
        aria-label="Ücretsiz platform çağrısı"
        className="p-8 sm:p-10 rounded-3xl bg-surface-1 border border-border-default shadow-md text-center space-y-6 relative overflow-hidden"
      >
        <div className="max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tone-success-bg border border-tone-success-border text-tone-success-fg text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Tamamen Ücretsiz Matematik Platformu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            Tüm Testlere, Canlı Derslere ve Oyunlara Katıl
          </h2>
          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            Yüzlerce yaprak test, tam deneme sınavları, takma adlı oyun liderlik
            tablosu ve kişisel çalışma takibi için hemen bir hesap oluştur.
            Hiçbir gizli ücret yok, tamamen ücretsiz öğrenci dostu deneyim.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-secondary pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-fg" />
              Öğrenci gizliliği korumalı
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-fg" />
              Rumuzlu oyun tablosu
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-fg" />
              Sınırsız soru çözümü
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/kayit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent-bg text-accent-fg font-bold text-sm shadow-md hover:opacity-90 transition"
          >
            <span>Hemen Ücretsiz Kayıt Ol</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/giris"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-2 border border-border-default text-primary font-bold text-sm hover:bg-surface-3 transition"
          >
            <span>Zaten Hesabım Var</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
