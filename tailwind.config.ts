import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0A0A0A",
        charcoal: "#141414",
        graphite: "#1F1F1F",
        stone: "#8A8A8E",
        ash: "#D4D4D8",
        ivory: "#F7F7F5",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-syne)", "var(--font-inter)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        editorial: "0.22em",
        wideplus: "0.14em",
      },
    },
  },
  plugins: [],
};
export default config;
