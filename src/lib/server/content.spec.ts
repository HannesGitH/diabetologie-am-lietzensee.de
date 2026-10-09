import { describe, expect, it } from 'vitest';
import { locales } from '#lib/paraglide/runtime.js';
import { PAGE_SLUGS } from '#lib/site.js';
import { getImage } from '#lib/images.js';
import {
	CONTENT_FILES,
	berlinToday,
	buildNotice,
	getNotice,
	getPage,
	getPractice,
	hasContentFile,
	parsePage,
	parsePractice,
	renderMarkdown
} from './content.js';
import practiceSource from '/content/practice.yml?raw';

describe('content files', () => {
	it.each(locales)('has every content file for locale %s', (locale) => {
		for (const name of CONTENT_FILES) {
			expect(hasContentFile(locale, name), `content/${locale}/${name}.md`).toBe(true);
		}
	});

	it.each(locales)('loads and validates every page for locale %s', (locale) => {
		for (const slug of PAGE_SLUGS) {
			const page = getPage(slug, locale);
			expect(page.data.title.length).toBeGreaterThan(0);
			expect(page.data.description.length).toBeGreaterThan(0);
		}
	});

	it('marks German as translated and placeholders as untranslated German', () => {
		const de = getPage('home', 'de');
		expect(de.translated).toBe(true);
		expect(de.contentLang).toBe('de');
		for (const locale of locales) {
			const page = getPage('home', locale);
			if (!page.translated) expect(page.contentLang).toBe('de');
		}
	});

	it('references only images that exist', () => {
		for (const locale of locales) {
			const team = getPage('team', locale).data;
			if (team.doctor.photo) expect(getImage(team.doctor.photo)).toBeDefined();
			for (const person of team.staff) {
				if (person.photo) expect(getImage(person.photo), person.photo).toBeDefined();
			}
			for (const item of getPage('praxis', locale).data.gallery) {
				expect(getImage(`practice/${item.image}`), item.image).toBeDefined();
			}
		}
		for (const cert of getPractice().certifications) {
			expect(getImage(`certifications/${cert.image}`)).toBeDefined();
		}
	});

	it('keeps all facts of the original site in the German content', () => {
		const services = getPage('leistungen', 'de').data.groups.flatMap((g) => g.items);
		expect(services.filter((s) => s === 'Dopplerdruckmessung der Fußarterien')).toHaveLength(2);
		const team = getPage('team', 'de').data;
		expect(team.staff.map((p) => p.name)).toEqual([
			'Valentina Byckov',
			'Regina Bischoff',
			'Nicole Wilmes',
			'Valerie Paulish'
		]);
		expect(team.doctor.cv).toHaveLength(10);
	});
});

