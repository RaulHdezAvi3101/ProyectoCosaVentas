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
        surface: "#f8f7f4",
        ink: "#1a1a18",
        muted: "#5f5e5a",
        subtle: "#9c9a92",
        accent: "#7F77DD",
        "accent-light": "#EEEDFE",
        "accent-dark": "#3C3489",
        teal: "#1D9E75",
        "teal-light": "#E1F5EE",
        "teal-dark": "#085041",
        coral: "#D85A30",
        "coral-light": "#FAECE7",
        "coral-dark": "#4A1B0C",
        amber: "#BA7517",
        "amber-light": "#FAEEDA",
        "amber-dark": "#412402",
      },
      animation: {
        pulseLive: "pulseLive 2s ease-in-out infinite",
        shake: "shake 0.5s ease-in-out",
      },
      keyframes: {
        pulseLive: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
