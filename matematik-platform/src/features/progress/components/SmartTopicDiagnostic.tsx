'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  ArrowRight,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import {
  getSavedMistakes,
  MISTAKE_REASON_LABELS,
  type SavedMistakeQuestion,
  type MistakeReason,
} from '@/features/quizzes/lib/mistakeStorage';
import type { ProgressRow } from '@/features/progress/types';

type SmartTopicDiagnosticProps = {
  isLight: boolean;
  progressData?: ProgressRow[];
  onStartRecoveryQuiz?: () => void;
};

export function SmartTopicDiagnostic({
  isLight,
  progressData: _progressData = [],
  onStartRecoveryQuiz,
}: SmartTopicDiagnosticProps) {
  const [mistakes, setMistakes] = useState<SavedMistakeQuestion[]>([]);

  useEffect(() => {
    setMistakes(getSavedMistakes());

    const handleUpdate = () => {
      setMistakes(getSavedMistakes());
    };
    window.addEventListener('ugurhoca:mistakes-updated', handleUpdate);
    return () => window.removeEventListener('ugurhoca:mistakes-updated', handleUpdate);
  }, []);

  const diagnosticResult = useMemo(() => {
    const unmastered = mistakes.filter((m) => !m.mastered);
    if (unmastered.length === 0) {
      return null;
    }

    // 1. Sebep Dağılımı
    const reasonCounts: Record<MistakeReason, number> = {
      concept: 0,
      careless: 0,
      reading: 0,
      time: 0,
    };

    // 2. Konu / Test Dağılımı
    const topicCounts: Record<string, number> = {};

    unmastered.forEach((m) => {
      if (m.reason && reasonCounts[m.reason] !== undefined) {
        reasonCounts[m.reason]++;
      }
      const topic = m.quizTitle || 'Genel Matematik';
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    // En çok hata yapılan konu
    let topTopic = 'Genel Matematik';
    let maxTopicCount = 0;
    Object.entries(topicCounts).forEach(([t, count]) => {
      if (count > maxTopicCount) {
        maxTopicCount = count;
        topTopic = t;
      }
    });

    // En sık rastlanan hata nedeni
    let topReason: MistakeReason = 'concept';
    let maxReasonCount = -1;
    for (const r of Object.keys(reasonCounts) as MistakeReason[]) {
      if (reasonCounts[r] > maxReasonCount) {
        maxReasonCount = reasonCounts[r];
        topReason = r;
      }
    }

    // Tavsiye & Strateji metni
    let recommendationTitle = 'Kural ve Formül Pekiştirme';
    let recommendationText =
      'Yanlışlarının çoğu kural ve formül eksikliğinden kaynaklanıyor. Soruyu çözmeye başlamadan önce ilgili formülü kenara yazmak hata oranını %80 azaltır.';
    let actionTip = 'Formül kartlarını incele ve konuyu 1 kez tekrar et.';

    if (topReason === 'careless') {
      recommendationTitle = 'İşlem Disiplini & Adım Takibi';
      recommendationText =
        'Hataların büyük kısmı işaret ve toplama-çıkarma gibi dikkatsizliklerden oluşuyor. Karalama tahtasını kullanarak basamakları atlamadan yazmak kesin çözümdür.';
      actionTip = 'İşlemleri kafadan yapmak yerine karalama tahtasına basamak basamak yaz.';
    } else if (topReason === 'reading') {
      recommendationTitle = 'Soru Kökü Odaklanması';
      recommendationText =
        'Sorularda "...olamaz?", "...kesinlikle doğrudur?" gibi olumsuz ve kısıtlayıcı ifadelere dikkat etmek gerekiyor. Soru kökünü iki kez okuyup altını çizmelisin.';
      actionTip = 'Sorunun son kelimesini okumadan şıklara geçme.';
    } else if (topReason === 'time') {
      recommendationTitle = 'Süre Yönetimi ve Tur Taktikleri';
      recommendationText =
        'Zor sorulara takılıp kalmak süreni tüketiyor. 1 dakika içinde fikir yürütemediğin soruyu işaretleyip turlama taktiğiyle bir sonraki soruya geçmelisin.';
      actionTip = 'Turlama taktiğini uygula; ilk turda sadece yapabildiklerini çöz.';
    }

    return {
      unmasteredCount: unmastered.length,
      topTopic,
      maxTopicCount,
      topReason,
      reasonCounts,
      recommendationTitle,
      recommendationText,
      actionTip,
    };
  }, [mistakes]);

  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 transition-all ${
        isLight
          ? 'bg-white border-slate-200 shadow-sm'
          : 'bg-slate-800/60 border-slate-700/80 shadow-xl backdrop-blur-md'
      }`}
    >
      {/* Başlık & İkon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 border border-rose-500/25">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-display text-lg sm:text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Kişiselleştirilmiş Eksik Reçetesi
              </h2>
              <span className="rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Akıllı Teşhis 🩺
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Hatalarından öğren: Yanlış defteri verilerinle hazırlanan özel çalışma reçetesi.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Brain className="h-3.5 w-3.5" />
          <span>Pedagojik Analiz</span>
        </div>
      </div>

      {!diagnosticResult ? (
        /* Temiz Durum (Yanlış yok) */
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className={`font-bold text-base ${isLight ? 'text-slate-800' : 'text-white'}`}>
            Harika! Şu Anda Bekleyen Bir Eksik Teşhisi Yok
          </h3>
          <p className={`max-w-md text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Yanlış defterinde henüz telafi edilmemiş bir hata bulunmuyor. Testler çözdükçe akıllı sistem hatalarını analiz edip sana özel çalışma planı üretecektir.
          </p>
          <Link
            href="/testler"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Test Çözmeye Başla</span>
          </Link>
        </div>
      ) : (
        /* Teşhis ve Reçete Paneli */
        <div className="space-y-4">
          {/* Teşhis Özeti Kartı */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between ${
              isLight ? 'bg-rose-50/70 border-rose-200/80' : 'bg-rose-950/20 border-rose-500/30'
            }`}
          >
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Öncelikli Gelişim Alanı: {diagnosticResult.topTopic}
                </span>
              </div>
              <p className={`text-sm font-semibold leading-snug ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {diagnosticResult.unmasteredCount} bekleyen sorunun içinde en belirgin kök neden:{' '}
                <span className="text-rose-600 dark:text-rose-300 font-bold underline decoration-rose-400 underline-offset-2">
                  {MISTAKE_REASON_LABELS[diagnosticResult.topReason].label}
                </span>
                .
              </p>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {diagnosticResult.recommendationText}
              </p>
            </div>

            {/* Aksiyon Butonu */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
              {onStartRecoveryQuiz ? (
                <button
                  type="button"
                  onClick={onStartRecoveryQuiz}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Telafi Testini Çöz ({diagnosticResult.unmasteredCount} Soru)</span>
                </button>
              ) : (
                <Link
                  href="/testler"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Testlerde Telafi Et</span>
                </Link>
              )}
            </div>
          </div>

          {/* 3 Adımlı İyileşme Reçetesi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Adım 1 */}
            <div
              className={`rounded-2xl border p-3.5 flex flex-col justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-white/5'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Adım 1: Teori & Formül
                </span>
                <h4 className={`text-xs font-bold mt-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  {diagnosticResult.recommendationTitle}
                </h4>
                <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {diagnosticResult.actionTip}
                </p>
              </div>
              <div className="mt-3 text-right">
                <Link
                  href="/icerikler"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
                >
                  <span>Ders Videoları</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Adım 2 */}
            <div
              className={`rounded-2xl border p-3.5 flex flex-col justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-white/5'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Adım 2: Yanlış Defteri
                </span>
                <h4 className={`text-xs font-bold mt-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  {diagnosticResult.maxTopicCount} Soru Bu Konuda Bekliyor
                </h4>
                <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Bu soruları tekrar çözüp &quot;Öğrendim&quot; olarak işaretleyene kadar reçete aktif kalır.
                </p>
              </div>
              <div className="mt-3 text-right">
                <Link
                  href="/testler"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300"
                >
                  <span>Deftere Git</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Adım 3 */}
            <div
              className={`rounded-2xl border p-3.5 flex flex-col justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-white/5'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Adım 3: İlerleme
                </span>
                <h4 className={`text-xs font-bold mt-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  Gelişim Radarında Takip
                </h4>
                <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Her telafi sorusu, konunun ustalık yüzdesini doğrudan yukarı çeker.
                </p>
              </div>
              <div className="mt-3 text-right">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center justify-end gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Sürekli Güncel</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SmartTopicDiagnostic;
