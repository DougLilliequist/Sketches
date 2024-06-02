import sveltePreprocess from 'svelte-preprocess';
import netlify from '@sveltejs/adapter-netlify'; 
import vitePluginString from 'vite-plugin-string';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: netlify(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: () => ({
			plugins: [vitePluginString]
		})
	},
	preprocess: sveltePreprocess()
};

export default config;
