import { describe, expect, it } from 'vitest';
import {
  decodeDataPayload,
  encodeRoomDataMessage,
  type RoomDataMessage,
} from './room-data';

describe('room-data protocol with whiteboard_permission and hand raising', () => {
  it('encodes and decodes whiteboard_permission message properly', () => {
    const msg: RoomDataMessage = {
      kind: 'whiteboard_permission',
      targetIdentity: 'student_123',
      allowed: true,
      fromIdentity: 'teacher_abc',
    };

    const encoded = encodeRoomDataMessage(msg);
    const decoded = decodeDataPayload(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded?.channel).toBe('room');
    if (decoded?.channel === 'room') {
      expect(decoded.message.kind).toBe('whiteboard_permission');
      if (decoded.message.kind === 'whiteboard_permission') {
        expect(decoded.message.targetIdentity).toBe('student_123');
        expect(decoded.message.allowed).toBe(true);
        expect(decoded.message.fromIdentity).toBe('teacher_abc');
      }
    }
  });

  it('encodes and decodes raise_hand and lower_hand messages', () => {
    const raiseMsg: RoomDataMessage = {
      kind: 'raise_hand',
      raised: true,
      displayName: 'Zeynep Kaya',
      fromIdentity: 'student_456',
    };

    const encoded = encodeRoomDataMessage(raiseMsg);
    const decoded = decodeDataPayload(encoded);

    expect(decoded?.channel).toBe('room');
    if (decoded?.channel === 'room') {
      expect(decoded.message.kind).toBe('raise_hand');
      if (decoded.message.kind === 'raise_hand') {
        expect(decoded.message.displayName).toBe('Zeynep Kaya');
        expect(decoded.message.raised).toBe(true);
      }
    }
  });
});
