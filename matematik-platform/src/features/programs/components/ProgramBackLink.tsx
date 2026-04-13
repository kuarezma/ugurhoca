import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type ProgramBackLinkProps = {
  isLight: boolean;
};

export function ProgramBackLink({ isLight }: ProgramBackLinkProps) {
  return (
    <Link
      href="/programlar"
      className={`mb-5 inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
        isLight
          ? 'text-slate-700 hover:text-slate-950'
          : 'text-slate-300 hover:text-white'
      }`}
    >
      <ArrowLeft className="h-4 w-4" />
      Programlar Merkezine Don
    </Link>
  );
}
