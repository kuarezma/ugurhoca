'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  AlertTriangle,
  Compass,
  BookmarkPlus,
  BookmarkCheck,
  HelpCircle,
} from 'lucide-react';
import MathText from '@/components/MathText';
import type { QuizQuestion } from '@/types/quiz';
import { getSavedMistakes, saveMistakesToBank } from '../lib/mistakeStorage';

export const STORAGE_PUZZLED_KEY = 'ugurhoca_puzzled_steps_v1';

type QuestionHintLadderProps = {
  question: QuizQuestion;
  questionIndex: number;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  quizTitle?: string;
};

export type QuestionHintsData = {
  level1: string;
  level2: string;
  level3: string;
  socraticAnalysis: string;
  criticalEquation: string;
  commonTrap: string;
};

// Pedagojik Heuristik: Soru metnindeki anahtar kelimelere göre akıllı ipuçları ve Sokratik yönlendirme türetir
export function deriveQuestionHints(question: QuizQuestion): QuestionHintsData {
  const text = (question.question || '').toLowerCase();
  const explanation = question.explanation || '';

  let socraticAnalysis =
    'Soruda verilen sayısal değerleri ve aranan hedefi tespit et. Hangi matematiksel kavram doğrudan test ediliyor?';
  let criticalEquation = 'Verilenler ➔ Bağıntı Modeli ➔ Sadeleştirme ➔ Sonuç';
  let commonTrap =
    'İşlem önceliğine ve işaret kurallarına (+ / -) dikkat et. Şıklardaki en yakın çeldiriciye hemen atlama.';

  // 1. Kademe: Formül & Kural
  let level1 = 'Soruda verilenleri ve isteneni belirle. Bilinen değerleri bir kenara not et.';
  if (
    text.includes('sinüs') ||
    text.includes('kosinüs') ||
    text.includes('tanjant') ||
    text.includes('kotanjant') ||
    text.includes('\\sin') ||
    text.includes('\\cos') ||
    text.includes('\\tan') ||
    text.includes('birim çember') ||
    text.includes('trigonometri')
  ) {
    level1 =
      'Temel trigonometrik özdeşliği hatırla: sin²(x) + cos²(x) = 1 ve tan(x) = sin(x) / cos(x). Açının hangi bölgede olduğunu tespit et.';
    socraticAnalysis =
      'Verilen açı hangi bölgede (1., 2., 3. veya 4.)? Trigonometrik fonksiyonların bu bölgedeki işaretleri (+ / -) nelerdir?';
    criticalEquation =
      '\\sin^2(x) + \\cos^2(x) = 1 | \\tan(x) \\cdot \\cot(x) = 1 | \\sin(2x) = 2\\sin(x)\\cos(x)';
    commonTrap =
      'Açı indirgemesi yaparken bölgeye göre işaret değişimini unutma! Örneğin 2. bölgede cos(180° - x) = -cos(x) olur.';
  } else if (
    text.includes('logaritma') ||
    text.includes('\\log') ||
    text.includes('\\ln') ||
    text.includes('taban değiştir')
  ) {
    level1 =
      'Logaritma tanımını uygula: log_a(b) = c ⟺ aᶜ = b (a > 0, a ≠ 1, b > 0). Çarpım toplamaya, bölüm çıkarmaya dönüşür.';
    socraticAnalysis =
      'Tabanlar aynı mı? Aynı tabandaki logaritmaları tek bir terimde birleştirebilir veya taban değiştirme kuralını uygulayabilir misin?';
    criticalEquation =
      '\\log_a(x \\cdot y) = \\log_a(x) + \\log_a(y) | \\log_a(x^k) = k \\cdot \\log_a(x) | a^{\\log_a(b)} = b';
    commonTrap =
      'Logaritma tanım kümesini kontrol et: Taban a > 0 ve a ≠ 1 olmalı, içerideki fonksiyon f(x) > 0 olmak zorundadır!';
  } else if (
    text.includes('aritmetik dizi') ||
    text.includes('geometrik dizi') ||
    text.includes('ortak fark') ||
    text.includes('genel terim') ||
    text.includes('dizi')
  ) {
    level1 =
      'Aritmetik dizide ardışık terimler farkı sabit (aₙ = a₁ + (n-1)d), geometrik dizide terimler oranı sabittir (aₙ = a₁ · rⁿ⁻¹).';
    socraticAnalysis =
      'Dizi aritmetik mi (sabit ekleniyor) yoksa geometrik mi (sabit çarpılıyor)? İlk terim a₁ ve ortak fark/çarpan biliniyor mu?';
    criticalEquation =
      'Aritmetik: a_n = a_1 + (n-1)d | S_n = \\frac{n}{2}(a_1 + a_n) | Geometrik: a_n = a_1 \\cdot r^{n-1}';
    commonTrap =
      'Terim sayısı formülünde +1 eklemeyi unutma: Terim Sayısı = (Son Terim - İlk Terim) / Artış Miktarı + 1.';
  } else if (
    text.includes('polinom') ||
    text.includes('kalan teoremi') ||
    text.includes('baş katsayı') ||
    text.includes('derece')
  ) {
    level1 =
      'Polinomda x kuvvetleri doğal sayı olmalıdır. P(x) polinomunun (x - a) ile bölümünden kalan P(a) değeridir.';
    socraticAnalysis =
      'Kalanı bulmak için uzun polinom bölmesi yerine bölen çarpanı sıfıra eşitleyerek doğrudan sonuca ulaşabilir misin?';
    criticalEquation =
      'P(x) = Q(x) \\cdot B(x) + K(x) | \\text{der}[K(x)] < \\text{der}[B(x)] | x = a \\implies P(a)';
    commonTrap =
      'Sabit terim için x = 0, katsayılar toplamı için x = 1 yazılır. P(x+2) verildiğinde katsayılar toplamı için x yerine 1 yazıp P(3) arandığını unutma!';
  } else if (
    text.includes('fonksiyon') ||
    text.includes('f(x)') ||
    text.includes('g(x)') ||
    text.includes('bileşke') ||
    text.includes('ters fonksiyon') ||
    text.includes('tanım kümesi')
  ) {
    level1 =
      'Fonksiyon bağıntısında tanım kümesindeki her elemanın değer kümesinde yalnız bir karşılığı olmalıdır. Ters fonksiyonda y = f(x) eşitliğinde x yalnız bırakılır.';
    socraticAnalysis =
      'Bileşke (f ∘ g)(x) mi isteniyor? Önce en içerideki g(x) değerini hesaplayıp çıkan sonucu f fonksiyonuna girdi yapabilir misin?';
    criticalEquation =
      '(f \\circ g)(x) = f(g(x)) | f(a) = b \\iff f^{-1}(b) = a | (f \\circ f^{-1})(x) = x';
    commonTrap =
      'f(x+2) verildiğinde f(5) değerini bulmak için x yerine 5 değil, x+2 = 5 ⟹ x = 3 yazılmalıdır!';
  } else if (
    text.includes('pisagor') ||
    text.includes('30-60-90') ||
    text.includes('45-45-90') ||
    text.includes('hipotenüs') ||
    text.includes('dik üçgen') ||
    text.includes('öklid') ||
    text.includes('muhteşem üçlü')
  ) {
    level1 =
      'Özel dik üçgen oranlarını hatırla: 3-4-5, 5-12-13, 8-15-17. 30-60-90 üçgeninde 30° karşısı a ise 90° karşısı 2a, 60° karşısı a√3 olur.';
    socraticAnalysis =
      'Dik açıdan dikme inmiş mi (Öklid bağıntıları: h² = p · k)? Hipotenüse ait kenarortay var mı (Muhteşem Üçlü)?';
    criticalEquation =
      'a^2 + b^2 = c^2 | \\text{Öklid: } h^2 = p \\cdot k, b^2 = k \\cdot a | 30^\\circ-60^\\circ-90^\\circ: a, a\\sqrt{3}, 2a';
    commonTrap =
      'Özel açıları (30°, 45°, 60°) gördüğünde karşılarına dikme indir; ancak geniş açılı üçgenlerde dikmenin üçgenin dışına düşebileceğini hatırla!';
  } else if (text.includes('oran') || text.includes('orantı')) {
    level1 = 'İçler dışlar çarpımı kuralını hatırla: a/b = c/d ise a · d = b · c.';
    socraticAnalysis =
      'Verilen iki büyüklük arasında doğru orantı mı (biri artınca diğeri de artıyor) yoksa ters orantı mı (biri artınca diğeri azalıyor) var?';
    criticalEquation = 'Doğru Orantı: a/b = k | Ters Orantı: a · b = k | a · d = b · c';
    commonTrap =
      'Orantı kurarken aynı cinsten birimleri alt alta yazmayı unutma (örn. saat ile dakika birbirine dönüştürülmeli).';
  } else if (text.includes('üslü') || text.includes('üs') || text.includes('kuvvet')) {
    level1 =
      'Tabanları aynı üslü ifadelerde çarpma yapılırken üsler toplanır (aᵐ · aⁿ = aᵐ⁺ⁿ), bölmede çıkarılır.';
    socraticAnalysis =
      'Tabanlar aynı mı yoksa tabanları asal çarpanlara (2, 3, 5 gibi) dönüştürerek eşitleyebilir misin?';
    criticalEquation = 'aᵐ · aⁿ = aᵐ⁺ⁿ | (aᵐ)ⁿ = aᵐⁿ | a⁻ⁿ = 1 / aⁿ';
    commonTrap =
      "Negatif sayıların parantezli ve parantezsiz kuvvetlerine dikkat: (-2)⁴ = +16 iken -2⁴ = -16'dır!";
  } else if (text.includes('karekö') || text.includes('kök') || text.includes('√')) {
    level1 =
      'Kök içindeki sayıyı çarpanlarına ayır ve tam kare çarpanları dışarı çıkar (√(a² · b) = a√b).';
    socraticAnalysis =
      'Kökün içindeki sayı bir tam kare mi yoksa a√b biçiminde en sade haline mi getirilmeli?';
    criticalEquation = '√(a² · b) = a√b | √a · √b = √(a · b)';
    commonTrap =
      'Kareköklü ifadelerde toplama/çıkarma yaparken kök içleri toplanmaz! √9 + √16 ≠ √25, 3 + 4 = 7 olur.';
  } else if (text.includes('yüzde') || text.includes('%')) {
    level1 = "Bir sayının %X'i bulunurken sayı X ile çarpılıp 100'e bölünür (A · X / 100).";
    socraticAnalysis =
      'Soru bir indirim, kâr veya zam mı içeriyor? Artış sonrası yeni değer %100 + X, azalış ise %100 - X olur.';
    criticalEquation = 'Yeni Değer = Ana Miktar · (1 ± Yüzde / 100)';
    commonTrap =
      'Peş peşe yapılan %20 zam ve %20 indirim birbirini nötrlemez; son fiyat ilk fiyattan daha düşük olur!';
  } else if (text.includes('alan') || text.includes('çevre') || text.includes('üçgen')) {
    level1 =
      'Geometrik şeklin temel alan ve çevre formüllerini hatırla (Dikdörtgen Alanı = a · b, Üçgen Alanı = (taban · yükseklik) / 2).';
    socraticAnalysis =
      'Şekil karmaşık ise onu parçalara (dikdörtgen, dik üçgen vb.) ayırarak alanların toplamını bulabilir misin?';
    criticalEquation =
      'Üçgen Alanı = (a · h) / 2 | Dikdörtgen Alanı = a · b | Pisagor: a² + b² = c²';
    commonTrap =
      'Çevre hesaplarken şeklin içinde kalan iç sınır çizgilerini çevreye katmamaya dikkat et!';
  } else if (text.includes('eğim') || text.includes('doğru') || text.includes('grafik')) {
    level1 =
      'Doğrunun eğimi m = (y₂ - y₁) / (x₂ - x₁) veya y = mx + b denklemindeki m katsayısıdır.';
    socraticAnalysis =
      'Doğru sağa mı yatık (pozitif eğim) yoksa sola mı yatık (negatif eğim)? Eksenleri kestiği noktalar (x=0 ve y=0) biliniyor mu?';
    criticalEquation = 'm = Δy / Δx = (y₂ - y₁) / (x₂ - x₁) | y = mx + n';
    commonTrap =
      'Eğim formülünde ordinatlar farkı (y) payda, apsisler farkı (x) paydadadır. Ters yazmamaya dikkat!';
  } else if (text.includes('parabol') || text.includes('ikinci derece')) {
    level1 =
      'Parabol tepe noktası T(r, k) için r = -b / (2a) ve diskriminant Δ = b² - 4ac formüllerini hatırla.';
    socraticAnalysis =
      'Kollar yukarı mı (a > 0) aşağı mı (a < 0)? En büyük veya en küçük değer tepe noktasında (k değeri) alınır.';
    criticalEquation = 'r = -b / (2a) | k = f(r) | Δ = b² - 4ac';
    commonTrap =
      'r değerinin apsis, k değerinin ordinat (en büyük/en küçük sonuç) olduğunu karıştırma!';
  } else if (text.includes('çarpan') || text.includes('ebob') || text.includes('ekok')) {
    level1 =
      'Sayıları asal çarpanlarına ayır. Ortak bölenler için en küçük üsleri, ortak katlar için en büyük üsleri al.';
    socraticAnalysis =
      'Problemde büyük bir bütünü parçalara mı bölüyorsun (EBOB), yoksa küçük parçaları birleştirip periyodik olarak büyütüyor musun (EKOK)?';
    criticalEquation = 'EBOB(a, b) · EKOK(a, b) = a · b';
    commonTrap =
      "Aralarında asal sayıların EBOB'unun 1 olduğunu unutma. Aralık ve parça sorularında baş/son direk sayısına (+1) dikkat et.";
  } else if (text.includes('olasılık')) {
    level1 = 'Olasılık = (İstenen Olayların Sayısı) / (Tüm Olası Durumların Sayısı).';
    socraticAnalysis =
      'Tüm olası çıktılar (örneklem uzayı) kaç elemanlı? İstenen duruma uyan kaç farklı senaryo var?';
    criticalEquation = 'P(A) = s(A) / s(E) | 0 ≤ P(A) ≤ 1';
    commonTrap =
      'Geri bırakılan veya bırakılmayan seçimlerde örneklem uzayının değişip değişmediğini kontrol et!';
  }

  // 2. Kademe: İlk İşlem Adımı
  let level2 =
    'Denklem kurmak için bilinmeyene x de ve soruda verilen eşitliği matematik diline dök.';
  if (
    text.includes('sinüs') ||
    text.includes('kosinüs') ||
    text.includes('tanjant') ||
    text.includes('\\sin') ||
    text.includes('\\cos') ||
    text.includes('\\tan') ||
    text.includes('trigonometri')
  ) {
    level2 =
      'İlk adım olarak verilen açıyı esas ölçüsüne ([0, 360°] veya [0, 2π]) indirge ve trigonometrik değerin bölgesine göre işaretini (+/-) belirle.';
  } else if (text.includes('logaritma') || text.includes('\\log') || text.includes('\\ln')) {
    level2 =
      'İlk adım olarak tüm logaritmaları aynı tabana dönüştür veya üsleri katsayı olarak logaritmanın başına indir.';
  } else if (text.includes('dizi') || text.includes('aritmetik dizi') || text.includes('geometrik dizi')) {
    level2 =
      'İlk terim (a₁) ve ortak farkı (d) ya da ortak çarpanı (r) tespit ederek sorudaki tüm terimleri a₁ cinsinden ifade et.';
  } else if (text.includes('polinom')) {
    level2 =
      'İlk adım olarak bölen ifadeyi sıfıra eşitleyerek elde ettiğin x değerini doğrudan polinom fonksiyonunda yerine koy.';
  } else if (text.includes('fonksiyon') || text.includes('f(x)') || text.includes('bileşke')) {
    level2 =
      'İlk olarak parantez içindeki bağıntıyı istenen girdi değerine eşitle veya bileşke işleminde içeriden dışarıya doğru adım at.';
  } else if (
    text.includes('pisagor') ||
    text.includes('dik üçgen') ||
    text.includes('öklid') ||
    text.includes('30-60-90')
  ) {
    level2 =
      'İlk adım olarak bilinen dik kenarları veya hipotenüsü yerleştir, 3-4-5 gibi özel üçgen kalıplarını veya Öklid bağıntısını kontrol et.';
  } else if (text.includes('karekö') || text.includes('kök')) {
    level2 =
      'İlk adım olarak kök dışındaki katsayıları kök içine al veya kök içindeki sayıları en sade a√b haline getir.';
  } else if (text.includes('oran') || text.includes('yüzde')) {
    level2 =
      'İlk olarak verilen yüzdeyi kesre çevir (örn: %25 = 1/4) ve ana sayı ile sadeleştirme yap.';
  } else if (text.includes('çarpan') || text.includes('ebob') || text.includes('ekok')) {
    level2 =
      'İlk adım olarak verilen sayıları asal çarpanlarına ayır veya ortak bölen listesini çıkar.';
  } else if (text.includes('denklem') || text.includes('bilinmeyen')) {
    level2 =
      'Benzer terimleri bir araya topla, bilinenleri bir tarafa, bilinmeyenleri (x) diğer tarafa aktar.';
  }

  // 3. Kademe: Çözüm Stratejisi
  const level3 = explanation
    ? explanation
    : 'İşlem adımlarını sırayla uygula, bulduğun sonucun şıklardaki karşılığını kontrol et ve gerekirse yerine koyarak sağlama yap.';

  return {
    commonTrap,
    criticalEquation,
    level1,
    level2,
    level3,
    socraticAnalysis,
  };
}

