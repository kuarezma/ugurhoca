'use client';

import {
  formatRank,
  type YksScoreRow,
  type YksScoreType,
} from '@/lib/examCalculators';

type YksScoreTableProps = {
  activeScoreType: YksScoreType;
  isLight: boolean;
  rows: YksScoreRow[];
  onScoreTypeChange: (scoreType: YksScoreType) => void;
};

const scoreTypeLabels: Record<YksScoreType, string> = {
  TYT: 'TYT',
  SAY: 'SAY',
  EA: 'EA',
  SOZ: 'SÖZ',
};

export function YksScoreTable({
  activeScoreType,
  isLight,
  onScoreTypeChange,
  rows,
}: YksScoreTableProps) {
  const headerClassName = isLight
    ? 'bg-slate-100 text-slate-600'
    : 'bg-white/5 text-slate-300';

  return (
    <div
      className={`overflow-hidden rounded-3xl border ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/5'}`}
    >
      <div
        className={`px-4 py-3 ${isLight ? 'border-b border-slate-200' : 'border-b border-white/10'}`}
      >
        <h2
          className={`text-base font-black ${isLight ? 'text-slate-950' : 'text-white'}`}
        >
          Puan ve Sıralama Sonuçları
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead className={headerClassName}>
            <tr>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">
                Puan Türü
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">
                Ham Puan
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">
                Ham Sıralama
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">
                Yer. Puanı
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">
                Yer. Sıralama
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">
                Tercih
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const active = row.scoreType === activeScoreType;

              return (
                <tr
                  key={row.scoreType}
                  className={`border-t transition ${
                    isLight
                      ? active
                        ? 'border-cyan-100 bg-cyan-50/70'
                        : 'border-slate-100 bg-white'
                      : active
                        ? 'border-cyan-300/20 bg-cyan-300/10'
                        : 'border-white/10 bg-transparent'
                  }`}
                >
                  <td
                    className={`px-4 py-3 font-black ${isLight ? 'text-slate-950' : 'text-white'}`}
                  >
                    {scoreTypeLabels[row.scoreType]}
                  </td>
                  <td
                    className={
                      isLight
                        ? 'px-4 py-3 text-slate-700'
                        : 'px-4 py-3 text-slate-200'
                    }
                  >
                    {row.rawScore}
                  </td>
                  <td
                    className={
                      isLight
                        ? 'px-4 py-3 text-slate-700'
                        : 'px-4 py-3 text-slate-200'
                    }
                  >
                    {formatRank(row.rawRank)}
                  </td>
                  <td
                    className={`px-4 py-3 font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}
                  >
                    {row.placementScore}
                  </td>
                  <td
                    className={`px-4 py-3 font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}
                  >
                    {formatRank(row.placementRank)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onScoreTypeChange(row.scoreType)}
                      className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                        active
                          ? 'border-transparent bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white'
                          : isLight
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300'
                            : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/50'
                      }`}
                    >
                      {active ? 'Seçili' : 'Seç'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
