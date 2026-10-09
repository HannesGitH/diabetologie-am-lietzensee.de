import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
	'/',
	'/leistungen/',
	'/team/',
	'/praxis/',
	'/kontakt/',
	'/impressum/',
	'/datenschutz/'
];
const LOCALES = [
	{ lang: 'de', prefix: '' },
	{ lang: 'en', prefix: '/en' },
	{ lang: 'ru', prefix: '/ru' }
];

for (const { lang, prefix } of LOCALES) {
	for (const path of PAGES) {
		const url = prefix + path;
		test(`${url} renders and is accessible`, async ({ page }) => {
			const response = await page.goto(url);
			expect(response?.status()).toBe(200);
			await expect(page.locator('html')).toHaveAttribute('lang', lang);
			await expect(page.locator('h1')).toHaveCount(1);
			await expect(page.locator('main#main')).toBeVisible();
			await expect(page.locator(`link[rel="alternate"][hreflang="x-default"]`)).toHaveCount(1);

			const results = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
				.analyze();
			const serious = results.violations.filter(
				(v) => v.impact === 'serious' || v.impact === 'critical'
			);
			expect(
				serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
			).toEqual([]);
		});
	}
}

test('ships no client JavaScript', async ({ page }) => {
	const scripts: string[] = [];
	page.on('request', (request) => {
		if (request.resourceType() === 'script') scripts.push(request.url());
	});
	await page.goto('/');
	expect(scripts).toEqual([]);
	await expect(page.locator('script:not([type="application/ld+json"])')).toHaveCount(0);
});

test('language switcher links to the same page in other languages', async ({ page }) => {
	await page.goto('/kontakt/');
	const switcher = page.locator('.topbar nav');
	await expect(switcher.locator('a[hreflang="en"]')).toHaveAttribute('href', '/en/kontakt/');
	await expect(switcher.locator('a[hreflang="ru"]')).toHaveAttribute('href', '/ru/kontakt/');
});

test('mobile menu works without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 375, height: 800 },
		baseURL: 'http://localhost:4173'
	});
	const page = await context.newPage();
	await page.goto('/');
	const menu = page.locator('details.nav-mobile');
	await expect(menu.getByRole('link', { name: 'Kontakt' })).toBeHidden();
	await menu.locator('summary').click();
	await expect(menu.getByRole('link', { name: 'Kontakt' })).toBeVisible();
	await context.close();
});

test('sitemap lists all 21 pages', async ({ request }) => {
	const xml = await (await request.get('/sitemap.xml')).text();
	expect(xml.match(/<loc>/g)).toHaveLength(21);
});

test.describe('dark mode', () => {
	test.use({ colorScheme: 'dark' });
	for (const url of ['/', '/team/', '/kontakt/', '/leistungen/']) {
		test(`${url} has sufficient contrast in dark mode`, async ({ page }) => {
			await page.goto(url);
			const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
			expect(results.violations.map((v) => v.id)).toEqual([]);
		});
	}
});

test('open mobile menu hides the page behind it and has an accessible name', async ({
	browser
}) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 320, height: 640 },
		baseURL: 'http://localhost:4173'
	});
	const page = await context.newPage();
	await page.goto('/');
	const summary = page.locator('details.nav-mobile summary');
	await expect(summary).toHaveAccessibleName('Menü');
	await summary.click();
	await expect(page.locator('main#main')).toBeHidden();
	await expect(page.locator('footer.site-footer')).toBeHidden();
	await context.close();
});

for (const [width, url] of [
	[320, '/leistungen/'],
	[320, '/ru/'],
	[375, '/ru/kontakt/'],
	[375, '/ru/team/']
] as const) {
	test(`${url} has no horizontal scroll at ${width}px`, async ({ browser }) => {
		const context = await browser.newContext({
			viewport: { width, height: 700 },
			baseURL: 'http://localhost:4173'
		});
		const page = await context.newPage();
		await page.goto(url);
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		);
		expect(overflow).toBeLessThanOrEqual(0);
		await context.close();
	});
}

test('404 pages link to the home page of each language', async ({ page }) => {
	await page.goto('/en/404.html');
	const switcher = page.locator('.topbar nav');
	await expect(switcher.locator('a[hreflang="de"]')).toHaveAttribute('href', '/');
	await expect(switcher.locator('a[hreflang="ru"]')).toHaveAttribute('href', '/ru/');
	await expect(page.locator('.others a[hreflang="de"]')).toHaveCount(1);
});
