import { NextResponse } from 'next/server';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.message || 'AI yanıt üretilemedi.' },
      { status: 500 }
    );
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'AI yanıtı boş geldi.' }, { status: 500 });
  }

  return NextResponse.json({ reply: content });
}
