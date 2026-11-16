import type { ReactNode } from 'react';
import { SitePageNavigation } from '@/components/SitePageNavigation';

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SitePageNavigation />
      {children}
    </>
  );
}
