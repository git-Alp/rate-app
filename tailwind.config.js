/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      colors: {
        'dark': '#262730',
        'light': '#ECECEE',
        'title': '#6E1511',
        'text': '#007549',
        'text-2': '#029664',
        'input': '#D3D3D3',
        'button': '#E62C31',
        'bg': 'rgba(0,0,0, 0.1)',
      },
      backgroundImage: {
        'cristmas-bg': "url('%sveltekit.assets%/cristmas-bg.jpg')"
      }
    }
  },

  plugins: []
};