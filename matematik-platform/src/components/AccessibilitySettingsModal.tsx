'use client';

import React, { useId } from 'react';
import {
  X,
  Eye,
  Type,
  Maximize,
  RotateCcw,
  ZapOff,
  MoveHorizontal,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  useAccessibilitySettings,
  type A11yFontSize,
} from '@/hooks/useAccessibilitySettings';

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilitySettingsModal({
  isOpen,
  onClose,
}: AccessibilitySettingsModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const { settings, updateSetting, resetSettings } = useAccessibilitySettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden transition-all"
      >
        {/* Başlık */}
        <div className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 id={titleId} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Kişisel Görünüm & Erişilebilirlik</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                  WCAG 2.2 Uyumlu
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Yazı boyutu, dokunma alanı ve animasyonları kişisel çalışma rahatlığına göre özelleştir.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ayarlar İçeriği */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-5">
          {/* 1. Yazı Boyutu Tercihi (Font Scaling) */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50/50 dark:bg-slate-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                <Type className="w-4 h-4 text-sky-500" />
                <span>Yazı Büyüklüğü (Metin Ölçekleme)</span>
              </div>
              <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                {settings.fontSize === 'normal' ? 'Standart (%100)' : settings.fontSize === 'large' ? 'Büyük (%115)' : 'Ekstra Büyük (%130)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'xlarge'] as A11yFontSize[]).map((size) => {
                const active = settings.fontSize === size;
                const label = size === 'normal' ? 'Standart' : size === 'large' ? 'Büyük' : 'Çok Büyük';
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateSetting('fontSize', size)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                      active
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[10px] opacity-80">{size === 'normal' ? '%100' : size === 'large' ? '%115' : '%130'}</span>
                  </button>
                );
              })}
            </div>

            {/* Canlı Önizleme Kutusu */}
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/20 p-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-all">
              <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                Örnek Metin Önizlemesi:
              </span>
              <p
                className={`transition-all font-medium ${
                  settings.fontSize === 'xlarge'
                    ? 'text-base sm:text-lg'
                    : settings.fontSize === 'large'
                      ? 'text-sm sm:text-base'
                      : 'text-xs sm:text-sm'
                }`}
              >
                Matematikte başarı; düzenli tekrar, kavramları derinlemesine anlama ve sabırlı pratik ile inşa edilir.
              </p>
            </div>
          </div>

          {/* 2. Dokunma Alanı (Target Size Minimum - WCAG 2.2 SC 2.5.8) */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50/50 dark:bg-slate-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                <Maximize className="w-4 h-4 text-indigo-500" />
                <span>Dokunma Alanı Boyutu (W3C Target Size)</span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                {settings.touchTarget === 'comfortable_44' ? '44x44 px (Geniş & Rahat)' : settings.touchTarget === 'wcag_24' ? '24x24 px (WCAG Min)' : 'Standart Boyut'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dokunmatik ekranlarda ve mobilde yanlış tıklamaları önlemek için buton ve şık tıklama alanlarını genişletir.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'normal', title: 'Standart', desc: 'Varsayılan butonlar' },
                  { id: 'wcag_24', title: 'WCAG Minimum', desc: 'En az 24x24 px hedef' },
                  { id: 'comfortable_44', title: 'Rahat Dokunma (Önerilen)', desc: '44x44 px geniş hedef' },
                ] as const
              ).map((opt) => {
                const active = settings.touchTarget === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateSetting('touchTarget', opt.id)}
                    className={`p-3 rounded-xl text-left text-xs font-semibold transition border ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <strong className="block font-bold">{opt.title}</strong>
                    <span className={`text-[10px] block mt-0.5 ${active ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Animasyon ve Aralık Ayarları (Toggles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Azaltılmış Hareket */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50/50 dark:bg-slate-950/30 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <ZapOff className="w-4 h-4 text-amber-500" />
                  <span>Azaltılmış Hareket</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sayfa geçişleri ve pencerelerdeki animasyonları kapatır, odaklanmayı artırır.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.reducedMotion}
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.reducedMotion ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Geniş Soru Seçenek Aralığı */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50/50 dark:bg-slate-950/30 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <MoveHorizontal className="w-4 h-4 text-emerald-500" />
                  <span>Geniş Şık Aralığı</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Test çözerken seçenekler arasındaki boşluğu artırarak okumayı kolaylaştırır.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.spaciousOptions}
                onClick={() => updateSetting('spaciousOptions', !settings.spaciousOptions)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.spaciousOptions ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.spaciousOptions ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Alt Çubuk */}
        <div className="border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-6 py-3.5 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılana Sıfırla</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-colors"
          >
            Ayarları Kaydet & Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
