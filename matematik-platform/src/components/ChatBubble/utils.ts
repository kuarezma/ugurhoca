import { useEffect, useState } from 'react';
import {
  parseSupportPayload,
  type ParsedSupportPayload,
} from '@/features/messages/supportChatUtils';
import type { ConversationPreview, InboxMessage } from './types';

export function parseInboxPayload(raw: string): ParsedSupportPayload | null {
  return parseSupportPayload(raw);
}

export function buildConversations(
  messages: InboxMessage[],
): ConversationPreview[] {
  const byStudent = new Map<string, ConversationPreview>();

  for (const m of messages) {
    const sid = m.parsed?.sender_id;
    const sname = m.parsed?.sender_name || 'Öğrenci';
    if (!sid) continue;

    const existing = byStudent.get(sid);
    const unread = !m.is_read ? 1 : 0;
    const snippet = m.parsed?.text || m.title || '';

    if (!existing) {
      byStudent.set(sid, {
        studentId: sid,
        studentName: sname,
        lastSnippet: snippet,
        lastAt: m.created_at,
        unreadCount: unread,
      });
    } else {
      existing.unreadCount += unread;
      if (new Date(m.created_at) > new Date(existing.lastAt)) {
        existing.lastAt = m.created_at;
        existing.lastSnippet = snippet;
        existing.studentName = sname;
      }
    }
  }

  return Array.from(byStudent.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  );
}

export function useSafeTheme(): boolean {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const checkIsLight = () => {
      if (typeof document !== 'undefined') {
        return !document.documentElement.classList.contains('dark');
      }
      return false;
    };
    setIsLight(checkIsLight());

    const observer = new MutationObserver(() => {
      setIsLight(checkIsLight());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isLight;
}

export function playNotificationChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.25);
  } catch {
    // Ses izni yoksa sessiz kal
  }
}
