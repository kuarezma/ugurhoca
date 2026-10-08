'use client';

import {
  Calculator,
  Timer,
  Edit3,
  Layers,
  Video,
  ArrowRight,
  Award,
  Compass,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import type { AdventureTopicNode } from './AdventureCurriculumData';

interface AdventureSideQuestsProps {
  activeTopic: AdventureTopicNode | null;
  onOpenCalculator?: () => void;
  onOpenPomodoro?: () => void;
  onOpenScratchpad?: () => void;
  onOpenFlashcards?: () => void;
}

export function AdventureSideQuests({
  activeTopic,
  onOpenCalculator,
  onOpenPomodoro,
  onOpenScratchpad,
  onOpenFlashcards,
}: AdventureSideQuestsProps) {
  return (
    <div className="space-y-6">
      <div className="card-playful rounded-3xl p-5 sm:p-6">
        <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
          <Compass className="h-5 w-5" /> Günün Görevi
        </h3>
        {activeTopic ? (
          <>
            <p className="mt-3 text-sm font-bold text-primary">
              {activeTopic.title}
            </p>
            <p className="mt-1 text-xs text-secondary">
              Aktif konunun yaprak testleriyle çalış. Diğer konular da açık.
            </p>
            <SafeLink
              href={activeTopic.testsHref}
              className="btn-3d btn-green btn-sm mt-4"
            >
              Yaprak Teste Git <ArrowRight className="h-4 w-4" />
            </SafeLink>
          </>
        ) : (
          <p className="mt-3 text-sm text-secondary">
            Tüm konular tamamlandı. Haritadan tekrar etmek istediğin konuyu
            seçebilirsin.
          </p>
        )}
      </div>
      <div className="card-playful rounded-3xl p-5 sm:p-6">
        <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
          <Award className="h-5 w-5" /> Başarı Rozetleri
        </h3>
        <p className="mt-3 text-xs text-secondary">
          Kazandığın rozetleri ve ilerlemeni profilinde inceleyebilirsin.
        </p>
        <SafeLink
          href="/profil"
          className="inline-block mt-3 text-sm font-bold text-primary hover:underline"
        >
          Profilime Git →
        </SafeLink>
      </div>

      {/* 4. HIZLI ERİŞİM SANDIĞI (Dokunsal 3D Butonlar) */}
      <div className="card-playful rounded-3xl p-5 sm:p-6 transition-all">
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-default mb-3.5">
          <h3 className="font-display text-base font-bold text-primary">
            Hızlı Araç Sandığı 🎁
          </h3>
          <span className="text-[11px] text-secondary">Sınav Yardımcıları</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onOpenCalculator}
            className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-default bg-surface-2 hover:bg-surface-3 text-left transition-all duration-150 cursor-pointer shadow-[0_3px_0_var(--border-default)] active:translate-y-1 active:shadow-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <Calculator className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-primary block truncate">
                Hesaplayıcı
              </span>
              <span className="text-[10px] text-secondary">LGS/YKS Puan</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenPomodoro}
            className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-default bg-surface-2 hover:bg-surface-3 text-left transition-all duration-150 cursor-pointer shadow-[0_3px_0_var(--border-default)] active:translate-y-1 active:shadow-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <Timer className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-primary block truncate">
                Pomodoro
              </span>
              <span className="text-[10px] text-secondary">Odak Sayacı</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenScratchpad}
            className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-default bg-surface-2 hover:bg-surface-3 text-left transition-all duration-150 cursor-pointer shadow-[0_3px_0_var(--border-default)] active:translate-y-1 active:shadow-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
              <Edit3 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-primary block truncate">
                Karalama
              </span>
              <span className="text-[10px] text-secondary">Çizim Tahtası</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenFlashcards}
            className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-default bg-surface-2 hover:bg-surface-3 text-left transition-all duration-150 cursor-pointer shadow-[0_3px_0_var(--border-default)] active:translate-y-1 active:shadow-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-primary block truncate">
                Kartlar
              </span>
              <span className="text-[10px] text-secondary">Formül Ezberi</span>
            </div>
          </button>
        </div>

        {/* Canlı Ders Kartı */}
        <div className="mt-3">
          <SafeLink
            href="/canli-ders"
            className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/15 text-left transition-all group shadow-[0_3px_0_rgba(244,63,94,0.3)] active:translate-y-0.5 active:shadow-none"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white dark:text-white shrink-0 shadow-xs">
                <Video className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white/40" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-primary block">
                    Canlı Ders Odası
                  </span>
                  <span className="text-[9px] font-black uppercase text-rose-800 dark:text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded-md">
                    Ders Odası
                  </span>
                </div>
                <span className="text-[10px] text-secondary">
                  Uğur Hoca ile Soru Çözümü
                </span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
          </SafeLink>
        </div>
      </div>
    </div>
  );
}

export default AdventureSideQuests;
