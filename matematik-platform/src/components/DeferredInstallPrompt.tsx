'use client';

import dynamic from 'next/dynamic';

const InstallPrompt = dynamic(() => import('@/components/InstallPrompt'), {
  ssr: false,
  loading: () => null,
});

export default function DeferredInstallPrompt() {
  return <InstallPrompt />;
}
