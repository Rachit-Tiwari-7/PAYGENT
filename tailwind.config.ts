import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#F3EFE3",
          bg: "#F3EFE3",
          surface: "#FFFCF5",
          subtle: "#EAE5D7",
          border: "#E4DFD2",
        },
        porcelain: "#FFFCF5",
        forest: {
          DEFAULT: "#344B3B",
          hover: "#273A2D",
          light: "#EBF1EC",
          border: "#C1CEBF",
        },
        sapphire: {
          DEFAULT: "#28568A",
          hover: "#1F436D",
          light: "#EBF2FA",
          border: "#BCD1E7",
        },
        charcoal: {
          DEFAULT: "#292F29",
          primary: "#292F29",
          secondary: "#77796F",
          tertiary: "#9B9C94",
        },
        brass: {
          DEFAULT: "#B39A65",
          hover: "#9C8350",
          light: "#F7F3E8",
          border: "#E5DAC2",
        },
        status: {
          success: {
            bg: "#EAF3EB",
            text: "#27532F",
            border: "#CDE3D0",
          },
          warning: {
            bg: "#F7F3E8",
            text: "#8C6D23",
            border: "#E5DAC2",
          },
          error: {
            bg: "#F8ECEC",
            text: "#7A2929",
            border: "#ECCACA",
          },
          info: {
            bg: "#EBF2FA",
            text: "#28568A",
            border: "#BCD1E7",
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
        subtle: "0 1px 2px 0 rgba(41, 47, 41, 0.04)",
        card: "0 1px 3px 0 rgba(41, 47, 41, 0.05), 0 1px 2px -1px rgba(41, 47, 41, 0.04)",
        dropdown: "0 4px 12px 0 rgba(41, 47, 41, 0.08)",
        modal: "0 12px 28px -4px rgba(41, 47, 41, 0.12), 0 4px 8px -2px rgba(41, 47, 41, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
