import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

export type GameComponentProps = {
  onScore: (score: number) => void;
};

export type GameDefinition = {
  color: string;
  component: ComponentType<GameComponentProps>;
  description: string;
  difficulty: string;
  grade: string;
  icon: LucideIcon;
  id: number;
  rating: number;
  title: string;
};

export type LeaderboardRow = {
  id?: string;
  total_score: number;
  user_name: string;
};
