import { formatIstanbulDate } from '@/lib/date-format';
import {
  type SavedMistakeQuestion,
  MISTAKE_REASON_LABELS,
} from '@/features/quizzes/lib/mistakeStorage';
import type { ReasonBreakdown } from './types';

type MistakePrintSectionProps = {
  filteredList: SavedMistakeQuestion[];
  reasonBreakdown: ReasonBreakdown | null;
};

export function MistakePrintSection({
  filteredList,
  reasonBreakdown,
}: MistakePrintSectionProps) {
  return (
    <div className="print-only mb-6 border-b-2 border-black pb-4 text-black">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">
            Uğur Hoca Matematik — Kişisel Hata Defteri & Odak Telafi Föyü
          </h1>
          <p className="mt-1 text-xs text-gray-700">
            Tarih: {formatIstanbulDate(new Date())} | Toplam{' '}
            {filteredList.length} Soru | Kişisel Teşhis & Telafi Çalışması
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold border border-black px-2.5 py-1 rounded-md">
            LGS & YKS Matematik
          </span>
        </div>
      </div>

      {/* Kök Neden Dağılımı Özeti */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs border border-gray-400 rounded-lg p-2.5 bg-gray-50">
        <div className="border-r border-gray-300">
          <span className="block font-bold text-red-700">🔴 İşlem Hatası</span>
          <span className="text-sm font-extrabold">
            {reasonBreakdown?.careless || 0} Soru
          </span>
        </div>
        <div className="border-r border-gray-300">
          <span className="block font-bold text-amber-700">
            🟡 Kural Eksikliği
          </span>
          <span className="text-sm font-extrabold">
            {reasonBreakdown?.concept || 0} Soru
          </span>
        </div>
        <div className="border-r border-gray-300">
          <span className="block font-bold text-blue-700">🔵 Yanlış Okuma</span>
          <span className="text-sm font-extrabold">
            {reasonBreakdown?.reading || 0} Soru
          </span>
        </div>
        <div>
          <span className="block font-bold text-purple-700">
            🟣 Süre Baskısı
          </span>
          <span className="text-sm font-extrabold">
            {reasonBreakdown?.time || 0} Soru
          </span>
        </div>
      </div>

      {/* Soru Listesi ve Çözüm/Düzeltme Alanları */}
      <div className="mt-4 space-y-4">
        {filteredList.map((item, idx) => (
          <div
            key={item.id || idx}
            className="border border-gray-400 rounded-xl p-3.5 break-inside-avoid text-xs"
          >
            <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-1.5">
              <span className="font-bold text-sm">
                Soru #{idx + 1} {item.quizTitle ? `• ${item.quizTitle}` : ''}
              </span>
              <span className="font-semibold px-2 py-0.5 border border-gray-400 rounded text-[11px]">
                {item.reason
                  ? MISTAKE_REASON_LABELS[item.reason].label
                  : 'Teşhis Bekleniyor'}
              </span>
            </div>
            <div className="my-2.5 leading-relaxed text-black font-medium text-sm">
              {item.question.question}
            </div>
            {item.question.options && item.question.options.length > 0 && (
              <div className="grid grid-cols-2 gap-2 my-2 text-gray-800">
                {item.question.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className="border border-gray-300 rounded px-2.5 py-1 text-xs"
                  >
                    <strong className="mr-1">
                      {String.fromCharCode(65 + optIdx)})
                    </strong>{' '}
                    {opt}
                  </div>
                ))}
              </div>
            )}
            {/* Öğrenci Çözüm ve Analiz Kutusu */}
            <div className="mt-3 border-2 border-dashed border-gray-400 rounded-lg p-3 min-h-[95px] bg-white">
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase mb-1">
                <span>✍️ Nerede Yanıldım? & Doğru Çözüm Adımlarım</span>
                <span className="border border-gray-400 px-2 py-0.5 rounded text-gray-700">
                  [ ] Doğru Çözdüm & Kavradım
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
