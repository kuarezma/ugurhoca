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
  it('registers data listener on mount and unregisters on unmount', () => {
    const { unmount } = render(
      <LivePollStudentOverlay
        identity="student-1"
        displayName="Ali Yılmaz"
        roomId="room-1"
      />
    );

    expect(mockRoomOn).toHaveBeenCalled();
    unmount();
    expect(mockRoomOff).toHaveBeenCalled();
  });

  it('renders correctly with isTeacher=true', () => {
    const { container } = render(
      <LivePollStudentOverlay
        identity="teacher-1"
        displayName="Uğur Hoca"
        roomId="room-1"
        isTeacher={true}
      />
    );

    // Başlangıçta aktif soru olmadığında null döner
    expect(container.firstChild).toBeNull();
  });
});
