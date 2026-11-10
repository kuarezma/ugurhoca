import { formatIstanbulDateTime } from '@/lib/date-format';

export const QUICK_FEEDBACK_TEMPLATES = [
  'Harika çözüm! 👏',
  'İşlem hatasına dikkat et ⚠️',
  'Ortak çarpan parantezine almayı dene 📐',
  'Soru kökündeki kısıtı tekrar oku 🔍',
  'Tebrikler, tam doğru! ⭐',
  'Yanlış defterindeki çözümlü videoyu izle 🎬',
  'Ödevini inceledim, eline sağlık! 📚',
];

export const STUDENT_QUICK_TEMPLATES = [
  '❓ Çözüm adımlarını anlayamadım',
  '📐 Hangi konuya çalışmalıyım?',
  '⏰ Canlı ders ne zaman?',
  '📝 Ödev kontrolü rica edebilir miyim?',
  '💡 Bir sonraki deneme ne zaman?',
];

export const MATH_QUICK_SYMBOLS = [
  { label: '√x', snippet: '$\\sqrt{x}$' },
  { label: 'x²', snippet: '$x^2$' },
  { label: 'a/b', snippet: '$\\frac{a}{b}$' },
  { label: 'π', snippet: '$\\pi$' },
  { label: '±', snippet: '$\\pm$' },
  { label: '≤', snippet: '$\\le$' },
  { label: '≥', snippet: '$\\ge$' },
  { label: '≠', snippet: '$\\neq$' },
  { label: '·', snippet: '$\\cdot$' },
  { label: '°', snippet: '$^\\circ$' },
  { label: 'Δ', snippet: '$\\Delta$' },
];

export const formatTime = (value: string) =>
  formatIstanbulDateTime(value, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  });

export function formatAudioDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
