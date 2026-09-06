'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Trash2,
  Volume2,
  VolumeX,
  X,
  BookOpen,
  Radio,
  MessageCircle,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DashboardNotification } from '@/types/dashboard';
import { getNotificationStyle } from '@/features/profile/utils/getNotificationStyle';
import { useNavbarNotifications } from '@/features/home/hooks/useNavbarNotifications';

type HomeNavbarNotificationBellProps = {
  userId: string;
  isLight: boolean;
};

type NotificationFilterTab = 'all' | 'assignments' | 'classes' | 'messages';

function formatRelativeTime(isoDate: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
    if (diff < 172800) return 'Dün';
    if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
    return new Date(isoDate).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}

export function resolveNotificationTarget(notification: DashboardNotification): {
  path?: string;
  openChat?: boolean;
} {
  const type = notification.type;
  const title = (notification.title || '').toLowerCase();
  const msg = (notification.message || '').toLowerCase();

  // 1. Mesajlar -> Sohbet Balonunu Aç
  if (
    type === 'message' ||
    type === 'admin-message' ||
    title.includes('mesaj') ||
    msg.includes('mesaj')
  ) {
    return { openChat: true };
  }

  // 2. Canlı Dersler
  if (
    type === 'live-lesson' ||
    title.includes('canlı ders') ||
    msg.includes('canlı ders')
  ) {
    const roomId = (notification.metadata as { room_id?: string })?.room_id;
    return { path: roomId ? `/canli-ders/d/${roomId}` : '/canli-ders' };
  }

  // 3. Ödevler
  if (
    type === 'assignment' ||
    title.includes('ödev') ||
    msg.includes('ödev')
  ) {
    return { path: '/odevler' };
  }

  // 4. İçerikler / Dokümanlar / Kitaplar
  if (
    type === 'document' ||
    title.includes('yaprak test') ||
    title.includes('kitap') ||
    title.includes('doküman')
  ) {
    return { path: '/icerikler' };
  }

  // 5. Testler / Sınavlar
  if (
    title.includes('test') ||
    title.includes('deneme') ||
    title.includes('sınav')
  ) {
    return { path: '/testler' };
  }

  return { path: '/profil' };
}

