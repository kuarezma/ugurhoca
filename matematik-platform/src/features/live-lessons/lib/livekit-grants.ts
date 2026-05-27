import { TrackSource, type VideoGrant } from 'livekit-server-sdk';
import type { LiveLessonRole } from '@/features/live-lessons/types';

export function buildLiveKitVideoGrant(role: LiveLessonRole, roomName: string): VideoGrant {
  if (role === 'teacher') {
    return {
      canPublish: true,
      canPublishData: true,
      canPublishSources: [
        TrackSource.MICROPHONE,
        TrackSource.CAMERA,
        TrackSource.SCREEN_SHARE,
        TrackSource.SCREEN_SHARE_AUDIO,
      ],
      canSubscribe: true,
      room: roomName,
      roomJoin: true,
    };
  }

  return {
    canPublish: false,
    canPublishData: true,
    canSubscribe: true,
    room: roomName,
    roomJoin: true,
  };
}
