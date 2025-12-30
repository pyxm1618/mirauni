import type { Config } from 'tailwindcss'

export default <Config>{
    theme: {
        extend: {
            colors: {
                toon: {
                    50: '#fff1f2',
                    100: '#ffe4e6',
                    200: '#fecdd3',
                    300: '#fda4af',
                    400: '#fb7185',
                    500: '#f43f5e', // Primary Red/Pink
                    600: '#e11d48',
                    700: '#be123c',
                    800: '#9f1239',
                    900: '#881337',
                }
            },
            borderWidth: {
                '3': '3px',
            },
            boxShadow: {
                'hard': '4px 4px 0px 0px rgba(0,0,0,1)',
                'hard-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
                'hard-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
            }
        }
    }
}
