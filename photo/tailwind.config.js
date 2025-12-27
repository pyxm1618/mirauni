/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Space Grotesk"', 'sans-serif'],
                display: ['"Space Grotesk"', 'sans-serif'],
            },
            colors: {
                indie: {
                    bg: '#f8f5f2', // Off white
                    card: '#FFFFFF',
                    primary: '#FEF08A', // Lemon Yellow
                    secondary: '#7dd3fc', // Sky Blue
                    accent: '#f472b6', // Pink
                    text: '#222222', // Almost black
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
            }
        },
    },
    plugins: [],
}
