'use client';

import { formatIstanbulDate } from '@/lib/date-format';
import {
  lgsSubjects,
  yksSubjects,
  type LgsInputs,
  type YksInputs,
  type YksScoreType,
} from '@/lib/examCalculators';
import type { LgsResultData, LgsGapAnalysis, YksGapAnalysis } from './types';

type PrintReportSectionProps = {
  activeTab: 'lgs' | 'yks';
  selectedYksType: YksScoreType;
  selectedLgsTarget: string;
  selectedYksTarget: string;
  lgsResult: LgsResultData;
  yksResult: {
    activeRow: { placementScore: number };
    tytNet: number;
    aytNet: number;
  };
  lgsInputs: LgsInputs;
  yksInputs: YksInputs;
  lgsGapAnalysis: LgsGapAnalysis;
  yksGapAnalysis: YksGapAnalysis;
};

export function PrintReportSection({
  activeTab,
  selectedYksType,
  selectedLgsTarget,
  selectedYksTarget,
  lgsResult,
  yksResult,
  lgsInputs,
  yksInputs,
  lgsGapAnalysis,
  yksGapAnalysis,
}: PrintReportSectionProps) {
  return (
    <div className="print-only mb-6 border-b-2 border-black pb-4 text-black font-sans">
      <div className="flex justify-between items-start border-b border-gray-400 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Uğur Hoca Matematik — Deneme Sınavı Sonuç Karnesi & Stratejik Eylem
            Planı
          </h1>
          <p className="mt-1 text-xs text-gray-700">
            Sınav Türü:{' '}
            <span className="font-bold">
              {activeTab === 'lgs'
                ? 'LGS (8. Sınıf)'
                : `YKS (${selectedYksType} Puan Türü)`}
            </span>{' '}
            | Tarih: {formatIstanbulDate(new Date())} | Kişisel Teşhis ve
            Gelişim Çıktısı
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block border border-black px-2.5 py-1 text-xs font-bold rounded">
            Hedef: {activeTab === 'lgs' ? selectedLgsTarget : selectedYksTarget}
          </span>
        </div>
      </div>

      {/* Ana Metrikler Bento Grid */}
      <div className="mt-4 grid grid-cols-4 gap-2.5 text-center">
        <div className="border border-gray-400 rounded-lg p-2.5 bg-gray-50">
          <div className="text-[10px] font-bold uppercase text-gray-600">
            {activeTab === 'lgs' ? 'LGS Puanı' : 'Yerleştirme Puanı'}
          </div>
          <div className="mt-1 text-2xl font-black">
            {activeTab === 'lgs'
              ? lgsResult.score
              : yksResult.activeRow.placementScore}
          </div>
          <div className="text-[9px] text-gray-500">
            {activeTab === 'lgs' ? 'Maks: 500 Puan' : 'Maks: 560 Puan'}
          </div>
        </div>

        <div className="border border-gray-400 rounded-lg p-2.5 bg-gray-50">
          <div className="text-[10px] font-bold uppercase text-gray-600">
            Toplam Net
          </div>
          <div className="mt-1 text-2xl font-black text-indigo-700">
            {activeTab === 'lgs'
              ? lgsResult.totalNet
              : Number((yksResult.tytNet + yksResult.aytNet).toFixed(2))}
          </div>
          <div className="text-[9px] text-gray-500">
            {activeTab === 'lgs'
              ? '90 Soru Üzerinden'
              : `${yksResult.tytNet} TYT + ${yksResult.aytNet} AYT`}
          </div>
        </div>

        <div className="border border-gray-400 rounded-lg p-2.5 bg-gray-50">
          <div className="text-[10px] font-bold uppercase text-gray-600">
            Matematik Neti
          </div>
          <div className="mt-1 text-2xl font-black text-amber-700">
            {activeTab === 'lgs'
              ? Math.max(
                  0,
                  (lgsInputs.matematik?.correct || 0) -
                    (lgsInputs.matematik?.wrong || 0) / 3,
                ).toFixed(2)
              : Number(
                  (
                    Math.max(
                      0,
                      (yksInputs.tytMatematik?.correct || 0) -
                        (yksInputs.tytMatematik?.wrong || 0) / 4,
                    ) +
                    Math.max(
                      0,
                      (yksInputs.aytMatematik?.correct || 0) -
                        (yksInputs.aytMatematik?.wrong || 0) / 4,
                    )
                  ).toFixed(2),
                )}
          </div>
          <div className="text-[9px] text-gray-500">
            {activeTab === 'lgs' ? 'LGS Matematik' : 'TYT + AYT Matematik'}
          </div>
        </div>

        <div className="border border-gray-400 rounded-lg p-2.5 bg-gray-50">
          <div className="text-[10px] font-bold uppercase text-gray-600">
            Tahmini Dilim / Bant
          </div>
          <div className="mt-1 text-sm font-black text-emerald-700 truncate">
            {activeTab === 'lgs' ? lgsResult.estimatedPercentile : 'YKS Derece'}
          </div>
          <div className="text-[9px] text-gray-500 truncate">
            {activeTab === 'lgs' ? lgsResult.targetBand : selectedYksType}
          </div>
        </div>
      </div>

      {/* Ayrıntılı Ders Dağılımı Tablosu */}
      <div className="mt-4">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
          📊 Ders Bazlı Doğru, Yanlış ve Net Tablosu
        </div>
        <table className="w-full text-left text-xs border border-gray-400 border-collapse">
          <thead>
            <tr className="bg-gray-200 border-b border-gray-400 text-[11px] font-bold text-gray-800">
              <th className="p-1.5 border-r border-gray-300">Ders Adı</th>
              <th className="p-1.5 text-center border-r border-gray-300">
                Soru Sayısı
              </th>
              <th className="p-1.5 text-center border-r border-gray-300">
                Doğru
              </th>
              <th className="p-1.5 text-center border-r border-gray-300">
                Yanlış
              </th>
              <th className="p-1.5 text-center border-r border-gray-300">
                Boş
              </th>
              <th className="p-1.5 text-center border-r border-gray-300 font-bold">
                Net
              </th>
              <th className="p-1.5 text-center">Başarı %</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'lgs' ? (
              <>
                {lgsSubjects.map((sub) => {
                  const inp = lgsInputs[sub.key] || {
                    correct: 0,
                    wrong: 0,
                  };
                  const empty = Math.max(
                    0,
                    sub.questions - (inp.correct + inp.wrong),
                  );
                  const net = Math.max(0, inp.correct - inp.wrong / 3);
                  const rate = Math.round((net / sub.questions) * 100);
                  return (
                    <tr key={sub.key} className="border-b border-gray-300">
                      <td className="p-1.5 font-medium border-r border-gray-300">
                        {sub.label}
                      </td>
                      <td className="p-1.5 text-center border-r border-gray-300">
                        {sub.questions}
                      </td>
                      <td className="p-1.5 text-center border-r border-gray-300 text-emerald-800 font-semibold">
                        {inp.correct}
                      </td>
                      <td className="p-1.5 text-center border-r border-gray-300 text-rose-800 font-semibold">
                        {inp.wrong}
                      </td>
                      <td className="p-1.5 text-center border-r border-gray-300 text-gray-600">
                        {empty}
                      </td>
                      <td className="p-1.5 text-center border-r border-gray-300 font-bold">
                        {net.toFixed(2)}
                      </td>
                      <td className="p-1.5 text-center font-medium">%{rate}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
                  <td className="p-1.5 border-r border-gray-300">
                    LGS TOPLAMI
                  </td>
                  <td className="p-1.5 text-center border-r border-gray-300">
                    90
                  </td>
                  <td className="p-1.5 text-center border-r border-gray-300">
                    {lgsResult.totalCorrect}
                  </td>
                  <td className="p-1.5 text-center border-r border-gray-300">
                    {lgsResult.totalWrong}
                  </td>
                  <td className="p-1.5 text-center border-r border-gray-300">
                    {90 - (lgsResult.totalCorrect + lgsResult.totalWrong)}
                  </td>
                  <td className="p-1.5 text-center border-r border-gray-300 text-indigo-900">
                    {lgsResult.totalNet.toFixed(2)}
                  </td>
                  <td className="p-1.5 text-center">
                    %{Math.round((lgsResult.totalNet / 90) * 100)}
                  </td>
                </tr>
              </>
            ) : (
              <>
                {yksSubjects.map((sub) => {
                  const inp = yksInputs[sub.key] || {
                    correct: 0,
                    wrong: 0,
                  };
                  const empty = Math.max(
                    0,
                    sub.questions - (inp.correct + inp.wrong),
                  );
                  const net = Math.max(0, inp.correct - inp.wrong / 4);
                  const rate = Math.round((net / sub.questions) * 100);
                  return (
                    <tr key={sub.key} className="border-b border-gray-300">
                      <td className="p-1.5 font-medium border-r border-gray-300">
                        {sub.label}
                      </td>
                      <td className="p-1.5 text-center border-r border-gray-300">
                        {sub.questions}
                      </td>
                      <td className="p-1.5 text-center border-r border-gray-300 text-emerald-800 font-semibold">
                        {inp.correct}
                      </td>
                      <td className="p-1.5 text-center border-r border-gray-300 text-rose-800 font-semibold">
                        {inp.wrong}
                      </td>
                      <td className="p-1.5 text-center border-r border-gray-300 text-gray-600">
                        {empty}
                      </td>
                      <td className="p-1.5 text-center border-r border-gray-300 font-bold">
                        {net.toFixed(2)}
                      </td>
                      <td className="p-1.5 text-center font-medium">%{rate}</td>
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Hedef Açığı ve Stratejik Eylem Reçetesi */}
      <div className="mt-3.5 border border-indigo-300 rounded-lg p-2.5 bg-indigo-50/50">
        <div className="font-bold text-xs text-indigo-950 flex items-center justify-between">
          <span>🎯 Hedef Analizi & Stratejik Eylem Reçetesi</span>
          <span className="text-[11px] font-medium text-gray-700">
            Hedef: {activeTab === 'lgs' ? selectedLgsTarget : selectedYksTarget}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-800 leading-relaxed">
          {activeTab === 'lgs'
            ? lgsGapAnalysis.isReached
              ? `Mevcut netlerin (${lgsResult.score.toFixed(2)} puan) ${selectedLgsTarget} taban puanının üzerinde. Harika bir tempoyla devam ediyorsun!`
              : `Hedeflenen ${selectedLgsTarget} taban puanına ulaşmak için: Matematikten yaklaşık +${lgsGapAnalysis.mathNeeded} net veya Fen Bilimlerinden yaklaşık +${lgsGapAnalysis.fenNeeded} net artırmak yeterlidir.`
            : yksGapAnalysis.isReached
              ? `Mevcut yerleştirme puanın (${yksResult.activeRow.placementScore.toFixed(1)}) ${selectedYksTarget} taban puanının üzerinde. Başarılı bir gidişat!`
              : `Hedeflenen ${selectedYksTarget} taban puanı için AYT Matematikten yaklaşık +${yksGapAnalysis.aytMathNeeded} net artırmak hedefe taşır.`}
        </p>
      </div>

      {/* Öğrenci Öz Değerlendirme & Haftalık Eylem Planı Çizgili Alanları */}
      <div className="mt-3.5 grid grid-cols-2 gap-3 text-xs">
        <div className="border border-gray-400 rounded-lg p-2.5">
          <div className="font-bold text-[11px] text-gray-900 mb-1">
            📌 Bu Denemede Hata Yaptığım veya Zorlandığım Konular:
          </div>
          <div className="border-b border-dashed border-gray-400 h-5 mt-2"></div>
          <div className="border-b border-dashed border-gray-400 h-5 mt-2"></div>
          <div className="border-b border-dashed border-gray-400 h-5 mt-2"></div>
        </div>

        <div className="border border-gray-400 rounded-lg p-2.5">
          <div className="font-bold text-[11px] text-gray-900 mb-1">
            🎯 Gelecek Hafta Çözeceğim Telafi Soruları ve Odak Planım:
          </div>
          <div className="text-gray-600 mt-1.5 space-y-1">
            <div>
              [ ] 1.
              ..............................................................
              (Hedef: ... Soru)
            </div>
            <div>
              [ ] 2.
              ..............................................................
              (Hedef: ... Soru)
            </div>
            <div>
              [ ] 3.
              ..............................................................
              (Hedef: ... Soru)
            </div>
          </div>
        </div>
      </div>

      {/* İmzalar */}
      <div className="mt-4 flex justify-between items-center text-[10px] text-gray-700 border-t border-gray-300 pt-2">
        <div>Öğrenci İmzası: ____________________</div>
        <div>Tarih: {formatIstanbulDate(new Date())}</div>
        <div>Öğretmen / Takip İmzası: ____________________</div>
      </div>
    </div>
  );
}
