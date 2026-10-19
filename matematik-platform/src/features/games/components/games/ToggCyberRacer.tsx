'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Flame,
  Gauge,
  Heart,
  Play,
  RotateCcw,
  Shield,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

// ==========================================
// 1. OYUN TİPLERİ VE MODELLERİ
// ==========================================

export type RaceVehicle = {
  accentClass: string;
  badge: string;
  bonusText: string;
  colorHex: string;
  colorName: string;
  id: 'toggx' | 'toggf' | 'gtr' | 'cyber';
  isTogg: boolean;
  name: string;
  specs: string;
};

export type RaceTrack = {
  asphaltBg: string;
  borderGlow: string;
  desc: string;
  icon: string;
  id: 'bosphorus' | 'cappadocia' | 'gemlik';
  name: string;
};

export type ToggColor = {
  bgClass: string;
  hex: string;
  name: string;
};

export type RoadEntityType = 'rival' | 'battery' | 'coin' | 'shield';

export type RoadEntity = {
  cleared?: boolean;
  collected?: boolean;
  color: string;
  icon: string;
  id: number;
  lane: number;
  speed: number;
  type: RoadEntityType;
  y: number;
};

export const RACE_VEHICLES: RaceVehicle[] = [
  {
    id: 'toggx',
    name: 'TOGG T10X',
    badge: 'Yerli & Milli SUV ⚡',
    specs: '435 BG Çift Motor • Trugo Süper Şarj',
    bonusText: '+%15 Trugo Puan Bonusu',
    colorName: 'Anadolu Kırmızısı',
    colorHex: '#e11d48',
    accentClass: 'from-rose-600 to-red-700',
    isTogg: true,
  },
  {
    id: 'toggf',
    name: 'TOGG T10F',
    badge: 'Yerli Spor Fastback ⚡',
    specs: 'Aerodinamik Sedan • 600 km Menzil',
    bonusText: '+%15 Hız Bonusu',
    colorName: 'Gemlik Mavisi',
    colorHex: '#0284c7',
    accentClass: 'from-cyan-500 to-blue-700',
    isTogg: true,
  },
  {
    id: 'gtr',
    name: 'Fırtına GT-R',
    badge: 'Pist Canavarı 🏎️',
    specs: 'Çift Turbo V6 • Karbon Kanat',
    bonusText: '+%10 Puan Bonusu',
    colorName: 'Gece Mavisi',
    colorHex: '#4f46e5',
    accentClass: 'from-indigo-500 to-purple-700',
    isTogg: false,
  },
  {
    id: 'cyber',
    name: 'Siber Hiper-X',
    badge: 'Neon Konsept 🛸',
    specs: 'Plazma İtici • Lazer Far',
    bonusText: '+%10 Kalkan Bonusu',
    colorName: 'Zümrüt Neon',
    colorHex: '#10b981',
    accentClass: 'from-emerald-500 to-teal-700',
    isTogg: false,
  },
];

export const TOGG_COLORS: ToggColor[] = [
  { name: 'Anadolu Kırmızısı', hex: '#e11d48', bgClass: 'bg-rose-600' },
  { name: 'Gemlik Mavisi', hex: '#0284c7', bgClass: 'bg-sky-600' },
  { name: 'Kapadokya Beji', hex: '#d97706', bgClass: 'bg-amber-600' },
  { name: 'Pamukkale Beyazı', hex: '#f8fafc', bgClass: 'bg-slate-100 dark:bg-slate-100 border border-slate-300 dark:border-slate-600' },
  { name: 'Oltu Siyahı', hex: '#0f172a', bgClass: 'bg-slate-900 dark:bg-slate-900 border border-slate-700 dark:border-slate-600' },
];

export const RACE_TRACKS: RaceTrack[] = [
  {
    id: 'bosphorus',
    name: 'Boğaz Köprüsü Gece Pisti',
    icon: '🌉',
    desc: 'Işıklar altında neon asfalt ve Boğaz rüzgarı',
    asphaltBg: 'bg-slate-950 dark:bg-slate-950',
    borderGlow: 'border-cyan-500/40 shadow-cyan-500/20',
  },
  {
    id: 'cappadocia',
    name: 'Kapadokya Balonlar Etabı',
    icon: '🎈',
    desc: 'Peri bacaları ve gökyüzünde yükselen balonlar',
    asphaltBg: 'bg-stone-900 dark:bg-stone-900',
    borderGlow: 'border-amber-500/40 shadow-amber-500/20',
  },
  {
    id: 'gemlik',
    name: 'Gemlik Teknoloji Kampüsü',
    icon: '⚡',
    desc: 'Yüksek hızlı test pisti & Trugo şarj hatları',
    asphaltBg: 'bg-slate-950 dark:bg-slate-950',
    borderGlow: 'border-emerald-500/40 shadow-emerald-500/20',
  },
];

// ==========================================
// 2. ARAÇ VE OTOYOL SVG BİLEŞENLERİ
// ==========================================

