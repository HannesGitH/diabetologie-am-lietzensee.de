import { getLocale } from '#lib/paraglide/runtime.js';
import { getNotice, getPage, renderInline } from '#lib/server/content.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const locale = getLocale();
	const content = getPage('home', locale);
	return {
		content,
		focus: content.data.focus.map((item) => ({
			title: item.title,
			html: renderInline(item.text, locale)
		})),
		notice: getNotice(locale),
		meta: { title: content.data.title, description: content.data.description, home: true }
	};
};
