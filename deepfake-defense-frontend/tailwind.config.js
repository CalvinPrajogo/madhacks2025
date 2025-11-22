/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        danger: "#ef4444",
        safe: "#10b981",
        warning: "#f59e0b",
      },
    },
  },
  plugins: [],
};
