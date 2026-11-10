'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { formatAudioDuration } from './constants';

export function VoiceNotePlayer({
  audioUrl,
  isOwn,
  isLight = true,
}: {
  audioUrl: string;
  isOwn: boolean;
  isLight?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      void audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={`my-1 flex items-center gap-2 rounded-xl p-2 min-w-[180px] max-w-[240px] ${
        isOwn
          ? 'bg-white/15 text-white'
          : isLight
            ? 'bg-slate-100 text-slate-800'
            : 'bg-slate-700/60 text-slate-100'
      }`}
    >
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Durdur' : 'Oynat'}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition shadow-sm ${
          isOwn
            ? 'bg-white text-indigo-600 hover:bg-slate-100'
            : 'bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none'
        }`}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/20 dark:bg-white/20">
          <div
            className={`h-full transition-all duration-100 ${
              isOwn ? 'bg-white' : 'bg-indigo-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] opacity-75 font-mono">
          <span>{formatAudioDuration((progress / 100) * (duration || 0))}</span>
          <span>{formatAudioDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
}
