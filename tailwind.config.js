/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          50: "#f7f5f1",
          100: "#ece7da",
          200: "#d9d2bf",
          300: "#b8ae93",
          400: "#8a8268",
          500: "#5c5641",
          600: "#3d3829",
          700: "#2a2620",
          800: "#1f1c18",
          900: "#131210",
        },
        paper: {
          DEFAULT: "#f5efe1",
          warm: "#efe6d2",
          deep: "#e6dabe",
        },
        cinnabar: {
          DEFAULT: "#c0392b",
          dark: "#9b2c20",
          soft: "#d9695b",
        },
        aloes: {
          DEFAULT: "#b08d57",
          deep: "#8a6d3f",
          soft: "#c9a86f",
        },
        jade: {
          DEFAULT: "#5a7d6a",
          deep: "#3e5a4a",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        kai: ['"Ma Shan Zheng"', '"STKaiti"', '"KaiTi"', "serif"],
        display: ['"ZCOOL XiaoWei"', '"Noto Serif SC"', "serif"],
        copybook: ['"STKaiti"', '"KaiTi"', '"楷体"', '"Noto Serif SC"', "serif"],
      },
      boxShadow: {
        paper:
          "0 1px 2px rgba(31,28,24,0.04), 0 8px 24px -8px rgba(31,28,24,0.18), 0 32px 64px -24px rgba(31,28,24,0.22)",
        seal: "0 2px 6px rgba(192,57,43,0.35)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 20% 30%, rgba(176,141,87,0.06) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(192,57,43,0.04) 0%, transparent 35%), radial-gradient(circle at 50% 90%, rgba(90,125,106,0.05) 0%, transparent 40%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out",
        "scale-in": "scale-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
