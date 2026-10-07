'use client';

import { useState } from 'react';
import { GRADE_TOPIC_OPTIONS } from '@/features/progress/constants';
import { SafeLink } from '@/components/SafeLink';
import { getCurriculumContentHref } from '../curriculum-coverage';
import { useCurriculumCoverage } from '../hooks/useCurriculumCoverage';

export function CurriculumCoverageReport({
  defaultGrade = 'all',
}: {
  defaultGrade?: string;
}) {
  const [grade, setGrade] = useState(defaultGrade);
  const [filter, setFilter] = useState<'all' | 'incomplete' | 'complete'>(
    'all',
  );
  const { rows, loading, error, retry } = useCurriculumCoverage();
  const gradeRows = rows.filter(
    (row) => grade === 'all' || String(row.grade) === grade,
  );
  const filteredRows = gradeRows.filter(
    (row) =>
      filter === 'all' ||
      (filter === 'complete' ? !row.missing.length : row.missing.length > 0),
  );
  const covered = gradeRows.reduce(
    (sum, row) => sum + Number(row.worksheets > 0) + Number(row.notes > 0),
    0,
  );
  const percent = gradeRows.length
    ? Math.round((covered / (gradeRows.length * 2)) * 100)
    : 0;

  return (
    <div className="space-y-4 text-primary">
      <p className="text-sm text-secondary">
        Sınıf ve içerik türü eşleşir; konu adı başlık, açıklama veya yaprak test
        kazanımında tam sözcüklerle aranır. Farklı adla ya da yalnız kodla
        kaydedilmiş içerikler eşleşmeyebilir.
      </p>
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 text-sm">
          Sınıf
          <select
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            className="rounded-xl border border-default bg-surface-1 p-2 text-primary"
          >
            <option value="all">Tüm sınıflar</option>
            {Object.keys(GRADE_TOPIC_OPTIONS).map((key) => (
              <option key={key} value={key}>
                {key}. Sınıf
              </option>
            ))}
          </select>
        </label>
        {(['all', 'incomplete', 'complete'] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className="rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm hover:bg-surface-3"
          >
            {value === 'all'
              ? 'Tümü'
              : value === 'incomplete'
                ? 'Eksikli Konular'
                : 'Tam Hazır'}
          </button>
        ))}
        <button
          type="button"
          onClick={retry}
          className="rounded-xl border border-default px-3 py-2 text-sm"
        >
          Yenile
        </button>
      </div>
      {loading ? (
        <p role="status">İçerik kapsamı yükleniyor...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <>
          <p className="text-sm font-bold">
            Genel Kapsam Oranı: %{percent} · {gradeRows.length} konu
          </p>
          <div className="overflow-x-auto rounded-2xl border border-default">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2">
                <tr>
                  <th className="p-3">Müfredat Kazanım / Konu Başlığı</th>
                  <th className="p-3">Yaprak Test</th>
                  <th className="p-3">Ders Notu</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    key={`${row.grade}:${row.topic}`}
                    className="border-t border-default"
                  >
                    <th scope="row" className="p-3 font-medium">
                      {row.grade}. Sınıf · {row.topic}
                    </th>
                    <td className="p-3">
                      <SafeLink
                        href={getCurriculumContentHref(
                          row.grade,
                          row.topic,
                          'yaprak-test',
                        )}
                        className="hover:underline"
                      >
                        {row.worksheets ? `${row.worksheets} içerik` : 'Eksik'}
                      </SafeLink>
                    </td>
                    <td className="p-3">
                      <SafeLink
                        href={getCurriculumContentHref(
                          row.grade,
                          row.topic,
                          'ders-notlari',
                        )}
                        className="hover:underline"
                      >
                        {row.notes ? `${row.notes} içerik` : 'Eksik'}
                      </SafeLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filteredRows.length && (
            <p className="text-sm text-secondary">
              Bu filtrede konu bulunamadı.
            </p>
          )}
          <div className="space-y-2">
            <h3 className="font-bold">Eksik İçerikler</h3>
            {filteredRows
              .flatMap((row) => row.missing)
              .map((message) => (
                <p key={message} className="text-sm text-secondary">
                  {message}
                </p>
              ))}
            {!filteredRows.some((row) => row.missing.length) && (
              <p className="text-sm text-secondary">
                Bu filtrede eksik içerik yok.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
