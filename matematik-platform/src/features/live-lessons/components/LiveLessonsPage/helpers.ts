export const GRADE_FILTERS = [
  { label: 'Tümü', value: 'all_filter' },
  { label: '5. Sınıf', value: '5' },
  { label: '6. Sınıf', value: '6' },
  { label: '7. Sınıf', value: '7' },
  { label: '8. Sınıf', value: '8' },
  { label: 'YKS / Mezun', value: 'Mezun' },
  { label: 'Herkese Açık', value: 'all' },
];

export const GRADE_PLAN_OPTIONS = [
  { label: '5. Sınıf', value: '5' },
  { label: '6. Sınıf', value: '6' },
  { label: '7. Sınıf', value: '7' },
  { label: '8. Sınıf', value: '8' },
  { label: 'YKS / Mezun', value: 'Mezun' },
  { label: 'Herkese Açık', value: 'all' },
  { label: 'Seçili Öğrenciler', value: 'selected' },
];

export function toLocalInputValue(date: Date) {
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}
