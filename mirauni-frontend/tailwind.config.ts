import type { Config } from 'tailwindcss'

export default {
    content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue',
        './error.vue'
    ],
    theme: {
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
        },
        extend: {
            fontFamily: {
                sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
                display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
            },
            colors: {
                indie: {
                    bg: '#f8f5f2',
                    card: '#FFFFFF',
                    primary: '#FEF08A',
                    secondary: '#7dd3fc',
                    accent: '#f472b6',
                    text: '#222222',
                    border: '#000000',
                }
            },
            boxShadow: {
                'brutal': '4px 4px 0px 0px #000000',
                'brutal-lg': '8px 8px 0px 0px #000000',
                'brutal-hover': '2px 2px 0px 0px #000000',
                'brutal-active': '0px 0px 0px 0px #000000',
            },
            borderWidth: {
                DEFAULT: '2px',
                '3': '3px',
            },
            spacing: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
            }
        },
    },
    plugins: [],
} satisfies Config
