/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50:  "#fdf8ef",
          100: "#f8edd9",
          200: "#f0d9b0",
          300: "#e6c07b",
          400: "#d9a043",
          500: "#c8882a",
        },
        stone: {
          950: "#0d0b09",
          900: "#16130e",
          850: "#1e1912",
          800: "#2a231a",
          700: "#3d3226",
          600: "#544537",
        },
        crimson: {
          400: "#e05252",
          500: "#c93333",
          600: "#a82424",
        },
        ember: {
          400: "#f5a623",
          500: "#e8920e",
          600: "#c77a08",
        },
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "serif"],
        body:    ["var(--font-crimson)", "serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "stone-texture": "url('/textures/stone.png')",
        "parchment-texture": "url('/textures/parchment.png')",
      },
      boxShadow: {
        "glow-amber": "0 0 20px rgba(200, 136, 42, 0.35), 0 0 60px rgba(200, 136, 42, 0.1)",
        "glow-crimson": "0 0 20px rgba(201, 51, 51, 0.35), 0 0 60px rgba(201, 51, 51, 0.1)",
        "inset-card": "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)",
      },
      animation: {
        "flicker": "flicker 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.6s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
          "75%": { opacity: "0.95" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
