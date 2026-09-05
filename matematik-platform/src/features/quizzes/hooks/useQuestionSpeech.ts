'use client';

import { useCallback, useEffect, useState, useRef } from 'react';

export function latexToSpeechText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // Temel kesirler: \frac{a}{b} -> "a bölü b"
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 bölü $2');
  text = text.replace(/\\frac\s*([a-zA-Z0-9])\s*([a-zA-Z0-9])/g, '$1 bölü $2');

  // Karekök: \sqrt{x} -> "karekök x"
  text = text.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1 inci dereceden kök $2');
  text = text.replace(/\\sqrt\{([^}]+)\}/g, 'karekök $1');
  text = text.replace(/\\sqrt\s*([a-zA-Z0-9])/g, 'karekök $1');

  // Üslü sayılar: x^2 -> "x kare", x^3 -> "x küp", x^n -> "x üzeri n"
  text = text.replace(/([a-zA-Z0-9)])\^\{?2\}?/g, '$1 kare');
  text = text.replace(/([a-zA-Z0-9)])\^\{?3\}?/g, '$1 küp');
  text = text.replace(/([a-zA-Z0-9)])\^\{([^}]+)\}/g, '$1 üzeri $2');
  text = text.replace(/([a-zA-Z0-9)])\^([a-zA-Z0-9])/g, '$1 üzeri $2');

  // Matematiksel semboller
  text = text.replace(/\\le(q)?\b/g, ' küçük eşittir ');
  text = text.replace(/\\ge(q)?\b/g, ' büyük eşittir ');
  text = text.replace(/\\neq\b/g, ' eşit değildir ');
  text = text.replace(/\\approx\b/g, ' yaklaşık eşittir ');
  text = text.replace(/\\pm\b/g, ' artı eksi ');
  text = text.replace(/\\times\b/g, ' çarpı ');
  text = text.replace(/\\cdot\b/g, ' çarpı ');
  text = text.replace(/\\div\b/g, ' bölü ');
  text = text.replace(/\\pi\b/g, ' pi ');
  text = text.replace(/\\infty\b/g, ' sonsuz ');
  text = text.replace(/\\Delta\b/g, ' delta ');
  text = text.replace(/\\alpha\b/g, ' alfa ');
  text = text.replace(/\\beta\b/g, ' beta ');
  text = text.replace(/\\theta\b/g, ' teta ');

  // Temizleme: $ ve $$ sembollerini kaldır
  text = text.replace(/\$\$?/g, ' ');

  // LaTeX komut ters slashlarını kaldır: \sin -> sin, \cos -> cos
  text = text.replace(/\\([a-zA-Z]+)/g, '$1');

  // Fazla boşlukları temizle
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

export function useQuestionSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((textToSpeak: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const spokenText = latexToSpeechText(textToSpeak);
    if (!spokenText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const toggle = useCallback((textToSpeak: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(textToSpeak);
    }
  }, [isSpeaking, speak, stop]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { isSpeaking, isSupported, speak, stop, toggle };
}
