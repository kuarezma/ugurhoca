'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Replaces \frac{num}{den} with "pay num, payda den",
 * correctly handling nested braces inside num or den.
 */
function replaceFractions(str: string): string {
  let result = str;
  let safety = 0;
  while (result.includes('\\frac{') && safety < 20) {
    safety++;
    const idx = result.indexOf('\\frac{');
    let depth = 1;
    let numEnd = -1;
    for (let i = idx + 6; i < result.length; i++) {
      if (result[i] === '{') depth++;
      else if (result[i] === '}') {
        depth--;
        if (depth === 0) {
          numEnd = i;
          break;
        }
      }
    }
    if (numEnd === -1 || result[numEnd + 1] !== '{') break;

    depth = 1;
    let denEnd = -1;
    for (let i = numEnd + 2; i < result.length; i++) {
      if (result[i] === '{') depth++;
      else if (result[i] === '}') {
        depth--;
        if (depth === 0) {
          denEnd = i;
          break;
        }
      }
    }
    if (denEnd === -1) break;

    const num = result.slice(idx + 6, numEnd);
    const den = result.slice(numEnd + 2, denEnd);
    result = result.slice(0, idx) + `pay ${num}, payda ${den}` + result.slice(denEnd + 1);
  }
  // Also handle simple \frac 1 2
  result = result.replace(/\\frac\s*([a-zA-Z0-9])\s*([a-zA-Z0-9])/g, 'pay $1, payda $2');
  return result;
}

/**
 * Converts KaTeX formulas, math symbols, and descriptions into
 * natural, pedagogical Turkish spoken text for SpeechSynthesis.
 */
