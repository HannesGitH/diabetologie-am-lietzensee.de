<script lang="ts">
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { deLocalizeHref, getLocale, localizeHref, locales } from '#lib/paraglide/runtime.js';
	import { LOCALE_NAMES } from '#lib/site.js';

	let { variant = 'inline' }: { variant?: 'inline' | 'stacked' } = $props();

	const current = getLocale();
	// On "not found" / error pages there is no equivalent page in the other languages:
	// link to their home pages instead.
	const isError = $derived(page.status >= 400 || page.route.id === '/404');
	const basePath = $derived(isError ? '/' : deLocalizeHref(page.url.pathname));
</script>

<nav class="lang lang-{variant}" aria-label={m.language_label()}>
	<ul>
		{#each locales as locale (locale)}
			<li>
				<a
					href={localizeHref(basePath, { locale })}
					lang={locale}
					hreflang={locale}
					aria-current={locale === current ? 'true' : undefined}>{LOCALE_NAMES[locale]}</a
				>
			</li>
		{/each}
	</ul>
</nav>

<style>
	ul {
		display: flex;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding-inline: var(--space-3);
		border-radius: var(--radius-sm);
		color: inherit;
		text-decoration: none;
		font-size: var(--text-sm);
	}

	a:hover {
		background: var(--color-tint-strong);
		color: var(--color-heading);
	}

	a[aria-current='true'] {
		font-weight: 650;
		color: var(--color-accent-text);
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.35em;
	}

	.lang-inline a {
		min-height: 2rem;
		padding-inline: var(--space-2);
	}

	.lang-stacked ul {
		flex-wrap: wrap;
	}

	.lang-stacked a {
		border: 1px solid var(--color-border);
		font-size: var(--text-base);
	}
</style>
