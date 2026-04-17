import type { LucideIcon } from 'lucide-react';
import {
  AppWindow,
  BookOpen,
  ClipboardList,
  FileText,
  Gamepad2,
  Video,
} from 'lucide-react';

export type HomeCategory = {
  bgColor: string;
  borderColor: string;
  color: string;
  contentType?: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  id: string;
  title: string;
};

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    color: 'from-blue-500 to-cyan-500',
    contentType: 'ders-notlari',
    desc: 'Yüklediğiniz doküman ve testler',
    href: '/icerikler?type=ders-notlari',
    icon: BookOpen,
    id: 'ders-notlari',
    title: 'Yaprak Test',
  },
  {
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    color: 'from-indigo-500 to-violet-500',
    contentType: 'kitaplar',
    desc: 'Kitap önerileri ve pdf\'leri',
    href: '/icerikler?type=kitaplar',
    icon: BookOpen,
    id: 'kitaplar',
    title: 'Kitaplar',
  },
  {
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    color: 'from-purple-500 to-pink-500',
    contentType: 'yaprak-test',
    desc: 'Sınıf ve ünite bazlı kazanım klasörleri',
    href: '/icerikler?type=yaprak-test',
    icon: ClipboardList,
    id: 'yaprak-test',
    title: 'Kazanımlar',
  },
  {
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    color: 'from-red-500 to-orange-500',
    contentType: 'ders-videolari',
    desc: 'Video anlatımlar',
    href: '/icerikler?type=ders-videolari',
    icon: Video,
    id: 'ders-videolari',
    title: 'Ders Videoları',
  },
  {
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    color: 'from-green-500 to-emerald-500',
    contentType: 'deneme',
    desc: 'Deneme sınavları',
    href: '/icerikler?type=deneme',
    icon: FileText,
    id: 'deneme',
    title: 'Deneme',
  },
  {
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    color: 'from-teal-500 to-cyan-500',
    contentType: 'sinav',
    desc: 'Sınavlar ve testler',
    href: '/icerikler?type=sinav',
    icon: ClipboardList,
    id: 'sinav',
    title: 'Sınav',
  },
  {
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    color: 'from-yellow-500 to-amber-500',
    desc: 'Eğlenirken öğren',
    href: '/oyunlar',
    icon: Gamepad2,
    id: 'oyunlar',
    title: 'Oyunlar',
  },
  {
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    color: 'from-pink-500 to-rose-500',
    desc: 'Eğitim uygulamaları',
    href: '/programlar',
    icon: AppWindow,
    id: 'programlar',
    title: 'Programlar',
  },
];

export const HOME_ROUTE_PREFETCH_HREFS = HOME_CATEGORIES.map(
  (category) => category.href,
);

export const HOME_CONTENT_PREFETCH_TYPES = HOME_CATEGORIES.flatMap(
  (category) => (category.contentType ? [category.contentType] : []),
);
