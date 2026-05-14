/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#0d9488",
        "primary-light": "#ccfbf1",
        "primary-dark": "#0f766e",
        secondary: "#f0fdfa",
        accent: "#f59e0b",
        "text-main": "#111827",
        "text-muted": "#6b7280",
        "bg-main": "#ffffff",
        "bg-alt": "#f9fafb",
        "border-color": "#e5e7eb",
      },
      boxShadow: {
        card: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      fontSize: {
        // Ensure consistent sizing
        "2xs": "0.6rem",
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
      },
    },
  },
  plugins: [],
};
