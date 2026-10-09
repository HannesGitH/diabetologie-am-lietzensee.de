/**
 * Build-time content loader.
 *
 * Everything editors change lives in /content:
 *   content/practice.yml            language-independent facts (address, phones, hours …)
 *   content/{de,en,ru}/<slug>.md    one Markdown file per page and language (YAML frontmatter + body)
 *   content/{de,en,ru}/notice.md    the announcement banner
 *
 * Files are bundled via import.meta.glob (?raw) so this works in dev, at prerender time and in tests.
 * Content is never run through mdsvex/Svelte, so curly braces etc. in editor text are harmless.
 *
 * Every file is checked against a small schema below; mistakes fail the build with a German
 * message that names the file, the position and (where possible) the likely cause.
 */
import { Marked, type Tokens } from 'marked';
import { parse as parseYaml, YAMLParseError } from 'yaml';
import { baseLocale, locales, type Locale } from '#lib/paraglide/runtime.js';
import { m } from '#lib/paraglide/messages.js';
import { PAGE_SLUGS, type PageSlug } from '#lib/site.js';
import {
	WEEKDAYS,
	type DayHours,
	type FrontmatterBySlug,
	type Notice,
	type PageContent,
	type Practice,
	type Weekday
} from '#lib/types.js';

const markdownFiles = import.meta.glob<string>('/content/*/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});
const practiceSource = import.meta.glob<string>('/content/practice.yml', {
	query: '?raw',
	import: 'default',
	eager: true
})['/content/practice.yml'];

export class ContentError extends Error {
	constructor(file: string, problem: string) {
		super(`[content] ${file}: ${problem}`);
		this.name = 'ContentError';
	}
}

/* ── YAML ──────────────────────────────────────────────────────────────────── */

const YAML_HINTS: Record<string, string> = {
	BLOCK_AS_IMPLICIT_KEY:
		'Enthält der Text einen Doppelpunkt? Dann den ganzen Text in Anführungszeichen setzen, z. B. text: "Hinweis: …". Sonst bitte die Einrückung prüfen.',
	MULTILINE_IMPLICIT_KEY:
		'Enthält der Text einen Doppelpunkt? Dann den ganzen Text in Anführungszeichen setzen. Sonst bitte die Einrückung prüfen.',
	TAB_AS_INDENT: 'Tabulator statt Leerzeichen – bitte nur Leerzeichen zum Einrücken verwenden.',
	UNEXPECTED_TOKEN:
		'Beginnt der Text mit *, &, !, #, @ oder einem Anführungszeichen? Dann den ganzen Text in Anführungszeichen setzen.',
	UNEXPECTED_SCALAR:
		'Beginnt der Text mit *, &, !, #, @ oder einem Anführungszeichen? Dann den ganzen Text in Anführungszeichen setzen.',
	BAD_ALIAS: 'Beginnt der Text mit * oder &? Dann den ganzen Text in Anführungszeichen setzen.',
	MISSING_CHAR: 'Ein Anführungszeichen oder eine Klammer wird nicht geschlossen.',
	BAD_INDENT: 'Bitte die Einrückung (Leerzeichen am Zeilenanfang) prüfen.',
	DUPLICATE_KEY: 'Ein Feldname kommt doppelt vor.'
};

/**
 * Parse YAML; errors are reported in German with line numbers counted in the *file*
 * (`lineOffset` = number of lines before the YAML starts, e.g. 1 for the opening `---`).
 */
function parseYamlSource(source: string, file: string, lineOffset: number): unknown {
	try {
		return parseYaml(source);
	} catch (error) {
		if (error instanceof YAMLParseError) {
			const pos = error.linePos?.[0];
			const where = pos ? `Zeile ${pos.line + lineOffset}, Spalte ${pos.col}` : 'unbekannte Stelle';
			const hint = YAML_HINTS[error.code] ?? 'Bitte Schreibweise und Einrückung prüfen.';
			const original = error.message.split('\n')[0];
			throw new ContentError(file, `YAML-Fehler in ${where}: ${hint} (Technisch: ${original})`);
		}
		throw new ContentError(file, `YAML-Fehler – ${(error as Error).message}`);
	}
}

/* ── Schema validation ─────────────────────────────────────────────────────── */

type Schema =
	| { type: 'text'; optional?: boolean; pattern?: RegExp; patternHint?: string; oneOf?: string[] }
	| { type: 'number'; optional?: boolean }
	| { type: 'boolean'; optional?: boolean }
	| { type: 'list'; of: Schema; optional?: boolean }
	| { type: 'object'; fields: Record<string, Schema>; optional?: boolean; open?: boolean }
	| { type: 'any'; optional?: boolean };

const text = (extra: Omit<Extract<Schema, { type: 'text' }>, 'type'> = {}): Schema => ({
	type: 'text',
	...extra
});
const optionalText: Schema = { type: 'text', optional: true };
const textList: Schema = { type: 'list', of: { type: 'text' } };
const list = (of: Schema): Schema => ({ type: 'list', of });
const object = (fields: Record<string, Schema>, optional = false): Schema => ({
	type: 'object',
	fields,
	optional
});

const describe = (value: unknown) =>
	value === null
		? 'leer'
		: Array.isArray(value)
			? 'eine Liste'
			: typeof value === 'object'
				? 'ein Block (Feld: Wert)'
				: typeof value === 'boolean'
					? `ein Ja/Nein-Wert (${value})`
					: `„${String(value)}“`;

/** Validate `value` against `schema`; returns a normalised copy (numbers in text fields → text). */
function check(value: unknown, schema: Schema, path: string[], file: string): unknown {
	const where = path.length ? `„${path.join(' → ')}“` : 'Der Kopfbereich';
	const fail = (problem: string): never => {
		throw new ContentError(file, `${where} ${problem}`);
	};

	if (value === undefined || value === null || value === '') {
		if (schema.optional) return undefined;
		return fail('fehlt oder ist leer.');
	}

	switch (schema.type) {
		case 'any':
			return value;
		case 'boolean':
			if (typeof value !== 'boolean') {
				return fail(`muss true oder false sein, nicht ${describe(value)}.`);
			}
			return value;
		case 'number':
			if (typeof value !== 'number') return fail(`muss eine Zahl sein, nicht ${describe(value)}.`);
			return value;
		case 'text': {
			let result: string;
			if (typeof value === 'string') result = value;
			else if (typeof value === 'number') result = String(value);
			else if (value && typeof value === 'object' && !Array.isArray(value)) {
				return fail(
					'ist kein Text – enthält die Zeile einen Doppelpunkt? Dann den ganzen Text in Anführungszeichen setzen, z. B. - "Ultraschall: Schilddrüse und Bauch".'
				);
			} else {
				return fail(`muss ein Text sein, nicht ${describe(value)}.`);
			}
			if (schema.oneOf && !schema.oneOf.includes(result)) {
				return fail(`hat den Wert „${result}“ – erlaubt sind: ${schema.oneOf.join(', ')}.`);
			}
			if (schema.pattern && !schema.pattern.test(result)) {
				return fail(`hat den Wert „${result}“ – ${schema.patternHint ?? 'Format ungültig.'}`);
			}
			return result;
		}
		case 'list': {
			if (!Array.isArray(value)) {
				return fail(
					`muss eine Liste sein (jeder Eintrag in einer eigenen Zeile, beginnend mit „- “), nicht ${describe(value)}.`
				);
			}
			return value.map((item, i) => check(item, schema.of, [...path, `${i + 1}. Eintrag`], file));
		}
		case 'object': {
			if (typeof value !== 'object' || Array.isArray(value)) {
				return fail(`muss ein Block mit Feldern (${Object.keys(schema.fields).join(', ')}) sein.`);
			}
			const record = value as Record<string, unknown>;
			if (!schema.open) {
				for (const key of Object.keys(record)) {
					if (!(key in schema.fields)) {
						fail(
							`enthält das unbekannte Feld „${key}“ – Tippfehler? Erlaubt sind: ${Object.keys(schema.fields).join(', ')}.`
						);
					}
				}
			}
			const result: Record<string, unknown> = { ...record };
			for (const [key, fieldSchema] of Object.entries(schema.fields)) {
				const checked = check(record[key], fieldSchema, [...path, key], file);
				if (checked === undefined) delete result[key];
				else result[key] = checked;
			}
			return result;
		}
	}
}

const BASE_FIELDS = {
	title: text(),
	description: text(),
	translated: { type: 'boolean', optional: true } as Schema
};

const PAGE_SCHEMAS: { [S in PageSlug]: Record<string, Schema> } = {
	home: {
		...BASE_FIELDS,
		heading: text(),
		lead: text(),
		focusHeading: text(),
		focus: list(object({ title: text(), text: text() })),
		servicesTeaser: object({ heading: text(), text: text() }),
		teamTeaser: object({ heading: text(), text: text() }),
		quote: object({ text: text(), author: text() }),
		signoff: text()
	},
	leistungen: {
		...BASE_FIELDS,
		groups: list(object({ title: text(), items: textList }))
	},
	team: {
		...BASE_FIELDS,
		doctorHeading: text(),
		doctor: object({
			name: text(),
			photo: optionalText,
			titles: textList,
			cv: list(object({ period: text(), text: text() })),
			languages: textList,
			memberships: textList
		}),
		staffHeading: text(),
		staff: list(object({ name: text(), photo: optionalText, roles: textList }))
	},
	praxis: {
		...BASE_FIELDS,
		gallery: list(object({ image: text(), caption: text(), alt: text() }))
	},
	kontakt: {
		...BASE_FIELDS,
		appointmentHeading: text(),
		appointmentText: text(),
		directionsHeading: text(),
		mapAlt: text()
	},
	impressum: BASE_FIELDS,
	datenschutz: BASE_FIELDS
};

/* ── Placeholders ({{telefon}} etc.) ───────────────────────────────────────── */

const PLACEHOLDER = /\{\{\s*([^{}\s]*)\s*\}\}/g;

/** The placeholders editors can use in Markdown text and in text fields of the frontmatter. */
export function placeholderValues(locale: Locale): Record<string, string> {
	const practice = getPractice();
	const phone = (p: Practice['phones'][number]) =>
		locale === baseLocale ? p.display : p.international;
	const email = (purpose: 'general' | 'prescriptions') =>
		practice.emails.find((e) => e.purpose === purpose)?.address ?? '';
	const { street, postalCode, city } = practice.address;
	return {
		aerztin: practice.doctor,
		strasse: street,
		plz_ort: `${postalCode} ${city}`,
		adresse: `${street}, ${postalCode} ${city}`,
		telefon: practice.phones.map(phone).join(` ${m.or({}, { locale })} `),
		fax: practice.fax ? phone(practice.fax) : '',
		email: email('general'),
		email_rezepte: email('prescriptions')
	};
}

function fillPlaceholders(source: string, locale: Locale, file: string): string {
	if (!source.includes('{{')) return source;
	const values = placeholderValues(locale);
	return source.replace(PLACEHOLDER, (_match, name: string) => {
		const value = values[name];
		if (value === undefined) {
			throw new ContentError(
				file,
				`Unbekannter Platzhalter „{{${name}}}“. Erlaubt sind: ${Object.keys(values)
					.map((key) => `{{${key}}}`)
					.join(', ')}.`
			);
		}
		return value;
	});
}

/** Apply placeholders to every text in a frontmatter object. */
function fillDeep<T>(value: T, locale: Locale, file: string): T {
	if (typeof value === 'string') return fillPlaceholders(value, locale, file) as T;
	if (Array.isArray(value)) return value.map((item) => fillDeep(item, locale, file)) as T;
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, fillDeep(item, locale, file)])
		) as T;
	}
	return value;
}

