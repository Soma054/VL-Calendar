/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter Variable"',
          '"Inter"',
          '"Noto Sans JP Variable"',
          '"Noto Sans JP"',
          '"Hiragino Sans"',
          '"Yu Gothic"',
          '"YuGothic"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
        // Title-like font stack (modern sans)
        display: [
          '"Inter Variable"',
          '"Inter"',
          '"Noto Sans JP Variable"',
          '"Noto Sans JP"',
          '"Hiragino Sans"',
          '"Yu Gothic"',
          "ui-sans-serif",
          "system-ui",
        ],
      },
    },
  },
  plugins: [],
}