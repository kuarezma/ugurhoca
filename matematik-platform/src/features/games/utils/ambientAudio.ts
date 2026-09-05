// Saf Web Audio API tabanlı odak ve ambiyans sesleri sentezleyicisi
// Harici mp3 veya bant genişliği gerektirmez (0 KB asset, 0 ağ isteği).

export type AmbientSoundType = 'none' | 'brown' | 'pink' | 'tone432';

export interface AmbientSoundMeta {
  id: AmbientSoundType;
  name: string;
  description: string;
  icon: string;
}

export const AMBIENT_SOUND_OPTIONS: AmbientSoundMeta[] = [
  {
    id: 'none',
    name: 'Sessiz',
    description: 'Arka plan sesi kapalı',
    icon: '🔇',
  },
  {
    id: 'brown',
    name: 'Kahverengi Gürültü',
    description: 'Derin şelale uğultusu, dikkat dağınıklığını engeller',
    icon: '🌊',
  },
  {
    id: 'pink',
    name: 'Pembe Gürültü',
    description: 'Dingin yağmur ritmi, çalışma temposunu dengeler',
    icon: '🌧️',
  },
  {
    id: 'tone432',
    name: '432 Hz Zihin Akordu',
    description: 'Yumuşak harmonik ton, alfa dalgalarını ve sükûneti destekler',
    icon: '🧘',
  },
];

export class AmbientAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private primarySource: AudioBufferSourceNode | OscillatorNode | null = null;
  private secondarySource: OscillatorNode | null = null;
  private masterGain: GainNode | null = null;
  private currentSound: AmbientSoundType = 'none';
  private volume = 0.25;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  getCurrentSound(): AmbientSoundType {
    return this.currentSound;
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && this.currentSound !== 'none') {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.1);
    }
  }

  stop(): void {
    if (this.currentSound === 'none') return;
    this.currentSound = 'none';

    if (!this.ctx || !this.masterGain) {
      this.cleanupNodes();
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.001, now + 0.2);

      setTimeout(() => {
        this.cleanupNodes();
      }, 220);
    } catch {
      this.cleanupNodes();
    }
  }

  private cleanupNodes(): void {
    if (this.primarySource) {
      try {
        this.primarySource.stop();
        this.primarySource.disconnect();
      } catch {
        // Zaten durdurulmuş olabilir
      }
      this.primarySource = null;
    }

    if (this.secondarySource) {
      try {
        this.secondarySource.stop();
        this.secondarySource.disconnect();
      } catch {
        // Zaten durdurulmuş olabilir
      }
      this.secondarySource = null;
    }

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // Yok say
      }
      this.masterGain = null;
    }
  }

  play(type: AmbientSoundType, customVolume?: number): void {
    if (type === 'none') {
      this.stop();
      return;
    }

    if (typeof customVolume === 'number') {
      this.volume = Math.max(0, Math.min(1, customVolume));
    }

    const ctx = this.getContext();
    if (!ctx) return;

    // Önceki ses kaynağını hemen temizle
    this.cleanupNodes();

    this.currentSound = type;

    // Master Gain oluştur (tıklama ve patlama önleyici yumuşak geçiş)
    const masterGain = ctx.createGain();
    const now = ctx.currentTime;
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.3);
    masterGain.connect(ctx.destination);
    this.masterGain = masterGain;

    if (type === 'brown') {
      this.generateBrownNoise(ctx, masterGain);
    } else if (type === 'pink') {
      this.generatePinkNoise(ctx, masterGain);
    } else if (type === 'tone432') {
      this.generate432HzTone(ctx, masterGain);
    }
  }

  private generateBrownNoise(ctx: AudioContext, destination: AudioNode): void {
    const duration = 5;
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = ctx.createBuffer(2, bufferSize, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.2;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);

    source.start(0);
    this.primarySource = source;
  }

  private generatePinkNoise(ctx: AudioContext, destination: AudioNode): void {
    const duration = 5;
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = ctx.createBuffer(2, bufferSize, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
        b6 = white * 0.115926;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);

    source.start(0);
    this.primarySource = source;
  }

  private generate432HzTone(ctx: AudioContext, destination: AudioNode): void {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, ctx.currentTime);

    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(216, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.25, ctx.currentTime);

    subOsc.connect(subGain);
    subGain.connect(destination);

    osc.connect(destination);

    osc.start(0);
    subOsc.start(0);

    this.primarySource = osc;
    this.secondarySource = subOsc;
  }
}

export const ambientAudio = new AmbientAudioSynthesizer();
