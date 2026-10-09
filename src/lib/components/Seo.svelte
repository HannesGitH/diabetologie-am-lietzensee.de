<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeHref, getLocale, locales, baseLocale } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import { absoluteUrl } from '#lib/site.js';
	import { buildJsonLd, serializeJsonLd } from '#lib/structured-data.js';
	import type { PageMeta, Practice } from '#lib/types.js';

	let {
		practice,
		meta,
		ogImage
	}: {
		practice: Practice;
		meta: PageMeta & { noindex?: boolean; home?: boolean };
		ogImage?: { url: string; width: number; height: number };
	} = $props();

	const locale = getLocale();
	const basePath = $derived(deLocalizeHref(page.url.pathname));
	const canonical = $derived(absoluteUrl(basePath, locale));
	const fullTitle = $derived(
		meta.home ? `${practice.name} – ${meta.title}` : `${meta.title} | ${practice.name}`
	);
	const ogLocale = { de: 'de_DE', en: 'en_GB', ru: 'ru_RU' } as const;
	const jsonLd = $derived(
		meta.home
			? serializeJsonLd(
					buildJsonLd(practice, absoluteUrl('/', locale), meta.description, ogImage?.url)
				)
			: null
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	{#if meta.description}<meta name="description" content={meta.description} />{/if}
	{#if meta.noindex}
		<meta name="robots" content="noindex" />
	{:else}
		<link rel="canonical" href={canonical} />
		{#each locales as alt (alt)}
			<link rel="alternate" hreflang={alt} href={absoluteUrl(basePath, alt)} />
		{/each}
		<link rel="alternate" hreflang="x-default" href={absoluteUrl(basePath, baseLocale)} />
		<meta property="og:type" content="website" />
		<meta property="og:site_name" content={practice.name} />
		<meta property="og:title" content={fullTitle} />
		<meta property="og:description" content={meta.description} />
		<meta property="og:url" content={canonical} />
		<meta property="og:locale" content={ogLocale[locale]} />
		{#each locales.filter((alt) => alt !== locale) as alt (alt)}
			<meta property="og:locale:alternate" content={ogLocale[alt]} />
		{/each}
		{#if ogImage}
			<meta property="og:image" content={ogImage.url} />
			<meta property="og:image:width" content={String(ogImage.width)} />
			<meta property="og:image:height" content={String(ogImage.height)} />
			<meta property="og:image:alt" content={m.og_image_alt()} />
		{/if}
		<meta name="twitter:card" content="summary" />
	{/if}
	{#if jsonLd}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD data, '<' escaped -->
		{@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
	{/if}
</svelte:head>
