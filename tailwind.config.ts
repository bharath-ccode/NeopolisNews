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
        brand: {
          50:  "#f0f7ff",
          100: "#e0effe",
          200: "#baddfd",
          300: "#7ec2fc",
          400: "#3aa0f8",
          500: "#1082e9",
          600: "#0464c7",
          700: "#054fa1",
          800: "#094485",
          900: "#0d3a6e",
          950: "#09243f",
        },
        accent: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea6c10",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
