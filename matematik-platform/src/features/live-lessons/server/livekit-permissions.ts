import 'server-only';

import {
  DataPacket_Kind,
  RoomServiceClient,
  TrackSource,
} from 'livekit-server-sdk';
import { buildLiveKitVideoGrant } from '@/features/live-lessons/lib/livekit-grants';
import { encodeRoomDataMessage, type RoomDataMessage } from '@/features/live-lessons/lib/room-data';

function getLiveKitHttpUrl() {
  const url = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!url) {
    throw new Error('LIVEKIT_URL veya NEXT_PUBLIC_LIVEKIT_URL tanımlı değil.');
  }

  if (url.startsWith('wss://')) return `https://${url.slice('wss://'.length)}`;
  if (url.startsWith('ws://')) return `http://${url.slice('ws://'.length)}`;
  return url;
}

export { buildLiveKitVideoGrant };

export function getLiveKitRoomServiceClient() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('LIVEKIT_API_KEY ve LIVEKIT_API_SECRET tanımlı olmalı.');
  }

  return new RoomServiceClient(getLiveKitHttpUrl(), apiKey, apiSecret);
}

export async function setStudentMicrophonePublishPermission({
  allowed,
  identity,
  roomName,
}: {
  allowed: boolean;
  identity: string;
  roomName: string;
}) {
  const roomService = getLiveKitRoomServiceClient();

  if (!allowed) {
    await muteParticipantMicrophoneTracks(roomName, identity, roomService);
  }

  await roomService.updateParticipant(roomName, identity, {
    permission: allowed
      ? {
          canPublish: true,
          canPublishData: true,
          canPublishSources: [TrackSource.MICROPHONE],
          canSubscribe: true,
        }
      : {
          canPublish: false,
          canPublishData: true,
          canPublishSources: [],
          canSubscribe: true,
        },
  });
}

export async function muteParticipantMicrophoneTracks(
  roomName: string,
  identity: string,
  roomService = getLiveKitRoomServiceClient(),
) {
  try {
    const participant = await roomService.getParticipant(roomName, identity);
    const microphoneTracks = participant.tracks.filter(
      (track) => track.source === TrackSource.MICROPHONE && !track.muted,
    );

    await Promise.all(
      microphoneTracks.map((track) =>
        roomService.mutePublishedTrack(roomName, identity, track.sid, true),
      ),
    );
  } catch {
    // Katılımcı o anda odada değilse DB izni yine kapatılır; yeniden girince token/permission engeller.
  }
}

export async function sendLiveLessonRoomMessage({
  destinationIdentities,
  message,
  roomName,
}: {
  destinationIdentities?: string[];
  message: RoomDataMessage;
  roomName: string;
}) {
  await getLiveKitRoomServiceClient().sendData(
    roomName,
    encodeRoomDataMessage(message),
    DataPacket_Kind.RELIABLE,
    { destinationIdentities },
  );
}
