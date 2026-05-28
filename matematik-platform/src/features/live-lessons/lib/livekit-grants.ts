import { TrackSource, type VideoGrant } from 'livekit-server-sdk';
import type { LiveLessonRole } from '@/features/live-lessons/types';

export function buildLiveKitVideoGrant(
  role: LiveLessonRole,
  roomName: string,
  options: { studentCanPublishMicrophone?: boolean } = {},
): VideoGrant {
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

  if (options.studentCanPublishMicrophone) {
    return {
      canPublish: true,
      canPublishData: true,
      canPublishSources: [TrackSource.MICROPHONE],
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
