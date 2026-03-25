import { NextResponse } from 'next/server';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const extractReplyText = (data: any): string => {
  const c1 = data?.choices?.[0]?.message?.content;
  if (typeof c1 === 'string' && c1.trim()) return c1.trim();

  if (Array.isArray(c1)) {
    const joined = c1
      .map((part: any) => {
        if (typeof part === 'string') return part;
        if (typeof part?.text === 'string') return part.text;
        if (typeof part?.content === 'string') return part.content;
        return '';
      })
      .join('')
      .trim();
    if (joined) return joined;
  }

  const c2 = data?.message?.content;
  if (typeof c2 === 'string' && c2.trim()) return c2.trim();

  const c3 = data?.output?.[0]?.content?.[0]?.text;
  if (typeof c3 === 'string' && c3.trim()) return c3.trim();

  const c4 = data?.response?.output_text;
  if (typeof c4 === 'string' && c4.trim()) return c4.trim();

  return '';
};

const extractFromRawText = (raw: string): string => {
  const text = raw.trim();
  if (!text) return '';

  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      return extractReplyText(parsed);
    } catch {
      return '';
    }
  }

  if (text.includes('data:')) {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('data:'));

    for (let i = lines.length - 1; i >= 0; i -= 1) {
      const payload = lines[i].replace(/^data:\s*/, '');
      if (!payload || payload === '[DONE]') continue;
      try {
        const parsed = JSON.parse(payload);
        const content = extractReplyText(parsed);
        if (content) return content;
      } catch {
        continue;
      }
    }
  }

  if (text.length > 0) {
    return text;
  }

  return '';
};

const SYSTEM_PROMPT = `Sen Uğur Hoca Matematik platformunun Türkçe eğitim asistanısın.

Hedeflerin:
- Öğrencinin sorusunu anlaşılır ve kısa adımlarla anlatmak
- Gerektiğinde örnek soru ve mini alıştırma vermek
- Ders çalışma planı, odaklanma, erteleme ve sınav kaygısı konusunda uygulanabilir öneriler sunmak

Kurallar:
- Türkçe konuş, samimi ama öğretici ol
- Çok uzun paragraflardan kaçın, maddeli ve net anlat
- Öğrencinin seviyesine (ortaokul-lise) uygun açıklama yap
- Tıbbi/psikolojik kriz durumunda profesyonel destek önermeyi unutma
- Küfür, hakaret, zararlı yönlendirmeye destek verme
`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENCODE_API_KEY || '';
  const model = process.env.OPENCODE_MODEL || 'big-pickle';
  const apiUrl = process.env.OPENCODE_API_URL || 'https://api.opencode.ai/v1/chat/completions';

  const body = await request.json().catch(() => null);
  const rawMessages = Array.isArray(body?.messages) ? body.messages : [];

  const safeMessages: ChatMessage[] = rawMessages
    .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
    .slice(-20)
    .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

  if (safeMessages.length === 0) {
    return NextResponse.json({ error: 'Mesaj bulunamadı.' }, { status: 400 });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 700,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...safeMessages,
      ],
    }),
  });

  const raw = await response.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data?.error?.message ||
          `AI yanıt üretilemedi. HTTP ${response.status}. ${raw?.slice(0, 180) || ''}`,
      },
      { status: 500 }
    );
  }

  const content = extractReplyText(data) || extractFromRawText(raw);
  if (!content) {
    const debugShape = data && typeof data === 'object' ? Object.keys(data).slice(0, 8) : [];
    return NextResponse.json(
      {
        error: `AI yanıtı boş geldi. Dönen alanlar: ${debugShape.join(', ') || 'yok'}. Ham yanıt: ${raw?.slice(0, 180) || 'boş'}`,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ reply: content });
}
