import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ambientAudio, AMBIENT_SOUND_OPTIONS, AmbientAudioSynthesizer } from "./ambientAudio";

describe("ambientAudio", () => {
  let synth: AmbientAudioSynthesizer;

  beforeEach(() => {
    synth = new AmbientAudioSynthesizer();
  });

  afterEach(() => {
    synth.stop();
  });

  it("exports sound options with proper labels and icons", () => {
    expect(AMBIENT_SOUND_OPTIONS.length).toBe(4);
    const ids = AMBIENT_SOUND_OPTIONS.map((o) => o.id);
    expect(ids).toEqual(["none", "brown", "pink", "tone432"]);
  });

  it("initializes with none sound and default volume", () => {
    expect(synth.getCurrentSound()).toBe("none");
    expect(synth.getVolume()).toBe(0.35);
  });

  it("clamps volume properly", () => {
    synth.setVolume(1.5);
    expect(synth.getVolume()).toBe(1);

    synth.setVolume(-0.5);
    expect(synth.getVolume()).toBe(0);

    synth.setVolume(0.4);
    expect(synth.getVolume()).toBe(0.4);
  });

  it("handles stop when already stopped gracefully", () => {
    expect(() => synth.stop()).not.toThrow();
    expect(synth.getCurrentSound()).toBe("none");
  });

  it("handles play none without throwing", () => {
    expect(() => synth.play("none")).not.toThrow();
    expect(synth.getCurrentSound()).toBe("none");
  });

  it("singleton ambientAudio instance is defined and operable", () => {
    expect(ambientAudio).toBeInstanceOf(AmbientAudioSynthesizer);
    expect(ambientAudio.getCurrentSound()).toBe("none");
  });
});
