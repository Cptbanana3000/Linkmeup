/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
	  extend: {
		colors: {
		  primary: '#4CAF50',  // You can change this to your brand color
		  secondary: '#45a049'
		}
	  },
	},
	plugins: [],
  }