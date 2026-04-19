export type ExamSubItem = {
  label: string;
  dateLabel: string;
};

export type FeaturedExam = {
  id: string;
  title: string;
  provider: string;
  targetDate: string;
  dateLabel: string;
  accent: string;
  featured: boolean;
  category: 'central' | 'scholarship' | 'school';
  toolHref?: string;
  subItems?: ExamSubItem[];
};

export const featuredExams: FeaturedExam[] = [
  {
    id: 'lgs-2026',
    title: "LGS'ye Kalan Süre",
    provider: 'MEB',
    targetDate: '2026-06-13T09:30:00+03:00',
    dateLabel: '13 Haziran 2026 Cumartesi',
    accent: 'from-cyan-500 via-blue-500 to-indigo-500',
    featured: true,
    category: 'central',
    toolHref: '/programlar/lgs',
  },
  {
    id: 'yks-2026',
    title: "YKS'ye Kalan Süre",
    provider: 'ÖSYM',
    targetDate: '2026-06-20T10:15:00+03:00',
    dateLabel: '20 Haziran 2026 Cumartesi 10:15',
    accent: 'from-violet-500 via-fuchsia-500 to-orange-400',
    featured: true,
    category: 'central',
    toolHref: '/programlar/yks',
    subItems: [
      {
        label: 'TYT',
        dateLabel: '20 Haziran 2026 10:15',
      },
      {
        label: 'AYT',
        dateLabel: '21 Haziran 2026 10:15',
      },
    ],
  },
];