describe('practice.yml', () => {
	const practice = getPractice();

	it('parses opening hours in weekday order', () => {
		expect(practice.hours.map((d) => d.day)).toEqual(['mon', 'tue', 'wed', 'thu', 'fri']);
		expect(practice.hours[0]).toEqual({
			day: 'mon',
			times: [{ from: '09:00', to: '12:30' }],
			note: 'by_appointment'
		});
		expect(practice.hours[3].times).toEqual([
			{ from: '10:00', to: '12:30' },
			{ from: '14:30', to: '17:30' }
		]);
	});

	it('has callable phone numbers and a booking link', () => {
		for (const phone of practice.phones) expect(phone.tel).toMatch(/^\+49\d+$/);
		expect(practice.bookingUrl).toMatch(/^https:\/\/www\.doctolib\.de\//);
		expect(practice.address.postalCode).toBe('14057');
	});
});

describe('markdown & notice', () => {
	it('strips HTML comments (templates) and marks external links', () => {
		const html = renderMarkdown('Hallo <!-- geheim -->\n\n[x](https://example.org)', 'de');
		expect(html).not.toContain('geheim');
		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener noreferrer"');
	});

	it('shows the current German notice without its commented templates', () => {
		const notice = getNotice('de', new Date('2026-01-15T12:00:00Z'));
		expect(notice?.html).toContain('FFP2');
		expect(notice?.html).not.toContain('VORLAGEN');
	});

	it('takes visibility from German and falls back to German when a translation is stale', () => {
		const de = '---\nshow: true\ntone: warning\nstand: 2026-10-01\n---\nPraxis geschlossen.';
		const enCurrent = '---\ntitle: Closed\nstand: 2026-10-01\n---\nPractice closed.';
		const enStale = '---\ntitle: Old\nstand: 2026-01-01\n---\nWear a mask.';
		expect(buildNotice('en', de, enCurrent)).toMatchObject({ tone: 'warning', translated: true });
		const stale = buildNotice('en', de, enStale);
		expect(stale?.html).toContain('Praxis geschlossen');
		expect(stale?.translated).toBe(false);
		const hidden = de.replace('show: true', 'show: false');
		expect(buildNotice('en', hidden, enCurrent)).toBeNull();
		expect(() => buildNotice('en', de, '---\nshow: false\n---\nx')).toThrow(/nur in de/);
	});

	it('rejects invalid notice settings', () => {
		expect(() => buildNotice('de', '---\nshow: ja\n---\nx')).toThrow(/true oder false/);
		expect(() => buildNotice('de', '---\nshow: true\ntone: warnung\n---\nx')).toThrow(
			/info, warning/
		);
		expect(() => buildNotice('de', '---\nshow: true\nuntil: 2026-02-30\n---\nx')).toThrow(
			/gültiges Datum/
		);
	});

	it('fills placeholders and rejects unknown ones', () => {
		expect(renderMarkdown('Tel. {{telefon}}', 'de')).toContain('030 3218153 oder 030 3226177');
		expect(renderMarkdown('Tel. {{telefon}}', 'en')).toContain('+49 30 3218153 or');
		expect(renderMarkdown('{{email}}', 'de')).toContain('href="mailto:praxis@');
		expect(() => renderMarkdown('{{telfon}}', 'de')).toThrow(/Unbekannter Platzhalter/);
	});

	it('computes the Berlin date', () => {
		expect(berlinToday(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01');
	});
});

describe('content validation', () => {
	const file = '/content/de/leistungen.md';
	const services = (items: string) =>
		`---\ntitle: L\ndescription: D\ngroups:\n  - title: Diabetes\n    items:\n${items}\n---\n`;

	it('reports an unquoted colon inside a list', () => {
		expect(() =>
			parsePage('leistungen', services('      - Ultraschall: Schilddrüse'), file, 'de')
		).toThrow(/groups → 1\. Eintrag → items → 1\. Eintrag.*Anführungszeichen/);
	});

	it('reports text where a list is expected and misspelt field names', () => {
		const team = getPage('team', 'de').data;
		expect(team.staff.length).toBeGreaterThan(0);
		expect(() =>
			parsePage(
				'leistungen',
				'---\ntitle: L\ndescription: D\ngroups:\n  - titel: X\n    items: [a]\n---\n',
				file,
				'de'
			)
		).toThrow(/unbekannte Feld „titel“/);
		expect(() =>
			parsePage(
				'leistungen',
				'---\ntitle: L\ndescription: D\ngroups:\n  - title: X\n    items: Text\n---\n',
				file,
				'de'
			)
		).toThrow(/muss eine Liste sein/);
	});

	it('reports YAML errors with the line number in the file', () => {
		expect(() =>
			parsePage('leistungen', '---\ntitle: L\ndescription: Neu: da\n---\n', file, 'de')
		).toThrow(/Zeile 3.*Doppelpunkt/);
	});

	it('rejects unquoted phone numbers and invalid practice data', () => {
		const source = practiceSource as string;
		expect(parsePractice(source).phones[0].international).toBe('+49 30 3218153');
		expect(() => parsePractice(source.replace("tel: '+49303218153'", 'tel: +49303218153'))).toThrow(
			/mit \+ und Ländervorwahl/
		);
		expect(() => parsePractice(source.replace("postalCode: '14057'", 'postalCode: 01067'))).toThrow(
			/fünfstellig/
		);
		expect(() =>
			parsePractice(source.replace('purpose: prescriptions', 'purpose: rezepte'))
		).toThrow(/general, prescriptions/);
		expect(() => parsePractice(source.replace('bookingUrl: https://', 'bookingUrl: '))).toThrow(
			/https:\/\//
		);
	});

	it('keeps the team identical in all languages', () => {
		for (const locale of locales) {
			const team = getPage('team', locale).data;
			expect(team.staff.map((p) => [p.name, p.photo])).toEqual(
				getPage('team', 'de').data.staff.map((p) => [p.name, p.photo])
			);
		}
	});
});