/* ── Markdown ──────────────────────────────────────────────────────────────── */

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function splitFrontmatter(source: string, file: string) {
	const match = FRONTMATTER.exec(source);
	if (!match) return { data: {} as Record<string, unknown>, body: source };
	// The YAML starts on line 2 of the file (after the opening ---).
	const data = parseYamlSource(match[1], file, 1) ?? {};
	if (typeof data !== 'object' || Array.isArray(data)) {
		throw new ContentError(
			file,
			'Der Kopfbereich (zwischen den ---) muss Schlüssel: Wert-Paare enthalten.'
		);
	}
	return { data: data as Record<string, unknown>, body: match[2] };
}

const escapeAttr = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function createMarkdown(locale: Locale) {
	const marked = new Marked({ gfm: true, breaks: false });
	marked.use({
		renderer: {
			link(
				this: { parser: { parseInline(tokens: Tokens.Generic[]): string } },
				token: Tokens.Link
			) {
				const text = this.parser.parseInline(token.tokens);
				const title = token.title ? ` title="${escapeAttr(token.title)}"` : '';
				const href = escapeAttr(token.href);
				if (/^https?:\/\//.test(token.href)) {
					return `<a href="${href}"${title} target="_blank" rel="noopener noreferrer" class="external">${text}<span class="visually-hidden"> ${m.opens_new_tab({}, { locale })}</span></a>`;
				}
				return `<a href="${href}"${title}>${text}</a>`;
			}
		}
	});
	return marked;
}

