/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1F2937",
        },
        warning: {
          DEFAULT: "#FF1A1A",
          light: "#FFE1E1",
        },
        success: {
          DEFAULT: "#00922A",
          light: "#CBFFCE",
        },
        gray: {
          DEFAULT: "#696969",
          light: "#CCCCCC",
        },
      },
    },
  },
  plugins: [],
};
