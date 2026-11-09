/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {
    colors: { cream: "#F5F1E8", ink: "#191919", muted: "#85827C", accent: "#A47C55" },
    fontFamily: { sans: ["Inter", "sans-serif"], display: ["Playfair Display", "serif"] }
  }},
  plugins: []
};