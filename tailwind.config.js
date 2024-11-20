/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
	  extend: {
		colors: {
		  primary: '#4F46E5',  // You can adjust this to match your brand
		  secondary: '#4338CA',
		  warm: {
			50: '#FDF8F4',
			100: '#F9E8D9',
			// ... add more shades if needed
		  }
		}
	  },
	},
	plugins: [],
  }