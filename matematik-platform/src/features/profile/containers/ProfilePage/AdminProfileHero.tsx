'use client';

import { motion } from 'framer-motion';
import { Settings, Shield } from 'lucide-react';
import { SafeLink as Link } from '@/components/SafeLink';

export type AdminProfileHeroProps = {
  name?: string | null;
  email?: string | null;
};

export function AdminProfileHero({ name, email }: AdminProfileHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-default bg-surface-1 p-8"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-3xl font-bold text-white dark:text-white">
            {name?.[0] || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">{name}</h1>
            <p className="mt-1 text-sm text-secondary">{email}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-hairline bg-accent-warning-tint px-4 py-1.5">
              <Shield className="h-4 w-4 text-accent-warning-ink" />
              <span className="text-sm font-semibold text-accent-warning-ink">
                Yönetici
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-2xl border border-default bg-surface-2 px-5 py-3 font-semibold text-primary transition-colors hover:bg-overlay-2"
        >
          <Settings className="h-5 w-5" />
          Admin Paneline Git
        </Link>
      </div>
    </motion.section>
  );
}
