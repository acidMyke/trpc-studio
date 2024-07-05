/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["selector", '[theme="dark"]'],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  plugins: [require("tailwindcss-animated"), require("tailwindcss-animate"), require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          'primary': '#2474f5',
          'primary-content': '#ffffff',
          'secondary': '#1e293b',
          'secondary-content': '#ffffff',
          'accent': '#2474f5',
          'accent-content': '#ffffff',
          'neutral': '#1e293b',
          'neutral-content': '#ffffff',
          'base-100': '#0d1117',
          'base-content': '#ffffff',
          'info': '#2094f3',
          'success': '#009485',
          'warning': '#ff9900',
          'error': '#ff5724',
        },
        light: {
          'primary': '#3b82f6',
          'primary-content': '#ffffff',
          'secondary': '#d1d9e0',
          'secondary-content': '#1e293b',
          'accent': '#3b82f6',
          'accent-content': '#ffffff',
          'neutral': '#d1d9e0',
          'neutral-content': '#1e293b',
          'base-100': '#ffffff',
          'base-content': '#1e293b',
          'info': '#2094f3',
          'success': '#009485',
          'warning': '#ff9900',
          'error': '#ff5724',
        }
      }
    ]
  }
}