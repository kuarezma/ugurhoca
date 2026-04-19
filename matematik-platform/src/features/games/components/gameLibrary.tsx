'use client';

import {
  Calculator,
  Grid3x3,
  Link2,
  Palette,
  Puzzle,
  WholeWord,
} from 'lucide-react';
import { FloatingParticles } from './FloatingParticles';
import { GameCard } from './GameCard';
import { ColorMath } from './games/ColorMath';
import { Hangman } from './games/Hangman';
import { MathPuzzle } from './games/MathPuzzle';
import { MemoryGame } from './games/MemoryGame';
import { MultiplicationRace } from './games/MultiplicationRace';
import { NumberPuzzle } from './games/NumberPuzzle';
import type { GameDefinition } from '../types';

export { FloatingParticles, GameCard };
export type {
  GameComponentProps,
  GameDefinition,
  LeaderboardRow,
} from '../types';

export const games: GameDefinition[] = [
  {
    id: 1,
    title: 'Çarpım Tablosu',
    description: 'Çarpım tablosunu hızlıca öğren!',
    grade: '5-8',
    rating: 4.9,
    difficulty: 'Kolay',
    color: 'from-pink-500 to-purple-500',
    icon: Grid3x3,
    component: MultiplicationRace,
  },
  {
    id: 2,
    title: 'Matematik Zihin Jimnastiği',
    description: 'Zor problemleri çöz, seviye atla!',
    grade: '5-8',
    rating: 4.8,
    difficulty: 'Orta',
    color: 'from-purple-500 to-pink-500',
    icon: Puzzle,
    component: MathPuzzle,
  },
  {
    id: 3,
    title: 'Renkli Matematik',
    description: 'Renkleri oku, doğruyu bul!',
    grade: '5-8',
    rating: 4.7,
    difficulty: 'Zor',
    color: 'from-cyan-500 to-blue-500',
    icon: Palette,
    component: ColorMath,
  },
  {
    id: 4,
    title: 'Matematik Adam Asmaca',
    description: 'Matematik terimlerini tahmin et!',
    grade: '5-8',
    rating: 4.8,
    difficulty: 'Orta',
    color: 'from-indigo-500 to-purple-500',
    icon: WholeWord,
    component: Hangman,
  },
  {
    id: 5,
    title: 'Sayı Bulmaca',
    description: 'Eksik sayıyı bul, puan topla!',
    grade: '5-8',
    rating: 4.6,
    difficulty: 'Orta',
    color: 'from-amber-500 to-orange-500',
    icon: Calculator,
    component: NumberPuzzle,
  },
  {
    id: 6,
    title: 'Matematik Memory',
    description: 'Eşleşen sembolleri bul!',
    grade: '5-8',
    rating: 4.9,
    difficulty: 'Kolay',
    color: 'from-emerald-500 to-teal-500',
    icon: Link2,
    component: MemoryGame,
  },
];
