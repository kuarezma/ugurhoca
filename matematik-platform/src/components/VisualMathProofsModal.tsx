'use client';

import { useState, useMemo } from 'react';
import {
  X,
  Compass,
  Lightbulb,
} from 'lucide-react';

export type VisualProofTab = 'pythagoras' | 'difference_of_squares' | 'trig_identity' | 'pascal_binomial';

type VisualMathProofsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
  initialTab?: VisualProofTab;
};

export function VisualMathProofsModal({
  isOpen,
  onClose,
  isLight = false,
  initialTab = 'pythagoras',
}: VisualMathProofsModalProps) {
  const [activeTab, setActiveTab] = useState<VisualProofTab>(initialTab);

  // 1. Pisagor Kontrolleri
  const [pythA, setPythA] = useState(3);
  const [pythB, setPythB] = useState(4);
  const [pythProgress, setPythProgress] = useState(0); // 0 to 100%

  // 2. İki Kare Farkı
  const [diffA, setDiffA] = useState(6);
  const [diffB, setDiffB] = useState(2);
  const [diffStep, setDiffStep] = useState(0); // 0 to 100%

  // 3. Trigonometri
  const [trigAngle, setTrigAngle] = useState(35); // degrees 0-360

  // 4. Pascal & Binom
  const [binomialPower, setBinomialPower] = useState(3); // 0 to 5

  // Pisagor hesapları
  const pythC = useMemo(() => Math.sqrt(pythA * pythA + pythB * pythB), [pythA, pythB]);
  const pythAreaA = pythA * pythA;
  const pythAreaB = pythB * pythB;

  // İki kare farkı hesapları
  const safeDiffB = Math.min(diffB, diffA - 1);
  const diffAreaOrig = diffA * diffA - safeDiffB * safeDiffB;
  const diffFactored = (diffA - safeDiffB) * (diffA + safeDiffB);

  // Trigonometri hesapları
  const trigRad = (trigAngle * Math.PI) / 180;
  const cosVal = Math.cos(trigRad);
  const sinVal = Math.sin(trigRad);
  const cosSq = cosVal * cosVal;
  const sinSq = sinVal * sinVal;

  // Pascal üçgeni satırları (n = 0 to 5)
  const PASCAL_ROWS = [
    [1],
    [1, 1],
    [1, 2, 1],
    [1, 3, 3, 1],
    [1, 4, 6, 4, 1],
    [1, 5, 10, 10, 5, 1],
  ];

  const BINOMIAL_EXPANSIONS = [
    '1',
    'a + b',
    'a^2 + 2ab + b^2',
    'a^3 + 3a^2b + 3ab^2 + b^3',
    'a^4 + 4a^3b + 6a^2b^2 + 4ab^3 + b^4',
    'a^5 + 5a^4b + 10a^3b^2 + 10a^2b^3 + 5ab^4 + b^5',
  ];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="İnteraktif Görsel Formül İspatları"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-md overflow-y-auto"
    >
      <div
        className={`relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border shadow-2xl transition-all my-auto max-h-[95vh] ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-white/15 text-slate-100'
        }`}
      >
        {/* Üst Başlık & Sekmeler */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-lg font-bold">
                  İnteraktif Görsel Formül İspatları
                </h2>
                <span className="rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Görsel Deney 🔬
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Ezberleme, neden öyle olduğunu kendi gözlerinle gör!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="İspat penceresini kapat"
            className={`rounded-xl p-2 transition ${
              isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sekme Seçici */}
        <div
          className={`flex overflow-x-auto border-b px-3 sm:px-6 py-2 gap-1.5 scrollbar-none ${
            isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/40 border-white/10'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('pythagoras')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'pythagoras'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📐 Pisagor Teoremi (a² + b² = c²)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('difference_of_squares')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'difference_of_squares'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ✂️ İki Kare Farkı (a² - b²)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trig_identity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'trig_identity'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ⭕ sin²θ + cos²θ = 1
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pascal_binomial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'pascal_binomial'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🔺 Pascal & (a + b)ⁿ
          </button>
        </div>

        {/* Sekme İçerikleri */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: PİSAGOR */}
          {activeTab === 'pythagoras' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Sol İnteraktif SVG */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950 p-4 min-h-[300px]">
                  <svg viewBox="0 0 400 320" className="w-full max-h-[320px] select-none">
                    {/* Koordinat merkezli üçgen ve kareler */}
                    {/* Dik üçgen: Köşeler (150, 200), (150 + pythA*22, 200), (150, 200 - pythB*22) */}
                    {(() => {
                      const scale = 20;
                      const ox = 150;
                      const oy = 210;
                      const ax = ox + pythA * scale;
                      const by = oy - pythB * scale;

                      return (
                        <g>
                          {/* Kenar A Karesi (Alt) */}
                          <rect
                            x={ox}
                            y={oy}
                            width={pythA * scale}
                            height={pythA * scale}
                            fill="#3b82f6"
                            fillOpacity="0.4"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            rx="3"
                          />
                          <text
                            x={ox + (pythA * scale) / 2}
                            y={oy + (pythA * scale) / 2 + 5}
                            textAnchor="middle"
                            fill="#93c5fd"
                            fontSize="13"
                            fontWeight="bold"
                          >
                            a² = {pythAreaA}
                          </text>

                          {/* Kenar B Karesi (Sol) */}
                          <rect
                            x={ox - pythB * scale}
                            y={by}
                            width={pythB * scale}
                            height={pythB * scale}
                            fill="#10b981"
                            fillOpacity="0.4"
                            stroke="#10b981"
                            strokeWidth="2"
                            rx="3"
                          />
                          <text
                            x={ox - (pythB * scale) / 2}
                            y={by + (pythB * scale) / 2 + 5}
                            textAnchor="middle"
                            fill="#6ee7b7"
                            fontSize="13"
                            fontWeight="bold"
                          >
                            b² = {pythAreaB}
                          </text>

                          {/* Hipotenüs Karesi C (Eğimli alan) */}
                          {/* İspat dönüşüm animasyonu ile renk yoğunluğu artar */}
                          <polygon
                            points={`${ox},${by} ${ax},${oy} ${ax + (oy - by)},${oy - (ax - ox)} ${ox + (oy - by)},${by - (ax - ox)}`}
                            fill="#f59e0b"
                            fillOpacity={0.25 + (pythProgress / 100) * 0.45}
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeDasharray={pythProgress < 50 ? '4 2' : 'none'}
                          />
                          <text
                            x={ox + (pythA * scale) / 2 + 30}
                            y={by - 10}
                            textAnchor="middle"
                            fill="#fcd34d"
                            fontSize="13"
                            fontWeight="bold"
                          >
                            c² = {pythAreaA + pythAreaB}
                          </text>

                          {/* Ana Dik Üçgen */}
                          <polygon
                            points={`${ox},${oy} ${ax},${oy} ${ox},${by}`}
                            fill="#a855f7"
                            fillOpacity="0.8"
                            stroke="#ffffff"
                            strokeWidth="2.5"
                          />

                          {/* Dik Açı Sembolü */}
                          <rect
                            x={ox}
                            y={oy - 12}
                            width="12"
                            height="12"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                          <circle cx={ox + 6} cy={oy - 6} r="1.5" fill="#ffffff" />
                        </g>
                      );
                    })()}
                  </svg>
                  <span className="text-[11px] text-slate-400 mt-2">
                    Mavi alan (a²) + Yeşil alan (b²) = Sarı hipotenüs alanı (c²)
                  </span>
                </div>

                {/* Sağ Kontrol Paneli */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Kenar Uzunluklarını Değiştir:
                    </span>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-blue-400">a Kenarı (Yatay): {pythA} birim</span>
                        <span className="text-slate-400">a² = {pythAreaA}</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="6"
                        value={pythA}
                        onChange={(e) => setPythA(parseInt(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-400">b Kenarı (Dikey): {pythB} birim</span>
                        <span className="text-slate-400">b² = {pythAreaB}</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="6"
                        value={pythB}
                        onChange={(e) => setPythB(parseInt(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-amber-400">Alan Birleşim İspat Seviyesi (%{pythProgress})</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={pythProgress}
                        onChange={(e) => setPythProgress(parseInt(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* Canlı Eşitlik Kartı */}
                  <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/25 p-4 text-center">
                    <div className="text-xs font-semibold text-indigo-300 mb-1">
                      Pisagor Özdeşliği Doğrulaması:
                    </div>
                    <div className="text-lg sm:text-xl font-mono font-black text-white">
                      <span className="text-blue-400">{pythAreaA}</span> +{' '}
                      <span className="text-emerald-400">{pythAreaB}</span> ={' '}
                      <span className="text-amber-400">{pythAreaA + pythAreaB}</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      c = √{pythAreaA + pythAreaB} ≈ {pythC.toFixed(2)} birim
                    </div>
                  </div>
                </div>
              </div>

              {/* Pedagojik Açıklama */}
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-200">
                  <strong className="text-amber-300">Uğur Hoca Pedagojik İpucu:</strong> Pisagor teoremi bir sayı oyunu değil, <strong>alan korunumudur</strong>. İki dik kenar üzerine kurulan karelerin toplam yüzey alanı, daima hipotenüs üzerine kurulan karenin yüzey alanına birebir eşittir.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: İKİ KARE FARKI */}
          {activeTab === 'difference_of_squares' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Sol İnteraktif SVG */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950 p-4 min-h-[300px]">
                  <svg viewBox="0 0 380 280" className="w-full max-h-[300px] select-none">
                    {(() => {
                      const scale = 22;
                      const ox = 50;
                      const oy = 40;
                      const sideA = diffA * scale;
                      const sideB = safeDiffB * scale;

                      // Transformation offset based on diffStep
                      const moveX = (diffStep / 100) * (sideA - sideB);
                      const moveY = (diffStep / 100) * sideB;

                      return (
                        <g>
                          {/* Ana Parça 1: (a - b) x a taban dikdörtgeni */}
                          <rect
                            x={ox}
                            y={oy + sideB}
                            width={sideA}
                            height={sideA - sideB}
                            fill="#6366f1"
                            fillOpacity="0.5"
                            stroke="#818cf8"
                            strokeWidth="2"
                            rx="2"
                          />
                          <text
                            x={ox + sideA / 2}
                            y={oy + sideB + (sideA - sideB) / 2 + 4}
                            textAnchor="middle"
                            fill="#c7d2fe"
                            fontSize="12"
                            fontWeight="bold"
                          >
                            (a - b) × a
                          </text>

                          {/* Parça 2 (Sağ üst köşe kesilmiş, sol üst kalan parça): (a - b) x b */}
                          {/* Bu parça diffStep ile kayarak alt parçanın yanına yapışır */}
                          <g transform={`translate(${moveX}, ${moveY})`}>
                            <rect
                              x={ox}
                              y={oy}
                              width={sideA - sideB}
                              height={sideB}
                              fill="#ec4899"
                              fillOpacity="0.6"
                              stroke="#f472b6"
                              strokeWidth="2"
                              rx="2"
                            />
                            <text
                              x={ox + (sideA - sideB) / 2}
                              y={oy + sideB / 2 + 4}
                              textAnchor="middle"
                              fill="#fbcfe8"
                              fontSize="11"
                              fontWeight="bold"
                            >
                              (a - b) × b
                            </text>
                          </g>

                          {/* Kesilip atılan b x b köşesi */}
                          <rect
                            x={ox + sideA - sideB}
                            y={oy}
                            width={sideB}
                            height={sideB}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                            strokeDasharray="4 3"
                          />
                          <text
                            x={ox + sideA - sideB / 2}
                            y={oy + sideB / 2 + 4}
                            textAnchor="middle"
                            fill="#f87171"
                            fontSize="11"
                            fontWeight="bold"
                          >
                            - b²
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                  <span className="text-[11px] text-slate-400 mt-2">
                    Pembe parça kaydırıldığında tek parça bir <strong className="text-white">(a - b) × (a + b)</strong> dikdörtgeni oluşur!
                  </span>
                </div>

                {/* Sağ Kontrol Paneli */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                      Kare Kenarlarını Ayarla:
                    </span>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-indigo-400">Büyük Kare a: {diffA} birim</span>
                        <span className="text-slate-400">a² = {diffA * diffA}</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="8"
                        value={diffA}
                        onChange={(e) => setDiffA(parseInt(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-rose-400">Çıkarılan Kare b: {safeDiffB} birim</span>
                        <span className="text-slate-400">b² = {safeDiffB * safeDiffB}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={diffA - 1}
                        value={safeDiffB}
                        onChange={(e) => setDiffB(parseInt(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-pink-400">Parçayı Taşı & Dikdörtgen Yap: %{diffStep}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={diffStep}
                        onChange={(e) => setDiffStep(parseInt(e.target.value))}
                        className="w-full accent-pink-500"
                      />
                    </div>
                  </div>

                  {/* Sonuç Özeti */}
                  <div className="rounded-2xl border border-pink-500/30 bg-pink-950/20 p-4 text-center">
                    <div className="text-xs font-semibold text-pink-300 mb-1">
                      İki Kare Farkı Formülü:
                    </div>
                    <div className="text-base sm:text-lg font-mono font-black text-white">
                      {diffA}² - {safeDiffB}² = ({diffA} - {safeDiffB}) × ({diffA} + {safeDiffB})
                    </div>
                    <div className="text-sm font-bold text-pink-400 mt-1">
                      {diffAreaOrig} = {diffA - safeDiffB} × {diffA + safeDiffB} = {diffFactored}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pedagojik Açıklama */}
              <div className="flex items-start gap-3 rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-4">
                <Lightbulb className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-200">
                  <strong className="text-indigo-300">Neden (a - b)(a + b)?</strong> Büyük kareden küçük kare kesildiğinde kalan L-şeklindeki parça, ortasından kesilip yan yana konduğunda yüksekliği <strong>(a - b)</strong>, tabanı ise <strong>(a + b)</strong> olan mükemmel bir dikdörtgene dönüşür.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRİGONOMETRİK ÖZDEŞLİK */}
          {activeTab === 'trig_identity' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Sol İnteraktif Birim Çember */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950 p-4 min-h-[300px]">
                  <svg viewBox="-140 -140 280 280" className="w-full max-h-[300px] select-none">
                    {/* Eksenler */}
                    <line x1="-125" y1="0" x2="125" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    <line x1="0" y1="-125" x2="0" y2="125" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

                    {/* Birim Çember (r = 100) */}
                    <circle cx="0" cy="0" r="100" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="3 3" />

                    {/* Nokta P(x, y) */}
                    {(() => {
                      const px = cosVal * 100;
                      const py = -sinVal * 100;

                      return (
                        <g>
                          {/* Yatay dik kenar cos(theta) */}
                          <line x1="0" y1="0" x2={px} y2="0" stroke="#38bdf8" strokeWidth="3" />
                          {/* Dikey dik kenar sin(theta) */}
                          <line x1={px} y1="0" x2={px} y2={py} stroke="#f43f5e" strokeWidth="3" />
                          {/* Hipotenüs = 1 */}
                          <line x1="0" y1="0" x2={px} y2={py} stroke="#facc15" strokeWidth="2.5" />

                          {/* P Noktası */}
                          <circle cx={px} cy={py} r="5" fill="#facc15" stroke="#ffffff" strokeWidth="1.5" />

                          {/* Açı Yayı */}
                          <path
                            d={`M 25 0 A 25 25 0 ${trigAngle > 180 ? 1 : 0} 0 ${Math.cos(trigRad) * 25} ${-Math.sin(trigRad) * 25}`}
                            fill="none"
                            stroke="#a855f7"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    })()}
                  </svg>
                  <div className="flex items-center gap-4 text-xs font-semibold mt-2">
                    <span className="text-sky-400">■ cos(θ) = {cosVal.toFixed(3)}</span>
                    <span className="text-rose-400">■ sin(θ) = {sinVal.toFixed(3)}</span>
                    <span className="text-amber-400">■ Hipotenüs = 1</span>
                  </div>
                </div>

                {/* Sağ Kontrol Paneli */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Açıyı Değiştir (θ):
                    </span>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-amber-300">Açı θ = {trigAngle}°</span>
                        <span className="text-slate-400">({((trigAngle * Math.PI) / 180).toFixed(2)} radyan)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={trigAngle}
                        onChange={(e) => setTrigAngle(parseInt(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border border-sky-500/20 bg-sky-950/30 p-2.5">
                        <span className="text-sky-300 font-bold">cos²({trigAngle}°)</span>
                        <div className="font-mono text-base font-bold text-white mt-0.5">
                          {cosSq.toFixed(4)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-2.5">
                        <span className="text-rose-300 font-bold">sin²({trigAngle}°)</span>
                        <div className="font-mono text-base font-bold text-white mt-0.5">
                          {sinSq.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Eşitlik Kartı */}
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
                    <div className="text-xs font-semibold text-emerald-300 mb-1">
                      Özdeşlik Doğrulaması:
                    </div>
                    <div className="text-lg font-mono font-black text-white">
                      sin²(θ) + cos²(θ) = 1
                    </div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">
                      {sinSq.toFixed(3)} + {cosSq.toFixed(3)} = {(sinSq + cosSq).toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pedagojik Açıklama */}
              <div className="flex items-start gap-3 rounded-2xl border border-sky-500/25 bg-sky-500/10 p-4">
                <Lightbulb className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-200">
                  <strong className="text-sky-300">Birim Çember Sırrı:</strong> Birim çemberin yarıçapı daima <strong>1</strong> olduğu için, çember üzerindeki herhangi bir noktanın oluşturduğu dik üçgende Pisagor teoremi doğrudan <strong>cos²θ + sin²θ = 1² = 1</strong> verir. Bu eşitlik 360 derecenin tamamında ve negatif bölgelerde de karesi alındığı için daima 1 çıkar!
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PASCAL & BİNOM */}
          {activeTab === 'pascal_binomial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Sol Görsel Pascal Üçgeni */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950 p-6 min-h-[300px]">
                  <div className="space-y-2.5 text-center">
                    {PASCAL_ROWS.map((row, rIdx) => {
                      const isSelected = rIdx === binomialPower;
                      return (
                        <div key={rIdx} className="flex items-center justify-center gap-2">
                          <span className="w-8 text-[10px] font-mono text-slate-500">n={rIdx}</span>
                          <div className="flex gap-1.5">
                            {row.map((val, cIdx) => (
                              <div
                                key={cIdx}
                                className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl font-mono text-xs sm:text-sm font-bold transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-lg scale-110'
                                    : 'bg-white/5 border border-white/10 text-slate-300'
                                }`}
                              >
                                {val}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-4">
                    Her sayı, üstündeki iki sayının toplamıdır (Örn: 1 + 2 = 3).
                  </span>
                </div>

                {/* Sağ Kontrol Paneli */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Kuvvet Derecesi (n):
                    </span>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white">(a + b)ⁿ açılımı için n = {binomialPower}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={binomialPower}
                        onChange={(e) => setBinomialPower(parseInt(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((pow) => (
                        <button
                          key={pow}
                          type="button"
                          onClick={() => setBinomialPower(pow)}
                          className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${
                            binomialPower === pow
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          n={pow}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Binom Açılım Kartı */}
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-center">
                    <div className="text-xs font-semibold text-amber-300 mb-1">
                      (a + b)^{binomialPower} Cebirsel Açılımı:
                    </div>
                    <div className="text-sm sm:text-base font-mono font-bold text-white leading-relaxed">
                      {BINOMIAL_EXPANSIONS[binomialPower]}
                    </div>
                    <div className="text-xs text-slate-300 mt-2">
                      Katsayılar: [ {PASCAL_ROWS[binomialPower].join(', ')} ]
                    </div>
                  </div>
                </div>
              </div>

              {/* Pedagojik Açıklama */}
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-200">
                  <strong className="text-amber-300">Kombinasyon Bağlantısı:</strong> Pascal üçgenindeki her eleman aslında bir kombinasyondur: C(n, r). (a + b)³ açılımında a²b teriminin katsayısının 3 olmasının sebebi, 3 parantezden birini seçmenin 3 farklı yolu olmasıdır!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alt Kapat Çubuğu */}
        <div
          className={`flex items-center justify-between border-t px-4 py-3 sm:px-6 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-white/10'
          }`}
        >
          <span className="text-xs text-slate-400 hidden sm:inline">
            Formülleri görsel olarak anladığında asla unutmazsın.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
export default VisualMathProofsModal;
