/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        paper: "#f8fafc",
        line: "#e2e8f0",
        primary: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
          light: "#e0e7ff",
        },
        secondary: {
          DEFAULT: "#ec4899",
          dark: "#db2777",
          light: "#fce7f3",
        },
        surface: "rgba(255, 255, 255, 0.7)",
        surfaceDark: "rgba(255, 255, 255, 0.9)",
        teal: {
          DEFAULT: "#0F766E",
          dark: "#0B5A54",
          light: "#CCEAE7",
        },
        amber: {
          DEFAULT: "#D97706",
          light: "#FCEBD3",
        },
        leaf: {
          DEFAULT: "#10b981",
          light: "#d1fae5",
        },
        rust: {
          DEFAULT: "#ef4444",
          light: "#fee2e2",
        },
      },
      fontFamily: {
        display: ["Outfit", "Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
