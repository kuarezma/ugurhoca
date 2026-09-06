import { loadActiveLiveLessonForCurrentUser } from '@/features/live-lessons/server/liveLessons';
import { SafeLink } from '@/components/SafeLink';

/**
 * Ana sayfadaki "şu an ders var" rozeti.
 *
 * Kendi verisini çeken bir sunucu bileşeni olarak ayrıldı: aktif ders sorgusu
 * kimlik doğrulaması gerektiriyor (Supabase auth.getUser + profiles = iki ağ
 * gidiş-dönüşü) ve daha önce bu maliyet ana sayfanın TTFB'sine ekleniyordu.
 * Artık `<Suspense>` içinde stream ediliyor: sayfanın HTML'i duyuru sorgusu
 * biter bitmez akmaya başlıyor, rozet hazır olduğunda ekleniyor. Rozet `fixed`
 * konumlandığı için sonradan gelmesi düzen kaymasına yol açmaz.
 */
export async function ActiveLiveLessonBadge() {
  const activeLiveLesson = await loadActiveLiveLessonForCurrentUser();

  if (!activeLiveLesson) {
    return null;
  }

  return (
    <SafeLink
      href={`/canli-ders/d/${activeLiveLesson.room_id}`}
      className="fixed right-4 top-[calc(4.75rem+env(safe-area-inset-top))] z-40 inline-flex max-w-[calc(100vw-2rem)] animate-pulse items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_0_8px_rgba(220,38,38,0.16),0_18px_35px_-18px_rgba(220,38,38,0.9)] ring-1 ring-white/30 transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:right-6"
      aria-label={`${activeLiveLesson.title} canlı dersine katıl`}
    >
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
      </span>
      <span className="truncate">Şu an ders var</span>
    </SafeLink>
  );
}
