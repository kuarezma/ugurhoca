'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Flame,
  Gamepad2,
  Heart,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

export type MazeDirection = 'UP' | 'RIGHT' | 'LEFT' | 'DOWN';

export interface MazeCharacter {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  color: string;
}

const CHARACTERS: MazeCharacter[] = [
  {
    id: 'classic',
    name: 'Altın Pac-Matik',
    emoji: '🟡',
    desc: 'Klasik Hızlı Nokta Avcısı',
    color: 'text-amber-500',
  },
  {
    id: 'princess',
    name: 'Prenses Pembe',
    emoji: '🌸',
    desc: 'Kristal Taçlı Labirent Yıldızı',
    color: 'text-pink-500',
  },
  {
    id: 'unicorn',
    name: 'Gökkuşağı Unicorn',
    emoji: '🦄',
    desc: 'Sihirli Ok Koridoru Ustası',
    color: 'text-purple-500',
  },
  {
    id: 'cat',
    name: 'Neon Pati',
    emoji: '🐱',
    desc: 'Gece Görüşlü Hızlı Kaşif',
    color: 'text-cyan-500',
  },
];

export interface MazeOption {
  dir: MazeDirection;
  text: string;
  value: number | string;
  isCorrect: boolean;
  arrow: string;
  label: string;
  routeLabel: string;
  key: string;
}

export interface MazeQuestion {
  category: string;
  gradeBadge: string;
  prompt: string;
  subHint?: string;
  correctAnswer: number | string;
  correctDir: MazeDirection;
  options: MazeOption[];
  signature: string;
}

const DIRECTION_CONFIGS: {
  dir: MazeDirection;
  arrow: string;
  label: string;
  routeLabel: string;
  key: string;
  corridor: [number, number];
  gate: [number, number];
}[] = [
  {
    dir: 'UP',
    arrow: '⬆️',
    label: 'Yukarı',
    routeLabel: '⬆️ Yukarı Ok Yolu',
    key: '1',
    corridor: [1, 2],
    gate: [0, 2],
  },
  {
    dir: 'RIGHT',
    arrow: '➡️',
    label: 'Sağ',
    routeLabel: '➡️ Doğu Ok Yolu',
    key: '2',
    corridor: [2, 3],
    gate: [2, 4],
  },
  {
    dir: 'LEFT',
    arrow: '⬅️',
    label: 'Sol',
    routeLabel: '⬅️ Batı Ok Yolu',
    key: '3',
    corridor: [2, 1],
    gate: [2, 0],
  },
  {
    dir: 'DOWN',
    arrow: '⬇️',
    label: 'Aşağı',
    routeLabel: '⬇️ Güney Ok Yolu',
    key: '4',
    corridor: [3, 2],
    gate: [4, 2],
  },
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateNumericDistractors(
  correctVal: number,
  count = 3,
): number[] {
  const set = new Set<number>();
  const offsets = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 10, -10];
  const shuffledOffsets = shuffle(offsets);

  for (const off of shuffledOffsets) {
    const cand = correctVal + off;
    if (cand !== correctVal && cand >= 0) {
      set.add(cand);
      if (set.size >= count) break;
    }
  }

  let attempt = 1;
  while (set.size < count) {
    const delta = attempt % 2 === 0 ? attempt : -attempt;
    const cand = Math.max(0, correctVal + delta * 2 + 1);
    if (cand !== correctVal) {
      set.add(cand);
    }
    attempt++;
  }

  return Array.from(set).slice(0, count);
}