const markdownByLocale = new Map<Locale, Marked>();

function markdownFor(locale: Locale): Marked {
	let marked = markdownByLocale.get(locale);
	if (!marked) {
		marked = createMarkdown(locale);
		markdownByLocale.set(locale, marked);
	}
	return marked;
}

/**
 * Render trusted Markdown to HTML. HTML comments (editor templates/notes) are removed and
 * placeholders like {{telefon}} are filled in.
 */
export function renderMarkdown(
	markdown: string,
	locale: Locale = baseLocale,
	file = 'Markdown'
): string {
	const withoutComments = markdown.replace(/<!--[\s\S]*?-->/g, '').trim();
	if (!withoutComments) return '';
	const filled = fillPlaceholders(withoutComments, locale, file);
	return markdownFor(locale).parse(filled, { async: false }) as string;
}

/**
 * Render a single line of Markdown without wrapping <p>. Allows inline HTML such as
 * `<span lang="de">Fachärztin für Allgemeinmedizin</span>` in translated text.
 */
export function renderInline(markdown: string, locale: Locale = baseLocale): string {
	return markdownFor(locale).parseInline(markdown, { async: false }) as string;
}

/* ── Pages ─────────────────────────────────────────────────────────────────── */

const fileName = (locale: Locale, name: string) => `/content/${locale}/${name}.md`;

