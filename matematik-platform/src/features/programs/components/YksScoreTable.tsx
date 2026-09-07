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
  isLight: _isLight,
  onScoreTypeChange,
  rows,
}: YksScoreTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-default bg-surface-1 shadow-sm">
      <div className="border-b border-default px-4 py-3">
        <h2 className="text-base font-black text-primary">
          Puan ve Sıralama Sonuçları
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm tabular-nums">
          <thead className="bg-surface-2 text-secondary">
            <tr>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">
                Puan Türü
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">
                Ham Puan
              </th>
              <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-[0.14em]">
                Ham Sıralama
              </th>
              <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-[0.14em]">
                Yer. Puanı
              </th>
              <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-[0.14em]">
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
                  className={`border-t border-default transition ${
                    active ? 'bg-accent/10' : 'bg-transparent'
                  }`}
                >
                  <td className="px-4 py-3 font-black text-primary">
                    {scoreTypeLabels[row.scoreType]}
                  </td>
                  <td className="px-4 py-3 text-right text-secondary">
                    {row.rawScore.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-secondary">
                    {formatRank(row.rawRank)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary">
                    {row.placementScore.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary">
                    {formatRank(row.placementRank)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onScoreTypeChange(row.scoreType)}
                      className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                        active
                          ? 'border-purple-300 dark:border-purple-300 bg-gradient-to-r from-purple-700 to-fuchsia-700 text-white shadow-sm'
                          : 'border-default dark:border-slate-500 bg-surface-1 text-secondary hover:border-accent hover:text-primary'
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
