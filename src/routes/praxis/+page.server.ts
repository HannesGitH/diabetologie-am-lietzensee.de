import { getLocale } from '#lib/paraglide/runtime.js';
import { getPage } from '#lib/server/content.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const content = getPage('praxis', getLocale());
	return {
		content,
		meta: { title: content.data.title, description: content.data.description }
	};
};
