import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#7B6C57", dark: "#5E5142" }, 
        accent: "#94B5B4",  
        bg: "#E6ECEC",
        text: "#2F2F2F"
      },
      fontFamily: {
        heading: ['"Patrick Hand"', "cursive"],
        body: ['"Lato"', "sans-serif"]
      }
    },
  },
  plugins: [],
} satisfies Config;
