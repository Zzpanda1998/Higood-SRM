/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#2563EB",
        page: "#F5F7FA",
      },
    },
  },
  plugins: [],
}
