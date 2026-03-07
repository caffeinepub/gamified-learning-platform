import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                heading: ['Fredoka One', 'cursive'],
                body: ['Nunito', 'sans-serif'],
            },
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                },
                // RPG custom colors
                gold: {
                    DEFAULT: 'oklch(0.78 0.16 85)',
                    light: 'oklch(0.88 0.14 85)',
                    dark: 'oklch(0.62 0.16 75)',
                },
                emerald: {
                    rpg: 'oklch(0.55 0.18 155)',
                    light: 'oklch(0.68 0.18 155)',
                    dark: 'oklch(0.42 0.16 155)',
                },
                crimson: {
                    DEFAULT: 'oklch(0.58 0.22 27)',
                    light: 'oklch(0.68 0.22 27)',
                    dark: 'oklch(0.45 0.2 27)',
                },
                navy: {
                    DEFAULT: 'oklch(0.22 0.06 265)',
                    light: 'oklch(0.32 0.08 265)',
                    dark: 'oklch(0.14 0.04 265)',
                },
                'purple-rpg': 'oklch(0.45 0.2 295)',
                'sky-rpg': 'oklch(0.65 0.15 220)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: 'calc(var(--radius) + 4px)',
                '2xl': 'calc(var(--radius) + 8px)',
                '3xl': 'calc(var(--radius) + 16px)',
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                'rpg': '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                'rpg-gold': '0 4px 20px rgba(0,0,0,0.4), 0 0 20px oklch(0.78 0.16 85 / 0.3)',
                'rpg-emerald': '0 4px 20px rgba(0,0,0,0.4), 0 0 20px oklch(0.55 0.18 155 / 0.3)',
                'rpg-crimson': '0 4px 20px rgba(0,0,0,0.4), 0 0 20px oklch(0.58 0.22 27 / 0.3)',
                'btn-3d': '0 5px 0 0 rgba(0,0,0,0.4)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'float-up': {
                    '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                    '100%': { opacity: '0', transform: 'translateY(-80px) scale(1.3)' }
                },
                'bounce-in': {
                    '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
                    '60%': { transform: 'scale(1.2) rotate(5deg)', opacity: '1' },
                    '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
                },
                'shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '20%': { transform: 'translateX(-8px)' },
                    '40%': { transform: 'translateX(8px)' },
                    '60%': { transform: 'translateX(-6px)' },
                    '80%': { transform: 'translateX(6px)' }
                },
                'level-up-pulse': {
                    '0%': { transform: 'scale(0.5)', opacity: '0' },
                    '50%': { transform: 'scale(1.1)', opacity: '1' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                },
                'coin-bounce': {
                    '0%': { transform: 'scale(0) translateY(0)', opacity: '0' },
                    '50%': { transform: 'scale(1.3) translateY(-20px)', opacity: '1' },
                    '100%': { transform: 'scale(1) translateY(0)', opacity: '1' }
                },
                'boss-slide-in': {
                    '0%': { transform: 'translateY(-100%)', opacity: '0' },
                    '70%': { transform: 'translateY(10px)', opacity: '1' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 10px oklch(0.78 0.16 85 / 0.4)' },
                    '50%': { boxShadow: '0 0 25px oklch(0.78 0.16 85 / 0.8), 0 0 50px oklch(0.78 0.16 85 / 0.3)' }
                },
                'spin-slow': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'float-up': 'float-up 1.2s ease-out forwards',
                'bounce-in': 'bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'shake': 'shake 0.4s ease-in-out',
                'level-up': 'level-up-pulse 0.6s ease-out forwards',
                'coin-bounce': 'coin-bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'boss-slide': 'boss-slide-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'spin-slow': 'spin-slow 8s linear infinite',
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
