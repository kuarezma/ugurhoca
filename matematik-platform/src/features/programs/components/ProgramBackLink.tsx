import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type ProgramBackLinkProps = {
  isLight: boolean;
};

export function ProgramBackLink({ isLight: _isLight }: ProgramBackLinkProps) {
  return (
    <Link
      href="/programlar"
      className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary transition-colors hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      Programlar Merkezine Dön
    </Link>
  );
}
