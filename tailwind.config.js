import { heroui } from '@heroui/react';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--mainColor)',
                    light: 'var(--mainColorLight)',
                },
            },
        },
    },
    darkMode: 'class',
    plugins: [heroui(), require('tailwind-scrollbar')],
};
