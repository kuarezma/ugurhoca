"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calculator,
  ChevronRight,
  GraduationCap,
  School,
  Sparkles,
  Target,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const tools = [
  {
    id: "lgs",
    title: "LGS Puan ve Lise Tercih Sihirbazı",
    subtitle: "Ortaokul seviyesi için puan hesaplama ve hedef belirleme",
    href: "/programlar/lgs",
    icon: School,
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    bullets: [
      "Net tabanlı tahmini puan",
      "Lise hedef seviyesi",
      "Gerçek veritabanından okul önerileri",
    ],
  },
  {
    id: "yks",
    title: "YKS Puan ve Üniversite Tercih Sihirbazı",
    subtitle: "Lise grubu için puan hesaplama ve üniversite tercih yardımı",
    href: "/programlar/yks",
    icon: GraduationCap,
    gradient: "from-violet-500 via-fuchsia-500 to-orange-400",
    bullets: [
      "TYT / SAY / EA / SOZ puan tahmini",
      "Başarı sırası odaklı filtreleme",
      "Gerçek veritabanından program önerileri",
    ],
  },
];

export default function ProgramsHubPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <main className="programlar-page min-h-screen gradient-bg px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className={`mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
            isLight
              ? "text-slate-700 hover:text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          Ana Sayfa
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border p-6 sm:p-8 ${
            isLight ? "light-section" : "glass border-white/10"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Programlar Merkezi
              </div>
              <h1
                className={`text-2xl font-black sm:text-4xl ${isLight ? "light-text-strong" : "text-white"}`}
              >
                Hedefine Göre Akıllı Puan ve Tercih Sihirbazları
              </h1>
              <p
                className={`mt-3 text-sm sm:text-base ${isLight ? "light-text-muted" : "text-slate-300"}`}
              >
                LGS ve YKS için puanını hesapla, sonra hedef listeni oluştur.
                Sonuçlar kaydedilmez; tamamen anlık hesaplama ve rehberlik
                sunar.
              </p>
            </div>

            <div
              className={`hidden rounded-2xl border p-3 sm:block ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/10 border-white/10"}`}
            >
              <Calculator
                className={`h-8 w-8 ${isLight ? "text-indigo-600" : "text-indigo-300"}`}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {tools.map((tool) => (
              <motion.article
                key={tool.id}
                whileHover={{ y: -3 }}
                className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 ${
                  isLight ? "light-card" : "bg-slate-900/70 border-white/10"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tool.gradient}`}
                />
                <div
                  className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${tool.gradient} opacity-20 blur-3xl`}
                />

                <div className="relative">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} shadow-lg`}
                    >
                      <tool.icon className="h-6 w-6 text-white" />
                    </div>
                    <Target
                      className={`h-5 w-5 ${isLight ? "text-slate-400" : "text-slate-500"}`}
                    />
                  </div>

                  <h2
                    className={`text-lg font-black sm:text-xl ${isLight ? "text-slate-900" : "text-white"}`}
                  >
                    {tool.title}
                  </h2>
                  <p
                    className={`mt-2 text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}
                  >
                    {tool.subtitle}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {tool.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className={`flex items-center gap-2 text-sm ${isLight ? "text-slate-700" : "text-slate-200"}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${tool.gradient}`}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={tool.href}
                    className={`mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${tool.gradient} px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02]`}
                  >
                    Sihirbazı Aç
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
