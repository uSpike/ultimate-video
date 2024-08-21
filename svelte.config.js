import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        paths: {base: '/ultimate-video'},
    },
    preprocess: vitePreprocess(),
};

export default config;
