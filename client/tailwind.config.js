/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        wave: {
          red: "#e5092f",
          deep: "#050505",
          panel: "#111113",
          soft: "#1b1b1f"
        }
      },
      boxShadow: {
        glow: "0 0 45px rgba(229,9,47,.25)"
      }
    }
  },
  plugins: []
};