export function generateMazeQuestion(
  streak: number,
  askedSignatures: Set<string>,
): MazeQuestion {
  const maxAttempts = 30;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let category = 'Sayı Örüntüleri';
    let gradeBadge = '5. Sınıf';
    let prompt = '';
    let subHint = '';
    let correctAnswer: number | string = 0;
    let distractorValues: (number | string)[] = [];
    let sig = '';

    const categoryPool = [
      'pattern',
      'fraction',
      'equation',
      'power_root',
      'geometry',
      'percent_ratio',
    ];

    let chosenCategory = 'pattern';
    if (streak >= 6) {
      chosenCategory =
        categoryPool[Math.floor(Math.random() * categoryPool.length)];
    } else if (streak >= 3) {
      const midPool = ['pattern', 'fraction', 'equation', 'geometry', 'percent_ratio'];
      chosenCategory = midPool[Math.floor(Math.random() * midPool.length)];
    } else {
      const basicPool = ['pattern', 'fraction', 'geometry'];
      chosenCategory = basicPool[Math.floor(Math.random() * basicPool.length)];
    }

    if (chosenCategory === 'pattern') {
      category = 'Sayı Örüntüleri';
      gradeBadge = '5-6. Sınıf';
      const subType = Math.floor(Math.random() * 3);

      if (subType === 0) {
        // İleriye doğru adım örüntüsü
        const start = Math.floor(Math.random() * 30) + 4;
        const step = Math.floor(Math.random() * 9) + 3; // 3..11
        const term1 = start;
        const term2 = start + step;
        const term3 = start + step * 2;
        const term4 = start + step * 3;
        correctAnswer = start + step * 4;
        prompt = `Örüntüde soru işareti yerine hangi sayı gelmelidir?\n${term1}, ${term2}, ${term3}, ${term4}, [ ? ]`;
        subHint = `Her adımda +${step} artıyor`;
        sig = `pat-next-${start}-${step}`;
        distractorValues = [
          correctAnswer - step,
          correctAnswer + step,
          correctAnswer + step * 2,
        ];
      } else if (subType === 1) {
        // Ortadaki eksik terim
        const start = Math.floor(Math.random() * 25) + 6;
        const step = Math.floor(Math.random() * 8) + 4; // 4..11
        const term1 = start;
        const term2 = start + step;
        correctAnswer = start + step * 2;
        const term4 = start + step * 3;
        const term5 = start + step * 4;
        prompt = `Örüntüde eksik bırakılan terim kaçtır?\n${term1}, ${term2}, [ ? ], ${term4}, ${term5}`;
        subHint = `Ardışık terimler arasındaki farkı bul`;
        sig = `pat-mid-${start}-${step}`;
        distractorValues = generateNumericDistractors(correctAnswer, 3);
      } else {
        // N. terim hesabı
        const start = Math.floor(Math.random() * 8) + 3;
        const step = Math.floor(Math.random() * 6) + 3;
        const n = Math.floor(Math.random() * 4) + 6; // 6..9
        correctAnswer = start + (n - 1) * step;
        prompt = `İlk terimi ${start} ve artış kuralı (+${step}) olan örüntünün ${n}. terimi kaçtır?`;
        subHint = `Kural: ${start} + (${n} - 1) × ${step}`;
        sig = `pat-nth-${start}-${step}-${n}`;
        distractorValues = [
          correctAnswer + step,
          correctAnswer - step,
          correctAnswer + step * 2,
        ];
      }
    } else if (chosenCategory === 'fraction') {
      category = 'Kesir & Ondalık';
      gradeBadge = '5-6. Sınıf';
      const subType = Math.floor(Math.random() * 3);

      if (subType === 0) {
        // Bütünden parçaya
        const denomList = [4, 5, 6, 8, 10];
        const denom = denomList[Math.floor(Math.random() * denomList.length)];
        const num = Math.floor(Math.random() * (denom - 1)) + 1;
        const unit = Math.floor(Math.random() * 12) + 5;
        const total = denom * unit;
        correctAnswer = num * unit;
        prompt = `${total} sayısının ${num}/${denom}'i kaçtır?`;
        subHint = `${total} ÷ ${denom} = ${unit}, sonra ${unit} × ${num}`;
        sig = `frac-part-${total}-${num}-${denom}`;
        distractorValues = [
          unit * (num + 1),
          unit * Math.max(1, num - 1),
          total - correctAnswer,
        ];
      } else if (subType === 1) {
        // Ondalık gösterim toplama / çıkarma
        const aInt = Math.floor(Math.random() * 15) + 3;
        const aDec = Math.floor(Math.random() * 9) + 1;
        const bInt = Math.floor(Math.random() * 9) + 2;
        const bDec = Math.floor(Math.random() * 9) + 1;
        const a = parseFloat(`${aInt}.${aDec}`);
        const b = parseFloat(`${bInt}.${bDec}`);
        correctAnswer = parseFloat((a + b).toFixed(1));
        prompt = `${a} + ${b} işleminin sonucu kaçtır?`;
        subHint = 'Virgüller alt alta gelecek şekilde topla';
        sig = `dec-add-${a}-${b}`;
        distractorValues = [
          parseFloat((correctAnswer + 0.2).toFixed(1)),
          parseFloat((correctAnswer - 0.2).toFixed(1)),
          parseFloat((correctAnswer + 1.0).toFixed(1)),
        ];
      } else {
        // Ondalık çarpma
        const baseVals = [0.4, 0.5, 0.6, 0.8, 1.2, 1.5, 2.5];
        const a = baseVals[Math.floor(Math.random() * baseVals.length)];
        const mult = Math.floor(Math.random() * 5) + 2; // 2..6
        correctAnswer = parseFloat((a * mult).toFixed(1));
        prompt = `${a} × ${mult} işleminin sonucu kaçtır?`;
        subHint = `${a} sayısını ${mult} ile çarp`;
        sig = `dec-mult-${a}-${mult}`;
        distractorValues = [
          parseFloat((correctAnswer + 0.5).toFixed(1)),
          parseFloat((correctAnswer - 0.5).toFixed(1)),
          parseFloat((correctAnswer + 1.2).toFixed(1)),
        ];
      }
    } else if (chosenCategory === 'equation') {
      category = 'Denklem Çözme';
      gradeBadge = '7. Sınıf';
      const subType = Math.floor(Math.random() * 3);

      if (subType === 0) {
        // ax + b = c
        const a = Math.floor(Math.random() * 5) + 2; // 2..6
        const x = Math.floor(Math.random() * 9) + 3; // 3..11
        const b = Math.floor(Math.random() * 16) + 4; // 4..19
        const c = a * x + b;
        correctAnswer = x;
        prompt = `${a}x + ${b} = ${c}  →  x = ?`;
        subHint = `${a}x = ${c} - ${b}`;
        sig = `eq-lin-${a}-${b}-${c}`;
        distractorValues = generateNumericDistractors(x, 3);
      } else if (subType === 1) {
        // a(x - b) = c
        const a = Math.floor(Math.random() * 4) + 2; // 2..5
        const b = Math.floor(Math.random() * 5) + 2; // 2..6
        const x = Math.floor(Math.random() * 8) + b + 2; // ensure x > b
        const c = a * (x - b);
        correctAnswer = x;
        prompt = `${a}(x - ${b}) = ${c}  →  x = ?`;
        subHint = `Her iki tarafı ${a}'e böl: x - ${b} = ${c / a}`;
        sig = `eq-par-${a}-${b}-${c}`;
        distractorValues = generateNumericDistractors(x, 3);
      } else {
        // ax + b = cx + d
        const cCoef = Math.floor(Math.random() * 3) + 2; // 2..4
        const aCoef = cCoef + Math.floor(Math.random() * 3) + 1; // cCoef + 1..3
        const x = Math.floor(Math.random() * 7) + 3; // 3..9
        const b = Math.floor(Math.random() * 10) + 2;
        const d = (aCoef - cCoef) * x + b;
        correctAnswer = x;
        prompt = `${aCoef}x + ${b} = ${cCoef}x + ${d}  →  x = ?`;
        subHint = `${aCoef - cCoef}x = ${d - b}`;
        sig = `eq-both-${aCoef}-${cCoef}-${x}`;
        distractorValues = generateNumericDistractors(x, 3);
      }
    } else if (chosenCategory === 'power_root') {
      category = 'Üslü & Köklü Sayılar';
      gradeBadge = '8. Sınıf';
      const subType = Math.floor(Math.random() * 3);

      if (subType === 0) {
        // Üslü sayı çıkarma/toplama
        const baseList = [2, 3, 4, 5];
        const base = baseList[Math.floor(Math.random() * baseList.length)];
        const exp = base === 2 ? 5 : base === 3 ? 3 : 2;
        const off = Math.floor(Math.random() * 9) + 3;
        correctAnswer = Math.pow(base, exp) - off;
        const expSymbol = exp === 5 ? '⁵' : exp === 3 ? '³' : '²';
        prompt = `${base}${expSymbol} - ${off} işleminin sonucu kaçtır?`;
        subHint = `${base}${expSymbol} = ${Math.pow(base, exp)}`;
        sig = `pow-diff-${base}-${exp}-${off}`;
        distractorValues = generateNumericDistractors(correctAnswer, 3);
      } else if (subType === 1) {
        // Tam kare kök toplamı
        const squares = [
          { val: 16, root: 4 },
          { val: 25, root: 5 },
          { val: 36, root: 6 },
          { val: 49, root: 7 },
          { val: 64, root: 8 },
          { val: 81, root: 9 },
          { val: 100, root: 10 },
          { val: 121, root: 11 },
          { val: 144, root: 12 },
          { val: 169, root: 13 },
        ];
        const s1 = squares[Math.floor(Math.random() * squares.length)];
        let s2 = squares[Math.floor(Math.random() * squares.length)];
        while (s2.val === s1.val) {
          s2 = squares[Math.floor(Math.random() * squares.length)];
        }
        correctAnswer = s1.root + s2.root;
        prompt = `√${s1.val} + √${s2.val} işleminin sonucu kaçtır?`;
        subHint = `√${s1.val} = ${s1.root} ve √${s2.val} = ${s2.root}`;
        sig = `sqrt-sum-${s1.val}-${s2.val}`;
        distractorValues = generateNumericDistractors(correctAnswer, 3);
      } else {
        // Negatif taban üsleri
        const a = Math.floor(Math.random() * 3) + 2; // 2..4
        const b = Math.floor(Math.random() * 2) + 2; // 2..3
        correctAnswer = a * a + (b === 2 ? 4 : -8);
        prompt = `(-${a})² + (-${b})³ işleminin sonucu kaçtır?`;
        subHint = `(-${a})² = ${a * a}, (-${b})³ = ${b === 2 ? -8 : -27}`;
        correctAnswer = a * a + (b === 2 ? -8 : -27);
        sig = `pow-neg-${a}-${b}`;
        distractorValues = generateNumericDistractors(correctAnswer, 3);
      }
    } else if (chosenCategory === 'geometry') {
      category = 'Geometri & Açılar';
      gradeBadge = '5-7. Sınıf';
      const subType = Math.floor(Math.random() * 3);

      if (subType === 0) {
        // Üçgenin üçüncü açısı
        const a = Math.floor(Math.random() * 35) + 40; // 40..74
        const b = Math.floor(Math.random() * 35) + 40; // 40..74
        correctAnswer = 180 - (a + b);
        prompt = `Bir üçgenin iki iç açısı ${a}° ve ${b}° ise üçüncü iç açısı kaç derecedir?`;
        subHint = `Üçgenin iç açıları toplamı 180°'dir`;
        sig = `geom-tri-${a}-${b}`;
        distractorValues = [
          correctAnswer + 10,
          correctAnswer - 10,
          correctAnswer + 15,
        ];
      } else if (subType === 1) {
        // Tümler veya Bütünler açı
        const isComp = Math.random() > 0.5;
        if (isComp) {
          const deg = Math.floor(Math.random() * 45) + 25; // 25..69
          correctAnswer = 90 - deg;
          prompt = `Ölçüsü ${deg}° olan açının tümleri kaç derecedir?`;
          subHint = `Tümler açıların toplamı 90°'dir`;
          sig = `geom-comp-${deg}`;
        } else {
          const deg = Math.floor(Math.random() * 60) + 50; // 50..109
          correctAnswer = 180 - deg;
          prompt = `Ölçüsü ${deg}° olan açının bütünleri kaç derecedir?`;
          subHint = `Bütünler açıların toplamı 180°'dir`;
          sig = `geom-supp-${deg}`;
        }
        distractorValues = [
          correctAnswer + 10,
          correctAnswer - 10,
          correctAnswer + 20,
        ];
      } else {
        // Dikdörtgen çevre ve kenar hesabı
        const w = Math.floor(Math.random() * 6) + 4; // 4..9
        const l = w + Math.floor(Math.random() * 6) + 3; // w + 3..8
        correctAnswer = 2 * (w + l);
        prompt = `Kenar uzunlukları ${w} cm ve ${l} cm olan bir dikdörtgenin çevresi kaç cm'dir?`;
        subHint = `Çevre = 2 × (Kısa Kenar + Uzun Kenar)`;
        sig = `geom-rect-${w}-${l}`;
        distractorValues = [
          w * l,
          correctAnswer + 4,
          correctAnswer - 4,
        ];
      }
    } else {
      category = 'Yüzde & Oran';
      gradeBadge = '6-7. Sınıf';
      const subType = Math.floor(Math.random() * 3);

      if (subType === 0) {
        // Bir sayının yüzdesi
        const pList = [10, 15, 20, 25, 30, 40, 50];
        const p = pList[Math.floor(Math.random() * pList.length)];
        const base = (Math.floor(Math.random() * 15) + 4) * 20; // 80..360
        correctAnswer = (base * p) / 100;
        prompt = `${base} sayısının %${p}'i kaçtır?`;
        subHint = `${base} × ${p} ÷ 100`;
        sig = `pct-val-${base}-${p}`;
        distractorValues = generateNumericDistractors(correctAnswer, 3);
      } else if (subType === 1) {
        // İndirimli fiyat
        const pList = [10, 20, 25, 30, 50];
        const p = pList[Math.floor(Math.random() * pList.length)];
        const orig = (Math.floor(Math.random() * 12) + 4) * 25; // 100..375
        const discount = (orig * p) / 100;
        correctAnswer = orig - discount;
        prompt = `${orig} TL olan bir spor ayakkabıya %${p} indirim yapılırsa yeni fiyat kaç TL olur?`;
        subHint = `İndirim tutarı: ${discount} TL`;
        sig = `pct-disc-${orig}-${p}`;
        distractorValues = [
          discount,
          correctAnswer + 25,
          correctAnswer - 25,
        ];
      } else {
        // Doğru orantı
        const speed = (Math.floor(Math.random() * 5) + 4) * 15; // 60, 75, 90, 105, 120
        const t1 = Math.floor(Math.random() * 2) + 2; // 2..3
        const dist1 = speed * t1;
        const t2 = t1 + Math.floor(Math.random() * 2) + 2; // t1 + 2..3
        correctAnswer = speed * t2;
        prompt = `Sabit hızla giden bir tren ${t1} saatte ${dist1} km yol alıyorsa, aynı hızla ${t2} saatte kaç km yol alır?`;
        subHint = `1 saatteki hızı: ${dist1} ÷ ${t1} = ${speed} km/s`;
        sig = `prop-train-${speed}-${t1}-${t2}`;
        distractorValues = [
          correctAnswer + speed,
          correctAnswer - speed,
          dist1 * 2,
        ];
      }
    }

    if (!askedSignatures.has(sig) || attempt === maxAttempts - 1) {
      askedSignatures.add(sig);

      // Distractorları kesin benzersiz yap
      const finalDistractors = new Set<string | number>();
      for (const d of distractorValues) {
        if (d !== correctAnswer && !finalDistractors.has(d)) {
          finalDistractors.add(d);
        }
      }

      // 3 distractora tamamla
      let fillStep = 1;
      while (finalDistractors.size < 3) {
        if (typeof correctAnswer === 'number') {
          const delta = fillStep % 2 === 0 ? fillStep : -fillStep;
          const cand: number = correctAnswer + delta;
          if (cand !== correctAnswer && cand >= 0) {
            finalDistractors.add(cand);
          }
        } else {
          finalDistractors.add(`${correctAnswer}*`);
        }
        fillStep++;
      }

      const distractorArray = Array.from(finalDistractors).slice(0, 3);

      // 4 Yönü rastgele seç
      const correctDirIndex = Math.floor(Math.random() * 4);
      const correctDir = DIRECTION_CONFIGS[correctDirIndex].dir;

      const options: MazeOption[] = DIRECTION_CONFIGS.map((config) => {
        if (config.dir === correctDir) {
          return {
            ...config,
            text: String(correctAnswer),
            value: correctAnswer,
            isCorrect: true,
          };
        } else {
          const val = distractorArray.pop()!;
          return {
            ...config,
            text: String(val),
            value: val,
            isCorrect: false,
          };
        }
      });

      return {
        category,
        gradeBadge,
        prompt,
        subHint,
        correctAnswer,
        correctDir,
        options,
        signature: sig,
      };
    }
  }

  // Güvenli fallback
  const fallbackAnswer = 35;
  const correctDir = 'UP';
  const distractors = [30, 40, 25];
  const options: MazeOption[] = DIRECTION_CONFIGS.map((config) => {
    if (config.dir === correctDir) {
      return {
        ...config,
        text: String(fallbackAnswer),
        value: fallbackAnswer,
        isCorrect: true,
      };
    }
    return {
      ...config,
      text: String(distractors.pop() || 20),
      value: 20,
      isCorrect: false,
    };
  });

  return {
    category: 'Zihinden İşlem',
    gradeBadge: '5. Sınıf',
    prompt: '5 × 7 işleminin sonucu kaçtır?',
    correctAnswer: fallbackAnswer,
    correctDir,
    options,
    signature: 'fallback-5x7',
  };
}

