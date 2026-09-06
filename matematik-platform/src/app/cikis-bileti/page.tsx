import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ExitTicketPageContainer } from '@/features/exit-ticket/containers/ExitTicketPageContainer';

export const metadata: Metadata = {
  title: 'Ders Sonu Çıkış Bileti (Exit Ticket) | Uğur Hoca',
  description:
    'Sınıfta ve akıllı tahtada dersin son 3 dakikasında hızlı değerlendirme yapın. 6 haneli kodla anında katılım ve kavram yanılgısı analizi.',
};

export default function ExitTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex items-center justify-center text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            <span className="text-sm">Çıkış bileti yükleniyor...</span>
          </div>
        </div>
      }
    >
      <ExitTicketPageContainer />
    </Suspense>
  );
}
