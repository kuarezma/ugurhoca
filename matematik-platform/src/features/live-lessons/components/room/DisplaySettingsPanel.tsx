"use client";

import type { LiveLessonDisplaySettings } from "@/features/live-lessons/lib/room-data";

type Props = {
  settings: LiveLessonDisplaySettings;
  onChange: (settings: LiveLessonDisplaySettings) => void;
};

export function DisplaySettingsPanel({ onChange, settings }: Props) {
  const update = <K extends keyof LiveLessonDisplaySettings>(
    key: K,
    value: LiveLessonDisplaySettings[K],
  ) => onChange({ ...settings, [key]: value });

  return (
    <section className="rounded-xl border border-border bg-card p-3">
      <h2 className="text-sm font-semibold">Görüntü düzeni</h2>
      <div className="mt-3 grid gap-2 text-xs">
        <label className="grid gap-1">
          <span className="text-foreground/70">Kamera konumu</span>
          <select
            value={settings.cameraPlacement}
            onChange={(event) =>
              update(
                "cameraPlacement",
                event.target.value as LiveLessonDisplaySettings["cameraPlacement"],
              )
            }
            className="min-h-9 rounded-lg border border-border bg-background px-2"
          >
            <option value="side">Sağ panel</option>
            <option value="overlay">Ekran üstünde</option>
            <option value="hidden">Gizle</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-foreground/70">Kamera boyutu</span>
          <select
            value={settings.cameraSize}
            onChange={(event) =>
              update("cameraSize", event.target.value as LiveLessonDisplaySettings["cameraSize"])
            }
            className="min-h-9 rounded-lg border border-border bg-background px-2"
          >
            <option value="small">Küçük</option>
            <option value="medium">Orta</option>
            <option value="large">Büyük</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-foreground/70">Ekran paylaşımı</span>
          <select
            value={settings.screenFit}
            onChange={(event) =>
              update("screenFit", event.target.value as LiveLessonDisplaySettings["screenFit"])
            }
            className="min-h-9 rounded-lg border border-border bg-background px-2"
          >
            <option value="contain">Tam sığdır</option>
            <option value="cover">Alanı doldur</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-foreground/70">Yan panel</span>
          <select
            value={settings.panelWidth}
            onChange={(event) =>
              update("panelWidth", event.target.value as LiveLessonDisplaySettings["panelWidth"])
            }
            className="min-h-9 rounded-lg border border-border bg-background px-2"
          >
            <option value="normal">Normal</option>
            <option value="wide">Geniş</option>
          </select>
        </label>
      </div>
    </section>
  );
}
