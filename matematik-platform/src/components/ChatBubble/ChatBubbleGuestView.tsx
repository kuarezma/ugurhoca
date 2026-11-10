'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LogIn, UserPlus, X } from 'lucide-react';

export type ChatBubbleGuestViewProps = {
  isLight: boolean;
  onClose: () => void;
};

export function ChatBubbleGuestView({
  isLight,
  onClose,
}: ChatBubbleGuestViewProps) {
  return (
    <div
      className="flex h-full flex-col justify-between p-6 text-center overscroll-contain"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className={`rounded-xl p-1.5 transition-colors ${
            isLight
              ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="my-auto space-y-4">
        <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border-2 border-[#58cc02] p-0.5 shadow-lg shadow-emerald-500/20 ring-4 ring-[#d7ffb8]">
          <Image
            src="/ugur.jpeg"
            alt="Uğur Hoca"
            width={80}
            height={80}
            className="h-full w-full rounded-full object-cover"
          />
        </div>
        <div>
          <h3
            className={`font-display text-xl font-bold ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Uğur Hoca ile Sohbet
          </h3>
          <p
            className={`mt-2 text-sm ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Doğrudan benimle mesajlaşmak, sorularını iletmek veya ders takibi
            yapmak için giriş yapabilirsin.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/giris"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
          >
            <LogIn className="h-4 w-4" /> Giriş Yap
          </Link>
          <Link
            href="/kayit"
            onClick={onClose}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
              isLight
                ? 'border-slate-300 bg-slate-100/90 text-slate-800 hover:bg-slate-200'
                : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserPlus className="h-4 w-4" /> Ücretsiz Hesap Oluştur
          </Link>
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        Öğrenciler sadece öğretmenle 1-e-1 güvenli iletişim kurar.
      </p>
    </div>
  );
}
