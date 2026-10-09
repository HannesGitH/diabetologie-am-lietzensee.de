import { m } from '#lib/paraglide/messages.js';
import type { PageServerLoad } from './$types';

// Emitted as build/404.html — the file most static hosts (Netlify, Cloudflare Pages,
// GitHub Pages, …) serve for unknown URLs. Apache: `ErrorDocument 404 /404.html`.
export const trailingSlash = 'never';

export const load: PageServerLoad = () => ({
	meta: { title: `404 – ${m.error_title()}`, description: m.error_text(), noindex: true }
});
