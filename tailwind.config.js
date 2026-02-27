/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        happyco: {
          nav: "#1a1440",
          primary: "#5B4FCF",
          "primary-light": "#EDEDFC",
          teal: "#10B981",
          "teal-bg": "#ECFDF5",
          "teal-text": "#047857",
          danger: "#EF4444",
          "danger-bg": "#FEE2E2",
          warning: "#F59E0B",
          "warning-bg": "#FEF3C7",
          "warning-text": "#92400E",
          live: "#DC2626",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