function PlayerCarSVG({
  carId,
  colorHex,
  hasShield,
  isNitro,
  isTogg,
}: {
  carId: string;
  colorHex: string;
  hasShield: boolean;
  isNitro: boolean;
  isTogg: boolean;
}) {
  return (
    <div className="relative w-14 h-24 flex items-center justify-center select-none">
      {/* Enerji Kalkanı Aurası */}
      {hasShield && (
        <div className="absolute -inset-3 rounded-3xl border-2 border-emerald-400/90 bg-emerald-400/20 animate-pulse pointer-events-none z-30 shadow-[0_0_20px_rgba(52,211,153,0.7)]" />
      )}

      {/* Trugo Nitro Jet Alevleri */}
      {isNitro && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0.6 }}
          animate={{ opacity: [0.85, 1, 0.85], scaleY: [1, 1.4, 1] }}
          transition={{ duration: 0.12, repeat: Infinity }}
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-0"
        >
          <div className="flex gap-4">
            <div className="w-3 h-8 bg-gradient-to-b from-cyan-300 via-sky-500 to-transparent rounded-full blur-[1px] animate-pulse" />
            <div className="w-3 h-8 bg-gradient-to-b from-cyan-300 via-sky-500 to-transparent rounded-full blur-[1px] animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Vektör Gövde Çizimi */}
      <svg
        viewBox="0 0 64 100"
        className="w-full h-full relative z-10 drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`car-body-${carId}`} x1="0" y1="0" x2="64" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={colorHex} />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="headlight-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="roof-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Ön Far Işık Hüzmeleri */}
        <polygon points="12,14 4,-8 24,-8 18,14" fill="url(#headlight-beam)" opacity="0.45" />
        <polygon points="46,14 40,-8 60,-8 52,14" fill="url(#headlight-beam)" opacity="0.45" />

        {/* Tekerlekler */}
        <rect x="4" y="20" width="7" height="15" rx="3" fill="#1e293b" />
        <rect x="53" y="20" width="7" height="15" rx="3" fill="#1e293b" />
        <rect x="4" y="68" width="7" height="15" rx="3" fill="#1e293b" />
        <rect x="53" y="68" width="7" height="15" rx="3" fill="#1e293b" />

        {/* Ana Aerodinamik Gövde */}
        <path
          d="M 18 10 C 26 8, 38 8, 46 10 C 52 14, 55 24, 55 38 C 55 58, 54 82, 48 90 C 44 93, 20 93, 16 90 C 10 82, 9 58, 9 38 C 9 24, 12 14, 18 10 Z"
          fill={`url(#car-body-${carId})`}
          stroke={isNitro ? '#38bdf8' : hasShield ? '#34d399' : '#334155'}
          strokeWidth="1.6"
        />

        {/* Yan Hava Kanalları */}
        <path d="M 11 44 L 14 52 L 11 58 Z" fill="#0f172a" />
        <path d="M 53 44 L 50 52 L 53 58 Z" fill="#0f172a" />

        {/* Cam Tavan & Kokpit */}
        <path
          d="M 18 30 C 24 28, 40 28, 46 30 C 48 40, 48 58, 45 66 C 39 68, 25 68, 19 66 C 16 58, 16 40, 18 30 Z"
          fill="url(#roof-glass)"
          stroke="#38bdf8"
          strokeWidth="0.8"
        />
        <line x1="20" y1="46" x2="44" y2="46" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.5" />

        {/* Ön LED Farlar */}
        <ellipse cx="15" cy="14" rx="3" ry="2" fill="#e0f2fe" />
        <ellipse cx="49" cy="14" rx="3" ry="2" fill="#e0f2fe" />

        {/* TOGG Özel: Lale Motifi Ön Izgara & Rozet */}
        {isTogg ? (
          <g>
            <path
              d="M 23 14 Q 32 17 41 14"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M 32 12 L 34.5 15.5 L 32 17.5 L 29.5 15.5 Z"
              fill="#38bdf8"
            />
            <circle cx="32" cy="22" r="2.5" fill="#38bdf8" />
          </g>
        ) : (
          <g>
            <rect x="27" y="16" width="10" height="4" rx="1.5" fill="#0f172a" />
          </g>
        )}

        {/* Arka Kesintisiz LED Stop Şeridi */}
        <line x1="16" y1="89" x2="48" y2="89" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="28" y="87" width="8" height="2" rx="1" fill="#38bdf8" />
      </svg>
    </div>
  );
}

