/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#3B82F6",
          "secondary": "#10B981",
          "accent": "#F59E0B",
          "neutral": "#1F2937",
          "base-100": "#FFFFFF",
          "info": "#3B82F6",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
        },
        dark: {
          "primary": "#3B82F6",
          "secondary": "#10B981",
          "accent": "#F59E0B",
          "neutral": "#F9FAFB",
          "base-100": "#1F2937",
          "info": "#3B82F6",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
        }
      }
    ],
  },
}