export function formulaToSpokenTurkish(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // 1. Math block ve temizlik
  text = text.replace(/\$\$?/g, ' ');
  text = text.replace(/\\quad|\\qquad|\\,/g, ', ');

  // 2. Kesirleri dönüştür (iç içe parantezleri destekler)
  text = replaceFractions(text);

  // 3. Özel Matematik Fonksiyonları ve İsimleri
  text = text.replace(/\\text\{Alan\}|\bAlan\b/g, 'alan');
  text = text.replace(/\\text\{Çevre\b.*?\}|\bÇevre\b/g, 'çevre');
  text = text.replace(/\\text\{EBOB\}|\\text\{ebob\}|\bEBOB\b/gi, 'ebob');
  text = text.replace(/\\text\{EKOK\}|\\text\{ekok\}|\bEKOK\b/gi, 'ekok');
  text = text.replace(/\\text\{([^}]+)\}/g, '$1');

  // 4. Trigonometri
  text = text.replace(/\\sin\^\{?2\}?\(?([a-zA-Z0-9]+)\)?/g, 'sinüs kare $1');
  text = text.replace(/\\cos\^\{?2\}?\(?([a-zA-Z0-9]+)\)?/g, 'kosinüs kare $1');
  text = text.replace(/\\tan\^\{?2\}?\(?([a-zA-Z0-9]+)\)?/g, 'tanjant kare $1');
  text = text.replace(/\\sec\^\{?2\}?\(?([a-zA-Z0-9]+)\)?/g, 'sekant kare $1');
  text = text.replace(/\\sin\(?([a-zA-Z0-9]+)\)?/g, 'sinüs $1');
  text = text.replace(/\\cos\(?([a-zA-Z0-9]+)\)?/g, 'kosinüs $1');
  text = text.replace(/\\tan\(?([a-zA-Z0-9]+)\)?/g, 'tanjant $1');
  text = text.replace(/\\cot\(?([a-zA-Z0-9]+)\)?/g, 'kotanjant $1');
  text = text.replace(/\\sec\(?([a-zA-Z0-9]+)\)?/g, 'sekant $1');

  // 5. Logaritma
  text = text.replace(/\\log_\{?([a-zA-Z0-9]+)\}?\(?([^)]+)\)?/g, '$1 tabanında logaritma $2');
  text = text.replace(/\\ln\(?([a-zA-Z0-9]+)\)?/g, 'doğal logaritma $1');

  // 6. Permütasyon, Kombinasyon, Faktöriyel
  text = text.replace(/\\binom\{([^}]+)\}\{([^}]+)\}/g, '$1 in $2 li kombinasyonu');
  text = text.replace(/C\(([a-zA-Z0-9]+),\s*([a-zA-Z0-9]+)\)/g, '$1 in $2 li kombinasyonu');
  text = text.replace(/P\(([a-zA-Z0-9]+),\s*([a-zA-Z0-9]+)\)/g, '$1 in $2 li permütasyonu');
  text = text.replace(/([a-zA-Z0-9]+)!/g, '$1 faktöriyel');

  // 7. Karekök ve Kökler
  text = text.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1 inci dereceden kök $2');
  text = text.replace(/\\sqrt\{([^}]+)\}/g, 'karekök $1');

  // 8. İntegral ve Türev
  text = text.replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, '$1 den $2 ye belirli integral');
  text = text.replace(/\\int/g, 'integral');
  text = text.replace(/([a-zA-Z0-9])'/g, '$1 in türevi');

  // 9. Parantezli Üsler & Üslü Sayılar
  text = text.replace(/\(([^)]+)\)\^\{?2\}?/g, 'parantez içinde $1 in karesi');
  text = text.replace(/\(([^)]+)\)\^\{?3\}?/g, 'parantez içinde $1 in küpü');
  text = text.replace(/\(([^)]+)\)\^\{([^}]+)\}/g, 'parantez içinde $1 üzeri $2');
  text = text.replace(/([a-zA-Z0-9])\^\{?2\}?/g, '$1 kare');
  text = text.replace(/([a-zA-Z0-9])\^\{?3\}?/g, '$1 küp');
  text = text.replace(/([a-zA-Z0-9])\^\{([^}]+)\}/g, '$1 üzeri $2');
  text = text.replace(/([a-zA-Z0-9])\^([a-zA-Z0-9])/g, '$1 üzeri $2');

  // 10. İndisler (x_1, a_n)
  text = text.replace(/x_\{?1,2\}?/g, 'x bir iki');
  text = text.replace(/([a-zA-Z])_\{?([a-zA-Z0-9]+)\}?/g, '$1 $2');

  // 11. Yunan Harfleri ve Özel Semboller
  text = text.replace(/\\Delta\b/g, 'delta');
  text = text.replace(/\\pi\b/g, 'pi');
  text = text.replace(/\\alpha\b/g, 'alfa');
  text = text.replace(/\\beta\b/g, 'beta');
  text = text.replace(/\\theta\b/g, 'teta');
  text = text.replace(/\\pm\b/g, 'artı eksi');
  text = text.replace(/\\cdot\b/g, 'çarpı');
  text = text.replace(/\\times\b/g, 'çarpı');
  text = text.replace(/\\neq\b/g, 'eşit değildir');
  text = text.replace(/\\leq?\b/g, 'küçük eşittir');
  text = text.replace(/\\geq?\b/g, 'büyük eşittir');
  text = text.replace(/\\circ\b/g, 'derece');
  text = text.replace(/\\implies\b/g, 'ise');
  text = text.replace(/\\in\b/g, 'elemanıdır');
  text = text.replace(/\\infty\b/g, 'sonsuz');

  // 12. İşaretler ve Kalan Ters Slash Temizliği
  text = text.replace(/=/g, ' eşittir ');
  text = text.replace(/\+/g, ' artı ');
  text = text.replace(/-(?!\w)/g, ' eksi ');
  text = text.replace(/\\([a-zA-Z]+)/g, '$1');

  // 13. Fazla Boşlukları Düzelt
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

export function useFormulaSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.92);

  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window
    );
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (textToSpeak: string) => {
      if (
        typeof window === 'undefined' ||
        !('speechSynthesis' in window) ||
        typeof SpeechSynthesisUtterance === 'undefined'
      ) {
        return;
      }

      window.speechSynthesis.cancel();

      const spokenText = formulaToSpokenTurkish(textToSpeak);
      if (!spokenText.trim()) return;

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'tr-TR';
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [speechRate]
  );

  const toggle = useCallback(
    (textToSpeak: string) => {
      if (isSpeaking) {
        stop();
      } else {
        speak(textToSpeak);
      }
    },
    [isSpeaking, speak, stop]
  );

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSpeaking,
    isSupported,
    speechRate,
    setSpeechRate,
    speak,
    stop,
    toggle,
  };
}