function readMarkdownFile(locale: Locale, name: string) {
	const requested = fileName(locale, name);
	if (markdownFiles[requested] !== undefined) {
		return { file: requested, source: markdownFiles[requested], contentLang: locale };
	}
	// Fall back to German if a translation file is missing entirely.
	const fallback = fileName(baseLocale, name);
	if (markdownFiles[fallback] === undefined) {
		throw new ContentError(requested, 'Datei nicht gefunden.');
	}
	return { file: fallback, source: markdownFiles[fallback], contentLang: baseLocale as Locale };
}

/** Staff names/photos (and the doctor's) must be identical in every language. */
function checkTeamMatchesGerman(team: FrontmatterBySlug['team'], file: string) {
	const german = getPage('team', baseLocale).data;
	const people = (t: FrontmatterBySlug['team']) => [
		`${t.doctor.name} (${t.doctor.photo ?? 'ohne Foto'})`,
		...t.staff.map((p) => `${p.name} (${p.photo ?? 'ohne Foto'})`)
	];
	const expected = people(german);
	const actual = people(team);
	if (expected.join('|') !== actual.join('|')) {
		throw new ContentError(
			file,
			`Ärztin/Praxisteam weicht von de/team.md ab. Namen, Fotos und Reihenfolge müssen in allen Sprachen gleich sein.\n  Deutsch:     ${expected.join(', ')}\n  Diese Datei: ${actual.join(', ')}`
		);
	}
}

