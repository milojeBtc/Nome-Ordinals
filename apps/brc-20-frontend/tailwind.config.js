/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
    "../../packages/shared-ui/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    fontFamily: {
      "menoe-grotesque": [
        "Menoe Grotesque",
        "Helvetica",
        "Arial",
        "sans-serif",
      ],
    },
    extend: {
      colors: {
        pink: "#ff00f0",
        green: "#06ff00",
      },
    },
  },
  plugins: [],
};
