'use client';

import { useState, useEffect, useId } from 'react';
import {
  X,
  Download,
  Trash2,
  Play,
  Wifi,
  WifiOff,
  HardDrive,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  getOfflinePackages,
  removeOfflinePackage,
  saveOfflinePackage,
  clearAllOfflinePackages,
  type OfflineQuizPackage,
} from '../lib/offlineQuizPackageStorage';

const SAMPLE_PRESET_PACKAGES: OfflineQuizPackage[] = [
  {
    id: 'offline-carpanlar-8',
    title: 'LGS Çarpanlar ve Katlar Çevrimdışı Soru Seti',
    topic: 'CarpanlarVeKatlar',
    grade: '8',
    questionsCount: 15,
    downloadedAt: new Date().toISOString(),
    sizeKb: 180,
    questions: [
      {
        id: 'off-q1',
        quiz_id: 'offline-carpanlar-8',
        question: '72 ile 96 sayılarının EBOB\'u kaçtır?',
        options: ['12', '16', '24', '48'],
        correct_index: 2,
        question_order: 1,
        created_at: '2026-09-06T12:00:00Z',
        explanation: '72 = 2^3 * 3^2, 96 = 2^5 * 3. EBOB = 2^3 * 3 = 24.',
      },
      {
        id: 'off-q2',
        quiz_id: 'offline-carpanlar-8',
        question: 'Aralarında asal iki sayının EKOK\'u 120 ise bu sayıların toplamı en az kaçtır?',
        options: ['21', '23', '26', '62'],
        correct_index: 1,
        question_order: 2,
        created_at: '2026-09-06T12:00:00Z',
        explanation: 'Aralarında asal iki sayının çarpımı EKOK\'tur. 15 * 8 = 120, aralarında asaldır. Toplam: 15 + 8 = 23.',
      },
    ],
  },
  {
    id: 'offline-koklu-sayilar-8',
    title: 'LGS Kareköklü İfadeler Hızlı Tekrar Seti',
    topic: 'KarekokluIfadeler',
    grade: '8',
    questionsCount: 20,
    downloadedAt: new Date().toISOString(),
    sizeKb: 210,
    questions: [
      {
        id: 'off-q3',
        quiz_id: 'offline-koklu-sayilar-8',
        question: '√180 sayısı a√b şeklinde yazıldığında a + b değeri kaç olabilir?',
        options: ['11', '14', '23', '28'],
        correct_index: 0,
        question_order: 1,
        created_at: '2026-09-06T12:00:00Z',
        explanation: '√180 = √(36 * 5) = 6√5. a = 6, b = 5 ise a + b = 11.',
      },
    ],
  },
  {
    id: 'offline-ucgenler-8',
    title: 'LGS Üçgenler ve Pisagor Bağıntısı Özel Seti',
    topic: 'Ucgenler',
    grade: '8',
    questionsCount: 12,
    downloadedAt: new Date().toISOString(),
    sizeKb: 165,
    questions: [
      {
        id: 'off-q4',
        quiz_id: 'offline-ucgenler-8',
        question: 'Dik kenar uzunlukları 9 cm ve 12 cm olan dik üçgenin hipotenüs uzunluğu kaç cm\'dir?',
        options: ['13', '14', '15', '18'],
        correct_index: 2,
        question_order: 1,
        created_at: '2026-09-06T12:00:00Z',
        explanation: '3-4-5 özel üçgeninin 3 katı: 9-12-15 cm bulunur.',
      },
    ],
  },
];

type OfflineStudyPackageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartOfflineQuiz?: (pkg: OfflineQuizPackage) => void;
};

export function OfflineStudyPackageModal({
  isOpen,
  onClose,
  onStartOfflineQuiz,
}: OfflineStudyPackageModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [packages, setPackages] = useState<OfflineQuizPackage[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPackages(getOfflinePackages());
    }
  }, [isOpen]);

  const handleDownloadPreset = (preset: OfflineQuizPackage) => {
    saveOfflinePackage(preset);
    setPackages(getOfflinePackages());
  };

  const handleDelete = (id: string) => {
    removeOfflinePackage(id);
    setPackages(getOfflinePackages());
  };

  const handleClearAll = () => {
    if (confirm('Tüm çevrimdışı çalışma setlerini cihazınızdan silmek istediğinize emin misiniz?')) {
      clearAllOfflinePackages();
      setPackages([]);
    }
  };

  if (!isOpen) return null;

  const totalSizeKb = packages.reduce((acc, p) => acc + (p.sizeKb || 0), 0);

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={modalRef}
        className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/10 bg-slate-900 text-white shadow-2xl overflow-hidden"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-base font-bold tracking-tight text-white">
                  Çevrimdışı Çalışma Modu
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isOnline
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isOnline ? (
                    <>
                      <Wifi className="w-3 h-3" /> Çevrimiçi
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" /> Çevrimdışı Mod
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Testleri önceden indirin; internet bağlantınız olmadan çözün, bağlanınca otomatik senkronize edilsin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Depolama & Durum Özeti */}
        <div className="p-4 border-b border-white/10 bg-slate-950/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-300">
              İndirilen Setler: <strong>{packages.length}</strong>
            </span>
            <span className="text-slate-400">
              Cihaz Depolaması: <strong>~{totalSizeKb} KB</strong>
            </span>
          </div>

          {packages.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 transition underline underline-offset-2"
            >
              Hepsini Temizle
            </button>
          )}
        </div>

        {/* Liste & Hazır Öneriler */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Cihazdaki İndirilmiş Setler */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cihazınızda Hazır Soru Setleri
            </h3>

            {packages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center">
                <HardDrive className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">Henüz indirilmiş bir soru seti yok</p>
                <p className="text-xs text-slate-500 mt-1">
                  Aşağıdaki önerilen soru setlerinden birini indirerek internetsiz çözmeye başlayabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          {pkg.grade}. Sınıf
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white">{pkg.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {pkg.questionsCount} Soru • İndirilme: {new Date(pkg.downloadedAt).toLocaleDateString('tr-TR')} • {pkg.sizeKb} KB
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleDelete(pkg.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Cihazdan sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onStartOfflineQuiz) {
                            onStartOfflineQuiz(pkg);
                          }
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Çözmeye Başla</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Önerilen Çevrimdışı Soru Setleri (1 Tıkla İndir) */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Hızlı İndirilebilir Soru Seti Havuzu
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_PRESET_PACKAGES.map((preset) => {
                const isDownloaded = packages.some((p) => p.id === preset.id);

                return (
                  <div
                    key={preset.id}
                    className="p-3 rounded-2xl bg-slate-800/60 border border-white/5 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-amber-400">{preset.grade}. Sınıf</span>
                        <span>{preset.sizeKb} KB</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white leading-snug">{preset.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{preset.questionsCount} Soru & Çözüm Notu</p>
                    </div>

                    <button
                      type="button"
                      disabled={isDownloaded}
                      onClick={() => handleDownloadPreset(preset)}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isDownloaded
                          ? 'bg-white/10 text-emerald-300 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                      }`}
                    >
                      {isDownloaded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cihazda Yüklü
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" /> Çevrimdışı İndir
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfflineStudyPackageModal;