/** Split, validate and fill in placeholders of a page source (exported for tests). */
export function parsePage<S extends PageSlug>(
	slug: S,
	source: string,
	file: string,
	locale: Locale
): { data: FrontmatterBySlug[S]; body: string } {
	const { data: raw, body } = splitFrontmatter(source, file);
	const checked = check(raw, { type: 'object', fields: PAGE_SCHEMAS[slug] }, [], file);
	// Safe: `checked` has just been validated against the schema for this slug.
	return { data: fillDeep(checked, locale, file) as FrontmatterBySlug[S], body };
}

/** Load, validate and render a page for a locale. */
export function getPage<S extends PageSlug>(
	slug: S,
	locale: Locale
): PageContent<FrontmatterBySlug[S]> {
	const { file, source, contentLang: fileLang } = readMarkdownFile(locale, slug);
	const { data, body } = parsePage(slug, source, file, locale);
	const translated = fileLang === locale && data.translated !== false;
	if (slug === 'team' && fileLang !== baseLocale) {
		checkTeamMatchesGerman(data as FrontmatterBySlug['team'], file);
	}
	return {
		locale,
		contentLang: translated ? locale : baseLocale,
		translated,
		data,
		html: renderMarkdown(body, locale, file)
	};
}

/* ── Notice banner ─────────────────────────────────────────────────────────── */

/** Today's date in Berlin as YYYY-MM-DD. */
export function berlinToday(now = new Date()): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Berlin',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(now);
}

function toIsoDate(value: unknown, field: string, file: string): string | undefined {
	if (value === undefined || value === null || value === '') return undefined;
	const text =
		value instanceof Date ? value.toISOString().slice(0, 10) : String(value as string).trim();
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
	const date = match ? new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])) : undefined;
	if (!date || date.toISOString().slice(0, 10) !== text) {
		throw new ContentError(
			file,
			`„${field}“ muss ein gültiges Datum im Format JJJJ-MM-TT sein (z. B. 2026-12-31), nicht „${text}“.`
		);
	}
	return text;
}

const NOTICE_SETTINGS = ['show', 'tone', 'until'];

/**
 * The notice for a locale, or `null` when hidden / expired.
 *
 * Visibility (`show`, `until`) and colour (`tone`) are always taken from de/notice.md, so the
 * banner appears and disappears in all languages at once. A translation is only used while its
 * `stand:` matches the German one; otherwise the German text is shown.
 */
export function getNotice(locale: Locale, now = new Date()): Notice | null {
	const deFile = fileName(baseLocale, 'notice');
	if (markdownFiles[deFile] === undefined) throw new ContentError(deFile, 'Datei nicht gefunden.');
	const translationFile = fileName(locale, 'notice');
	const translationSource = locale !== baseLocale ? markdownFiles[translationFile] : undefined;
	return buildNotice(locale, markdownFiles[deFile], translationSource, now);
}

