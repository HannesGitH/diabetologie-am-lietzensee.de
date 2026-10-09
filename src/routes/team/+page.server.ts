import { getLocale } from '#lib/paraglide/runtime.js';
import { getPage, renderInline } from '#lib/server/content.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const locale = getLocale();
	const content = getPage('team', locale);
	const { doctor, staff } = content.data;
	// List texts may contain inline Markdown/HTML, e.g. <span lang="de">…</span> in translations.
	const inline = (text: string) => renderInline(text, locale);
	return {
		content,
		doctorHtml: {
			titles: doctor.titles.map(inline),
			cv: doctor.cv.map((entry) => ({ period: entry.period, html: inline(entry.text) })),
			languages: doctor.languages.map(inline),
			memberships: doctor.memberships.map(inline)
		},
		staffRoles: staff.map((person) => person.roles.map(inline)),
		meta: { title: content.data.title, description: content.data.description }
	};
};
