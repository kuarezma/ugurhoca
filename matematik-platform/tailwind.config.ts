import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#7C3AED",
          "primary-soft": "#A78BFA",
          "primary-deep": "#5B21B6",
          secondary: "#06B6D4",
          "secondary-soft": "#67E8F9",
          accent: "#FACC15",
          "accent-soft": "#FDE68A",
          success: "#22C55E",
          danger: "#EF4444",
          warning: "#F59E0B",
          pink: "#EC4899",
          orange: "#FB923C",
          indigo: "#6366F1",
        },
        xp: {
          bronze: "#C27C3C",
          silver: "#94A3B8",
          gold: "#FBBF24",
          platinum: "#67E8F9",
          legendary: "#EC4899",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-poppins)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 6vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-lg": ["clamp(2.25rem, 5vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "700" }],
        "display-md": ["clamp(1.75rem, 4vw, 2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "700" }],
      },
      boxShadow: {
        "brand-glow": "0 0 30px rgba(124, 58, 237, 0.35)",
        "brand-glow-lg": "0 0 60px rgba(124, 58, 237, 0.45)",
        "accent-glow": "0 0 25px rgba(250, 204, 21, 0.35)",
        "soft-card": "0 6px 18px -6px rgba(15, 23, 42, 0.18)",
        "pop-card": "0 18px 36px -14px rgba(124, 58, 237, 0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #FB923C 100%)",
        "cool-gradient": "linear-gradient(135deg, #06B6D4 0%, #6366F1 50%, #7C3AED 100%)",
        "warm-gradient": "linear-gradient(135deg, #FACC15 0%, #FB923C 60%, #EC4899 100%)",
        "success-gradient": "linear-gradient(135deg, #22C55E 0%, #06B6D4 100%)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "float-y": "float-y var(--float-duration, 4s) ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "bounce-slow": "bounce 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        gradient: "gradient 8s ease infinite",
        wiggle: "wiggle 0.6s ease-in-out",
        pop: "pop 0.22s ease-out",
        shine: "shine 2.2s linear infinite",
        "bounce-soft": "bounceSoft 1.6s ease-in-out infinite",
        "gradient-flow": "gradientFlow 6s ease infinite",
        "fade-up": "fadeUp 0.45s ease-out both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(124, 58, 237, 0.85)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(-6deg)" },
          "40%": { transform: "rotate(6deg)" },
          "60%": { transform: "rotate(-4deg)" },
          "80%": { transform: "rotate(4deg)" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        shine: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        gradientFlow: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translate3d(0, 18px, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
