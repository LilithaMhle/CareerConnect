module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        navy: "#07041a",
        teal: { DEFAULT: "#2DD4A4", 400: "#2DD4A4" },
        purple: { DEFAULT: "#7C6FE0", 400: "#7C6FE0" },
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        dmsans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
