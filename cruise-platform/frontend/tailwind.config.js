module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      colors: {
        'primary': '#4F46E5',
        'secondary': '#3B82F6',
        'accent': '#FBBF24',
      },
    },
  },
  plugins: [],
}