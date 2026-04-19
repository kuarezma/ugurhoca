import { cn } from '@/lib/cn';

type AvatarProps = {
  name?: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
  level?: number;
};

function initials(name: string | null | undefined) {
  if (!name) return 'UH';
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return 'UH';
  return parts.map((p) => p.charAt(0).toLocaleUpperCase('tr-TR')).join('');
}

function colorFromName(name: string | null | undefined) {
  if (!name) return 'from-brand-primary to-brand-pink';
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const palettes = [
    'from-brand-primary to-brand-pink',
    'from-brand-secondary to-brand-primary',
    'from-brand-orange to-brand-pink',
    'from-emerald-400 to-teal-500',
    'from-indigo-500 to-sky-400',
    'from-rose-400 to-amber-400',
    'from-violet-500 to-fuchsia-400',
  ];
  return palettes[Math.abs(hash) % palettes.length];
}

export function Avatar({ name, size = 44, className, ring = false, level }: AvatarProps) {
  const label = initials(name);
  const gradient = colorFromName(name);
  const style = { width: size, height: size };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-display font-bold text-white shadow-md',
        'bg-gradient-to-br',
        gradient,
        ring && 'ring-2 ring-offset-2 ring-brand-primary/60 ring-offset-transparent',
        className,
      )}
      style={style}
      aria-hidden={name ? undefined : true}
    >
      <span className="select-none" style={{ fontSize: size * 0.38 }}>
        {label}
      </span>
      {typeof level === 'number' ? (
        <span
          className="absolute -bottom-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-slate-900 ring-2 ring-white dark:ring-slate-900"
          aria-label={`Seviye ${level}`}
        >
          {level}
        </span>
      ) : null}
    </div>
  );
}
