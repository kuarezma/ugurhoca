import { Bell, CheckCircle2, Clock3 } from 'lucide-react';
import type { DashboardNotification } from '@/types/dashboard';
import type { ProfileNotificationStyle } from '@/features/profile/types';

export const getNotificationStyle = (
  notification: DashboardNotification,
): ProfileNotificationStyle => {
  if (notification.is_read) {
    return {
      wrapper: 'border-slate-700/60 bg-slate-700/20 hover:bg-slate-700/35',
      icon: CheckCircle2,
      iconWrap: 'bg-emerald-500/15 text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-300',
      status: 'Görüldü',
    };
  }

  if (notification.type === 'assignment') {
    return {
      wrapper: 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15',
      icon: Clock3,
      iconWrap: 'bg-amber-500/15 text-amber-300',
      badge: 'bg-amber-500/15 text-amber-200',
      status: 'Ödev',
    };
  }

  if (notification.type === 'document') {
    return {
      wrapper: 'border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/15',
      icon: Clock3,
      iconWrap: 'bg-sky-500/15 text-sky-300',
      badge: 'bg-sky-500/15 text-sky-200',
      status: 'Belge',
    };
  }

  if (notification.type === 'admin-message') {
    return {
      wrapper: 'border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15',
      icon: Bell,
      iconWrap: 'bg-violet-500/15 text-violet-300',
      badge: 'bg-violet-500/15 text-violet-200',
      status: 'Uğur Hoca',
    };
  }

  if (notification.type === 'message-read') {
    return {
      wrapper: 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10',
      icon: CheckCircle2,
      iconWrap: 'bg-emerald-500/10 text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-300',
      status: 'Okundu',
    };
  }

  return {
    wrapper: 'border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15',
    icon: Clock3,
    iconWrap: 'bg-indigo-500/15 text-indigo-300',
    badge: 'bg-indigo-500/15 text-indigo-200',
    status: 'Mesaj',
  };
};
