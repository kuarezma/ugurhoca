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
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

// ==========================================
// 1. OYUN TİPLERİ VE MODELLERİ
// ==========================================

export type RallyQuestion = {
  category: string;
  correctAnswer: number;
  options: number[];
  prompt: string;
  sig: string;
};

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

export const RACE_VEHICLES: RaceVehicle[] = [
  {
    id: 'toggx',
    name: 'TOGG T10X',
    badge: 'Yerli & Milli SUV ⚡',
    specs: '435 BG Çift Motor • Trugo Süper Şarj',
    bonusText: '+%15 Trugo Tork Puanı',
    colorName: 'Anadolu Kırmızısı',
    colorHex: '#e11d48',
    accentClass: 'from-rose-600 to-red-700',
    isTogg: true,
  },
  {
    id: 'toggf',
    name: 'TOGG T10F',
    badge: 'Yerli Spor Fastback ⚡',
    specs: 'Aerodinamik Şasi • 600 km Menzil',
    bonusText: '+%15 Aerodinamik Hız',
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
    bonusText: '+%10 Drift Serisi',
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
    bonusText: '+%10 Lazer İvme',
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
// 2. DİNAMİK & %100 ÖZGÜN SORU MOTORU
// ==========================================

function toSuperscript(num: number): string {
  const map: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
  };
  return String(num).split('').map((c) => map[c] || c).join('');
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateDistractors(ans: number): number[] {
  const distractors = new Set<number>();
  const offsets = [-10, 10, -5, 5, -2, 2, -1, 1, -20, 20, -15, 15, -3, 3, -4, 4];
  for (const off of offsets) {
    const val = ans + off;
    if (val !== ans) {
      distractors.add(val);
      if (distractors.size === 3) break;
    }
  }
  let step = 1;
  while (distractors.size < 3) {
    const val = ans + (step % 2 === 0 ? step * 3 : -step * 3);
    if (val !== ans) distractors.add(val);
    step++;
  }
  return Array.from(distractors);
}

function createCandidateRallyQuestion(_streak: number): RallyQuestion {
  // 5-8. sınıf kazanımları: 7 ana kategori
  const cat = Math.floor(Math.random() * 7);
  let category = '';
  let prompt = '';
  let correctAnswer = 0;
  let sig = '';

  if (cat === 0) {
    category = 'Hız & Zaman Problemleri';
    const sub = Math.floor(Math.random() * 5);
    if (sub === 0) {
      const v = [70, 80, 90, 100, 110, 120, 130, 140][Math.floor(Math.random() * 8)];
      const t = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
      prompt = `TOGG saatte ${v} km sabit hızla ${t} saat kesintisiz giderse kaç km yol alır?`;
      correctAnswer = v * t;
      sig = `spd-dist-${v}-${t}`;
    } else if (sub === 1) {
      const v = [60, 75, 80, 90, 100, 110, 120][Math.floor(Math.random() * 7)];
      const t = [2, 3, 4, 5, 6][Math.floor(Math.random() * 5)];
      const s = v * t;
      prompt = `${s} km mesafeyi ${t} saatte kateden TOGG'un ortalama hızı saatte kaç km'dir?`;
      correctAnswer = v;
      sig = `spd-avg-${s}-${t}`;
    } else if (sub === 2) {
      const v = [60, 80, 90, 100, 120][Math.floor(Math.random() * 5)];
      const t = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
      const s = v * t;
      prompt = `Saatte ${v} km sabit hızla ilerleyen bir araç ${s} km yolu kaç saatte tamamlar?`;
      correctAnswer = t;
      sig = `spd-time-${s}-${v}`;
    } else if (sub === 3) {
      const v1 = [110, 120, 130, 140][Math.floor(Math.random() * 4)];
      const v2 = [80, 85, 90, 95][Math.floor(Math.random() * 4)];
      const t = [2, 3, 4][Math.floor(Math.random() * 3)];
      prompt = `Aynı yöne giden iki araçtan biri saatte ${v1} km, diğeri ${v2} km hızla giderse ${t} saat sonra aralarındaki fark kaç km olur?`;
      correctAnswer = (v1 - v2) * t;
      sig = `spd-twocars-${v1}-${v2}-${t}`;
    } else {
      const pairs = [
        { v: 60, mins: 15, ans: 15 },
        { v: 60, mins: 45, ans: 45 },
        { v: 90, mins: 20, ans: 30 },
        { v: 90, mins: 40, ans: 60 },
        { v: 120, mins: 15, ans: 30 },
        { v: 120, mins: 30, ans: 60 },
        { v: 120, mins: 45, ans: 90 },
      ];
      const p = pairs[Math.floor(Math.random() * pairs.length)];
      prompt = `Saatte ${p.v} km hızla giden bir yarış aracı ${p.mins} dakikada kaç km yol alır?`;
      correctAnswer = p.ans;
      sig = `spd-mins-${p.v}-${p.mins}`;
    }
  } else if (cat === 1) {
    category = 'Batarya & Yüzde Hesapları';
    const sub = Math.floor(Math.random() * 4);
    if (sub === 0) {
      const pairs = [
        { cap: 88, pct: 25, ans: 22 },
        { cap: 88, pct: 50, ans: 44 },
        { cap: 88, pct: 75, ans: 66 },
        { cap: 80, pct: 20, ans: 16 },
        { cap: 80, pct: 40, ans: 32 },
        { cap: 80, pct: 75, ans: 60 },
        { cap: 100, pct: 35, ans: 35 },
        { cap: 100, pct: 65, ans: 65 },
        { cap: 120, pct: 30, ans: 36 },
        { cap: 120, pct: 50, ans: 60 },
      ];
      const p = pairs[Math.floor(Math.random() * pairs.length)];
      prompt = `${p.cap} kWh kapasiteli TOGG bataryasının %${p.pct}'si kaç kWh enerji depolar?`;
      correctAnswer = p.ans;
      sig = `bat-pct-${p.cap}-${p.pct}`;
    } else if (sub === 1) {
      const power = [60, 90, 120, 150, 180][Math.floor(Math.random() * 5)];
      const hours = [2, 3, 4][Math.floor(Math.random() * 3)];
      prompt = `Trugo istasyonunda saatte ${power} kW şarj gücüyle ${hours} saatte bataryaya kaç kWh enerji aktarılır?`;
      correctAnswer = power * hours;
      sig = `bat-charge-${power}-${hours}`;
    } else if (sub === 2) {
      const range = [400, 500, 600][Math.floor(Math.random() * 3)];
      const pct = [20, 30, 40, 50, 60, 70, 80][Math.floor(Math.random() * 7)];
      correctAnswer = (range * pct) / 100;
      prompt = `Tam şarjla ${range} km menzile sahip TOGG bataryası %${pct} doluyken kalan menzil kaç km'dir?`;
      sig = `bat-range-${range}-${pct}`;
    } else {
      const total = [80, 100, 120, 150][Math.floor(Math.random() * 4)];
      const pct = [20, 25, 30, 40, 50][Math.floor(Math.random() * 5)];
      correctAnswer = total - (total * pct) / 100;
      prompt = `${total} kWh enerjinin %${pct}'si kullanıldığında geriye kaç kWh enerji kalır?`;
      sig = `bat-consume-${total}-${pct}`;
    }
  } else if (cat === 2) {
    category = 'Tam Sayılarla İşlemler';
    const sub = Math.floor(Math.random() * 5);
    if (sub === 0) {
      const a = Math.floor(Math.random() * 25) + 6;
      const b = Math.floor(Math.random() * 25) + 6;
      prompt = `(-${a}) + (-${b}) = ?`;
      correctAnswer = -(a + b);
      sig = `int-add-${a}-${b}`;
    } else if (sub === 1) {
      const a = Math.floor(Math.random() * 30) + 10;
      const b = Math.floor(Math.random() * 30) + 10;
      prompt = `${a} - (-${b}) = ?`;
      correctAnswer = a + b;
      sig = `int-sub-${a}-${b}`;
    } else if (sub === 2) {
      const a = Math.floor(Math.random() * 10) + 4;
      const b = Math.floor(Math.random() * 12) + 4;
      prompt = `(-${a}) × (-${b}) = ?`;
      correctAnswer = a * b;
      sig = `int-mulpos-${a}-${b}`;
    } else if (sub === 3) {
      const a = Math.floor(Math.random() * 11) + 4;
      const b = Math.floor(Math.random() * 11) + 3;
      prompt = `(-${a}) × (+${b}) = ?`;
      correctAnswer = -(a * b);
      sig = `int-mulneg-${a}-${b}`;
    } else {
      const a = Math.floor(Math.random() * 20) + 15;
      const b = Math.floor(Math.random() * 6) + 3;
      const c = Math.floor(Math.random() * 7) + 3;
      prompt = `${a} + (-${b}) × (${c}) = ?`;
      correctAnswer = a + (-b * c);
      sig = `int-order-${a}-${b}-${c}`;
    }
  } else if (cat === 3) {
    category = 'Üslü İfadeler';
    const sub = Math.floor(Math.random() * 4);
    if (sub === 0) {
      const exp = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
      const val = Math.floor(Math.random() * 15) + 5;
      prompt = `2${toSuperscript(exp)} - ${val} = ?`;
      correctAnswer = Math.pow(2, exp) - val;
      sig = `pow-2-${exp}-${val}`;
    } else if (sub === 1) {
      const base = [3, 4, 5][Math.floor(Math.random() * 3)];
      const exp = base === 3 ? [2, 3, 4][Math.floor(Math.random() * 3)] : [2, 3][Math.floor(Math.random() * 2)];
      const val = Math.floor(Math.random() * 20) + 10;
      prompt = `${base}${toSuperscript(exp)} + ${val} = ?`;
      correctAnswer = Math.pow(base, exp) + val;
      sig = `pow-base-${base}-${exp}-${val}`;
    } else if (sub === 2) {
      const pairs = [
        { b: 2, x: 4, val: 16 },
        { b: 2, x: 5, val: 32 },
        { b: 2, x: 6, val: 64 },
        { b: 3, x: 3, val: 27 },
        { b: 3, x: 4, val: 81 },
        { b: 5, x: 3, val: 125 },
      ];
      const p = pairs[Math.floor(Math.random() * pairs.length)];
      prompt = `${p.b}ˣ = ${p.val}  →  x = ?`;
      correctAnswer = p.x;
      sig = `pow-eq-${p.b}-${p.x}`;
    } else {
      const pairs = [
        { text: '(-2)⁴ + (-3)²', ans: 16 + 9 },
        { text: '(-4)² + (-5)²', ans: 16 + 25 },
        { text: '(-2)⁵ + (-3)³', ans: -32 - 27 },
        { text: '(-1)¹⁰ + (-2)³', ans: 1 - 8 },
        { text: '(-3)³ + (-2)⁴', ans: -27 + 16 },
      ];
      const p = pairs[Math.floor(Math.random() * pairs.length)];
      prompt = `${p.text} = ?`;
      correctAnswer = p.ans;
      sig = `pow-neg-${p.text}`;
    }
  } else if (cat === 4) {
    category = 'Birinci Dereceden Denklemler';
    const sub = Math.floor(Math.random() * 4);
    if (sub === 0) {
      const a = Math.floor(Math.random() * 5) + 2;
      const x = Math.floor(Math.random() * 12) + 3;
      const b = Math.floor(Math.random() * 18) + 4;
      const c = a * x - b;
      prompt = `${a}x - ${b} = ${c}  →  x = ?`;
      correctAnswer = x;
      sig = `eq-1-${a}-${b}-${c}`;
    } else if (sub === 1) {
      const a = Math.floor(Math.random() * 5) + 2;
      const x = Math.floor(Math.random() * 12) + 3;
      const b = Math.floor(Math.random() * 20) + 5;
      const c = a * x + b;
      prompt = `${a}x + ${b} = ${c}  →  x = ?`;
      correctAnswer = x;
      sig = `eq-2-${a}-${b}-${c}`;
    } else if (sub === 2) {
      const a = Math.floor(Math.random() * 4) + 2;
      const x = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * 6) + 2;
      const c = a * (x + b);
      prompt = `${a}(x + ${b}) = ${c}  →  x = ?`;
      correctAnswer = x;
      sig = `eq-3-${a}-${b}-${c}`;
    } else {
      const a = Math.floor(Math.random() * 4) + 5;
      const c = Math.floor(Math.random() * 3) + 2;
      const x = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      const d = (a - c) * x + b;
      prompt = `${a}x + ${b} = ${c}x + ${d}  →  x = ?`;
      correctAnswer = x;
      sig = `eq-4-${a}-${c}-${x}`;
    }
  } else if (cat === 5) {
    category = 'Oran-Orantı & Verimlilik';
    const sub = Math.floor(Math.random() * 3);
    if (sub === 0) {
      const kwh = [14, 15, 16, 18, 20][Math.floor(Math.random() * 5)];
      const mul = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
      const dist = 100 * mul;
      prompt = `100 km'de ${kwh} kWh elektrik tüketen TOGG, ${dist} km'de kaç kWh harcar?`;
      correctAnswer = kwh * mul;
      sig = `ratio-cons-${kwh}-${dist}`;
    } else if (sub === 1) {
      const h1 = [2, 3][Math.floor(Math.random() * 2)];
      const spd = [70, 80, 90, 100][Math.floor(Math.random() * 4)];
      const d1 = h1 * spd;
      const h2 = [4, 5, 6][Math.floor(Math.random() * 3)];
      prompt = `Sabit hızla ${h1} saatte ${d1} km giden araç, aynı hızla ${h2} saatte kaç km yol alır?`;
      correctAnswer = spd * h2;
      sig = `ratio-dist-${h1}-${d1}-${h2}`;
    } else {
      const pairs = [
        { v1: 60, t1: 4, v2: 80, ans: 3 },
        { v1: 60, t1: 6, v2: 90, ans: 4 },
        { v1: 80, t1: 3, v2: 120, ans: 2 },
        { v1: 90, t1: 4, v2: 60, ans: 6 },
        { v1: 100, t1: 3, v2: 75, ans: 4 },
      ];
      const p = pairs[Math.floor(Math.random() * pairs.length)];
      prompt = `Bir pisti saatte ${p.v1} km hızla ${p.t1} saatte turlayan araç, saatte ${p.v2} km hızla kaç saatte tamamlar?`;
      correctAnswer = p.ans;
      sig = `ratio-inv-${p.v1}-${p.t1}-${p.v2}`;
    }
  } else {
    category = 'Geometri, Alan & Çevre';
    const sub = Math.floor(Math.random() * 4);
    if (sub === 0) {
      const w = Math.floor(Math.random() * 25) + 12;
      const h = Math.floor(Math.random() * 40) + 25;
      prompt = `Kısa kenarı ${w} m, uzun kenarı ${h} m olan test pistinin çevre uzunluğu kaç metredir?`;
      correctAnswer = 2 * (w + h);
      sig = `geo-rect-${w}-${h}`;
    } else if (sub === 1) {
      const side = Math.floor(Math.random() * 15) + 11;
      prompt = `Bir kenar uzunluğu ${side} metre olan kare biçimindeki TOGG şarj istasyonunun alanı kaç m²'dir?`;
      correctAnswer = side * side;
      sig = `geo-sq-${side}`;
    } else if (sub === 2) {
      const b = [12, 14, 16, 18, 20, 24][Math.floor(Math.random() * 6)];
      const h = [6, 8, 10, 12, 14, 16][Math.floor(Math.random() * 6)];
      prompt = `Tabanı ${b} m ve yüksekliği ${h} m olan üçgen pist alanının yüzölçümü kaç m²'dir?`;
      correctAnswer = (b * h) / 2;
      sig = `geo-tri-${b}-${h}`;
    } else {
      const r = [10, 15, 20, 25, 30, 40, 50][Math.floor(Math.random() * 7)];
      prompt = `Yarıçapı ${r} metre olan dairesel virajın çevresi kaç metredir? (π = 3 alınız)`;
      correctAnswer = 2 * 3 * r;
      sig = `geo-circle-${r}`;
    }
  }

  const distractors = generateDistractors(correctAnswer);
  const options = shuffle([correctAnswer, ...distractors]);

  return {
    category,
    correctAnswer,
    options,
    prompt,
    sig,
  };
}

export function generateRallyQuestion(
  streak: number,
  askedSignatures: Set<string>,
): RallyQuestion {
  let attempts = 0;
  while (attempts < 60) {
    attempts++;
    const candidate = createCandidateRallyQuestion(streak);
    if (!askedSignatures.has(candidate.sig)) {
      askedSignatures.add(candidate.sig);
      return candidate;
    }
  }
  const fallback = createCandidateRallyQuestion(streak);
  askedSignatures.add(`${fallback.sig}-${Date.now()}`);
  return fallback;
}

// ==========================================
// 3. ARAÇ VE PİST SVG BİLEŞENLERİ
// ==========================================

function PlayerCarSVG({
  carId,
  colorHex,
  isNitro,
  isTogg,
}: {
  carId: string;
  colorHex: string;
  isNitro: boolean;
  isTogg: boolean;
}) {
  return (
    <div className="relative w-14 h-24 flex items-center justify-center select-none">
      {/* Trugo Nitro Jet Alevleri */}
      {isNitro && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0.6 }}
          animate={{ opacity: [0.8, 1, 0.8], scaleY: [1, 1.3, 1] }}
          transition={{ duration: 0.15, repeat: Infinity }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-0"
        >
          <div className="flex gap-4">
            <div className="w-2.5 h-7 bg-gradient-to-b from-cyan-400 via-sky-500 to-transparent rounded-full blur-[1px] animate-pulse" />
            <div className="w-2.5 h-7 bg-gradient-to-b from-cyan-400 via-sky-500 to-transparent rounded-full blur-[1px] animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Vektör Gövde Çizimi */}
      <svg
        viewBox="0 0 64 100"
        className="w-full h-full relative z-10 drop-shadow-xl"
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
        <polygon points="12,14 4,-6 24,-6 18,14" fill="url(#headlight-beam)" opacity="0.4" />
        <polygon points="46,14 40,-6 60,-6 52,14" fill="url(#headlight-beam)" opacity="0.4" />

        {/* Tekerlekler */}
        <rect x="4" y="20" width="7" height="15" rx="3" fill="#1e293b" />
        <rect x="53" y="20" width="7" height="15" rx="3" fill="#1e293b" />
        <rect x="4" y="68" width="7" height="15" rx="3" fill="#1e293b" />
        <rect x="53" y="68" width="7" height="15" rx="3" fill="#1e293b" />

        {/* Ana Aerodinamik Gövde */}
        <path
          d="M 18 10 C 26 8, 38 8, 46 10 C 52 14, 55 24, 55 38 C 55 58, 54 82, 48 90 C 44 93, 20 93, 16 90 C 10 82, 9 58, 9 38 C 9 24, 12 14, 18 10 Z"
          fill={`url(#car-body-${carId})`}
          stroke={isNitro ? '#38bdf8' : '#334155'}
          strokeWidth="1.5"
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

        {/* TOGG Özel: Lale Motifi Ön Izgara & Trugo Amblemi */}
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
    <div className="w-11 h-20 opacity-85 drop-shadow-md select-none">
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

// ==========================================
// 4. ANA OYUN BİLEŞENİ
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
  const [speedKmh, setSpeedKmh] = useState(120);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState(120);
  const [overtaken, setOvertaken] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [trugoNitro, setTrugoNitro] = useState(25);
  const [totalAnswers, setTotalAnswers] = useState(0);

  // Pist ve Şerit Kontrolü (0: Şerit 1, 1: Şerit 2, 2: Şerit 3, 3: Şerit 4)
  const [selectedLane, setSelectedLane] = useState(0);
  const [selectedLaneAnswered, setSelectedLaneAnswered] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [isCrash, setIsCrash] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'correct' | 'wrong';
  } | null>(null);

  // Soru Havuzu
  const askedSignaturesRef = useRef<Set<string>>(new Set());
  const [question, setQuestion] = useState<RallyQuestion>(() =>
    generateRallyQuestion(0, new Set()),
  );

  // Rakip Araçlar (Şeritler üzerinde animasyon)
  const [rivalCars, setRivalCars] = useState<Array<{ color: string; id: number; lane: number; top: number }>>([
    { id: 1, lane: 1, top: 15, color: '#f59e0b' },
    { id: 2, lane: 2, top: 38, color: '#8b5cf6' },
    { id: 3, lane: 3, top: 20, color: '#64748b' },
  ]);

  const hasSubmittedRef = useRef(false);
  const nextQuestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // 60 Saniye Zamanlayıcı
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

  // Zamanlayıcıları temizle
  useEffect(() => {
    return () => {
      if (nextQuestionTimeoutRef.current) {
        clearTimeout(nextQuestionTimeoutRef.current);
      }
    };
  }, []);

  // Oyunu Başlat
  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setSpeedKmh(120);
    setMaxSpeedKmh(120);
    setOvertaken(0);
    setStreak(0);
    setMaxStreak(0);
    setTrugoNitro(25);
    setTotalAnswers(0);
    setSelectedLane(0);
    setSelectedLaneAnswered(null);
    setIsEvaluating(false);
    setIsNitroActive(false);
    setIsCrash(false);
    setFeedback(null);
    askedSignaturesRef.current.clear();
    setQuestion(generateRallyQuestion(0, askedSignaturesRef.current));
    setGameState('playing');
    gameAudio.playPop();
  }, []);

  // Şerit ve Cevap Seçimi
  const handleAnswerLane = useCallback(
    (laneIndex: number) => {
      if (gameState !== 'playing' || isEvaluating) return;

      setIsEvaluating(true);
      setSelectedLane(laneIndex);
      setSelectedLaneAnswered(laneIndex);
      setTotalAnswers((t) => t + 1);

      const chosenOption = question.options[laneIndex];
      const isCorrect = chosenOption === question.correctAnswer;
      const correctLaneIndex = question.options.findIndex(
        (o) => o === question.correctAnswer,
      );

      if (isCorrect) {
        setIsNitroActive(true);
        const newStreak = streak + 1;
        const streakBonus = Math.min(newStreak * 25, 125);
        let baseEarned = 100 + streakBonus;

        // Trugo %100 Süper Şarj Bonusu
        if (trugoNitro >= 100) {
          baseEarned += 50;
        }

        // Araç bonusu
        const vehicleMultiplier = selectedCar.isTogg
          ? 1.15
          : selectedCar.id === 'gtr' || selectedCar.id === 'cyber'
          ? 1.1
          : 1.0;
        const pointsEarned = Math.round(baseEarned * vehicleMultiplier);

        setScore((s) => s + pointsEarned);
        setStreak(newStreak);
        setMaxStreak((m) => Math.max(m, newStreak));
        setOvertaken((o) => o + 1);
        setTrugoNitro((n) => Math.min(100, n + 25));

        setSpeedKmh((prev) => {
          const nextSpeed = Math.min(280, prev + 20);
          setMaxSpeedKmh((m) => Math.max(m, nextSpeed));
          return nextSpeed;
        });

        // Rakip araçların sollama animasyonu
        setRivalCars((prev) =>
          prev.map((r) => ({
            ...r,
            top: r.top > 80 ? 10 : r.top + 35,
            lane: (r.lane + 1) % 4 === laneIndex ? (r.lane + 2) % 4 : r.lane,
          })),
        );

        if (newStreak >= 3) {
          gameAudio.playCombo(newStreak);
        } else {
          gameAudio.playNitro();
        }

        setFeedback({
          message: `Harika Sollama! ⚡ (+${pointsEarned} Puan, ${selectedCar.bonusText})`,
          type: 'correct',
        });
      } else {
        setIsCrash(true);
        setStreak(0);
        setTrugoNitro(0);
        setSpeedKmh((prev) => Math.max(80, prev - 30));
        setLives((l) => {
          const nextLives = l - 1;
          if (nextLives <= 0) {
            finishGame();
          }
          return Math.max(0, nextLives);
        });

        gameAudio.playWrong();
        setFeedback({
          message: `Bariyere Çarptın! 💥 (Doğru Şerit: Şerit ${correctLaneIndex + 1} → ${question.correctAnswer})`,
          type: 'wrong',
        });
      }

      // 750ms sonra sonraki soruya geçiş
      nextQuestionTimeoutRef.current = setTimeout(() => {
        setIsEvaluating(false);
        setIsNitroActive(false);
        setIsCrash(false);
        setSelectedLaneAnswered(null);
        setFeedback(null);
        setQuestion(
          generateRallyQuestion(
            streak + (isCorrect ? 1 : 0),
            askedSignaturesRef.current,
          ),
        );
      }, 750);
    },
    [
      gameState,
      isEvaluating,
      question,
      streak,
      trugoNitro,
      selectedCar,
      finishGame,
    ],
  );

  // Klavye Kontrolleri: 1-4 tuşları doğrudan şerit seçer, Ok tuşları şeridi kaydırır, Enter/Boşluk onaylar
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
        const lane = parseInt(e.key, 10) - 1;
        handleAnswerLane(lane);
      } else if (e.key === 'ArrowLeft') {
        setSelectedLane((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedLane((prev) => Math.min(3, prev + 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAnswerLane(selectedLane);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, selectedLane, handleAnswerLane]);

  // İsabet oranı hesabı
  const accuracy = useMemo(() => {
    if (totalAnswers === 0) return 0;
    return Math.round((overtaken / totalAnswers) * 100);
  }, [totalAnswers, overtaken]);

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
              Şeritlerdeki matematik engellerini çöz, rakipleri solla ve Trugo süper torku yakala!
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
              Aracını ve yarış pistini seç. 4 şeritli otoyolda doğru matematik şeridine geçerek rakipleri solla,
              Trugo süper şarj ile maksimum torku elde et!
            </p>
          </div>

          {/* ARAÇ SEÇİM KARTLARI (div role="radio" - testlerin start butonunu bulması için ilk button Start olmalıdır) */}
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
                        isNitro={false}
                        isTogg={vehicle.isTogg}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOGG RENK PALETİ SEÇİMİ (Yalnızca TOGG seçiliyse) */}
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

          {/* BİRİNCİL BAŞLAT BUTONU (DOM içindeki İLK buton! Testler screen.getAllByRole('button')[0] ile tıklar) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 px-10 py-4 rounded-xl font-black text-lg transition-all transform active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
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
        </div>
      )}

      {/* 3. OYUN ALANI (PLAYING) */}
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
                    trugoNitro >= 100
                      ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-amber-400 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                  }`}
                  animate={{ width: `${trugoNitro}%` }}
                />
              </div>
            </div>

            {streak >= 2 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
                {streak} Sollama Serisi!
              </div>
            )}
          </div>

          {/* MATEMATİK SORU KARTI */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 dark:bg-slate-800/90 rounded-2xl border border-cyan-200 dark:border-cyan-800/50 text-center shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 font-mono uppercase tracking-wide">
                {question.category}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-wide text-slate-900 dark:text-white font-mono my-1 select-none">
              {question.prompt}
            </h3>

            {/* Geri Bildirim Bildirimi */}
            <div className="h-6 mt-1 flex items-center justify-center">
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
          </div>

          {/* 4 ŞERİTLİ OTOYOL SİMÜLASYONU */}
          <div
            className={`relative w-full h-[220px] sm:h-[260px] rounded-2xl overflow-hidden border-2 ${selectedTrack.borderGlow} shadow-2xl flex flex-col justify-end p-2 ${selectedTrack.asphaltBg}`}
          >
            {/* Şerit Çizgileri ve Zemin */}
            <div className="absolute inset-0 flex justify-between px-3 pointer-events-none">
              {/* 3 Kesikli Yol Çizgisi (4 şeridi böler) */}
              <div className="w-1/4 border-r-2 border-dashed border-white/20 dark:border-white/20 h-full relative overflow-hidden">
                <motion.div
                  className="w-full h-full bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.4)_50%)] bg-[length:100%_40px]"
                  animate={{ backgroundPositionY: ['0px', '40px'] }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: Math.max(0.18, 0.7 - speedKmh / 400) }}
                />
              </div>
              <div className="w-1/4 border-r-2 border-dashed border-white/20 dark:border-white/20 h-full relative overflow-hidden">
                <motion.div
                  className="w-full h-full bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.4)_50%)] bg-[length:100%_40px]"
                  animate={{ backgroundPositionY: ['0px', '40px'] }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: Math.max(0.18, 0.7 - speedKmh / 400) }}
                />
              </div>
              <div className="w-1/4 border-r-2 border-dashed border-white/20 dark:border-white/20 h-full relative overflow-hidden">
                <motion.div
                  className="w-full h-full bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.4)_50%)] bg-[length:100%_40px]"
                  animate={{ backgroundPositionY: ['0px', '40px'] }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: Math.max(0.18, 0.7 - speedKmh / 400) }}
                />
              </div>
              <div className="w-1/4 h-full relative overflow-hidden">
                <motion.div
                  className="w-full h-full bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.4)_50%)] bg-[length:100%_40px]"
                  animate={{ backgroundPositionY: ['0px', '40px'] }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: Math.max(0.18, 0.7 - speedKmh / 400) }}
                />
              </div>
            </div>

            {/* Şerit İsimleri & Ön Kapı Göstergeleri (Yol üstünde uçuşan değerler) */}
            <div className="absolute top-2 inset-x-0 grid grid-cols-4 px-2 text-center pointer-events-none z-10">
              {question.options.map((opt, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] font-mono font-bold text-cyan-300 dark:text-cyan-300 bg-slate-900/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Şerit {idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* RAKİP ARAÇLAR (Sollanırken aşağı doğru kayarlar) */}
            {rivalCars.map((rival) => (
              <motion.div
                key={rival.id}
                className="absolute -translate-x-1/2 pointer-events-none z-10"
                style={{
                  left: `${rival.lane * 25 + 12.5}%`,
                  top: `${rival.top}%`,
                }}
                animate={{
                  top: isNitroActive ? '120%' : `${rival.top}%`,
                }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
              >
                <RivalCarSVG colorHex={rival.color} />
              </motion.div>
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
                left: { type: 'spring', stiffness: 420, damping: 30 },
                x: { duration: 0.35 },
                y: { repeat: Infinity, duration: 0.15 },
              }}
            >
              <PlayerCarSVG
                carId={selectedCar.id}
                colorHex={currentColorHex}
                isNitro={isNitroActive}
                isTogg={selectedCar.isTogg}
              />
            </motion.div>
          </div>

          {/* 4 ŞERİT CEVAP BUTONLARI (Klavye [1], [2], [3], [4] ile uyumlu) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {question.options.map((option, idx) => {
              const isTargetLane = selectedLane === idx;
              const isThisChosen = selectedLaneAnswered === idx;
              const isThisCorrect = option === question.correctAnswer;

              let btnBorder = 'border-slate-200 dark:border-slate-700/80';
              let btnBg = 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800';

              if (isThisChosen) {
                if (isThisCorrect) {
                  btnBorder = 'border-emerald-500 ring-2 ring-emerald-500/40';
                  btnBg = 'bg-emerald-50 dark:bg-emerald-950/40';
                } else {
                  btnBorder = 'border-rose-500 ring-2 ring-rose-500/40';
                  btnBg = 'bg-rose-50 dark:bg-rose-950/40';
                }
              } else if (isTargetLane) {
                btnBorder = 'border-cyan-500 ring-2 ring-cyan-500/30';
                btnBg = 'bg-cyan-50/60 dark:bg-cyan-950/30';
              }

              return (
                <button
                  key={`${question.prompt}-${idx}-${option}`}
                  type="button"
                  onClick={() => handleAnswerLane(idx)}
                  disabled={isEvaluating}
                  className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-between min-h-[92px] shadow-sm disabled:cursor-not-allowed ${btnBorder} ${btnBg}`}
                >
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                      [{idx + 1}]
                    </span>
                    <span>Şerit {idx + 1}</span>
                  </div>

                  <div className="my-1">
                    <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                      {option}
                    </span>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-500" />
                    <span>Tork Şeridi</span>
                  </div>
                </button>
              );
            })}
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
              {overtaken >= 15
                ? '🏆 Pistin Şampiyonu & Hız Efsanesi!'
                : overtaken >= 8
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
              <div className="text-xs text-slate-500 dark:text-slate-400">İsabet Oranı</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                %{accuracy}
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
        <span>Klavye: [1, 2, 3, 4] tuşları veya [← / →] ile şerit değiştir, [Boşluk / Enter] ile solla.</span>
        <span>Çarpan: x{scoreMultiplier}</span>
      </div>
    </div>
  );
}
