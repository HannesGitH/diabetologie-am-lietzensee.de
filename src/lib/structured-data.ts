import { SITE_ORIGIN } from './origin.js';
import type { Practice, Weekday } from './types.js';

const SCHEMA_DAYS: Record<Weekday, string> = {
	mon: 'https://schema.org/Monday',
	tue: 'https://schema.org/Tuesday',
	wed: 'https://schema.org/Wednesday',
	thu: 'https://schema.org/Thursday',
	fri: 'https://schema.org/Friday',
	sat: 'https://schema.org/Saturday',
	sun: 'https://schema.org/Sunday'
};

/** Languages spoken in the practice (and offered on the website). */
const AVAILABLE_LANGUAGES = ['de', 'en', 'ru'];

/** "Dr. med. Regina Nadolny" → { honorificPrefix: "Dr. med.", name: "Regina Nadolny" } */
function splitTitle(fullName: string) {
	const match = /^((?:(?:Prof|Dr|PD|med|rer|nat|habil|Dipl)\.\s*)+)(.+)$/.exec(fullName.trim());
	return match
		? { honorificPrefix: match[1].trim(), name: match[2].trim() }
		: { name: fullName.trim() };
}

/** schema.org MedicalClinic description generated from content/practice.yml. */
export function buildJsonLd(practice: Practice, url: string, description: string, image?: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'MedicalClinic',
		// One entity for all languages; `url` is the page in the current language.
		'@id': `${SITE_ORIGIN}/#praxis`,
		name: practice.name,
		description,
		url,
		...(image ? { image } : {}),
		telephone: practice.phones.map((p) => p.tel),
		...(practice.fax ? { faxNumber: practice.fax.tel } : {}),
		email: practice.emails.map((e) => e.address),
		availableLanguage: AVAILABLE_LANGUAGES,
		medicalSpecialty: ['https://schema.org/Endocrine', 'https://schema.org/PrimaryCare'],
		address: {
			'@type': 'PostalAddress',
			streetAddress: practice.address.street,
			postalCode: practice.address.postalCode,
			addressLocality: practice.address.city,
			addressCountry: practice.address.country
		},
		geo: {
			'@type': 'GeoCoordinates',
			latitude: practice.geo.lat,
			longitude: practice.geo.lng
		},
		openingHoursSpecification: practice.hours.flatMap((day) =>
			day.times.map((range) => ({
				'@type': 'OpeningHoursSpecification',
				dayOfWeek: SCHEMA_DAYS[day.day],
				opens: range.from,
				closes: range.to
			}))
		),
		potentialAction: {
			'@type': 'ReserveAction',
			target: practice.bookingUrl
		},
		employee: {
			'@type': 'Person',
			...splitTitle(practice.doctor)
		}
	};
}

/** Serialize JSON for embedding inside a <script> element. */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}
