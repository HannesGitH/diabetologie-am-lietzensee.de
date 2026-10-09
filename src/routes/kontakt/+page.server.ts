import { getLocale } from '#lib/paraglide/runtime.js';
import { getNotice, getPage, renderInline } from '#lib/server/content.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const locale = getLocale();
	const content = getPage('kontakt', locale);
	return {
		content,
		// The doctor's titles are maintained once, in team.md.
		doctorTitles: getPage('team', locale).data.doctor.titles.map((t) => renderInline(t, locale)),
		notice: getNotice(locale),
		meta: { title: content.data.title, description: content.data.description }
	};
};
