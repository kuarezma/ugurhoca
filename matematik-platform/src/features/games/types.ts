import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

export type GameComponentProps = {
  onExit?: () => void;
  onScore: (score: number) => void;
  scoreMultiplier: number;
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
  alias: string;
  rank?: number;
  total_score: number;
};

export type GameAlias = {
  alias: string;
  alias_normalized: string;
  created_at?: string;
  updated_at?: string;
  user_id: string;
};
