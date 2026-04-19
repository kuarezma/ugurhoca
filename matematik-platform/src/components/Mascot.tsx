import { cn } from '@/lib/cn';

export type MascotPose =
  | 'waving'
  | 'thinking'
  | 'celebrate'
  | 'confused'
  | 'study'
  | 'sleep';

type MascotProps = {
  pose?: MascotPose;
  size?: number;
  className?: string;
  ariaLabel?: string;
};

// "Pi" — a friendly owl that teaches math. Single SVG with pose-driven layers.
export function Mascot({ pose = 'waving', size = 160, className, ariaLabel }: MascotProps) {
  const label = ariaLabel ?? 'Uğur Hoca maskotu Pi';

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={cn('select-none drop-shadow-xl', className)}
    >
      <defs>
        <linearGradient id="pi-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="55%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="pi-belly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#FACC15" />
        </linearGradient>
        <linearGradient id="pi-beak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <radialGradient id="pi-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft halo */}
      <circle cx="100" cy="100" r="90" fill="url(#pi-body)" opacity="0.08" />

      {/* body */}
      <g>
        {/* feet */}
        <ellipse cx="78" cy="180" rx="14" ry="6" fill="#FB923C" />
        <ellipse cx="122" cy="180" rx="14" ry="6" fill="#FB923C" />

        {/* torso */}
        <path
          d="M40 95 C 40 55, 70 32, 100 32 C 130 32, 160 55, 160 95 C 160 140, 140 172, 100 172 C 60 172, 40 140, 40 95 Z"
          fill="url(#pi-body)"
        />

        {/* belly */}
        <ellipse cx="100" cy="120" rx="38" ry="36" fill="url(#pi-belly)" />

        {/* pi symbol on belly */}
        <text
          x="100"
          y="132"
          textAnchor="middle"
          fontSize="34"
          fontWeight="800"
          fontFamily="var(--font-display), system-ui, sans-serif"
          fill="#7C3AED"
        >
          π
        </text>

        {/* wings */}
        {pose === 'waving' ? (
          <path
            d="M42 90 C 22 70, 18 46, 42 40 C 50 55, 55 70, 52 95 Z"
            fill="#7C3AED"
          />
        ) : (
          <path
            d="M42 96 C 28 100, 24 120, 40 132 C 50 128, 54 116, 52 104 Z"
            fill="#6D28D9"
          />
        )}
        {pose === 'celebrate' ? (
          <path
            d="M158 92 C 180 66, 186 46, 166 38 C 154 54, 150 72, 150 96 Z"
            fill="#7C3AED"
          />
        ) : (
          <path
            d="M158 96 C 172 100, 176 120, 160 132 C 150 128, 146 116, 148 104 Z"
            fill="#6D28D9"
          />
        )}

        {/* eyes */}
        <g>
          {pose === 'sleep' ? (
            <>
              <path d="M68 82 Q 78 76 88 82" stroke="#1E1B4B" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M112 82 Q 122 76 132 82" stroke="#1E1B4B" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="78" cy="82" r="14" fill="#FFFFFF" />
              <circle cx="122" cy="82" r="14" fill="#FFFFFF" />
              <circle
                cx={pose === 'thinking' ? 82 : pose === 'confused' ? 74 : 78}
                cy={pose === 'thinking' ? 80 : 84}
                r="6"
                fill="#1E1B4B"
              />
              <circle
                cx={pose === 'thinking' ? 126 : pose === 'confused' ? 126 : 122}
                cy={pose === 'thinking' ? 80 : 84}
                r="6"
                fill="#1E1B4B"
              />
              <circle cx={pose === 'thinking' ? 84 : pose === 'confused' ? 76 : 80} cy="80" r="2" fill="#FFFFFF" />
              <circle cx={pose === 'thinking' ? 128 : pose === 'confused' ? 128 : 124} cy="80" r="2" fill="#FFFFFF" />
            </>
          )}
        </g>

        {/* cheeks */}
        <circle cx="66" cy="100" r="8" fill="url(#pi-cheek)" />
        <circle cx="134" cy="100" r="8" fill="url(#pi-cheek)" />

        {/* beak */}
        <path
          d={
            pose === 'celebrate'
              ? 'M92 96 Q 100 114 108 96 Q 100 108 92 96 Z'
              : pose === 'confused'
              ? 'M92 98 Q 100 104 108 98 L 104 108 L 96 108 Z'
              : 'M94 98 L 106 98 L 100 110 Z'
          }
          fill="url(#pi-beak)"
        />

        {/* mouth overlay for celebrate/thinking */}
        {pose === 'celebrate' ? (
          <path d="M88 116 Q 100 130 112 116" stroke="#EA580C" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : null}

        {/* prop: book for study */}
        {pose === 'study' ? (
          <g>
            <rect x="78" y="128" width="44" height="28" rx="3" fill="#0F172A" />
            <rect x="80" y="130" width="40" height="24" rx="2" fill="#F8FAFC" />
            <line x1="100" y1="130" x2="100" y2="154" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="86" y1="138" x2="96" y2="138" stroke="#94A3B8" strokeWidth="1" />
            <line x1="104" y1="138" x2="114" y2="138" stroke="#94A3B8" strokeWidth="1" />
            <line x1="86" y1="144" x2="96" y2="144" stroke="#94A3B8" strokeWidth="1" />
            <line x1="104" y1="144" x2="114" y2="144" stroke="#94A3B8" strokeWidth="1" />
          </g>
        ) : null}

        {/* question mark for confused */}
        {pose === 'confused' ? (
          <text x="145" y="45" fontSize="34" fontWeight="900" fill="#FACC15">
            ?
          </text>
        ) : null}

        {/* sparkles for celebrate */}
        {pose === 'celebrate' ? (
          <>
            <circle cx="38" cy="45" r="3" fill="#FACC15" />
            <circle cx="160" cy="50" r="4" fill="#EC4899" />
            <circle cx="28" cy="100" r="3" fill="#06B6D4" />
            <circle cx="172" cy="110" r="3" fill="#22C55E" />
          </>
        ) : null}

        {/* Z for sleep */}
        {pose === 'sleep' ? (
          <>
            <text x="150" y="48" fontSize="24" fontWeight="800" fill="#A78BFA">
              z
            </text>
            <text x="162" y="38" fontSize="18" fontWeight="800" fill="#A78BFA" opacity="0.7">
              z
            </text>
          </>
        ) : null}
      </g>
    </svg>
  );
}
