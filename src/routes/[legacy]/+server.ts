import { error } from '@sveltejs/kit';
import { SITE_ORIGIN } from '#lib/site.js';
import { LEGACY_PAGES } from '#lib/legacy.js';
import type { EntryGenerator, RequestHandler } from './$types';

/**
 * Keeps old bookmarks and search results working: /kontakt.html → /kontakt/
 * Emitted as small static HTML files with a meta refresh + canonical (works on every static
 * host). scripts/postbuild.js additionally writes real 301 redirects for Apache (.htaccess)
 * and Netlify/Cloudflare Pages (_redirects), which take precedence where supported.
 */
export const prerender = true;

export const entries: EntryGenerator = () =>
	Object.keys(LEGACY_PAGES).map((legacy) => ({ legacy }));

export const GET: RequestHandler = ({ params }) => {
	if (!Object.hasOwn(LEGACY_PAGES, params.legacy)) error(404, 'Not found');
	const target = LEGACY_PAGES[params.legacy];
	const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="canonical" href="${SITE_ORIGIN}${target}">
<title>Weiterleitung – Diabetologie am Lietzensee</title>
</head>
<body><p>Diese Seite ist umgezogen: <a href="${target}">${SITE_ORIGIN}${target}</a></p></body>
</html>
`;
	return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
