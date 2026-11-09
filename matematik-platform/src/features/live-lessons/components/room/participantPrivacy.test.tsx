import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { StudentEngagementBar } from './StudentEngagementBar';
import { LivePollStudentOverlay } from './LivePollStudentOverlay';
import { TeacherModerationPanel } from './TeacherModerationPanel';
import { QuizPanel } from '../quiz/QuizPanel';
import { encodeQuizMessage } from '@/features/live-lessons/lib/quiz-messages';
import { encodeRoomDataMessage } from '@/features/live-lessons/lib/room-data';

const { room, participant, listeners } = vi.hoisted(() => {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  const participant = {
    identity: 'student-a',
    name: 'Öğrenci',
    publishData: vi.fn().mockResolvedValue(undefined),
    setMicrophoneEnabled: vi.fn(),
  };
  const room = {
    localParticipant: participant,
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
    }),
    off: vi.fn((event: string, handler: (...args: unknown[]) => void) =>
      listeners.get(event)?.delete(handler),
    ),
  };
  return { room, participant, listeners };
});
vi.mock('@livekit/components-react', () => ({
  useRoomContext: () => room,
  useConnectionState: () => ConnectionState.Connected,
  useLocalParticipant: () => ({
    localParticipant: participant,
    isMicrophoneEnabled: false,
  }),
  useRemoteParticipants: () => [{ identity: 'student-b', name: 'Öğrenci' }],
}));
const question = encodeQuizMessage({
  kind: 'question',
  questionId: 'q1',
  prompt: 'Gizlilik test sorusu',
  options: ['Birinci seçenek', 'İkinci seçenek'],
  correctIndex: 0,
  fromIdentity: 'teacher-1',
});
function receive(payload: Uint8Array, identity = 'teacher-1') {
  act(() => {
    listeners
      .get(RoomEvent.DataReceived)
      ?.forEach((handler) => handler(payload, { identity }));
  });
}
const packets = () =>
  participant.publishData.mock.calls.map(([payload]) =>
    JSON.parse(new TextDecoder().decode(payload)),
  );
beforeEach(() => {
  vi.clearAllMocks();
  listeners.clear();
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ approved: false }) }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Canlı ders istemcisi ad gizliliği', () => {
  it('katılma, el kaldırma ve mikrofon isteğinde gerçek ad yayınlamaz', async () => {
    render(
      <StudentEngagementBar
        identity="student-a"
        displayName="Ada Gerçek"
        lessonId="lesson"
        requireStudentApproval
        onLessonUnlocked={vi.fn()}
      />,
    );
    await waitFor(() =>
      expect(packets()).toContainEqual(
        expect.objectContaining({
          kind: 'join_request',
          displayName: 'Öğrenci',
        }),
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'El kaldır' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mikrofon izni iste' }));
    await waitFor(() => expect(packets()).toHaveLength(3));
    expect(packets().map((p) => p.kind)).toEqual([
      'join_request',
      'raise_hand',
      'microphone_request',
    ]);
    for (const packet of packets()) expect(packet.displayName).toBe('Öğrenci');
    expect(JSON.stringify(packets())).not.toContain('Ada Gerçek');
  });
  it.each(['panel', 'overlay'])(
    '%s soru cevabında gerçek ad yayınlamaz',
    async (variant) => {
      const studentRole = { role: 'student' as const };
      render(
        variant === 'panel' ? (
          <QuizPanel
            roomId="room1"
            {...studentRole}
            identity="student-a"
            displayName="Ada Gerçek"
            persistToken={null}
          />
        ) : (
          <LivePollStudentOverlay
            roomId="room1"
            identity="student-a"
            displayName="Ada Gerçek"
          />
        ),
      );
      receive(question);
      fireEvent.click(screen.getByRole('button', { name: /Birinci seçenek/ }));
      await waitFor(() =>
        expect(packets()).toContainEqual(
          expect.objectContaining({ kind: 'answer', displayName: 'Öğrenci' }),
        ),
      );
      expect(JSON.stringify(packets())).not.toContain('Ada Gerçek');
    },
  );
  it('öğretmen cevap listesi sonradan gelen yetkili ad haritasını kullanır', () => {
    const props = {
      roomId: 'room1',
      role: 'teacher' as const,
      identity: 'teacher-1',
      displayName: 'Öğretmen',
      persistToken: null,
    };
    const { rerender } = render(<QuizPanel {...props} />);
    receive(question);
    receive(
      encodeQuizMessage({
        kind: 'answer',
        questionId: 'q1',
        choiceIndex: 0,
        fromIdentity: 'student-b',
        displayName: 'Öğrenci',
      }),
      'student-b',
    );
    rerender(
      <QuizPanel
        {...props}
        participantNames={{ 'student-b': 'Bora Gerçek' }}
      />,
    );
    expect(screen.getByText('Bora Gerçek: şık 1')).toBeInTheDocument();
  });
  it('öğretmen katılımcı ve onay listelerinde gerçek adları görür', () => {
    render(
      <TeacherModerationPanel
        lessonId="lesson"
        teacherIdentity="teacher-1"
        requireStudentApproval
        participantNames={{ 'student-b': 'Bora Gerçek' }}
      />,
    );
    receive(
      encodeRoomDataMessage({
        kind: 'join_request',
        fromIdentity: 'student-b',
        displayName: 'Öğrenci',
      }),
      'student-b',
    );
    expect(screen.getAllByText('Bora Gerçek')).toHaveLength(2);
  });
});
