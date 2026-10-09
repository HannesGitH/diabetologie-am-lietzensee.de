import {
	baseLocale,
	getLocale,
	locales,
	localizeHref,
	type Locale
} from '#lib/paraglide/runtime.js';
import { m } from '#lib/paraglide/messages.js';
import { SITE_ORIGIN } from './origin.js';
import type { Phone, Practice } from './types.js';

export { SITE_ORIGIN };

/** Native names for the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
	de: 'Deutsch',
	en: 'English',
	ru: 'Русский'
};

export const PAGE_SLUGS = [
	'home',
	'leistungen',
	'team',
	'praxis',
	'kontakt',
	'impressum',
	'datenschutz'
] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

/** Locale-independent path of a page (German slugs, trailing slash). */
export function pagePath(slug: PageSlug): string {
	return slug === 'home' ? '/' : `/${slug}/`;
}

/** Path of a page in the given (or current) locale, e.g. `/en/kontakt/`. */
export function localizedPath(slug: PageSlug, locale?: Locale): string {
	return localizeHref(pagePath(slug), locale ? { locale } : undefined);
}

/** Absolute URL of a de-localized path in a locale. */
export function absoluteUrl(path: string, locale: Locale): string {
	return SITE_ORIGIN + localizeHref(path, { locale });
}

/**
 * Phone number as shown to visitors: German national format on German pages
 * ("030 3218153"), international format elsewhere ("+49 30 3218153").
 */
export function phoneText(phone: Phone, locale: Locale = getLocale()): string {
	return locale === baseLocale ? phone.display : phone.international;
}

/** "14057 Berlin" (or "14057 Berlin-Charlottenburg" with `withDistrict`). */
export function cityLine(address: Practice['address'], withDistrict = false): string {
	const city =
		withDistrict && address.district ? `${address.city}-${address.district}` : address.city;
	return `${address.postalCode} ${city}`;
}

export const NAV_ITEMS: { slug: PageSlug; label: () => string }[] = [
	{ slug: 'home', label: m.nav_home },
	{ slug: 'leistungen', label: m.nav_services },
	{ slug: 'team', label: m.nav_team },
	{ slug: 'praxis', label: m.nav_practice },
	{ slug: 'kontakt', label: m.nav_contact }
];

export const LEGAL_ITEMS: { slug: PageSlug; label: () => string }[] = [
	{ slug: 'impressum', label: m.nav_imprint },
	{ slug: 'datenschutz', label: m.nav_privacy }
];

export { baseLocale, locales };
