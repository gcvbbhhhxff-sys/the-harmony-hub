import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-primary)",
          primaryDark: "var(--color-primary-dark)",
          secondary: "var(--color-secondary)",
          background: "var(--color-background)",
          accent: "var(--color-accent)",
          success: "var(--color-success)",
          danger: "var(--color-danger)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
