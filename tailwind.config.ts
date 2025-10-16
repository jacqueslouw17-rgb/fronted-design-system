import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "16px",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      spacing: {
        // 2pt spacing system (even numbers only for grid alignment)
        '0': '0px',
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '18': '72px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '44': '176px',
        '48': '192px',
        '52': '208px',
        '56': '224px',
        '60': '240px',
        '64': '256px',
        '72': '288px',
        '80': '320px',
        '96': '384px',
      },
      fontSize: {
        // Tight, elegant type scale
        'xs': ['11px', { lineHeight: '1.375', letterSpacing: '0' }],
        'sm': ['13px', { lineHeight: '1.5', letterSpacing: '0' }],
        'base': ['15px', { lineHeight: '1.5', letterSpacing: '0' }],
        'lg': ['17px', { lineHeight: '1.5', letterSpacing: '0' }],
        'xl': ['20px', { lineHeight: '1.375', letterSpacing: '-0.02em' }],
        '2xl': ['24px', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        '3xl': ['30px', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        '4xl': ['36px', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Soft Accent System - Stripe-inspired
        "accent-blue": {
          outline: "hsl(var(--accent-blue-outline))",
          fill: "hsl(var(--accent-blue-fill))",
          text: "hsl(var(--accent-blue-text))",
        },
        "accent-purple": {
          outline: "hsl(var(--accent-purple-outline))",
          fill: "hsl(var(--accent-purple-fill))",
          text: "hsl(var(--accent-purple-text))",
        },
        "accent-green": {
          outline: "hsl(var(--accent-green-outline))",
          fill: "hsl(var(--accent-green-fill))",
          text: "hsl(var(--accent-green-text))",
        },
        "accent-yellow": {
          outline: "hsl(var(--accent-yellow-outline))",
          fill: "hsl(var(--accent-yellow-fill))",
          text: "hsl(var(--accent-yellow-text))",
        },
      },
      borderRadius: {
        // Subtle, 4pt-aligned radius
        'none': '0',
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "kurt-pulse": {
          "0%, 100%": {
            opacity: "0.5",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05)",
          },
        },
        "kurt-pulse-active": {
          "0%, 100%": {
            opacity: "0.4",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.08)",
          },
        },
        "kurt-breathe": {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.03)",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in-left": {
          from: {
            transform: "translateX(-100%)",
          },
          to: {
            transform: "translateX(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "kurt-pulse": "kurt-pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "kurt-pulse-active": "kurt-pulse-active 3s ease-in-out infinite",
        "kurt-breathe": "kurt-breathe 4s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-secondary": "var(--gradient-secondary)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-progress": "var(--gradient-progress)",
        "gradient-kurt": "var(--gradient-kurt)",
      },
      boxShadow: {
        "glow-primary": "var(--glow-primary)",
        "glow-secondary": "var(--glow-secondary)",
        "glow-accent": "var(--glow-accent)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
