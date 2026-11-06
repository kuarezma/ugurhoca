import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeAnnouncementsSection } from './HomeAnnouncementsSection';

vi.mock('@/features/home/queries', () => ({
  isNewContent: () => false,
  proxiedImageSrc: (url: string) => url,
}));

afterEach(() => vi.unstubAllEnvs());

describe('HomeAnnouncementsSection tarihleri', () => {
  it.each(['UTC', 'Europe/Istanbul'])(
    '%s ortamında duyurunun İstanbul takvim gününü gösterir',
    (timeZone) => {
      vi.stubEnv('TZ', timeZone);
      render(
        <HomeAnnouncementsSection
          announcements={[
            {
              id: 'announcement-date',
              title: 'Yeni duyuru',
              content: 'Duyuru içeriği',
              created_at: '2026-11-03T21:00:00.000Z',
            },
          ]}
          onSelectAnnouncement={vi.fn()}
        />,
      );

      expect(screen.getByText('4 Kas')).toBeInTheDocument();
    },
  );
});
