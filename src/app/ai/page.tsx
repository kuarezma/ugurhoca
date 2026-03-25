'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Bot, User, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Msg = {
  role: 'user' | 'assistant';
  content: string;
};

const starterPrompts = [
  'Bu hafta için 45 dakikalık günlük matematik planı yapar mısın?',
  'Sınav kaygım var, sınavdan önce ne yapmalıyım?',
  'Ders çalışırken odaklanamıyorum, pratik öneri ver.',
  'Çarpanlar ve katlar konusunu kısa ve örnekli anlat.',
];

export default function AIPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'Merhaba! Ben senin matematik çalışma asistanınım. Konu anlatımı, çalışma planı, odaklanma ve sınav kaygısı için yardımcı olabilirim. Nereden başlayalım?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/giris');
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setUser(profile || { id: session.user.id, name: session.user.user_metadata?.name || 'Öğrenci' });
    };

    checkSession();
  }, [router]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const nextMessages: Msg[] = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Yanıt alınamadı.');

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Şu an yanıt veremedim: ${err?.message || 'Bilinmeyen hata'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pb-8">
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-5">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            Ana Sayfa
          </Link>
          <div className="text-xs sm:text-sm text-slate-400">AI Öğrenci Asistanı</div>
        </div>

        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Yapay Zeka Çalışma Koçu</h1>
              <p className="text-slate-400 text-sm">Soru sor, plan oluştur, odaklanma ve kaygı desteği al.</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 h-[52vh] overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <motion.div
                key={`${m.role}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed text-sm sm:text-base ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-slate-800/70 border border-white/10 text-slate-100'
                  }`}
                >
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-9 h-9 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && <p className="text-slate-400 text-sm">AI düşünüyor...</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-4 sm:p-6 border-t border-white/10"
          >
            <div className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Sorunu yaz... (örn: 1 haftalık matematik planı yap)"
                className="flex-1 bg-slate-800/70 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                Gönder
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
