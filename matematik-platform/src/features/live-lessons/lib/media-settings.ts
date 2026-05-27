"use client";

import {
  AudioPresets,
  ScreenSharePresets,
  Track,
  VideoPresets,
  type AudioCaptureOptions,
  type RoomConnectOptions,
  type RoomOptions,
  type ScreenShareCaptureOptions,
  type TrackPublishOptions,
  type VideoCaptureOptions,
} from "livekit-client";

export const teacherAudioCaptureOptions: AudioCaptureOptions = {
  autoGainControl: true,
  channelCount: { ideal: 1 },
  echoCancellation: true,
  latency: { ideal: 0.02, max: 0.08 },
  noiseSuppression: true,
  sampleRate: { ideal: 48000 },
  voiceIsolation: true,
};

export const teacherAudioPublishOptions: TrackPublishOptions = {
  audioPreset: AudioPresets.music,
  dtx: true,
  red: true,
  source: Track.Source.Microphone,
};

export const teacherCameraCaptureOptions: VideoCaptureOptions = {
  frameRate: { ideal: 30, max: 30 },
  resolution: VideoPresets.h720.resolution,
};

export const teacherScreenShareOptions: ScreenShareCaptureOptions = {
  audio: false,
  contentHint: "detail",
  resolution: ScreenSharePresets.h1080fps30.resolution,
  selfBrowserSurface: "exclude",
  surfaceSwitching: "include",
};

export const teacherScreenSharePublishOptions: TrackPublishOptions = {
  degradationPreference: "maintain-resolution",
  screenShareEncoding: {
    ...ScreenSharePresets.h1080fps30.encoding,
    priority: "high",
  },
  screenShareSimulcastLayers: [
    ScreenSharePresets.h720fps15,
    ScreenSharePresets.h1080fps30,
  ],
  simulcast: true,
  source: Track.Source.ScreenShare,
};

export const liveLessonRoomOptions: RoomOptions = {
  adaptiveStream: true,
  audioCaptureDefaults: teacherAudioCaptureOptions,
  dynacast: true,
  publishDefaults: {
    audioPreset: AudioPresets.music,
    degradationPreference: "maintain-resolution",
    dtx: true,
    red: true,
    screenShareEncoding: teacherScreenSharePublishOptions.screenShareEncoding,
    screenShareSimulcastLayers:
      teacherScreenSharePublishOptions.screenShareSimulcastLayers,
    simulcast: true,
    stopMicTrackOnMute: false,
  },
  videoCaptureDefaults: teacherCameraCaptureOptions,
  webAudioMix: true,
};

export const liveLessonConnectOptions: RoomConnectOptions = {
  autoSubscribe: true,
  maxRetries: 3,
  peerConnectionTimeout: 15000,
  websocketTimeout: 15000,
};
