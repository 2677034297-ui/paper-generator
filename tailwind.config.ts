import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主文字
        ink: {
          DEFAULT: "#1E1E1E",
          secondary: "#666666",
          muted: "#999999",
        },
        // 金色点缀
        gold: {
          DEFAULT: "#C9A86A",
          light: "#DFCBA0",
          dark: "#A88A4E",
        },
        // 表面
        surface: {
          DEFAULT: "#FFFFFF",
          warm: "#F8F6F2",
          border: "rgba(0,0,0,0.06)",
        },
        // 评分状态
        score: {
          green: "#16A34A",
          red: "#DC2626",
          amber: "#D97706",
        },
      },
      fontFamily: {
        heading: [
          "Crimson Pro",
          "Noto Serif SC",
          "Source Han Serif SC",
          "Georgia",
          "serif",
        ],
        body: [
          "Atkinson Hyperlegible",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        hero: ["3.5rem", { lineHeight: "1.08", fontWeight: "600", letterSpacing: "-0.02em" }],
        "hero-mobile": ["2.25rem", { lineHeight: "1.15", fontWeight: "600", letterSpacing: "-0.01em" }],
        heading: ["1.5rem", { lineHeight: "1.3", fontWeight: "500" }],
        "heading-sm": ["1.125rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
