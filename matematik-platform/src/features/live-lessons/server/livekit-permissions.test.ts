import { TrackSource } from 'livekit-server-sdk';
import { describe, expect, it } from 'vitest';
import { buildLiveKitVideoGrant } from '@/features/live-lessons/lib/livekit-grants';

describe('LiveKit live lesson grants', () => {
  it('allows teachers to publish audio, camera, screen and data', () => {
    const grant = buildLiveKitVideoGrant('teacher', 'room1234');

    expect(grant).toMatchObject({
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      room: 'room1234',
      roomJoin: true,
    });
    expect(grant.canPublishSources).toEqual([
      TrackSource.MICROPHONE,
      TrackSource.CAMERA,
      TrackSource.SCREEN_SHARE,
      TrackSource.SCREEN_SHARE_AUDIO,
    ]);
  });

  it('starts students as subscribers with data only publish permission', () => {
    const grant = buildLiveKitVideoGrant('student', 'room1234');

    expect(grant).toMatchObject({
      canPublish: false,
      canPublishData: true,
      canSubscribe: true,
      room: 'room1234',
      roomJoin: true,
    });
    expect(grant.canPublishSources).toBeUndefined();
  });
});
