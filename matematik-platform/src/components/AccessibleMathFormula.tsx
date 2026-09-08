'use client';

import React from 'react';

export interface AccessibleMathFormulaProps {
  /**
   * Ekran okuyucu (VoiceOver, NVDA, JAWS vb.) için Türkçe seslendirme metni
   * Örn: "x eşittir eksi b artı eksi karekök içinde b kare eksi 4 a c bölü 2 a"
   */
  speechLabel: string;
  /**
   * Saf MathML içeriği veya JSX elemanı
   */
  children?: React.ReactNode;
  /**
   * Ekran okuyucuların görmezden geleceği görsel metin/formül (varsa)
   */
  visualFormula?: string;
  className?: string;
  display?: 'inline' | 'block';
}

/**
 * Erişilebilir Matematik Formülü Bileşeni
 * WCAG 2.2 AA & AAA uyumludur; MathML desteği olan tarayıcılarda semantik MathML render eder,
 * ekran okuyuculara ise kusursuz telaffuz sağlayan aria-label ve sr-only metin sunar.
 */
export function AccessibleMathFormula({
  speechLabel,
  children,
  visualFormula,
  className = '',
  display = 'inline',
}: AccessibleMathFormulaProps) {
  const isBlock = display === 'block';

  return (
    <span
      className={`${isBlock ? 'my-3 flex items-center justify-center p-2 rounded-lg bg-slate-800/40 border border-slate-700/50' : 'inline-flex items-center'} font-mono text-slate-100 ${className}`}
      role="math"
      aria-label={speechLabel}
    >
      {/* Ekran okuyucu için açık Türkçe konuşma metni */}
      <span className="sr-only">{speechLabel}</span>

      {/* Görsel Katman: MathML veya fallback görsel metin (ekran okuyucudan gizlenir) */}
      <span aria-hidden="true" className="select-text">
        {children ? children : visualFormula}
      </span>
    </span>
  );
}
