import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

import { SITE_ORIGIN } from './src/lib/origin.ts';

export default defineConfig({
	plugins: [
		enhancedImages(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
				experimental: { async: true }
			},
			// Plain folder of static files (build/), deployable to any static host.
			adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
			// Root-relative asset URLs so 404.html works at any depth.
			paths: { origin: SITE_ORIGIN, relative: false },
			// Inline the (small) CSS into every page: no render-blocking requests.
			inlineStyleThreshold: Infinity,
			prerender: {
				// Crawl from every locale root; the header / footer / language switcher link to all pages.
				entries: ['*', '/en', '/ru', '/404', '/en/404', '/ru/404', '/sitemap.xml']
			}
		}),

		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true,
			// German lives at the root (/kontakt), English under /en/…, Russian under /ru/…
			strategy: ['url', 'baseLocale'],
			// Every page is emitted as folder/index.html, which works on any static host.
			trailingSlash: 'always'
		})
	],
	test: {
		expect: { requireAssertions: true },
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'node'
	}
});
