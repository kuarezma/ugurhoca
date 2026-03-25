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

const buildLocalCoachReply = (prompt: string) => {
  const p = prompt.toLowerCase();

  if (p.includes('odak') || p.includes('dikkat')) {
    return `Odaklanma için kısa bir plan yapalım:\n\n1) 25 dakika tek konu + 5 dakika mola (Pomodoro)\n2) Telefonu farklı odada tut\n3) Her oturumdan önce tek hedef yaz: "Bu 25 dakikada şu 10 soruyu çözeceğim"\n4) Oturum bitince 2 dakikada mini tekrar yap\n\nİstersen buna göre bugün için saat saat çalışma planı da çıkarabilirim.`;
  }

  if (p.includes('kaygı') || p.includes('stres') || p.includes('heyecan')) {
    return `Sınav kaygısı için hızlı uygulanabilir yöntem:\n\n- 4-4 nefes: 4 sn nefes al, 4 sn ver (2 dakika)\n- İlk 3 dakika kolay sorularla başla\n- Takıldığın soruyu işaretleyip geç\n- Kendine cümle: "Tüm soruları değil, sıradaki soruyu çözeceğim"\n\nİstersen sana sınavdan önceki gece ve sınav sabahı için 10 maddelik hazır rutin de vereyim.`;
  }

  if (p.includes('plan') || p.includes('program')) {
    return `Örnek 45 dakikalık matematik oturumu:\n\n- 0-5 dk: konu özeti\n- 5-25 dk: orta seviye 10 soru\n- 25-35 dk: zor 4 soru\n- 35-42 dk: yanlış analizi\n- 42-45 dk: kısa tekrar notu\n\nBunu haftalık plana çevirmemi istersen sınıfını ve hedefini yaz.`;
  }

  return `Harika soru. Bunu birlikte adım adım çözelim:\n\n- Önce konunun kısa özetini çıkaralım\n- Sonra 3 örnek soru çözelim\n- En sonda mini tekrar planı yapalım\n\nİstersen bana konuyu yaz (ör. "çarpanlara ayırma"), seviyene göre anlatayım.`;
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

  let response: Response;
  try {
    response = await fetch(apiUrl, {
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
  } catch {
    const lastUserMessage = [...safeMessages].reverse().find((m) => m.role === 'user')?.content || '';
    return NextResponse.json({ reply: buildLocalCoachReply(lastUserMessage), source: 'local-fallback' });
  }

  const raw = await response.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const lastUserMessage = [...safeMessages].reverse().find((m) => m.role === 'user')?.content || '';
    if (response.status === 404 || response.status === 401 || response.status === 403) {
      return NextResponse.json({ reply: buildLocalCoachReply(lastUserMessage), source: 'local-fallback' });
    }

    return NextResponse.json({
      reply: buildLocalCoachReply(lastUserMessage),
      source: 'local-fallback',
      warning: data?.error?.message || `AI servis hatası (HTTP ${response.status})`,
    });
  }

  const content = extractReplyText(data) || extractFromRawText(raw);
  if (!content) {
    const lastUserMessage = [...safeMessages].reverse().find((m) => m.role === 'user')?.content || '';
    return NextResponse.json({ reply: buildLocalCoachReply(lastUserMessage), source: 'local-fallback' });
  }

  return NextResponse.json({ reply: content });
}