/** getNotice for given sources (exported for tests). */
export function buildNotice(
	locale: Locale,
	germanSource: string,
	translationSource?: string,
	now = new Date()
): Notice | null {
	const deFile = fileName(baseLocale, 'notice');
	const german = splitFrontmatter(germanSource, deFile);
	const settings = check(
		german.data,
		{
			type: 'object',
			fields: {
				show: { type: 'boolean' },
				tone: text({ optional: true, oneOf: ['info', 'warning'] }),
				until: { type: 'any', optional: true },
				stand: { type: 'any', optional: true },
				title: optionalText
			}
		},
		[],
		deFile
	) as {
		show: boolean;
		tone?: 'info' | 'warning';
		until?: unknown;
		stand?: unknown;
		title?: string;
	};
	const until = toIsoDate(settings.until, 'until', deFile);
	const stand = toIsoDate(settings.stand, 'stand', deFile);
	if (!settings.show) return null;
	if (until && berlinToday(now) > until) return null;

	let source = { data: settings as Record<string, unknown>, body: german.body, file: deFile };
	let translated = locale === baseLocale;
	const translationFile = fileName(locale, 'notice');
	if (locale !== baseLocale && translationSource !== undefined) {
		const translation = splitFrontmatter(translationSource, translationFile);
		for (const key of NOTICE_SETTINGS) {
			if (key in translation.data) {
				throw new ContentError(
					translationFile,
					`„${key}“ wird nur in de/notice.md eingestellt und gilt dort für alle Sprachen. Bitte die Zeile hier löschen.`
				);
			}
		}
		const data = check(
			translation.data,
			{
				type: 'object',
				fields: {
					title: optionalText,
					stand: { type: 'any', optional: true },
					translated: { type: 'boolean', optional: true }
				}
			},
			[],
			translationFile
		) as { title?: string; stand?: unknown; translated?: boolean };
		const translationStand = toIsoDate(data.stand, 'stand', translationFile);
		if (translationStand === stand && data.translated !== false) {
			source = { data, body: translation.body, file: translationFile };
			translated = true;
		}
	}

	const html = renderMarkdown(source.body, locale, source.file);
	if (!html) return null;
	const title = source.data.title;
	return {
		tone: settings.tone === 'warning' ? 'warning' : 'info',
		title: typeof title === 'string' ? fillPlaceholders(title, locale, source.file) : undefined,
		html,
		translated
	};
}

/* ── Practice facts ────────────────────────────────────────────────────────── */

const TIME = /^([01]?\d|2[0-3]):[0-5]\d$/;

function parseHours(raw: unknown, file: string): DayHours[] {
	if (!raw || typeof raw !== 'object') throw new ContentError(file, '„hours“ fehlt.');
	const result: DayHours[] = [];
	for (const key of Object.keys(raw)) {
		if (!WEEKDAYS.includes(key as Weekday)) {
			throw new ContentError(
				file,
				`Unbekannter Wochentag „${key}“ (erlaubt: ${WEEKDAYS.join(', ')}).`
			);
		}
	}
	for (const day of WEEKDAYS) {
		const entry = (raw as Record<string, unknown>)[day] as
			{ times?: unknown; note?: unknown } | undefined;
		if (!entry) continue;
		const times = Array.isArray(entry.times) ? entry.times : [];
		const ranges = times.map((range: unknown) => {
			const { from, to } = (range ?? {}) as { from?: unknown; to?: unknown };
			if (
				typeof from !== 'string' ||
				typeof to !== 'string' ||
				!TIME.test(from) ||
				!TIME.test(to)
			) {
				throw new ContentError(file, `Ungültige Uhrzeit bei „${day}“ – bitte "HH:MM" verwenden.`);
			}
			const range_ = { from: from.padStart(5, '0'), to: to.padStart(5, '0') };
			if (range_.from >= range_.to) {
				throw new ContentError(file, `Bei „${day}“ liegt „from“ (${from}) nicht vor „to“ (${to}).`);
			}
			return range_;
		});
		if (entry.note !== undefined && entry.note !== 'by_appointment') {
			throw new ContentError(
				file,
				`Unbekannte Notiz „${String(entry.note)}“ bei „${day}“ (erlaubt: by_appointment).`
			);
		}
		result.push({ day, times: ranges, ...(entry.note ? { note: 'by_appointment' as const } : {}) });
	}
	return result;
}

