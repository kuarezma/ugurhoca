'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Copy,
  Check,
  Radio,
  Clock,
  Users,
  Volume2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import type { LiveLesson, LiveLessonRole } from '@/features/live-lessons/types';

type Props = {
  connecting: boolean;
  displayName: string;
  error: string | null;
  initialCameraOn: boolean;
  initialMicOn: boolean;
  lesson: LiveLesson;
  onCameraToggle: () => void;
  onJoin: () => void;
  onMicToggle: () => void;
  role: LiveLessonRole;
};

export function RoomLobbyPreview({
  connecting,
  displayName,
  error,
  initialCameraOn,
  initialMicOn,
  lesson,
  onCameraToggle,
  onJoin,
  onMicToggle,
  role,
}: Props) {
  const [micLevel, setMicLevel] = useState(0);
  const [micTesting, setMicTesting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Mikrofon Testi
  const startMicTest = useCallback(async () => {
    try {
      setMicTesting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((average / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(checkAudio);
      };

      checkAudio();
    } catch {
      setMicTesting(false);
    }
  }, []);

  const stopMicTest = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setMicLevel(0);
    setMicTesting(false);
  }, []);

  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, [stopMicTest]);

  const copyStudentLink = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/canli-ders/d/${lesson.room_id}`;
    void navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const isTeacher = role === 'teacher';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="w-full max-w-xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
        {/* Üst Başlık */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/canli-ders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ders Listesine Dön</span>
          </Link>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isTeacher ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {isTeacher ? 'Öğretmen Girişi' : 'Öğrenci Girişi'}
          </span>
        </div>

        {/* Ders Bilgi Kartı */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-400">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Canlı Ders Lobisi</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
            {lesson.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{lesson.duration_minutes} dakika</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>Oda: <strong className="font-mono text-slate-200">{lesson.room_id}</strong></span>
            </span>
          </div>

          <p className="text-sm text-slate-300">
            Katılımcı: <strong className="text-white">{displayName}</strong>
          </p>
        </div>

        {/* Cihaz ve Önizleme Kontrolleri */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Cihaz ve Katılım Ayarları
          </h3>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onMicToggle}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                initialMicOn
                  ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {initialMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              <span>{initialMicOn ? 'Mikrofon Açık' : 'Mikrofon Kapalı'}</span>
            </button>

            {isTeacher && (
              <button
                type="button"
                onClick={onCameraToggle}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  initialCameraOn
                    ? 'border-violet-500/40 bg-violet-500/20 text-violet-300'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {initialCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                <span>{initialCameraOn ? 'Kamera Açık' : 'Kamera Kapalı'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={micTesting ? stopMicTest : startMicTest}
              className="flex items-center gap-1.5 text-xs text-brand-primary-light hover:underline ml-auto"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>{micTesting ? 'Mikrofon Testini Durdur' : 'Mikrofonunu Test Et'}</span>
            </button>
          </div>

          {/* Ses Seviyesi Göstergesi */}
          {micTesting && (
            <div className="space-y-1 rounded-xl bg-slate-900 p-3 border border-white/10 animate-in fade-in">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Konuşun ve çubuğu gözlemleyin:</span>
                <span>%{micLevel}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-75"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Öğretmen İçin Hızlı Link Paylaşımı */}
        {isTeacher && (
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
              <span>Öğrenci Katılım Bağlantısı:</span>
              <button
                type="button"
                onClick={copyStudentLink}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-indigo-500/20"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Linki Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <p className="truncate font-mono text-xs text-slate-400">
              {typeof window !== 'undefined' ? `${window.location.origin}/canli-ders/d/${lesson.room_id}` : ''}
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Ana Katıl Butonu */}
        <button
          type="button"
          onClick={onJoin}
          disabled={connecting}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary py-3.5 text-base font-bold text-white shadow-lg shadow-brand-primary/30 transition-all duration-200 hover:bg-brand-primary-deep active:scale-98 disabled:opacity-50"
        >
          {connecting ? (
            <span>Odaya Bağlanılıyor...</span>
          ) : (
            <>
              <Video className="h-5 w-5" />
              <span>Derse Katıl ve Başla</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