function RivalCarSVG({ colorHex }: { colorHex: string }) {
  return (
    <div className="w-12 h-20 opacity-90 drop-shadow-md select-none">
      <svg viewBox="0 0 64 100" className="w-full h-full" fill="none">
        <rect x="4" y="20" width="7" height="15" rx="3" fill="#1e293b" />
        <rect x="53" y="20" width="7" height="15" rx="3" fill="#1e293b" />
        <rect x="4" y="68" width="7" height="15" rx="3" fill="#1e293b" />
        <rect x="53" y="68" width="7" height="15" rx="3" fill="#1e293b" />
        <path
          d="M 18 10 C 26 8, 38 8, 46 10 C 52 14, 54 24, 54 38 C 54 58, 53 82, 47 90 C 44 93, 20 93, 17 90 C 11 82, 10 58, 10 38 C 10 24, 12 14, 18 10 Z"
          fill={colorHex}
          stroke="#475569"
          strokeWidth="1.2"
        />
        <path
          d="M 18 32 C 24 30, 40 30, 46 32 C 48 40, 48 56, 45 64 C 39 66, 25 66, 19 64 C 16 56, 16 40, 18 32 Z"
          fill="#1e293b"
        />
        <line x1="18" y1="88" x2="46" y2="88" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function RoadEntityItem({ entity }: { entity: RoadEntity }) {
  if (entity.collected || entity.cleared) return null;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center select-none"
      style={{
        left: `${entity.lane * 25 + 12.5}%`,
        top: `${entity.y}%`,
      }}
    >
      {entity.type === 'rival' && (
        <div className="flex flex-col items-center">
          <RivalCarSVG colorHex={entity.color} />
          <span className="text-xs -mt-2 drop-shadow">{entity.icon}</span>
        </div>
      )}

      {entity.type === 'battery' && (
        <div className="flex flex-col items-center animate-bounce">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-sky-500 border border-cyan-200 dark:border-cyan-300 shadow-lg shadow-cyan-500/50 flex items-center justify-center text-xl">
            ⚡
          </div>
          <span className="text-[10px] font-black font-mono text-cyan-300 dark:text-cyan-300 bg-slate-900/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded mt-0.5 border border-cyan-500/30">
            TRUGO
          </span>
        </div>
      )}

      {entity.type === 'coin' && (
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 border border-yellow-200 shadow-lg shadow-amber-500/50 flex items-center justify-center text-xl">
            🪙
          </div>
          <span className="text-[10px] font-black font-mono text-amber-300 dark:text-amber-300 bg-slate-900/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded mt-0.5 border border-amber-500/30">
            +120
          </span>
        </div>
      )}

      {entity.type === 'shield' && (
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 border border-emerald-200 shadow-lg shadow-emerald-500/50 flex items-center justify-center text-xl">
            🛡️
          </div>
          <span className="text-[10px] font-black font-mono text-emerald-300 dark:text-emerald-300 bg-slate-900/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded mt-0.5 border border-emerald-500/30">
            KALKAN
          </span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. ANA OYUN BİLEŞENİ (100% PURE ARCADE RACER)
// ==========================================

export function ToggCyberRacer({
  onExit,
  onScore,
  scoreMultiplier = 1,
}: GameComponentProps) {
  // Oyun Durumu
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');

  // Garaj ve Özelleştirme
  const [selectedCarId, setSelectedCarId] = useState<'toggx' | 'toggf' | 'gtr' | 'cyber'>('toggx');
  const [selectedColor, setSelectedColor] = useState<string>('Anadolu Kırmızısı');
  const [selectedTrackId, setSelectedTrackId] = useState<'bosphorus' | 'cappadocia' | 'gemlik'>('bosphorus');

  // Skor ve Telemetri
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [speedKmh, setSpeedKmh] = useState(180);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState(180);
  const [overtaken, setOvertaken] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [trugoNitro, setTrugoNitro] = useState(30);
  const [collectedItems, setCollectedItems] = useState(0);

  // Şerit Kontrolü (0: Şerit 1, 1: Şerit 2, 2: Şerit 3, 3: Şerit 4)
  const [selectedLane, setSelectedLane] = useState(1);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [isCrash, setIsCrash] = useState(false);
  const [shieldTimeLeft, setShieldTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'correct' | 'wrong';
  } | null>(null);

  // Otoyol Varlıkları (Rakipler, Bataryalar, Altınlar, Kalkanlar)
  const [entities, setEntities] = useState<RoadEntity[]>([]);

  // Referanslar (Tick içi en güncel state erişimi)
  const entitiesRef = useRef<RoadEntity[]>([]);
  const laneRef = useRef(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const speedRef = useRef(180);
  const overtakenRef = useRef(0);
  const streakRef = useRef(0);
  const nitroRef = useRef(30);
  const nitroActiveRef = useRef(false);
  const nitroTimerRef = useRef(0);
  const shieldTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const nextEntityIdRef = useRef(1);
  const hasSubmittedRef = useRef(false);

  // Senkronizasyon
  useEffect(() => {
    laneRef.current = selectedLane;
  }, [selectedLane]);

  // Seçilen Araç ve Pist Nesneleri
  const selectedCar = useMemo(() => {
    return RACE_VEHICLES.find((v) => v.id === selectedCarId) || RACE_VEHICLES[0];
  }, [selectedCarId]);

  const selectedTrack = useMemo(() => {
    return RACE_TRACKS.find((t) => t.id === selectedTrackId) || RACE_TRACKS[0];
  }, [selectedTrackId]);

  const currentColorHex = useMemo(() => {
    if (selectedCar.isTogg) {
      const match = TOGG_COLORS.find((c) => c.name === selectedColor);
      return match ? match.hex : selectedCar.colorHex;
    }
    return selectedCar.colorHex;
  }, [selectedCar, selectedColor]);

  // Bitiş Fonksiyonu
  const finishGame = useCallback(() => {
    setGameState('ended');
    gameAudio.playFanfare();
  }, []);

  // Skor Gönderimi (En fazla 4800 puan)
  useEffect(() => {
    if (gameState === 'playing') {
      hasSubmittedRef.current = false;
    }
    if (gameState === 'ended' && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      const safeFinalScore = Math.min(
        4800,
        Math.round(score * (scoreMultiplier || 1)),
      );
      onScore(safeFinalScore);
    }
  }, [gameState, score, scoreMultiplier, onScore]);

  // 60 Saniye Geri Sayım Zamanlayıcısı
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, finishGame]);

  // Şerit Değiştirme
  const steerLeft = useCallback(() => {
    setSelectedLane((l) => Math.max(0, l - 1));
  }, []);

  const steerRight = useCallback(() => {
    setSelectedLane((l) => Math.min(3, l + 1));
  }, []);

  // Trugo Süper Nitro Ateşleme
  const activateNitro = useCallback(() => {
    if (gameState !== 'playing' || nitroRef.current < 50 || nitroActiveRef.current) return;

    nitroRef.current = Math.max(0, nitroRef.current - 50);
    setTrugoNitro(nitroRef.current);
    nitroActiveRef.current = true;
    setIsNitroActive(true);
    nitroTimerRef.current = 4.0; // 4 saniye süren yüksek hızlı nitro modu
    speedRef.current = 340;
    setSpeedKmh(340);
    setMaxSpeedKmh((m) => Math.max(m, 340));

    gameAudio.playNitro();
    setFeedback({
      message: 'TRUGO SÜPER NİTRO ATEŞLENDİ! ⚡🔥',
      type: 'correct',
    });
  }, [gameState]);

  // Oyunu Başlat
  const startGame = useCallback(() => {
    scoreRef.current = 0;
    livesRef.current = 3;
    speedRef.current = 180;
    overtakenRef.current = 0;
    streakRef.current = 0;
    nitroRef.current = 35;
    nitroActiveRef.current = false;
    nitroTimerRef.current = 0;
    shieldTimeRef.current = 0;
    spawnTimerRef.current = 0;
    nextEntityIdRef.current = 1;
    entitiesRef.current = [];
    laneRef.current = 1;

    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setSpeedKmh(180);
    setMaxSpeedKmh(180);
    setOvertaken(0);
    setStreak(0);
    setMaxStreak(0);
    setTrugoNitro(35);
    setCollectedItems(0);
    setSelectedLane(1);
    setIsNitroActive(false);
    setIsCrash(false);
    setShieldTimeLeft(0);
    setFeedback(null);
    setEntities([]);

    setGameState('playing');
    gameAudio.playPop();
  }, []);

  // ==========================================
  // REAL-TIME ARCADE TICK LOOP (50ms)
  // ==========================================
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      // 1. Nitro Süre Takibi
      if (nitroActiveRef.current) {
        nitroTimerRef.current -= 0.05;
        if (nitroTimerRef.current <= 0) {
          nitroActiveRef.current = false;
          setIsNitroActive(false);
          speedRef.current = 200;
          setSpeedKmh(200);
        }
      }

      // 2. Kalkan Süre Takibi
      if (shieldTimeRef.current > 0) {
        shieldTimeRef.current = Math.max(0, shieldTimeRef.current - 0.05);
        setShieldTimeLeft(Math.ceil(shieldTimeRef.current));
      }

      // 3. Hız Güncellemesi
      if (!nitroActiveRef.current) {
        const targetBaseSpeed = Math.min(260, 180 + overtakenRef.current * 2);
        speedRef.current = targetBaseSpeed;
        setSpeedKmh(targetBaseSpeed);
        setMaxSpeedKmh((m) => Math.max(m, targetBaseSpeed));
      }

      // 4. Yeni Araç & Öğe Doğurma (Spawning)
      spawnTimerRef.current += 1;
      if (spawnTimerRef.current >= 14) {
        spawnTimerRef.current = 0;

        // Adil oyun için: rastgele 1 veya 2 şeritte öğe doğur (en az 2 şerit daima boş kalır)
        const chosenLane = Math.floor(Math.random() * 4);
        const randType = Math.random();
        let entityType: RoadEntityType = 'rival';
        let icon = '🚙';
        let color = '#ef4444';

        if (randType < 0.52) {
          entityType = 'rival';
          const rivalTypes = [
            { icon: '🚙', color: '#38bdf8' },
            { icon: '🚕', color: '#f59e0b' },
            { icon: '🚚', color: '#64748b' },
            { icon: '🏎️', color: '#ef4444' },
          ];
          const chosenRival = rivalTypes[Math.floor(Math.random() * rivalTypes.length)];
          icon = chosenRival.icon;
          color = chosenRival.color;
        } else if (randType < 0.74) {
          entityType = 'battery';
          icon = '⚡';
          color = '#06b6d4';
        } else if (randType < 0.90) {
          entityType = 'coin';
          icon = '🪙';
          color = '#f59e0b';
        } else {
          entityType = 'shield';
          icon = '🛡️';
          color = '#10b981';
        }

        const newEntity: RoadEntity = {
          id: nextEntityIdRef.current++,
          lane: chosenLane,
          y: -8,
          type: entityType,
          icon,
          color,
          speed: entityType === 'rival' ? 3.4 : 3.0,
        };

        entitiesRef.current.push(newEntity);
      }

      // 5. Varlıkların Hareketi & Çarpışma Tespiti
      const currentLane = laneRef.current;
      const isNitro = nitroActiveRef.current;
      const hasShield = shieldTimeRef.current > 0;
      const speedFactor = isNitro ? 1.8 : 1.0;

      const nextEntities: RoadEntity[] = [];

      for (const entity of entitiesRef.current) {
        if (entity.cleared) continue;

        // Konum ilerleme
        entity.y += entity.speed * speedFactor;

        // Oyuncu Çarpışma Bölgesi (y: 72% - 88%)
        const inPlayerZone = entity.y >= 72 && entity.y <= 88;
        const inSameLane = entity.lane === currentLane;

        if (inPlayerZone && inSameLane && !entity.collected) {
          if (entity.type === 'battery') {
            entity.collected = true;
            entity.cleared = true;
            const trugoBonusMultiplier = selectedCar.id === 'toggx' ? 1.15 : 1.0;
            const points = Math.round(75 * trugoBonusMultiplier);

            scoreRef.current += points;
            nitroRef.current = Math.min(100, nitroRef.current + 25);
            setScore(scoreRef.current);
            setTrugoNitro(nitroRef.current);
            setCollectedItems((c) => c + 1);

            gameAudio.playCorrect();
            setFeedback({
              message: `+${points} Trugo Bataryası Toplandı! ⚡`,
              type: 'correct',
            });
          } else if (entity.type === 'coin') {
            entity.collected = true;
            entity.cleared = true;
            const points = 120;

            scoreRef.current += points;
            setScore(scoreRef.current);
            setCollectedItems((c) => c + 1);

            gameAudio.playCombo();
            setFeedback({
              message: `+${points} Altın Kupa Kazanıldı! 🪙`,
              type: 'correct',
            });
          } else if (entity.type === 'shield') {
            entity.collected = true;
            entity.cleared = true;
            shieldTimeRef.current = 5.0;
            setShieldTimeLeft(5);

            scoreRef.current += 50;
            setScore(scoreRef.current);
            setCollectedItems((c) => c + 1);

            gameAudio.playLevelUp();
            setFeedback({
              message: 'Enerji Kalkanı Aktif! 🛡️ (5 Saniye)',
              type: 'correct',
            });
          } else if (entity.type === 'rival') {
            entity.collected = true;
            entity.cleared = true;

            if (hasShield) {
              scoreRef.current += 50;
              setScore(scoreRef.current);
              gameAudio.playPop();
              setFeedback({
                message: 'Kalkan ile Çarpışma Savuşturuldu! 🛡️ (+50)',
                type: 'correct',
              });
            } else if (isNitro) {
              scoreRef.current += 80;
              overtakenRef.current += 1;
              streakRef.current += 1;

              setScore(scoreRef.current);
              setOvertaken(overtakenRef.current);
              setStreak(streakRef.current);
              setMaxStreak((m) => Math.max(m, streakRef.current));

              gameAudio.playSlice();
              setFeedback({
                message: 'Nitro Şoku! Araç Havaya Uçtu! 💥 (+80)',
                type: 'correct',
              });
            } else {
              livesRef.current -= 1;
              streakRef.current = 0;

              setLives(livesRef.current);
              setStreak(0);
              setIsCrash(true);
              setTimeout(() => setIsCrash(false), 400);

              gameAudio.playWhack();
              setFeedback({
                message: 'Trafik Kazası! -1 Can 💥',
                type: 'wrong',
              });

              if (livesRef.current <= 0) {
                finishGame();
                return;
              }
            }
          }
        }

        // Oyuncuyu Geçen Araçlar (Overtaken - Sollama Puanı)
        if (entity.type === 'rival' && entity.y > 90 && !entity.collected && !entity.cleared) {
          entity.cleared = true;
          overtakenRef.current += 1;
          streakRef.current += 1;
          const points = 40;

          scoreRef.current += points;
          setScore(scoreRef.current);
          setOvertaken(overtakenRef.current);
          setStreak(streakRef.current);
          setMaxStreak((m) => Math.max(m, streakRef.current));

          if (streakRef.current % 5 === 0) {
            gameAudio.playCombo();
          }
        }

        // Ekran dışına çıkanları temizle
        if (entity.y <= 108 && !entity.cleared) {
          nextEntities.push(entity);
        }
      }

      entitiesRef.current = nextEntities;
      setEntities([...nextEntities]);
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, selectedCar, finishGame]);

  // Klavye Kontrolleri: [1, 2, 3, 4], [←, →], [A, D], [Boşluk, W, ↑]
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
        const targetLane = parseInt(e.key, 10) - 1;
        setSelectedLane(targetLane);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        steerLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        steerRight();
      } else if (
        e.key === ' ' ||
        e.key === 'ArrowUp' ||
        e.key === 'w' ||
        e.key === 'W'
      ) {
        e.preventDefault();
        activateNitro();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, steerLeft, steerRight, activateNitro]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-2xl text-slate-900 dark:text-slate-100 min-h-[580px] flex flex-col justify-between select-none">
      {/* 1. ÜST BİLGİ & BAŞLIK ŞERİDİ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-600 to-red-700 text-white dark:text-white shadow-lg shadow-rose-600/25">
            <Car className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              TOGG & Süper Garaj Yarışı
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold">
                Milli Teknoloji & Hız Pisti
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Trafikten sıyrıl, Trugo bataryaları ve altınları topla, nitro ile rekor kır!
            </p>
          </div>
        </div>

        {/* Oyun Esnasında Telemetri HUD (Can, Süre, Hız, Sollanan, Skor) */}
        {gameState === 'playing' && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Can Sayacı */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/40">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-all ${
                    i < lives
                      ? 'fill-rose-500 text-rose-500 scale-100'
                      : 'fill-slate-300 dark:fill-slate-700 text-slate-300 dark:text-slate-700 scale-90'
                  }`}
                />
              ))}
            </div>

            {/* Süre */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <Timer className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span
                className={`font-mono text-base font-black ${
                  timeLeft <= 10
                    ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                    : 'text-amber-700 dark:text-amber-300'
                }`}
              >
                {timeLeft}s
              </span>
            </div>

            {/* Hız Göstergesi */}
            <div className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-300 font-mono font-bold text-sm flex items-center gap-1.5">
              <Gauge className="w-4 h-4" />
              {speedKmh} km/s
            </div>

            {/* Sollanan Araç */}
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold text-sm flex items-center gap-1.5">
              <Car className="w-4 h-4" />
              {overtaken} Sollandı
            </div>

            {/* Skor */}
            <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-mono font-black text-base">
              {score} Puan
            </div>
          </div>
        )}
      </div>

      {/* 2. BAŞLANGIÇ EKRANI (IDLE - GARAJ & PİST SEÇİMİ) */}
      {gameState === 'idle' && (
        <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-6">
          {/* BİRİNCİL BAŞLAT BUTONU (DOM İÇİNDEKİ İLK BUTON - Testler screen.getAllByRole('button')[0] ile tıklar) */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pb-2">
            <button
              type="button"
              onClick={startGame}
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-black text-lg transition-all transform active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none min-w-[220px]"
            >
              <Play className="w-6 h-6 fill-current" />
              Yarışa Başla
            </button>

            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="px-6 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white font-bold transition-all border border-slate-200 dark:border-transparent"
              >
                Garajdan Çık
              </button>
            )}
          </div>

          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center shadow-2xl shadow-rose-600/30 text-5xl">
              ⚡
            </div>
            <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-cyan-500 text-white dark:text-white rounded-full text-xs font-black shadow-lg">
              435 BG
            </div>
          </div>

          <div className="max-w-xl space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Süper Garaja Hoş Geldin!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Aracını ve yarış pistini seç. 4 şeritli otoyolda trafiği solla, Trugo bataryalarını ve altın kupaları topla,
              Süper Nitro ateşleyerek en yüksek skora ulaş!
            </p>
          </div>

          {/* ARAÇ SEÇİM KARTLARI (div role="radio" ile erişilebilir kartlar) */}
          <div className="w-full max-w-2xl text-left space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Yarış Aracını Seç
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RACE_VEHICLES.map((vehicle) => {
                const isSelected = selectedCarId === vehicle.id;
                return (
                  <div
                    key={vehicle.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => setSelectedCarId(vehicle.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedCarId(vehicle.id);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 shadow-md ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {vehicle.name}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {vehicle.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {vehicle.specs}
                      </div>
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        {vehicle.bonusText}
                      </div>
                    </div>
                    <div className="w-10 h-16 flex items-center justify-center shrink-0">
                      <PlayerCarSVG
                        carId={vehicle.id}
                        colorHex={vehicle.colorHex}
                        hasShield={false}
                        isNitro={false}
                        isTogg={vehicle.isTogg}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOGG RENK PALETİ SEÇİMİ (Yalnızca TOGG modellerinde) */}
          {selectedCar.isTogg && (
            <div className="w-full max-w-2xl text-left space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                TOGG Renk Seçimi ({selectedColor})
              </div>
              <div className="flex flex-wrap gap-2.5">
                {TOGG_COLORS.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <div
                      key={c.name}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => setSelectedColor(c.name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedColor(c.name);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${c.bgClass}`} />
                      <span>{c.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PİST SEÇİMİ */}
          <div className="w-full max-w-2xl text-left space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Yarış Pisti Seçimi
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RACE_TRACKS.map((track) => {
                const isSelected = selectedTrackId === track.id;
                return (
                  <div
                    key={track.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => setSelectedTrackId(track.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedTrackId(track.id);
                      }
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer text-left space-y-1 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/30 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{track.icon}</span>
                      <span className="font-black text-xs text-slate-900 dark:text-white">
                        {track.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {track.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. OYUN ALANI (PLAYING - PURE ARCADE HIGHWAY) */}
      {gameState === 'playing' && (
        <div className="py-2 space-y-3">
          {/* TELEMETRİ VE TRUGO SÜPER ŞARJ ÇUBUĞU */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-inner flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedTrack.icon}</span>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  {selectedTrack.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedCar.name} • {selectedCar.isTogg ? selectedColor : selectedCar.colorName}
                </div>
              </div>
            </div>

            {/* Trugo Nitro Çubuğu */}
            <div className="flex-1 max-w-xs min-w-[180px]">
              <div className="flex items-center justify-between text-xs font-black mb-1">
                <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Trugo Süper Şarj / Nitro
                </span>
                <span className="font-mono text-cyan-700 dark:text-cyan-300">
                  %{trugoNitro}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                <motion.div
                  className={`h-full rounded-full transition-all ${
                    trugoNitro >= 50
                      ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-amber-400 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                  }`}
                  animate={{ width: `${trugoNitro}%` }}
                />
              </div>
            </div>

            {/* Kalkan Göstergesi */}
            {shieldTimeLeft > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black animate-pulse">
                <Shield className="w-3.5 h-3.5 fill-emerald-500 dark:fill-emerald-400" />
                Kalkan: {shieldTimeLeft}s
              </div>
            )}

            {/* Sollama Serisi */}
            {streak >= 3 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
                {streak} Seri!
              </div>
            )}
          </div>

          {/* GERİ BİLDİRİM / AKSİYON BİLDİRİMİ */}
          <div className="h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  key={feedback.message}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className={`text-sm sm:text-base font-black ${
                    feedback.type === 'correct'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4 ŞERİTLİ OTOYOL SİMÜLASYONU */}
          <div
            className={`relative w-full h-[260px] sm:h-[300px] rounded-2xl overflow-hidden border-2 ${selectedTrack.borderGlow} shadow-2xl flex flex-col justify-end p-2 ${selectedTrack.asphaltBg}`}
          >
            {/* Şerit Çizgileri ve Asfalt Akış Efekti */}
            <div className="absolute inset-0 flex justify-between px-3 pointer-events-none">
              <div className="w-1/4 border-r-2 border-dashed border-white/20 dark:border-white/20 h-full relative overflow-hidden">
                <motion.div
                  className="w-full h-full bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.4)_50%)] bg-[length:100%_40px]"
                  animate={{ backgroundPositionY: ['0px', '40px'] }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: isNitroActive ? 0.12 : 0.28 }}
                />
              </div>
              <div className="w-1/4 border-r-2 border-dashed border-white/20 dark:border-white/20 h-full relative overflow-hidden">
                <motion.div
                  className="w-full h-full bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.4)_50%)] bg-[length:100%_40px]"
                  animate={{ backgroundPositionY: ['0px', '40px'] }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: isNitroActive ? 0.12 : 0.28 }}
                />
              </div>
              <div className="w-1/4 border-r-2 border-dashed border-white/20 dark:border-white/20 h-full relative overflow-hidden">
                <motion.div
                  className="w-full h-full bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.4)_50%)] bg-[length:100%_40px]"
                  animate={{ backgroundPositionY: ['0px', '40px'] }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: isNitroActive ? 0.12 : 0.28 }}
                />
              </div>
              <div className="w-1/4 h-full relative overflow-hidden">
                <motion.div
                  className="w-full h-full bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.4)_50%)] bg-[length:100%_40px]"
                  animate={{ backgroundPositionY: ['0px', '40px'] }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: isNitroActive ? 0.12 : 0.28 }}
                />
              </div>
            </div>

            {/* Şerit İsimleri & Ön Göstergeleri */}
            <div className="absolute top-2 inset-x-0 grid grid-cols-4 px-2 text-center pointer-events-none z-10">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex flex-col items-center">
                  <span className="text-[10px] font-mono font-bold text-cyan-300 dark:text-cyan-300 bg-slate-900/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Şerit {num}
                  </span>
                </div>
              ))}
            </div>

            {/* OTOYOL VARLIKLARI (Rakipler, Trugo Bataryaları, Altınlar, Kalkanlar) */}
            {entities.map((entity) => (
              <RoadEntityItem key={entity.id} entity={entity} />
            ))}

            {/* OYUNCU ARACI (Seçilen şeride doğru yumuşak yaylanarak geçer) */}
            <motion.div
              className="absolute bottom-2 -translate-x-1/2 z-20"
              style={{ left: `${selectedLane * 25 + 12.5}%` }}
              animate={{
                left: `${selectedLane * 25 + 12.5}%`,
                x: isCrash ? [-12, 12, -8, 8, 0] : 0,
                y: isNitroActive ? [-3, 3, -3] : 0,
              }}
              transition={{
                left: { type: 'spring', stiffness: 440, damping: 28 },
                x: { duration: 0.35 },
                y: { repeat: Infinity, duration: 0.12 },
              }}
            >
              <PlayerCarSVG
                carId={selectedCar.id}
                colorHex={currentColorHex}
                hasShield={shieldTimeLeft > 0}
                isNitro={isNitroActive}
                isTogg={selectedCar.isTogg}
              />
            </motion.div>
          </div>

          {/* 4 ŞERİT DİREKT GEÇİŞ BUTONLARI (Klavye [1], [2], [3], [4] ile uyumlu) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {[0, 1, 2, 3].map((laneIdx) => {
              const isCurrent = selectedLane === laneIdx;
              return (
                <button
                  key={laneIdx}
                  type="button"
                  onClick={() => setSelectedLane(laneIdx)}
                  className={`p-3 rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-between min-h-[72px] shadow-sm ${
                    isCurrent
                      ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-950/40 ring-2 ring-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-black'
                      : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                      [{laneIdx + 1}]
                    </span>
                    <span>Hızlı Geçiş</span>
                  </div>

                  <div className="text-base font-black">
                    Şerit {laneIdx + 1}
                  </div>

                  <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-semibold">
                    <Car className="w-3 h-3 text-cyan-500" />
                    <span>{isCurrent ? 'Aktif Şerit 🚗' : 'Şeride Geç'}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ARCADE DİREKSİYON & AKSİYON KONTROL ÇUBUĞU */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
            <button
              type="button"
              onClick={steerLeft}
              className="py-3 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <span>⬅️</span>
              <span>Sola Kır</span>
            </button>

            <button
              type="button"
              onClick={activateNitro}
              disabled={trugoNitro < 50 || isNitroActive}
              className={`py-3 px-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md ${
                trugoNitro >= 50 && !isNitroActive
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 text-white dark:text-white animate-pulse shadow-rose-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isNitroActive ? 'NİTRO AKTİF! 🔥' : `TRUGO NİTRO (%${trugoNitro})`}</span>
            </button>

            <button
              type="button"
              onClick={steerRight}
              className="py-3 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <span>Sağa Kır</span>
              <span>➡️</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. OYUN BİTİŞ EKRANI (ENDED) */}
      {gameState === 'ended' && (
        <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-6">
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col items-center shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center mb-3 shadow-lg">
              <Trophy className="w-10 h-10 text-white dark:text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {overtaken >= 20
                ? '🏆 Pistin Şampiyonu & Hız Efsanesi!'
                : overtaken >= 10
                ? '⚡ Süper Sürücü & Milli Teknoloji!'
                : '🏁 Yarış Tamamlandı!'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {selectedTrack.name} etabında {selectedCar.name} ile toplam {overtaken} araç solladın!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full max-w-2xl">
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Toplam Puan</div>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {Math.min(4800, Math.round(score * (scoreMultiplier || 1)))}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Maksimum Hız</div>
              <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                {maxSpeedKmh} km/s
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Sollanan Araç</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {overtaken}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">En Uzun Seri</div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {maxStreak}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">Toplanan Öğe</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {collectedItems}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-black active:scale-95 transition-all bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
            >
              <RotateCcw className="w-5 h-5" />
              Yeniden Yarış
            </button>
            <button
              type="button"
              onClick={() => setGameState('idle')}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white font-bold transition-all border border-slate-200 dark:border-transparent"
            >
              Garaja Dön
            </button>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white font-bold transition-all border border-slate-200 dark:border-transparent"
              >
                Çıkış
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. ALT BİLGİ & KONTROL REHBERİ */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <span>Klavye: [1, 2, 3, 4] veya [← / → / A / D] ile şerit değiştir, [Boşluk / W / ↑] ile Trugo Nitro ateşle.</span>
        <span>Çarpan: x{scoreMultiplier}</span>
      </div>
    </div>
  );
}
