import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: "#F0EFF4",
        ink: {
          DEFAULT: "#111111",
          muted: "rgba(17, 17, 17, 0.6)",
          subtle: "rgba(17, 17, 17, 0.4)",
        },
        brand: {
          DEFAULT: "#33658A",
          foreground: "#ffffff",
          muted: "rgba(51, 101, 138, 0.12)",
        },
        accent: {
          DEFAULT: "#FF9A3D",
          foreground: "#111111",
        },
        card: "#ffffff",
        destructive: "#dc2626",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": [
          "2.25rem",
          { lineHeight: "1.15", letterSpacing: "-0.02em" },
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17, 17, 17, 0.06), 0 8px 24px rgba(17, 17, 17, 0.08)",
        header: "0 1px 0 rgba(17, 17, 17, 0.06)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
