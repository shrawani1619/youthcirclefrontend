/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#4F46E5",
          secondary: "#8B5CF6",
          accent: "#EC4899",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 22px 50px -24px rgba(15, 23, 42, 0.22)",
        luxe: "0 32px 80px -30px rgba(17, 24, 39, 0.35)",
      },
    },
  },
  plugins: [],
};
