import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#0b0b0b",
        oxide: "#c4001d",
        line: "rgba(255,255,255,0.18)",
      },
      fontFamily: {
        mono: [
          "Space Mono",
          "IBM Plex Mono",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        redglow: "0 0 46px rgba(196,0,29,0.24)",
        panel: "0 24px 80px rgba(0,0,0,0.58)",
      },
    },
  },
  plugins: [],
};

export default config;