export function HomeNavbarNotificationBell({
  userId,
  isLight,
}: HomeNavbarNotificationBellProps) {
  const router = useRouter();
  const {
    deleteNotification,
    markAllAsRead,
    markAsRead,
    notifications,
    unreadCount,
  } = useNavbarNotifications(userId);
  const [open, setOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<NotificationFilterTab>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('notification_sound_muted');
      if (saved === 'true') setSoundMuted(true);
    } catch {
      // ignore
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('notification_sound_muted', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const playBellChime = useCallback(() => {
    if (soundMuted) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // ignore
    }
  }, [soundMuted]);

  const [desktopPermission, setDesktopPermission] =
    useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDesktopPermission(Notification.permission);
    }
  }, []);

  const requestDesktopPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setDesktopPermission(perm);
    }
  }, []);

  const prevUnreadRef = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      playBellChime();
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted' &&
        document.hidden
      ) {
        const latest = notifications[0];
        if (latest) {
          try {
            new Notification(latest.title || 'Uğur Hoca Matematik Platformu', {
              body: latest.message || 'Yeni bir bildiriminiz var.',
              icon: '/ugur.jpeg',
            });
          } catch {
            // ignore
          }
        }
      }
    }
    prevUnreadRef.current = unreadCount;
  }, [notifications, playBellChime, unreadCount]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleNotificationClick = useCallback(
    async (notification: DashboardNotification) => {
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }
      setOpen(false);
      const target = resolveNotificationTarget(notification);
      if (target.openChat) {
        window.dispatchEvent(new CustomEvent('open-chat-bubble'));
      } else if (target.path) {
        router.push(target.path);
      }
    },
    [markAsRead, router],
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (showOnlyUnread && n.is_read) return false;
      if (filterTab === 'assignments') {
        return n.type === 'assignment' || n.title.toLowerCase().includes('ödev');
      }
      if (filterTab === 'classes') {
        return (
          n.type === 'live-lesson' || n.title.toLowerCase().includes('canlı ders')
        );
      }
      if (filterTab === 'messages') {
        return (
          n.type === 'message' ||
          n.type === 'admin-message' ||
          n.title.toLowerCase().includes('mesaj')
        );
      }
      return true;
    });
  }, [notifications, filterTab, showOnlyUnread]);

  const buttonClasses = `relative inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
    isLight
      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={
          unreadCount > 0
            ? `Bildirimler: ${unreadCount} okunmamış`
            : 'Bildirimler'
        }
        aria-expanded={open}
        aria-haspopup="menu"
        className={buttonClasses}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className={`fixed left-4 right-4 top-[calc(3.5rem+0.25rem+env(safe-area-inset-top))] z-50 max-h-[75vh] overflow-hidden rounded-2xl border shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[420px] ${
              isLight
                ? 'border-slate-200 bg-white'
                : 'border-slate-700 bg-slate-900'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between border-b px-4 py-3 ${
                isLight ? 'border-slate-200' : 'border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <h3
                  className={`font-bold text-sm ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Bildirim Merkezi
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-500">
                    {unreadCount} yeni
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleSound}
                  title={soundMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                  aria-label={soundMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                  className={`rounded-lg p-1.5 transition-colors ${
                    isLight
                      ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {soundMuted ? (
                    <VolumeX className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-indigo-500" />
                  )}
                </button>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      void markAllAsRead();
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                      isLight
                        ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Tümünü oku
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Kapat"
                  className={`rounded-lg p-1.5 transition-colors ${
                    isLight
                      ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Filtre Sekmeleri & Okunmamış Toggle */}
            <div
              className={`flex items-center justify-between border-b px-3 py-2 gap-2 text-xs ${
                isLight
                  ? 'border-slate-100 bg-slate-50/70'
                  : 'border-slate-800 bg-slate-950/40'
              }`}
            >
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                    filterTab === 'all'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : isLight
                        ? 'text-slate-600 hover:bg-slate-200/60'
                        : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Tümü
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('assignments')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                    filterTab === 'assignments'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : isLight
                        ? 'text-slate-600 hover:bg-slate-200/60'
                        : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <BookOpen className="h-3 w-3" />
                  Ödevler
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('classes')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                    filterTab === 'classes'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : isLight
                        ? 'text-slate-600 hover:bg-slate-200/60'
                        : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Radio className="h-3 w-3" />
                  Dersler
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('messages')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                    filterTab === 'messages'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : isLight
                        ? 'text-slate-600 hover:bg-slate-200/60'
                        : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <MessageCircle className="h-3 w-3" />
                  Mesajlar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowOnlyUnread((prev) => !prev)}
                className={`shrink-0 px-2 py-1 rounded-lg font-medium transition border text-[11px] ${
                  showOnlyUnread
                    ? 'border-indigo-400 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : isLight
                      ? 'border-slate-200 text-slate-500 hover:bg-slate-100'
                      : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {showOnlyUnread ? '● Sadece Okunmamış' : 'Tüm Durumlar'}
              </button>
            </div>

            {desktopPermission === 'default' && (
              <div
                className={`flex items-center justify-between px-3.5 py-2 border-b text-[11px] ${
                  isLight
                    ? 'bg-indigo-50/70 border-indigo-100 text-indigo-900'
                    : 'bg-indigo-950/40 border-indigo-900/40 text-indigo-200'
                }`}
              >
                <span>Ödev ve ders uyarılarını masaüstünde al</span>
                <button
                  type="button"
                  onClick={requestDesktopPermission}
                  className="rounded-lg bg-indigo-600 px-2 py-0.5 font-semibold text-white transition hover:bg-indigo-500 shadow-xs"
                >
                  İzin Ver
                </button>
              </div>
            )}

            <div className="max-h-[55vh] overflow-y-auto sm:max-h-96">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <Bell className="h-5 w-5 opacity-40" />
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {showOnlyUnread
                      ? 'Harika! Okunmamış yeni bildiriminiz yok.'
                      : 'Bu kategoride henüz bir bildirim bulunmuyor.'}
                  </p>
                </div>
              ) : (
                <ul
                  className={`divide-y ${
                    isLight ? 'divide-slate-100' : 'divide-slate-800'
                  }`}
                >
                  {filteredNotifications.map((notification) => {
                    const style = getNotificationStyle(notification);
                    const Icon = style.icon;

                    return (
                      <li
                        key={notification.id}
                        className="group relative flex items-center justify-between"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            void handleNotificationClick(notification);
                          }}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors pr-10 ${
                            notification.is_read
                              ? isLight
                                ? 'hover:bg-slate-50'
                                : 'hover:bg-slate-800/60'
                              : isLight
                                ? 'bg-indigo-50/60 hover:bg-indigo-100/70'
                                : 'bg-indigo-500/10 hover:bg-indigo-500/20'
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`truncate text-sm font-semibold ${
                                  isLight ? 'text-slate-900' : 'text-white'
                                }`}
                              >
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                              )}
                            </div>
                            {notification.type !== 'message-read' &&
                            notification.message ? (
                              <p
                                className={`mt-0.5 line-clamp-2 text-xs ${
                                  isLight ? 'text-slate-600' : 'text-slate-300'
                                }`}
                              >
                                {notification.message}
                              </p>
                            ) : null}
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{formatRelativeTime(notification.created_at)}</span>
                              <span>•</span>
                              <span className="capitalize font-medium text-indigo-500 dark:text-indigo-400">
                                {notification.type === 'assignment'
                                  ? 'Ödev'
                                  : notification.type === 'live-lesson'
                                    ? 'Canlı Ders'
                                    : notification.type === 'message' ||
                                        notification.type === 'admin-message'
                                      ? 'Mesaj'
                                      : 'Duyuru'}
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Tekil Bildirim Silme Butonu */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void deleteNotification(notification.id);
                          }}
                          aria-label="Bildirimi sil"
                          title="Bildirimi sil"
                          className="absolute right-3 top-3.5 z-10 rounded-lg p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition focus:opacity-100 focus:outline-none"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div
              className={`border-t px-4 py-2 text-center ${
                isLight ? 'border-slate-200' : 'border-slate-700'
              }`}
            >
              <SafeLink
                href="/profil"
                onClick={() => setOpen(false)}
                className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                  isLight
                    ? 'text-indigo-600 hover:text-indigo-700'
                    : 'text-indigo-300 hover:text-indigo-200'
                }`}
              >
                Tümünü Gör
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </SafeLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
