'use client';

type HomeSupportLockedStateProps = {
  isLight: boolean;
};

export function HomeSupportLockedState({
  isLight,
}: HomeSupportLockedStateProps) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        isLight
          ? 'border-slate-200 bg-slate-50 text-slate-700'
          : 'border-white/10 bg-white/5 text-slate-300'
      }`}
    >
      Mesaj göndermek için giriş yapman gerekiyor.
    </div>
  );
}
