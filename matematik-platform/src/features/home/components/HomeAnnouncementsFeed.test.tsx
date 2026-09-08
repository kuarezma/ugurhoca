import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Announcement } from '@/types';

vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('@/features/home/components/HomeAnnouncementsSection', () => ({
  HomeAnnouncementsSection: ({
    announcements,
    onSelectAnnouncement,
  }: {
    announcements: Announcement[];
    onSelectAnnouncement: (announcement: Announcement) => void;
  }) => (
    <button
      type="button"
      onClick={() => onSelectAnnouncement(announcements[0])}
    >
      {announcements[0].title}
    </button>
  ),
}));

vi.mock('next/dynamic', () => ({
  default:
    () =>
    ({
      announcement,
      onClose,
    }: {
      announcement: Announcement;
      onClose: () => void;
    }) => (
      <div>
        <span>Modal: {announcement.title}</span>
        <button type="button" onClick={onClose}>
          Kapat
        </button>
      </div>
    ),
}));

import { HomeAnnouncementsFeed } from './HomeAnnouncementsFeed';

const announcement = {
  id: 'announcement-1',
  title: 'Yeni duyuru',
  content: 'Duyuru içeriği',
  created_at: '2026-09-08T10:00:00.000Z',
} as Announcement;

describe('HomeAnnouncementsFeed', () => {
  it('boş duyuru listesinde bölüm render etmez', () => {
    const { container } = render(<HomeAnnouncementsFeed announcements={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('seçilen duyurunun modalını açıp kapatır', () => {
    render(<HomeAnnouncementsFeed announcements={[announcement]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Yeni duyuru' }));
    expect(screen.getByText('Modal: Yeni duyuru')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }));
    expect(screen.queryByText('Modal: Yeni duyuru')).not.toBeInTheDocument();
  });
});