export function PacMathMaze({
  onExit,
  onScore,
  scoreMultiplier = 1,
}: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('classic');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [dotsEaten, setDotsEaten] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [correctMoves, setCorrectMoves] = useState(0);

  // Labirent Animasyon Durumu
  const [pacPos, setPacPos] = useState<[number, number]>([2, 2]);
  const [isMoving, setIsMoving] = useState(false);
  const [selectedDir, setSelectedDir] = useState<MazeDirection | null>(null);
  const [scaredGhosts, setScaredGhosts] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'correct' | 'wrong';
  } | null>(null);

  const askedSignaturesRef = useRef<Set<string>>(new Set());
  const hasSubmittedRef = useRef(false);
  const moveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [question, setQuestion] = useState<MazeQuestion>(() =>
    generateMazeQuestion(0, new Set()),
  );

  const activeCharacter = useMemo(() => {
    return (
      CHARACTERS.find((c) => c.id === selectedCharacterId) || CHARACTERS[0]
    );
  }, [selectedCharacterId]);

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

  // Skor Gönderimi (Maks 4800)
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
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    askedSignaturesRef.current.clear();
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setDotsEaten(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalMoves(0);
    setCorrectMoves(0);
    setPacPos([2, 2]);
    setIsMoving(false);
    setSelectedDir(null);
    setScaredGhosts(false);
    setFeedback(null);
    setQuestion(generateMazeQuestion(0, askedSignaturesRef.current));
    setGameState('playing');
    gameAudio.playPop();
  }, []);

  const handleDirection = useCallback(
    (dir: MazeDirection) => {
      if (gameState !== 'playing' || isMoving) return;

      const chosenOption = question.options.find((o) => o.dir === dir);
      if (!chosenOption) return;

      setIsMoving(true);
      setSelectedDir(dir);
      setTotalMoves((m) => m + 1);

      const dirConfig = DIRECTION_CONFIGS.find((d) => d.dir === dir)!;
      const corridorPos = dirConfig.corridor;
      const gatePos = dirConfig.gate;

      // 1. Adım: Koridora ilerleme & Pelet yeme
      gameAudio.playPop();
      setPacPos(corridorPos);
      setDotsEaten((d) => d + 1);

      // 2. Adım: Kapıya ulaşma & Cevap değerlendirmesi
      moveTimerRef.current = setTimeout(() => {
        setPacPos(gatePos);
        gameAudio.playPop();

        const isCorrect = chosenOption.isCorrect;

        if (isCorrect) {
          const newStreak = streak + 1;
          const streakBonus = Math.min(newStreak * 25, 125);
          const pointsEarned = 100 + streakBonus;

          setScore((s) => s + pointsEarned);
          setStreak(newStreak);
          setMaxStreak((prev) => Math.max(prev, newStreak));
          setCorrectMoves((c) => c + 1);
          setDotsEaten((d) => d + 1); // Kapıdaki kiraz/yıldız
          setScaredGhosts(true);

          if (newStreak >= 4) {
            gameAudio.playCombo(newStreak);
          } else if (newStreak >= 2) {
            gameAudio.playLevelUp();
          } else {
            gameAudio.playCorrect();
          }

          setFeedback({
            message: `Harika Rota! 🍒 Doğru Cevap: ${chosenOption.text} (+${pointsEarned} Puan)`,
            type: 'correct',
          });
        } else {
          setStreak(0);
          gameAudio.playWrong();
          gameAudio.playWhack();

          const correctOpt = question.options.find((o) => o.isCorrect);
          setFeedback({
            message: `Hayalete Yakalandın! 💥 Doğru Rota: ${correctOpt?.arrow} ${correctOpt?.label} (${correctOpt?.text})`,
            type: 'wrong',
          });

          setLives((l) => {
            const next = l - 1;
            if (next <= 0) {
              finishGame();
            }
            return Math.max(0, next);
          });
        }

        // 3. Adım: Merkeze dönüş ve sonraki soru
        resetTimerRef.current = setTimeout(() => {
          setPacPos([2, 2]);
          setIsMoving(false);
          setSelectedDir(null);
          setScaredGhosts(false);
          setFeedback(null);
          setQuestion(
            generateMazeQuestion(
              streak + (chosenOption.isCorrect ? 1 : 0),
              askedSignaturesRef.current,
            ),
          );
        }, 750);
      }, 220);
    },
    [gameState, isMoving, question, streak, finishGame],
  );

  // Klavye yön tuşları, WASD ve 1,2,3,4 dinleyicisi
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMoving) return;

      const key = e.key;
      if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === '1') {
        e.preventDefault();
        handleDirection('UP');
      } else if (
        key === 'ArrowRight' ||
        key === 'd' ||
        key === 'D' ||
        key === '2'
      ) {
        e.preventDefault();
        handleDirection('RIGHT');
      } else if (
        key === 'ArrowLeft' ||
        key === 'a' ||
        key === 'A' ||
        key === '3'
      ) {
        e.preventDefault();
        handleDirection('LEFT');
      } else if (
        key === 'ArrowDown' ||
        key === 's' ||
        key === 'S' ||
        key === '4'
      ) {
        e.preventDefault();
        handleDirection('DOWN');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isMoving, handleDirection]);

  const accuracy = useMemo(() => {
    if (totalMoves === 0) return 0;
    return Math.round((correctMoves / totalMoves) * 100);
  }, [totalMoves, correctMoves]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-2xl text-slate-900 dark:text-slate-100 min-h-[620px] flex flex-col justify-between select-none">
      {/* BAŞLIK & BİLGİ ŞERİDİ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white dark:text-white shadow-lg shadow-amber-500/20">
            <Gamepad2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Pac-Matik: Ok Labirenti
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                Oklarla Labirent & Matematik Avı
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Soruyu oku, doğru cevabın ok koridoruna koş ve labirenti tamamla!
            </p>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Can Göstergesi */}
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
              <Timer
                className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-spin"
                style={{ animationDuration: '4s' }}
              />
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

            {/* Toplanan Nokta / Kiraz */}
            <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 font-mono font-bold text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>{dotsEaten} Yıldız/Kiraz</span>
            </div>

            {/* Skor */}
            <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-mono font-black text-base">
              {score} Puan
            </div>
          </div>
        )}
      </div>

      {/* BAŞLANGIÇ EKRANI (IDLE) */}
      {gameState === 'idle' && (
        <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/25 text-5xl sm:text-6xl animate-bounce">
              {activeCharacter.emoji}
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-emerald-500 text-slate-950 dark:text-slate-950 rounded-full text-xs font-black shadow-lg">
              60 SN
            </div>
          </div>

          <div className="max-w-lg space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Labirente Girmeye Hazır mısın?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Önüne çıkan matematik sorusunu zihninden çöz. Doğru cevabın
              bulunduğu ok koridoruna (⬆️ ➡️ ⬅️ ⬇️) yönelerek altın noktaları
              ve kirazları topla, hayaletlere yakalanma!
            </p>
          </div>

          {/* KARAKTER SEÇİMİ (role="radiogroup" / role="radio") */}
          <div className="w-full max-w-xl space-y-2">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Karakterini Seç
            </div>
            <div
              role="radiogroup"
              aria-label="Karakter Seçimi"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
            >
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharacterId === char.id;
                return (
                  <div
                    key={char.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => setSelectedCharacterId(char.id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        setSelectedCharacterId(char.id);
                      }
                    }}
                    className={`cursor-pointer p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center select-none ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/15 dark:bg-amber-400/20 shadow-md ring-2 ring-amber-400/40 scale-102'
                        : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span className="text-3xl mb-1">{char.emoji}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {char.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {char.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OYUN BİLGİ KARTLARI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl text-left">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Süre & Can</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                60 Sn / 3 Can
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Kontroller</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Ok Tuşları, WASD, 1-4
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Bonus Noktalar</div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                🍒 Kiraz & ⭐ Yıldız
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Kazanımlar</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                5-8. Sınıf MEB
              </div>
            </div>
          </div>

          {/* İLK BUTON (Testlerin bulacağı birincil buton) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-lg transition-all transform active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" />
              Labirente Gir
            </button>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white font-bold transition-all border border-slate-200 dark:border-transparent cursor-pointer"
              >
                Çıkış
              </button>
            )}
          </div>
        </div>
      )}

      {/* OYUN OYNAMA EKRANI (PLAYING) */}
      {gameState === 'playing' && (
        <div className="py-2 space-y-4">
          {/* SORU EKRANI (GÖREV & MATEMATİK SORUSU) */}
          <div className="relative p-4 sm:p-5 rounded-2xl bg-slate-900/90 dark:bg-slate-950/95 border-2 border-indigo-500/50 dark:border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.25)] text-center overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  {question.category}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 dark:bg-slate-800 text-slate-300 dark:text-slate-300 text-[11px] font-semibold border border-slate-700 dark:border-slate-700">
                  {question.gradeBadge}
                </span>
              </div>
              {streak > 1 && (
                <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
                  <span>{streak} Seri!</span>
                </div>
              )}
            </div>

            <div className="text-lg sm:text-2xl font-black text-white dark:text-white font-mono tracking-wide py-1 whitespace-pre-line">
              {question.prompt}
            </div>

            {question.subHint && (
              <div className="text-xs text-indigo-200/80 dark:text-indigo-300/80 font-medium mt-1">
                İpucu: {question.subHint}
              </div>
            )}

            {/* GERİ BİLDİRİM BANNERI */}
            <div className="min-h-[24px] mt-1.5 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback.message}
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    className={`text-xs sm:text-sm font-black ${
                      feedback.type === 'correct'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 5x5 PAC-MAN NEON LABİRENT IZGARASI */}
          <div className="w-full max-w-[340px] sm:max-w-[380px] aspect-square mx-auto p-2.5 rounded-3xl bg-slate-950/95 dark:bg-slate-950/95 border-4 border-blue-600/70 dark:border-blue-500/70 shadow-[0_0_30px_rgba(37,99,235,0.3)] grid grid-cols-5 grid-rows-5 gap-1.5">
            {[0, 1, 2, 3, 4].map((r) =>
              [0, 1, 2, 3, 4].map((c) => {
                const isPacman = pacPos[0] === r && pacPos[1] === c;

                // 4 Ana Kapı Hücresi
                const isTopGate = r === 0 && c === 2;
                const isRightGate = r === 2 && c === 4;
                const isBottomGate = r === 4 && c === 2;
                const isLeftGate = r === 2 && c === 0;

                // 4 Koridor Hücresi
                const isTopCorridor = r === 1 && c === 2;
                const isRightCorridor = r === 2 && c === 3;
                const isBottomCorridor = r === 3 && c === 2;
                const isLeftCorridor = r === 2 && c === 1;

                // Merkez Kavşak
                const isCenter = r === 2 && c === 2;

                // 4 Köşe (Hayalet Noktaları)
                const isGhostCorner =
                  (r === 0 && c === 0) ||
                  (r === 0 && c === 4) ||
                  (r === 4 && c === 0) ||
                  (r === 4 && c === 4);

                let gateOption: MazeOption | undefined;
                if (isTopGate) gateOption = question.options.find((o) => o.dir === 'UP');
                if (isRightGate) gateOption = question.options.find((o) => o.dir === 'RIGHT');
                if (isBottomGate) gateOption = question.options.find((o) => o.dir === 'DOWN');
                if (isLeftGate) gateOption = question.options.find((o) => o.dir === 'LEFT');

                const isWall =
                  !isPacman &&
                  !isTopGate &&
                  !isRightGate &&
                  !isBottomGate &&
                  !isLeftGate &&
                  !isTopCorridor &&
                  !isRightCorridor &&
                  !isBottomCorridor &&
                  !isLeftCorridor &&
                  !isCenter &&
                  !isGhostCorner;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative rounded-xl flex items-center justify-center transition-all ${
                      isWall
                        ? 'bg-blue-950/40 dark:bg-slate-900/80 border-2 border-blue-500/40 dark:border-blue-600/40 shadow-inner'
                        : isGhostCorner
                        ? 'bg-purple-950/40 dark:bg-purple-950/40 border border-purple-500/30 dark:border-purple-500/30'
                        : gateOption
                        ? 'bg-slate-900 dark:bg-slate-950 border-2 border-amber-400/70 dark:border-amber-400/70 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                        : isCenter
                        ? 'bg-slate-900/90 dark:bg-slate-950/90 border border-yellow-500/30 dark:border-yellow-500/30'
                        : 'bg-slate-900/60 dark:bg-slate-950/60 border border-blue-500/20 dark:border-blue-500/20'
                    }`}
                  >
                    {/* Pac-Matik Karakteri */}
                    {isPacman && (
                      <motion.div
                        className="text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] z-20"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                      >
                        {activeCharacter.emoji}
                      </motion.div>
                    )}

                    {/* Kapı İçeriği (Cevap & Ok) */}
                    {!isPacman && gateOption && (
                      <div className="flex flex-col items-center justify-center p-0.5 text-center">
                        <span className="text-xs sm:text-sm font-black text-amber-300">
                          {gateOption.arrow}
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono font-black text-white dark:text-white px-1 py-0.2 rounded bg-slate-800 dark:bg-slate-800 border border-slate-700 dark:border-slate-700 truncate max-w-[58px]">
                          {gateOption.text}
                        </span>
                        <span className="text-[10px] mt-0.5 opacity-90">
                          {gateOption.isCorrect ? '🍒' : '⭐'}
                        </span>
                      </div>
                    )}

                    {/* Koridor Enerji Noktaları */}
                    {!isPacman &&
                      (isTopCorridor ||
                        isRightCorridor ||
                        isBottomCorridor ||
                        isLeftCorridor) && (
                        <motion.div
                          className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                          animate={{ scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}

                    {/* Köşelerdeki Renkli Hayaletler */}
                    {!isPacman && isGhostCorner && (
                      <motion.div
                        className="text-xl sm:text-2xl"
                        animate={
                          scaredGhosts
                            ? { x: [-2, 2, -2], rotate: [0, 10, -10, 0] }
                            : { y: [-2, 2, -2] }
                        }
                        transition={{ duration: 0.6, repeat: Infinity }}
                      >
                        {scaredGhosts ? '😱' : '👻'}
                      </motion.div>
                    )}

                    {/* Merkez Noktası (Boşken küçük yıldız) */}
                    {!isPacman && isCenter && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
                    )}
                  </div>
                );
              }),
            )}
          </div>

          {/* 4 CEVAP & OK YOLU BUTONU (Testlerin bulacağı ve öğrencilerin tıklayacağı) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {question.options.map((opt) => {
              const isSelected = selectedDir === opt.dir;

              return (
                <button
                  key={opt.dir}
                  type="button"
                  disabled={isMoving}
                  onClick={() => handleDirection(opt.dir)}
                  className={`group relative p-3 rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-between text-center shadow-md disabled:cursor-not-allowed cursor-pointer ${
                    isSelected
                      ? opt.isCorrect
                        ? 'bg-emerald-500/20 border-emerald-500 ring-4 ring-emerald-400'
                        : 'bg-rose-500/20 border-rose-500 ring-4 ring-rose-400'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-400/10'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                      [{opt.key}]
                    </span>
                    <span className="text-xs">{opt.arrow} {opt.label}</span>
                  </div>

                  <div className="my-1.5 text-2xl font-black">{opt.arrow}</div>

                  <div className="w-full py-1.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-base sm:text-lg font-black font-mono tracking-tight text-slate-900 dark:text-white">
                      {opt.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* OYUN BİTİŞ EKRANI (ENDED) */}
      {gameState === 'ended' && (
        <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-6">
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col items-center shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center mb-3 shadow-lg">
              <Award className="w-10 h-10 text-white dark:text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {dotsEaten >= 16
                ? '👑 Labirentin Büyük Efendisi!'
                : dotsEaten >= 8
                ? '🍒 Hızlı Pac-Matik Ustası!'
                : '🎮 Labirent Macerası Tamamlandı!'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md">
              Toplam {dotsEaten} yıldız ve kiraz topladın, {correctMoves} doğru
              ok rotası ve en yüksek {maxStreak} seri tamamlandı!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Toplam Puan</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                {Math.min(4800, Math.round(score * (scoreMultiplier || 1)))}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Rota Başarısı</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                %{accuracy}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Yıldız & Kiraz</div>
              <div className="text-xl font-black text-amber-500 dark:text-amber-300">
                {dotsEaten}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Doğru Rota</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {correctMoves} / {totalMoves}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-black active:scale-95 transition-all bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              Yeniden Oyna
            </button>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white font-bold transition-all border border-slate-200 dark:border-transparent cursor-pointer"
              >
                Çıkış
              </button>
            )}
          </div>
        </div>
      )}

      {/* ALT BİLGİ */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <span>
          Klavye: [↑, →, ←, ↓], [W, D, A, S] veya [1, 2, 3, 4] tuşlarıyla Pac-Matik&apos;i yönlendirebilirsin.
        </span>
        <span>Çarpan: x{scoreMultiplier}</span>
      </div>
    </div>
  );
}

export default PacMathMaze;
