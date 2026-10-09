import { baseLocale, locales } from '#lib/paraglide/runtime.js';
import { PAGE_SLUGS, absoluteUrl, pagePath } from '#lib/site.js';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
	const urls = PAGE_SLUGS.flatMap((slug) =>
		locales.map((locale) => {
			const alternates = locales
				.map(
					(alt) =>
						`<xhtml:link rel="alternate" hreflang="${alt}" href="${absoluteUrl(pagePath(slug), alt)}"/>`
				)
				.join('');
			const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(pagePath(slug), baseLocale)}"/>`;
			return `<url><loc>${absoluteUrl(pagePath(slug), locale)}</loc>${alternates}${xDefault}</url>`;
		})
	);
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
