import type { Metadata } from "next";
import { FocusPomodoroPageContainer } from "@/features/tools/containers/FocusPomodoroPageContainer";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Odak & Pomodoro Zamanlayıcısı",
  description:
    "Matematik çalışmalarında kesintisiz odaklanma seansları, arka plan ambiyans sesleri ve mola yönetimi ile verimli ders çalışma.",
  path: "/odak-pomodoro",
});

export default function OdakPomodoroPage() {
  return <FocusPomodoroPageContainer />;
}
