import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#000000",
          bg: "#000000",
          surface: "#0c0c0e",
          subtle: "#18181b",
          border: "#27272a",
        },
        porcelain: "#0c0c0e",
        forest: {
          DEFAULT: "#10b981",
          hover: "#059669",
          light: "#064e3b",
          border: "#047857",
        },
        sapphire: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          light: "#172554",
          border: "#1d4ed8",
        },
        charcoal: {
          DEFAULT: "#f4f4f5",
          primary: "#ffffff",
          secondary: "#a1a1aa",
          tertiary: "#71717a",
        },
        brass: {
          DEFAULT: "#fbbf24",
          hover: "#f59e0b",
          light: "#451a03",
          border: "#92400e",
        },
        status: {
          success: {
            bg: "#052e16",
            text: "#4ade80",
            border: "#166534",
          },
          warning: {
            bg: "#451a03",
            text: "#fbbf24",
            border: "#92400e",
          },
          error: {
            bg: "#450a0a",
            text: "#f87171",
            border: "#991b1b",
          },
          info: {
            bg: "#172554",
            text: "#60a5fa",
            border: "#1e40af",
          },
        },
      },
      fontFamily: {
        sans: [
          "'Source Sans 3'",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "'Source Serif 4'",
          "Georgia",
          "Cambria",
          "'Times New Roman'",
          "serif",
        ],
        mono: [
          "'IBM Plex Mono'",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.4)",
        card: "0 2px 6px 0 rgba(0, 0, 0, 0.5)",
        dropdown: "0 8px 24px 0 rgba(0, 0, 0, 0.7)",
        modal: "0 20px 40px -4px rgba(0, 0, 0, 0.8)",
      },
    },
  },
  plugins: [],
};

export default config;
