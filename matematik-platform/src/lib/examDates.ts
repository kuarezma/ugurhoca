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
    id: 'lgs-2027',
    title: "LGS'ye Kalan Süre",
    provider: 'MEB',
    targetDate: '2027-06-13T09:30:00+03:00',
    dateLabel: '13 Haziran 2027 Pazar',
    accent: 'from-cyan-700 via-blue-700 to-indigo-700',
    featured: true,
    category: 'central',
    toolHref: '/programlar/lgs',
  },
  {
    id: 'yks-2027',
    title: "YKS'ye Kalan Süre",
    provider: 'ÖSYM',
    targetDate: '2027-06-19T10:15:00+03:00',
    dateLabel: '19 Haziran 2027 Cumartesi 10:15',
    accent: 'from-violet-700 via-fuchsia-700 to-rose-700',
    featured: true,
    category: 'central',
    toolHref: '/programlar/yks',
    subItems: [
      {
        label: 'TYT',
        dateLabel: '19 Haziran 2027 10:15',
      },
      {
        label: 'AYT',
        dateLabel: '20 Haziran 2027 10:15',
      },
    ],
  },
];
