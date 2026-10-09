import { getPractice } from '#lib/server/content.js';
import type { LayoutServerLoad } from './$types';

// Fully static site: every page is prerendered, and no client-side JavaScript is shipped.
export const prerender = true;
export const csr = false;
export const trailingSlash = 'always';

export const load: LayoutServerLoad = () => ({
	practice: getPractice(),
	year: new Date().getFullYear()
});
