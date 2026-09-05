import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LivePollStudentOverlay } from './LivePollStudentOverlay';

// Mock livekit components
const mockRoomOn = vi.fn();
const mockRoomOff = vi.fn();
const mockPublishData = vi.fn();

vi.mock('@livekit/components-react', () => ({
  useRoomContext: () => ({
    on: mockRoomOn,
    off: mockRoomOff,
    localParticipant: {
      identity: 'student-1',
      publishData: mockPublishData,
    },
  }),
}));

describe('LivePollStudentOverlay', () => {
  it('registers data listener on mount', () => {
    render(
      <LivePollStudentOverlay
        identity="student-1"
        displayName="Ali Yılmaz"
        roomId="room-1"
      />
    );

    expect(mockRoomOn).toHaveBeenCalled();
  });
});
