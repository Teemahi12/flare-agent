import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: { blue: "#0052FF", ink: "#0A0B0D", sub: "#5B616E", line: "#E2E6EE", bg: "#F5F7FB" },
        brand: {
          50: "#EEF4FF",
          100: "#DCE7FD",
          500: "#0052FF",
          600: "#0043D1",
          700: "#0039B0",
          violet: "#7B3FF2",
        },
        mint: "#00D4A4",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,11,13,0.04), 0 8px 24px -12px rgba(0,82,255,0.18)",
        pop: "0 12px 40px -12px rgba(0,82,255,0.35)",
        glow: "0 0 0 4px rgba(0,82,255,0.12)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "scale-in": "scale-in 0.18s ease-out both",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
