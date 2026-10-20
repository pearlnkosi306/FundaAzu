/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        savanna: "#0B6B3A",   // deep green
        sun: "#F5B700",       // gold
        clay: "#D2452B",      // terracotta
        night: "#16132B",     // midnight
        cream: "#FFF8E7",
      },
      fontFamily: {
        display: ["'Baloo 2'", "system-ui", "sans-serif"],
        body: ["'Nunito'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
