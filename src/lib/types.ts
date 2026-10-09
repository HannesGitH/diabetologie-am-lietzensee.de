import type { Locale } from '#lib/paraglide/runtime.js';

export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export interface TimeRange {
	from: string;
	to: string;
}

export interface DayHours {
	day: Weekday;
	times: TimeRange[];
	note?: 'by_appointment';
}

export interface Phone {
	/** National format as written in practice.yml, e.g. "030 3218153". */
	display: string;
	/** International format derived from `display`, e.g. "+49 30 3218153". */
	international: string;
	/** For the tel: link, e.g. "+49303218153". */
	tel: string;
}

export interface Practice {
	name: string;
	doctor: string;
	address: {
		street: string;
		postalCode: string;
		city: string;
		district?: string;
		country: string;
	};
	geo: { lat: number; lng: number };
	phones: Phone[];
	fax?: Phone;
	emails: { address: string; purpose: 'general' | 'prescriptions' }[];
	bookingUrl: string;
	/** Opening hours in weekday order (days without hours are omitted). */
	hours: DayHours[];
	certifications: { image: string; name: Record<Locale, string> }[];
	copyright: string;
	photoCredit?: string;
	/** Images on the home page (file names in src/lib/assets/images/). */
	images: { hero: string; impressions: string[] };
}

export interface Notice {
	tone: 'info' | 'warning';
	title?: string;
	html: string;
	translated: boolean;
}

/* ── Page frontmatter ─────────────────────────────────────────────────────── */

interface BaseFrontmatter {
	title: string;
	description: string;
	/** `false` while a translation is still a German placeholder. */
	translated?: boolean;
}

export interface HomeFrontmatter extends BaseFrontmatter {
	heading: string;
	lead: string;
	focusHeading: string;
	focus: { title: string; text: string }[];
	servicesTeaser: { heading: string; text: string };
	teamTeaser: { heading: string; text: string };
	quote: { text: string; author: string };
	signoff: string;
}

export interface ServicesFrontmatter extends BaseFrontmatter {
	groups: { title: string; items: string[] }[];
}

export interface TeamFrontmatter extends BaseFrontmatter {
	doctorHeading: string;
	doctor: {
		name: string;
		photo?: string;
		titles: string[];
		cv: { period: string; text: string }[];
		languages: string[];
		memberships: string[];
	};
	staffHeading: string;
	staff: { name: string; photo?: string; roles: string[] }[];
}

export interface PracticeFrontmatter extends BaseFrontmatter {
	gallery: { image: string; caption: string; alt: string }[];
}

export interface ContactFrontmatter extends BaseFrontmatter {
	appointmentHeading: string;
	appointmentText: string;
	directionsHeading: string;
	mapAlt: string;
}

export type LegalFrontmatter = BaseFrontmatter;

export interface FrontmatterBySlug {
	home: HomeFrontmatter;
	leistungen: ServicesFrontmatter;
	team: TeamFrontmatter;
	praxis: PracticeFrontmatter;
	kontakt: ContactFrontmatter;
	impressum: LegalFrontmatter;
	datenschutz: LegalFrontmatter;
}

export interface PageContent<F> {
	/** Locale the visitor requested. */
	locale: Locale;
	/** Language the text is actually written in (German if not yet translated). */
	contentLang: Locale;
	translated: boolean;
	data: F;
	/** Rendered Markdown body (trusted, repo-controlled HTML). */
	html: string;
}

export interface PageMeta {
	title: string;
	description: string;
}
