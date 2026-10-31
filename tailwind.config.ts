import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1320px" },
    },
    extend: {
      colors: {
        background: v("bg"),
        surface: { DEFAULT: v("surface"), hover: v("surface-2"), raised: v("surface-2"), sunken: v("surface-0") },
        border: { DEFAULT: v("line"), strong: v("line-strong") },
        foreground: { DEFAULT: v("fg"), muted: v("fg-muted"), dim: v("fg-dim") },
        accent: { DEFAULT: v("accent"), hover: v("accent-hover"), deep: v("accent-deep"), muted: "rgb(var(--accent) / 0.12)", glow: "rgb(var(--accent) / 0.2)", fg: v("accent-fg") },
        paper: { DEFAULT: v("paper"), ink: v("ink"), muted: v("ink-muted"), line: v("paper-line") },
        success: v("success"),
        warning: v("warning"),
        danger: v("danger"),
        info: v("info"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: { xl: "16px", lg: "12px", md: "8px", sm: "6px" },
      boxShadow: {
        soft: "0 1px 0 0 rgb(255 255 255 / 0.03) inset, 0 1px 2px rgb(0 0 0 / 0.3)",
        lift: "0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 12px 32px -12px rgb(0 0 0 / 0.55)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.97)" }, to: { opacity: "1", transform: "scale(1)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(.22,1,.36,1)",
        "scale-in": "scale-in 0.2s ease-out",
        shimmer: "shimmer 1.6s infinite",
        marquee: "marquee 40s linear infinite",
        "slide-up": "slide-up 0.6s cubic-bezier(.22,1,.36,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
