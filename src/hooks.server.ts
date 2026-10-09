import { dev } from '$app/env';
import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		return resolve(
			{ ...event, request },
			{
				transformPageChunk: ({ html }) =>
					html
						.replace('%paraglide.lang%', locale)
						.replace('%paraglide.dir%', getTextDirection(locale))
			}
		);
	});

export const handle: Handle = handleParaglide;

/**
 * In `pnpm dev`, show content errors (German message naming file and problem) on the error
 * page instead of a generic "Internal Error". A production build fails on them anyway.
 */
export const handleError: HandleServerError = ({ kind, error }) => {
	if (
		dev &&
		kind === 'unknown' &&
		error instanceof Error &&
		error.message.startsWith('[content]')
	) {
		return { message: error.message };
	}
	// Otherwise keep SvelteKit's defaults.
};
