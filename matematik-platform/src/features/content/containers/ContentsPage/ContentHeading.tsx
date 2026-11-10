import type { AppUser } from '@/types';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';

import type { ContentGradeFilter } from '@/features/content/types';
import {
  getContentPageDescription,
  getContentPageTitle,
} from '@/features/content/utils';

type ContentHeadingProps = {
  selectedType: string;
  selectedGrade: ContentGradeFilter;
  user: AppUser | null;
  handleQuickAddOpen: () => void;
};

export function ContentHeading({
  selectedType,
  selectedGrade,
  user,
  handleQuickAddOpen,
}: ContentHeadingProps) {
  return (
    <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-tone-info-border bg-tone-info-bg dark:bg-tone-info-bg px-3.5 py-1 text-xs font-bold text-tone-info-fg dark:text-tone-info-fg backdrop-blur-md shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-tone-info-fg dark:text-tone-info-fg" />
          <span>MEB 2026-2027 Müfredat Arşivi · %100 Ücretsiz & Çözümlü</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-primary font-display mb-2">
          {getContentPageTitle(selectedType)}
        </h1>
        <p className="text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
          {getContentPageDescription(selectedType, selectedGrade)}
        </p>
      </div>
      {user?.isAdmin && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleQuickAddOpen}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 bg-accent-bg hover:bg-accent-bg text-primary dark:text-primary shadow-btn-3d-green active:translate-y-1 active:shadow-none"
        >
          <Plus className="w-5 h-5" />
          Hızlı İçerik Ekle
        </motion.button>
      )}
    </div>
  );
}
