/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" }
        }
      },
      animation: {
        fadeUp: "fadeUp 420ms ease-out both",
        shimmer: "shimmer 5s ease-in-out infinite"
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,0.08)"
      }
    },
  },
  plugins: [],
};

