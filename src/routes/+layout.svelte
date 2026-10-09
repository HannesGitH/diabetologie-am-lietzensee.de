<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import favicon from '#lib/assets/favicon.svg';
	import { m } from '#lib/paraglide/messages.js';
	import Footer from '#lib/components/Footer.svelte';
	import Header from '#lib/components/Header.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { requireImage } from '#lib/images.js';
	import { SITE_ORIGIN } from '#lib/site.js';
	import type { PageMeta } from '#lib/types.js';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	const meta = $derived(
		(page.data as { meta?: PageMeta & { noindex?: boolean; home?: boolean } }).meta ?? {
			title: m.error_title(),
			description: '',
			noindex: true
		}
	);
	// Share preview image = the home page hero (content/practice.yml → images.hero).
	const ogImage = $derived.by(() => {
		const picture = requireImage(data.practice.images.hero);
		return {
			url: new URL(picture.img.src, SITE_ORIGIN + '/').href,
			width: picture.img.w,
			height: picture.img.h
		};
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="32x32" />
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />
	<meta name="theme-color" content="#f3fbef" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#121a13" media="(prefers-color-scheme: dark)" />
</svelte:head>

<Seo practice={data.practice} {meta} {ogImage} />

<a class="skip-link" href="#main">{m.skip_link()}</a>

<Header practice={data.practice} />

<main id="main" tabindex="-1">
	{@render children()}
</main>

<Footer practice={data.practice} year={data.year} />

<style>
	.skip-link {
		position: absolute;
		top: var(--space-2);
		left: var(--space-2);
		z-index: 100;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-sm);
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-weight: 600;
		text-decoration: none;
		transform: translateY(-200%);
	}

	.skip-link:focus {
		transform: none;
	}

	main:focus {
		outline: none;
	}
</style>
