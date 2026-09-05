'use client';

import { useState, useEffect, useId, useMemo } from 'react';
import {
  Timer,
  X,
  RotateCcw,
  Printer,
  Check,
  Info,
  Sparkles,
  Zap,
  BookmarkCheck,
  Clock,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

export type ExamPacingStrategyModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type ExamPacingType = 'lgs' | 'tyt';

export type LgsPacingState = {
  matematik: number; // varsayılan 45 dk (20 soru)
  fen: number; // varsayılan 25 dk (20 soru)
  turlama: number; // varsayılan 10 dk
};

export type TytPacingState = {
  turkce: number; // varsayılan 45 dk (40 soru)
  matematik: number; // varsayılan 60 dk (40 soru)
  fen: number; // varsayılan 25 dk (20 soru)
  sosyal: number; // varsayılan 20 dk (20 soru)
  turlama: number; // varsayılan 15 dk
};

const DEFAULT_LGS: LgsPacingState = {
  matematik: 45,
  fen: 25,
  turlama: 10,
};

const DEFAULT_TYT: TytPacingState = {
  turkce: 45,
  matematik: 60,
  fen: 25,
  sosyal: 20,
  turlama: 15,
};

const STORAGE_KEY = 'ugurhoca_exam_pacing_strategy_v1';

export function ExamPacingStrategyModal({ isOpen, onClose }: ExamPacingStrategyModalProps) {
  const [activeTab, setActiveTab] = useState<ExamPacingType>('lgs');
  const [lgsPacing, setLgsPacing] = useState<LgsPacingState>(DEFAULT_LGS);
  const [tytPacing, setTytPacing] = useState<TytPacingState>(DEFAULT_TYT);
  const [savedNotice, setSavedNotice] = useState(false);

  const titleId = useId();
  const descId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  // Yerel hafızadan yükle
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.lgs) setLgsPacing(parsed.lgs);
        if (parsed.tyt) setTytPacing(parsed.tyt);
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  const handleSaveStrategy = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lgs: lgsPacing, tyt: tytPacing })
      );
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleResetDefaults = () => {
    if (activeTab === 'lgs') {
      setLgsPacing(DEFAULT_LGS);
    } else {
      setTytPacing(DEFAULT_TYT);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Toplam süre ve limit kontrolleri
  const lgsTotal = lgsPacing.matematik + lgsPacing.fen + lgsPacing.turlama;
  const tytTotal =
    tytPacing.turkce +
    tytPacing.matematik +
    tytPacing.fen +
    tytPacing.sosyal +
    tytPacing.turlama;

  const currentTotal = activeTab === 'lgs' ? lgsTotal : tytTotal;
  const maxOfficialTime = activeTab === 'lgs' ? 80 : 165;
  const remainingTime = maxOfficialTime - currentTotal;

  // LGS Soru başı süre
  const lgsMetrics = useMemo(() => {
    const matSecPerQ = (lgsPacing.matematik * 60) / 20;
    const fenSecPerQ = (lgsPacing.fen * 60) / 20;
    return { matSecPerQ, fenSecPerQ };
  }, [lgsPacing]);

  // TYT Soru başı süre
  const tytMetrics = useMemo(() => {
    const turkceSec = (tytPacing.turkce * 60) / 40;
    const matSec = (tytPacing.matematik * 60) / 40;
    const fenSec = (tytPacing.fen * 60) / 20;
    const sosyalSec = (tytPacing.sosyal * 60) / 20;
    return { turkceSec, matSec, fenSec, sosyalSec };
  }, [tytPacing]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-strategy-area, .print-strategy-area * { visibility: visible !important; }
          .print-strategy-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 10mm !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div
        ref={modalRef}
        tabIndex={-1}
        className="print-strategy-area relative flex h-full max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl text-slate-100 focus:outline-none"
      >
        {/* Üst Başlık */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-inner">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <h2 id={titleId} className="font-display text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Sınav Bölüm Süresi & Zaman Yönetimi</span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  Simülatör
                </span>
              </h2>
              <p id={descId} className="text-xs text-slate-400">
                Sınavda panik yaşamamak için ders bazlı dakika dağılımını ve turlama payını planla
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={handlePrint}
              title="A4 Strateji Çıktısı Al"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Modalı kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sekme Değiştirici: LGS vs TYT */}
        <div className="px-5 pt-4 pb-1 no-print">
          <div className="flex rounded-2xl bg-slate-950/60 p-1 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('lgs')}
              className={`flex flex-1 items-center justify-center gap-2 py-2 rounded-xl transition ${
                activeTab === 'lgs'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>LGS Sayısal (80 Dk / 40 Soru)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tyt')}
              className={`flex flex-1 items-center justify-center gap-2 py-2 rounded-xl transition ${
                activeTab === 'tyt'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>YKS TYT (165 Dk / 120 Soru)</span>
            </button>
          </div>
        </div>

        {/* İçerik Alanı (Kaydırılabilir) */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 [scrollbar-width:thin]">
          {/* Süre Dengesi & İlerleme Çubuğu */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Planlanan Toplam Süre:{' '}
                <strong
                  className={`text-sm font-mono font-bold ${
                    remainingTime < 0
                      ? 'text-rose-400'
                      : remainingTime === 0
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {currentTotal} / {maxOfficialTime} Dk
                </strong>
              </span>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  remainingTime < 0
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : remainingTime === 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {remainingTime < 0
                  ? `${Math.abs(remainingTime)} Dk Süre Aşımı!`
                  : remainingTime === 0
                  ? 'Süre Tam Dengelendi ✓'
                  : `${remainingTime} Dk Boş Rezerv Var`}
              </span>
            </div>

            {/* Renkli Dağılım Çubuğu */}
            <div className="h-3 w-full rounded-full overflow-hidden bg-slate-800 flex shadow-inner">
              {activeTab === 'lgs' ? (
                <>
                  <div
                    style={{ width: `${(lgsPacing.matematik / maxOfficialTime) * 100}%` }}
                    className="bg-emerald-500 transition-all duration-300"
                    title={`Matematik: ${lgsPacing.matematik} Dk`}
                  />
                  <div
                    style={{ width: `${(lgsPacing.fen / maxOfficialTime) * 100}%` }}
                    className="bg-cyan-500 transition-all duration-300"
                    title={`Fen Bilimleri: ${lgsPacing.fen} Dk`}
                  />
                  <div
                    style={{ width: `${(lgsPacing.turlama / maxOfficialTime) * 100}%` }}
                    className="bg-amber-500 transition-all duration-300"
                    title={`Turlama Payı: ${lgsPacing.turlama} Dk`}
                  />
                </>
              ) : (
                <>
                  <div
                    style={{ width: `${(tytPacing.turkce / maxOfficialTime) * 100}%` }}
                    className="bg-blue-500 transition-all duration-300"
                    title={`Türkçe: ${tytPacing.turkce} Dk`}
                  />
                  <div
                    style={{ width: `${(tytPacing.matematik / maxOfficialTime) * 100}%` }}
                    className="bg-emerald-500 transition-all duration-300"
                    title={`Matematik: ${tytPacing.matematik} Dk`}
                  />
                  <div
                    style={{ width: `${(tytPacing.fen / maxOfficialTime) * 100}%` }}
                    className="bg-cyan-500 transition-all duration-300"
                    title={`Fen: ${tytPacing.fen} Dk`}
                  />
                  <div
                    style={{ width: `${(tytPacing.sosyal / maxOfficialTime) * 100}%` }}
                    className="bg-orange-500 transition-all duration-300"
                    title={`Sosyal: ${tytPacing.sosyal} Dk`}
                  />
                  <div
                    style={{ width: `${(tytPacing.turlama / maxOfficialTime) * 100}%` }}
                    className="bg-amber-500 transition-all duration-300"
                    title={`Turlama Payı: ${tytPacing.turlama} Dk`}
                  />
                </>
              )}
            </div>
          </div>

          {/* LGS Ayarları */}
          {activeTab === 'lgs' && (
            <div className="space-y-3">
              {/* Matematik */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span>Matematik (20 Soru)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                      {lgsPacing.matematik} Dakika
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      ~{Math.round(lgsMetrics.matSecPerQ)} sn / soru
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="25"
                  max="60"
                  step="1"
                  value={lgsPacing.matematik}
                  onChange={(e) =>
                    setLgsPacing((p) => ({ ...p, matematik: Number(e.target.value) }))
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                  aria-label="LGS Matematik süresi (dakika)"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Minimum 25 dk (75 sn/soru)</span>
                  <span className="text-emerald-300 font-medium">Önerilen: 45 dk (135 sn/soru)</span>
                  <span>Maksimum 60 dk (180 sn/soru)</span>
                </div>
              </div>

              {/* Fen Bilimleri */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <span>Fen Bilimleri (20 Soru)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                      {lgsPacing.fen} Dakika
                    </span>
                    <span className="text-[11px] font-semibold text-cyan-400">
                      ~{Math.round(lgsMetrics.fenSecPerQ)} sn / soru
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  step="1"
                  value={lgsPacing.fen}
                  onChange={(e) =>
                    setLgsPacing((p) => ({ ...p, fen: Number(e.target.value) }))
                  }
                  className="w-full accent-cyan-500 cursor-pointer"
                  aria-label="LGS Fen Bilimleri süresi (dakika)"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Minimum 15 dk (45 sn/soru)</span>
                  <span className="text-cyan-300 font-medium">Önerilen: 25 dk (75 sn/soru)</span>
                  <span>Maksimum 45 dk (135 sn/soru)</span>
                </div>
              </div>

              {/* Turlama ve Kontrol Payı */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Turlama & Geriye Dönüş Payı</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                    {lgsPacing.turlama} Dakika
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={lgsPacing.turlama}
                  onChange={(e) =>
                    setLgsPacing((p) => ({ ...p, turlama: Number(e.target.value) }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                  aria-label="LGS Turlama süresi (dakika)"
                />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  İlk turda boş bıraktığın zor sorulara dönmek ve optik işaretlemeleri son kez kontrol etmek için ayrılan altın rezerv süredir.
                </p>
              </div>
            </div>
          )}

          {/* TYT Ayarları */}
          {activeTab === 'tyt' && (
            <div className="space-y-3">
              {/* Türkçe */}
              <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-blue-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                    <span>Türkçe (40 Soru)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                      {tytPacing.turkce} Dakika
                    </span>
                    <span className="text-[11px] font-semibold text-blue-400">
                      ~{Math.round(tytMetrics.turkceSec)} sn / soru
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="30"
                  max="65"
                  step="1"
                  value={tytPacing.turkce}
                  onChange={(e) =>
                    setTytPacing((p) => ({ ...p, turkce: Number(e.target.value) }))
                  }
                  className="w-full accent-blue-500 cursor-pointer"
                  aria-label="TYT Türkçe süresi (dakika)"
                />
              </div>

              {/* Temel Matematik */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span>Temel Matematik (40 Soru)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                      {tytPacing.matematik} Dakika
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      ~{Math.round(tytMetrics.matSec)} sn / soru
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="40"
                  max="80"
                  step="1"
                  value={tytPacing.matematik}
                  onChange={(e) =>
                    setTytPacing((p) => ({ ...p, matematik: Number(e.target.value) }))
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                  aria-label="TYT Matematik süresi (dakika)"
                />
              </div>

              {/* Fen Bilimleri */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <span>Fen Bilimleri (20 Soru)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                      {tytPacing.fen} Dakika
                    </span>
                    <span className="text-[11px] font-semibold text-cyan-400">
                      ~{Math.round(tytMetrics.fenSec)} sn / soru
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="15"
                  max="40"
                  step="1"
                  value={tytPacing.fen}
                  onChange={(e) =>
                    setTytPacing((p) => ({ ...p, fen: Number(e.target.value) }))
                  }
                  className="w-full accent-cyan-500 cursor-pointer"
                  aria-label="TYT Fen Bilimleri süresi (dakika)"
                />
              </div>

              {/* Sosyal Bilimler */}
              <div className="rounded-2xl border border-orange-500/20 bg-orange-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-orange-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                    <span>Sosyal Bilimler (20 Soru)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                      {tytPacing.sosyal} Dakika
                    </span>
                    <span className="text-[11px] font-semibold text-orange-400">
                      ~{Math.round(tytMetrics.sosyalSec)} sn / soru
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="12"
                  max="35"
                  step="1"
                  value={tytPacing.sosyal}
                  onChange={(e) =>
                    setTytPacing((p) => ({ ...p, sosyal: Number(e.target.value) }))
                  }
                  className="w-full accent-orange-500 cursor-pointer"
                  aria-label="TYT Sosyal Bilimler süresi (dakika)"
                />
              </div>

              {/* Turlama Payı */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Turlama & Rezerv Süre</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                    {tytPacing.turlama} Dakika
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={tytPacing.turlama}
                  onChange={(e) =>
                    setTytPacing((p) => ({ ...p, turlama: Number(e.target.value) }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                  aria-label="TYT Turlama süresi (dakika)"
                />
              </div>
            </div>
          )}

          {/* Pedagojik Strateji İpuçları */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3.5 flex items-start gap-2.5 text-xs text-slate-300">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px]">
              <strong className="text-white block font-medium">Uğur Hoca Pedagojik Zaman Kuralı:</strong>
              <p className="text-slate-400 leading-relaxed">
                Bir soruda 2. dakikayı aştığında çözüme yaklaşamadıysan hemen yanına işaret koyup sonraki soruya geçmelisin. 
                Turlama payı (10-15 dk), sınavın sonunda zihnin açılmışken o soruları çok daha hızlı çözmeni sağlar.
              </p>
            </div>
          </div>
        </div>

        {/* Alt Eylemler */}
        <div className="border-t border-white/10 px-5 py-3.5 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Varsayılan Temposu</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveStrategy}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                savedNotice
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {savedNotice ? <Check className="h-4 w-4" /> : <BookmarkCheck className="h-4 w-4" />}
              <span>{savedNotice ? 'Strateji Kaydedildi!' : 'Stratejimi Kaydet'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
