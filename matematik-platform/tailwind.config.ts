import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        float: "float 3s ease-in-out infinite",
        "float-y": "float-y var(--float-duration, 4s) ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "bounce-slow": "bounce 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        gradient: "gradient 8s ease infinite",
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
          "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.8)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
