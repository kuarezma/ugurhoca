'use client';

import { useState, useEffect, useId } from 'react';
import {
  X,
  Lock,
  Unlock,
  Sparkles,
  Award,
  Target,
  FileText,
  Clock,
  Edit3,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  getTimeCapsule,
  saveTimeCapsule,
  unlockTimeCapsule,
  type TimeCapsuleGoal,
} from '../lib/timeCapsuleStorage';

interface GoalTimeCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  studentId?: string;
}

export function GoalTimeCapsuleModal({
  isOpen,
  onClose,
  studentName = 'Öğrenci',
  studentId = 'current-student',
}: GoalTimeCapsuleModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  const [capsule, setCapsule] = useState<TimeCapsuleGoal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reflectionInput, setReflectionInput] = useState('');

  // Form state
  const [targetNetScore, setTargetNetScore] = useState(18);
  const [targetGoalText, setTargetGoalText] = useState('');
  const [fearToOvercome, setFearToOvercome] = useState('');
  const [personalPledge, setPersonalPledge] = useState('');
  const [letterToFutureSelf, setLetterToFutureSelf] = useState('');
  const [unlockDate, setUnlockDate] = useState('2026-06-01');

  useEffect(() => {
    if (isOpen) {
      const current = getTimeCapsule();
      setCapsule(current);
      if (current) {
        setTargetNetScore(current.targetNetScore);
        setTargetGoalText(current.targetGoalText);
        setFearToOvercome(current.fearToOvercome);
        setPersonalPledge(current.personalPledge);
        setLetterToFutureSelf(current.letterToFutureSelf);
        setUnlockDate(current.unlockDate);
        setReflectionInput(current.reflectionNotes || '');
      }
      setIsEditing(!current);
    }
  }, [isOpen]);

  const handleSaveCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterToFutureSelf.trim() || !targetGoalText.trim()) return;

    const newCapsule: TimeCapsuleGoal = {
      id: capsule?.id || `capsule-${Date.now()}`,
      studentId,
      studentName,
      targetNetScore,
      targetGoalText: targetGoalText.trim(),
      fearToOvercome: fearToOvercome.trim(),
      personalPledge: personalPledge.trim(),
      letterToFutureSelf: letterToFutureSelf.trim(),
      unlockDate,
      createdAt: capsule?.createdAt || new Date().toISOString(),
      isUnlocked: false,
    };

    saveTimeCapsule(newCapsule);
    setCapsule(newCapsule);
    setIsEditing(false);
  };

  const handleUnlock = () => {
    unlockTimeCapsule(reflectionInput);
    const updated = getTimeCapsule();
    setCapsule(updated);
  };

  if (!isOpen) return null;

  const isUnlocked = capsule?.isUnlocked;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Hedef Zaman Kapsülü
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 font-medium">
                  Sene Başı ➔ Sene Sonu
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gelecekteki kendine bir mektup ve hedefler bırak. Yıl sonunda açıp gelişiminle gurur duy.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Kapsülü Düzenle"
                aria-label="Düzenle"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isEditing ? (
            <form onSubmit={handleSaveCapsule} className="space-y-4">
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl text-xs text-amber-950 dark:text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Kapsülünü Mühürle ve Geleceğe Gönder!
                </p>
                <p>
                  Yıl boyunca karşılaşacağın zorlukları düşün. Bugün koyduğun samimi hedefler ve kendine vereceğin cesaret mektubu, zorlandığın anlarda sana pusula olacak.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="capsule-net-score" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hedef Matematik Neti (20 Soru Üzerinden)
                  </label>
                  <input
                    id="capsule-net-score"
                    type="number"
                    min={1}
                    max={20}
                    value={targetNetScore}
                    onChange={(e) => setTargetNetScore(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="capsule-unlock-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kapsülün Açılacağı Tarih
                  </label>
                  <input
                    id="capsule-unlock-date"
                    type="date"
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="capsule-target-goal" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  En Büyük Matematiksel Hedefin
                </label>
                <input
                  id="capsule-target-goal"
                  type="text"
                  value={targetGoalText}
                  onChange={(e) => setTargetGoalText(e.target.value)}
                  placeholder="Örn: LGS Matematikte 18+ net yaparak hayalimdeki fen lisesine girmek"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="capsule-fear-overcome" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Yenmek İstediğin Korku / Önyargı
                  </label>
                  <input
                    id="capsule-fear-overcome"
                    type="text"
                    value={fearToOvercome}
                    onChange={(e) => setFearToOvercome(e.target.value)}
                    placeholder="Örn: Uzun paragraflı yeni nesil sorular"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="capsule-pledge" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kendine Çalışma Taahhüdün
                  </label>
                  <input
                    id="capsule-pledge"
                    type="text"
                    value={personalPledge}
                    onChange={(e) => setPersonalPledge(e.target.value)}
                    placeholder="Örn: Günde 20 soru çözüp yanlışlarımı incelemek"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="capsule-letter-self" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gelecekteki Kendine Mektup
                </label>
                <textarea
                  id="capsule-letter-self"
                  rows={4}
                  value={letterToFutureSelf}
                  onChange={(e) => setLetterToFutureSelf(e.target.value)}
                  placeholder="Sevgili gelecekteki ben, bu mektubu açtığında umarım..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {capsule && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                  >
                    Vazgeç
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md inline-flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Kapsülü Mühürle ve Kaydet
                </button>
              </div>
            </form>
          ) : capsule ? (
            <div className="space-y-5">
              {/* Capsule Status Card */}
              <div className={`p-6 rounded-3xl border ${
                isUnlocked
                  ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-300 dark:border-emerald-800'
                  : 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-300 dark:border-amber-800'
              } flex flex-col sm:flex-row items-center justify-between gap-4`}>
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                    isUnlocked
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white animate-pulse'
                  }`}>
                    {isUnlocked ? <Unlock className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {isUnlocked ? 'Zaman Kapsülü Kilidi Açıldı!' : 'Zaman Kapsülü Mühürlendi'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Hedef Açılış Tarihi: {capsule.unlockDate} • Oluşturulma: {new Date(capsule.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div>
                  {!isUnlocked ? (
                    <button
                      onClick={handleUnlock}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-2 transition-transform hover:scale-105"
                    >
                      <Unlock className="w-4 h-4" />
                      Kapsülü Şimdi Aç
                    </button>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Zaman Gezgini Rozeti
                    </span>
                  )}
                </div>
              </div>

              {/* Targets and Commitments */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Target className="w-3.5 h-3.5 text-amber-500" />
                    <span>Hedef Net</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {capsule.targetNetScore} / 20 Net
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Aşılacak Korku</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {capsule.fearToOvercome || 'Belirtilmedi'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Çalışma Taahhüdü</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {capsule.personalPledge || 'Belirtilmedi'}
                  </div>
                </div>
              </div>

              {/* Future Self Letter */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Sene Başında Gelecekteki Kendine Yazdığın Mektup:
                </h4>
                <div className="p-4 bg-amber-50/30 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-serif italic leading-relaxed whitespace-pre-line">
                  &ldquo;{capsule.letterToFutureSelf}&rdquo;
                </div>
              </div>

              {/* Reflection note if unlocked */}
              {isUnlocked && (
                <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Sene Sonu Değerlendirmesi ve Kazanılan Özgüven:
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-200">
                    {capsule.reflectionNotes || 'Hedeflerine doğru kararlılıkla yürüdün. Bu gelişim portfolyosundaki her bir çalışma, soru ve anlatım senin başarının somut kanıtıdır.'}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
