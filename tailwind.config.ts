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
        cream: {
          bg: "#F5F1E5",
          surface: "#FFFEFA",
          subtle: "#EFECDF",
          border: "#E7E3D7",
        },
        charcoal: {
          DEFAULT: "#30332B",
          primary: "#30332B",
          secondary: "#73766C",
          tertiary: "#96998F",
        },
        olive: {
          DEFAULT: "#727B50",
          hover: "#616A42",
          light: "#F0F2E8",
          border: "#C8D1A8",
        },
        slate: {
          blue: "#315E83",
          "blue-hover": "#264B6A",
          "blue-light": "#EBF1F6",
          "blue-border": "#CCDCE9",
        },
        status: {
          success: {
            bg: "#EAF3EB",
            text: "#27532F",
            border: "#CDE3D0",
          },
          warning: {
            bg: "#F8F3E6",
            text: "#6E4D15",
            border: "#E7D8B9",
          },
          error: {
            bg: "#F8ECEC",
            text: "#7A2929",
            border: "#ECCACA",
          },
          info: {
            bg: "#EBF1F6",
            text: "#234968",
            border: "#CCDCE9",
          },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
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
        subtle: "0 1px 2px 0 rgba(48, 51, 43, 0.04)",
        card: "0 1px 3px 0 rgba(48, 51, 43, 0.05), 0 1px 2px -1px rgba(48, 51, 43, 0.04)",
        dropdown: "0 4px 12px 0 rgba(48, 51, 43, 0.08)",
        modal: "0 12px 28px -4px rgba(48, 51, 43, 0.12), 0 4px 8px -2px rgba(48, 51, 43, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
