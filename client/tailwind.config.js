/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: '#0769F4', skybrand: '#12BDF4', navy: '#071B4F',
                ink: '#122747', muted: '#64748B', line: '#DCECF7', soft: '#F3FAFF',
            },
            fontFamily: { sans: ['Noto Sans Thai', 'Tahoma', 'sans-serif'] },
        },
    },
    plugins: [],
}