const PHONE: Schema = object({
	display: text({
		pattern: /^0[\d /-]{5,}$/,
		patternHint:
			'die Nummer bitte in deutscher Schreibweise mit Vorwahl angeben, z. B. "030 3218153" (in Anführungszeichen).'
	}),
	tel: text({
		pattern: /^\+\d{6,}$/,
		patternHint:
			'„tel“ muss mit + und Ländervorwahl beginnen, ohne Leerzeichen, und in Anführungszeichen stehen, z. B. tel: "+49303218153".'
	})
});

const PRACTICE_SCHEMA: Schema = object({
	name: text(),
	doctor: text(),
	address: object({
		street: text(),
		postalCode: text({
			pattern: /^\d{5}$/,
			patternHint:
				'die Postleitzahl muss fünfstellig sein und in Anführungszeichen stehen, z. B. "01067".'
		}),
		city: text(),
		district: optionalText,
		country: text({
			pattern: /^[A-Z]{2}$/,
			patternHint: 'Ländercode mit zwei Buchstaben, z. B. DE.'
		})
	}),
	geo: object({ lat: { type: 'number' }, lng: { type: 'number' } }),
	phones: list(PHONE),
	fax: { ...(PHONE as Extract<Schema, { type: 'object' }>), optional: true },
	emails: list(
		object({
			address: text({
				pattern: /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i,
				patternHint: 'keine gültige E-Mail-Adresse.'
			}),
			purpose: text({ oneOf: ['general', 'prescriptions'] })
		})
	),
	bookingUrl: text({
		pattern: /^https:\/\/\S+$/,
		patternHint: 'der Link muss vollständig sein und mit https:// beginnen.'
	}),
	hours: { type: 'any' },
	certifications: {
		type: 'list',
		optional: true,
		of: object({
			image: text(),
			name: object(Object.fromEntries(locales.map((locale) => [locale, text()])))
		})
	},
	copyright: text(),
	photoCredit: optionalText,
	images: object({ hero: text(), impressions: textList })
});

/** "030 3218153" → "+49 30 3218153" */
function toInternational(display: string): string {
	return display.startsWith('0') ? `+49 ${display.slice(1)}` : display;
}

let practiceCache: Practice | undefined;

export function getPractice(): Practice {
	if (practiceCache) return practiceCache;
	const file = '/content/practice.yml';
	if (practiceSource === undefined) throw new ContentError(file, 'Datei nicht gefunden.');
	practiceCache = parsePractice(practiceSource, file);
	return practiceCache;
}

/** Parse and validate practice.yml (exported for tests). */
export function parsePractice(source: string, file = '/content/practice.yml'): Practice {
	const raw = check(parseYamlSource(source, file, 0), PRACTICE_SCHEMA, [], file) as Omit<
		Practice,
		'hours' | 'phones' | 'fax'
	> & {
		hours: unknown;
		phones: { display: string; tel: string }[];
		fax?: { display: string; tel: string };
		certifications?: Practice['certifications'];
	};
	const withInternational = (phone: { display: string; tel: string }) => ({
		...phone,
		international: toInternational(phone.display)
	});
	return {
		...raw,
		phones: raw.phones.map(withInternational),
		fax: raw.fax ? withInternational(raw.fax) : undefined,
		hours: parseHours(raw.hours, file),
		certifications: raw.certifications ?? []
	};
}

/** Every page slug that must exist for every locale (used by tests). */
export const CONTENT_FILES = [...PAGE_SLUGS, 'notice'] as const;

/** Raw access for tests. */
export function hasContentFile(locale: Locale, name: string): boolean {
	return markdownFiles[fileName(locale, name)] !== undefined;
}