export function QuestionHintLadder({
  question,
  questionIndex,
  isOpen: controlledIsOpen,
  onToggleOpen: controlledToggleOpen,
  quizTitle,
}: QuestionHintLadderProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const [activeMode, setActiveMode] = useState<'ladder' | 'socratic'>('ladder');
  const [unlockedLevel, setUnlockedLevel] = useState<number>(0);
  const [isSavedToMistakes, setIsSavedToMistakes] = useState(false);
  const [puzzledSteps, setPuzzledSteps] = useState<Record<number, boolean>>({});

  // Soru değiştiğinde veya açıldığında bu soru için takılınan adımları yükle
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PUZZLED_KEY);
      if (raw) {
        const all: Record<string, Record<number, boolean>> = JSON.parse(raw);
        const qKey = question.id || question.question;
        setPuzzledSteps(all[qKey] || {});
      } else {
        setPuzzledSteps({});
      }
    } catch {
      setPuzzledSteps({});
    }
  }, [question]);

  const handleTogglePuzzledStep = (level: number) => {
    const qKey = question.id || question.question;
    const nextState = !puzzledSteps[level];
    const updated = { ...puzzledSteps, [level]: nextState };
    if (!nextState) {
      delete updated[level];
    }
    setPuzzledSteps(updated);

    try {
      const raw = localStorage.getItem(STORAGE_PUZZLED_KEY);
      const all: Record<string, Record<number, boolean>> = raw ? JSON.parse(raw) : {};
      if (Object.keys(updated).length > 0) {
        all[qKey] = updated;
      } else {
        delete all[qKey];
      }
      localStorage.setItem(STORAGE_PUZZLED_KEY, JSON.stringify(all));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ugur_hoca_puzzled_updated'));
      }
    } catch {
      // sessizce geç
    }
  };

  // Soru değiştiğinde ipucu kutusunu ve modu sıfırla
  useEffect(() => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(false);
    }
    setActiveMode('ladder');
    setUnlockedLevel(0);
    const saved = getSavedMistakes();
    const found = saved.some((m) => m.question.question === question.question);
    setIsSavedToMistakes(found);
  }, [questionIndex, question, controlledIsOpen]);

  // Açıldığında ilk kademe kilitli ise otomatik aç
  useEffect(() => {
    if (isOpen && unlockedLevel === 0) {
      setUnlockedLevel(1);
    }
  }, [isOpen, unlockedLevel]);

  const hints = deriveQuestionHints(question);

  const handleToggleOpen = () => {
    if (controlledToggleOpen) {
      controlledToggleOpen();
    } else {
      if (!isOpen && unlockedLevel === 0) {
        setUnlockedLevel(1);
      }
      setInternalIsOpen((prev) => !prev);
    }
  };

  const handleSaveToMistakes = () => {
    if (isSavedToMistakes) return;
    saveMistakesToBank([question], quizTitle);
    setIsSavedToMistakes(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ugur_hoca_mistakes_updated'));
    }
  };

  const renderMistakeBookmarkCard = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-slate-900/80 p-3">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <BookmarkPlus className="h-3.5 w-3.5 text-amber-400" />
          <span>Bu soruyu aralıklı tekrara eklemek ister misin?</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          {isSavedToMistakes
            ? 'Soru Hata Defterine eklendi. Leitner aralıklı tekrar algoritmasıyla karşına çıkacak.'
            : 'Zorlandığın veya ipucu aldığın soruları Hata Defterine ekleyerek unutmanın önüne geçebilirsin.'}
        </p>
      </div>
      <button
        type="button"
        onClick={handleSaveToMistakes}
        disabled={isSavedToMistakes}
        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
          isSavedToMistakes
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
            : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 hover:text-white'
        }`}
      >
        {isSavedToMistakes ? (
          <>
            <BookmarkCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Hata Defterinde Kayıtlı</span>
          </>
        ) : (
          <>
            <BookmarkPlus className="h-3.5 w-3.5 text-amber-400" />
            <span>Hata Defterine Ekle</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 sm:p-4 backdrop-blur-sm transition-all">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleToggleOpen}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 transition focus:outline-none"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Lightbulb className="h-4 w-4" />
          </div>
          <span>Kademeli İpucu Sistemi</span>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
            {unlockedLevel > 0 ? `${unlockedLevel}/3 Kademe` : '3 Seviye'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {isOpen && (
            <button
              type="button"
              onClick={() => setActiveMode((m) => (m === 'ladder' ? 'socratic' : 'ladder'))}
              className={`hidden sm:inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                activeMode === 'socratic'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:text-white'
              }`}
            >
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>{activeMode === 'socratic' ? 'Kademeliye Dön' : 'Sokratik Asistan'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleOpen}
            className="rounded-lg p-1 text-slate-400 hover:text-white transition"
            aria-label={isOpen ? 'İpuçlarını daralt' : 'İpuçlarını genişlet'}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-3 space-y-3"
          >
            {/* Sekme Değiştirici */}
            <div className="flex rounded-xl bg-slate-950/40 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveMode('ladder')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                  activeMode === 'ladder'
                    ? 'bg-amber-500/20 text-amber-300 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Kademeli İpuçları</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('socratic')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                  activeMode === 'socratic'
                    ? 'bg-cyan-500/20 text-cyan-300 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>Sokratik Asistan (Rehber)</span>
              </button>
            </div>

            {activeMode === 'ladder' ? (
              <div className="space-y-3">
                {/* 1. Kademe: Temel Kural & Formül */}
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>1. Kademe: Temel Kural & Formül</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePuzzledStep(1)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                        puzzledSteps[1]
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'text-slate-400 hover:text-rose-300 hover:bg-white/5'
                      }`}
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>{puzzledSteps[1] ? 'Anlaşılmadı (İşaretlendi)' : 'Burayı Anlamadım 🤔'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed pl-5">
                    <MathText>{hints.level1}</MathText>
                  </div>
                  {puzzledSteps[1] && (
                    <div className="rounded-lg bg-rose-950/40 border border-rose-500/30 p-2 text-[11px] text-rose-200 mt-1">
                      <strong>💡 Mikro Rehber:</strong> Temel kuralı formüle dönüştürmekte zorlandıysan, sorudaki sayıları doğrudan formüldeki harflerin yerine yazarak başla.
                    </div>
                  )}
                </div>

                {/* 2. Kademe: İlk İşlem Adımı */}
                {unlockedLevel >= 2 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>2. Kademe: İlk İşlem Hamlesi</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePuzzledStep(2)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                          puzzledSteps[2]
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'text-slate-400 hover:text-rose-300 hover:bg-white/5'
                        }`}
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>{puzzledSteps[2] ? 'Anlaşılmadı (İşaretlendi)' : 'Burayı Anlamadım 🤔'}</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed pl-5">
                      <MathText>{hints.level2}</MathText>
                    </div>
                    {puzzledSteps[2] && (
                      <div className="rounded-lg bg-rose-950/40 border border-rose-500/30 p-2 text-[11px] text-rose-200 mt-1">
                        <strong>💡 Mikro Rehber:</strong> İlk işlem hamlesinde takıldıysan, benzer terimleri tek tarafa topla veya parantez dağılımını adım adım yaz.
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setUnlockedLevel(2)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-2 text-xs font-semibold text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>2. Kademe İpucunu Aç (İlk Hamle)</span>
                  </button>
                )}

                {/* 3. Kademe: Çözüm Yolu & Strateji */}
                {unlockedLevel >= 3 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-purple-500/30 bg-purple-950/40 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>3. Kademe: Çözüm Stratejisi</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePuzzledStep(3)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                          puzzledSteps[3]
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'text-slate-400 hover:text-rose-300 hover:bg-white/5'
                        }`}
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>{puzzledSteps[3] ? 'Anlaşılmadı (İşaretlendi)' : 'Burayı Anlamadım 🤔'}</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed pl-5">
                      <MathText>{hints.level3}</MathText>
                    </div>
                    {puzzledSteps[3] && (
                      <div className="rounded-lg bg-rose-950/40 border border-rose-500/30 p-2 text-[11px] text-rose-200 mt-1">
                        <strong>💡 Mikro Rehber:</strong> Çözümün son adımında şıkları eleyerek veya bulduğun sonucu denklemde yerine koyup sağlama yaparak kontrol et.
                      </div>
                    )}
                  </motion.div>
                ) : unlockedLevel >= 2 ? (
                  <button
                    type="button"
                    onClick={() => setUnlockedLevel(3)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-2 text-xs font-semibold text-slate-400 hover:border-purple-500/40 hover:text-purple-300 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    <span>3. Kademe İpucunu Aç (Çözüm Stratejisi)</span>
                  </button>
                ) : null}

                {/* 3. Kademe Açıldığında Hata Defterine Kaydetme Önerisi */}
                {unlockedLevel >= 3 && renderMistakeBookmarkCard()}
              </div>
            ) : (
              /* Sokratik Yapay Zeka Düşünme Asistanı */
              <div className="space-y-2.5">
                {/* 1. Soru Analizi & Ne İsteniyor? */}
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <Compass className="h-3.5 w-3.5" />
                    <span>Sokratik Soru Analizi (Ne Verildi, Ne Aranıyor?)</span>
                  </div>
                  <div className="text-xs text-cyan-100/90 leading-relaxed pl-5">
                    <MathText>{hints.socraticAnalysis}</MathText>
                  </div>
                </div>

                {/* 2. Kritik Eşitlik & Bağıntı */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Kritik Eşitlik & Kilit Bağıntı</span>
                  </div>
                  <div className="text-xs text-emerald-100/90 leading-relaxed pl-5 font-mono">
                    <MathText>{hints.criticalEquation}</MathText>
                  </div>
                </div>

                {/* 3. Tuzak Uyarısı (Nerede Yanılabilirsin?) */}
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Dikkat: Sık Yapılan Yanılgı & Tuzak!</span>
                  </div>
                  <div className="text-xs text-rose-100/90 leading-relaxed pl-5">
                    <MathText>{hints.commonTrap}</MathText>
                  </div>
                </div>

                {/* Sokratik Modda da Hata Defterine Ekleme */}
                {renderMistakeBookmarkCard()}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

